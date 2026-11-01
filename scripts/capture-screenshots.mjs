/**
 * Capture README screenshots of the real Tactica UI.
 *
 * Browser requests to the API are intercepted and answered with sports
 * fixtures. The app itself is unchanged — no mock data, no test hooks.
 * Shapes match what this frontend calls on tactica-backend:
 *   POST /auth/login, POST /auth/register, GET /auth/me
 *   GET/POST /conversations/, GET/DELETE /conversations/{id}
 *   GET /conversations/{id}/messages  (markdown + citations)
 *   POST /conversations/{id}/chat     (SSE token events, then citations)
 *
 * Re-run from the repo root (Google Chrome required, port 3000 free):
 *   bun run screenshots
 *
 * The script rebuilds the production app with
 * NEXT_PUBLIC_API_URL=http://localhost:8000/api, serves it on port 3000,
 * writes PNGs to docs/screenshots/, and stops the server.
 */
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright-core";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "docs", "screenshots");
const API_ORIGIN = "http://localhost:8000";
const API_URL = `${API_ORIGIN}/api`;
const PORT = 3000;
const BASE = `http://127.0.0.1:${PORT}`;

const USER = {
    id: "8f3a1c2e-6b47-4d1a-9e20-1c5a7b9d0e11",
    email: "maya.chen@example.com",
    name: "Maya Chen",
};

const NOW = "2026-10-28T18:30:00.000Z";

const CONVERSATIONS = [
    ["c0ffee00-0000-4000-8000-000000000001", null],
    ["c0ffee00-0000-4000-8000-000000000002", "Pressing a 4-3-3"],
    ["c0ffee00-0000-4000-8000-000000000003", "Low block vs high line"],
    ["c0ffee00-0000-4000-8000-000000000004", "Inverted fullbacks"],
    ["c0ffee00-0000-4000-8000-000000000005", "Near-post set pieces"],
    ["c0ffee00-0000-4000-8000-000000000006", "Rest defense"],
].map(([id, title], index) => ({
    id,
    user_id: USER.id,
    title,
    created_at: NOW,
    updated_at: new Date(Date.parse(NOW) - index * 3600_000).toISOString(),
}));

const PRESSING_ID = CONVERSATIONS[1].id;

const QUESTION = "How should we press a 4-3-3 that builds through the single pivot?";

const ANSWER = `Press the picture, not the ball. A 4-3-3 that builds through one pivot is vulnerable when the first pass out is delayed — curve the striker's run to close the return lane, then jump the pivot as the centre-back's hips open toward him.

## The trigger

Wait until the ball-side centre-back sets his body toward the pivot. That shape slows the backward pass and makes the forward one predictable.

- **Striker** shades the pivot and takes away the one-touch return.
- **Ball-side eight** jumps the reception, arriving with the ball.
- **Far eight and the six** hold a rest-defence line so a clearance is not a counter.

## After the trap

Counterpress for three seconds, then play into the space the fullback vacated. If the pivot receives facing his own goal, the trap has already worked.

> The pivot is the door. The centre-back's hips tell you when it opens.`;

// Same "{title} - {source}" strings the backend builds from retrieved documents.
const CITATIONS = [
    { source: "Gegenpressing - wikipedia", relevance_score: 0.19 },
    { source: "Pressing traps in the Premier League - BBC Sport", relevance_score: 0.24 },
    { source: "The single pivot and how to jump it - The Athletic", relevance_score: 0.31 },
];

const MESSAGES = {
    [PRESSING_ID]: [
        {
            id: "a1000000-0000-4000-8000-000000000001",
            conversation_id: PRESSING_ID,
            role: "user",
            content: QUESTION,
            created_at: NOW,
        },
        {
            id: "a1000000-0000-4000-8000-000000000002",
            conversation_id: PRESSING_ID,
            role: "assistant",
            content: ANSWER,
            created_at: NOW,
            citations: CITATIONS,
        },
    ],
};

const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
};

function sseBody(text, citations) {
    const chunks = text.split(/(\s+)/).filter((part) => part.length > 0);
    const events = chunks.map(
        (part) => `data: ${JSON.stringify({ type: "token", content: part })}\n\n`,
    );
    events.push(`data: ${JSON.stringify({ type: "citations", citations })}\n\n`);
    return events.join("");
}

function json(route, status, body) {
    return route.fulfill({
        status,
        contentType: "application/json",
        headers: CORS,
        body: JSON.stringify(body),
    });
}

async function mockApi(route) {
    const request = route.request();
    const method = request.method();
    const { pathname } = new URL(request.url());
    const pathName = pathname.replace(/\/+$/, "") || "/";

    if (method === "OPTIONS") {
        return route.fulfill({ status: 204, headers: CORS, body: "" });
    }

    const log = (status) => console.log(`  mock ${method} ${pathName} -> ${status}`);

    if (method === "POST" && pathName === "/api/auth/login") {
        log(200);
        return json(route, 200, { access_token: "mock-access-token", token_type: "bearer" });
    }
    if (method === "POST" && pathName === "/api/auth/register") {
        log(201);
        return json(route, 201, USER);
    }
    if (method === "GET" && pathName === "/api/auth/me") {
        log(200);
        return json(route, 200, USER);
    }
    if (method === "GET" && pathName === "/api/conversations") {
        log(200);
        return json(route, 200, CONVERSATIONS);
    }
    if (method === "POST" && pathName === "/api/conversations") {
        log(201);
        return json(route, 201, {
            id: "c0ffee00-0000-4000-8000-000000000099",
            user_id: USER.id,
            title: null,
            created_at: NOW,
            updated_at: NOW,
        });
    }

    const messages = pathName.match(/^\/api\/conversations\/([^/]+)\/messages$/);
    if (messages && method === "GET") {
        log(200);
        return json(route, 200, MESSAGES[messages[1]] ?? []);
    }

    const chat = pathName.match(/^\/api\/conversations\/([^/]+)\/chat$/);
    if (chat && method === "POST") {
        log(200);
        const citations = MESSAGES[chat[1]]?.find((message) => message.role === "assistant")?.citations ?? CITATIONS;
        return route.fulfill({
            status: 200,
            contentType: "text/event-stream",
            headers: { ...CORS, "Cache-Control": "no-cache" },
            body: sseBody(ANSWER, citations),
        });
    }

    const conversation = pathName.match(/^\/api\/conversations\/([^/]+)$/);
    if (conversation && (method === "GET" || method === "DELETE")) {
        log(200);
        const found = CONVERSATIONS.find((item) => item.id === conversation[1]);
        return json(
            route,
            200,
            found ?? {
                id: conversation[1],
                user_id: USER.id,
                title: null,
                created_at: NOW,
                updated_at: NOW,
            },
        );
    }

    log(404);
    return json(route, 404, { detail: `No mock for ${method} ${pathName}` });
}

function portInUse(port) {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.once("error", () => resolve(true));
        server.once("listening", () => server.close(() => resolve(false)));
        server.listen(port, "127.0.0.1");
    });
}

const NEXT_BIN = path.join(ROOT, "node_modules", "next", "dist", "bin", "next");

function run(args, extraEnv = {}) {
    return spawn(process.execPath, [NEXT_BIN, ...args], {
        cwd: ROOT,
        detached: true,
        stdio: "inherit",
        env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1", ...extraEnv },
    });
}

function stop(child) {
    if (!child || child.killed || child.pid == null) return;
    try {
        process.kill(-child.pid, "SIGTERM");
    } catch {
        child.kill("SIGTERM");
    }
}

async function waitForServer(child) {
    const deadline = Date.now() + 30_000;
    while (Date.now() < deadline) {
        if (child.exitCode != null) {
            throw new Error(`next start exited early (${child.exitCode})`);
        }
        try {
            const response = await fetch(BASE, { redirect: "manual" });
            if (response.status < 500) return;
        } catch {
            // Server still booting.
        }
        await new Promise((resolve) => setTimeout(resolve, 250));
    }
    throw new Error(`Server did not start on ${BASE}`);
}

async function settle(page) {
    await page.evaluate(async () => {
        if (document.fonts?.ready) await document.fonts.ready;
    });
    await page.waitForTimeout(150);
}

async function shoot(page, name) {
    await settle(page);
    const file = path.join(OUT_DIR, name);
    await page.screenshot({ path: file, animations: "disabled", caret: "hide" });
    console.log(`  saved ${path.relative(ROOT, file)}`);
}

async function capture(browser) {
    const desktop = {
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 2,
        colorScheme: "dark",
        reducedMotion: "reduce",
        locale: "en-US",
    };

    const anon = await browser.newContext(desktop);
    await anon.route(`${API_ORIGIN}/**`, mockApi);
    const login = await anon.newPage();
    await login.goto(`${BASE}/login`, { waitUntil: "networkidle" });
    await login.getByRole("heading", { name: "Tactica" }).waitFor();
    await login.getByText("Login to your account").waitFor();
    await shoot(login, "login.png");

    const register = await anon.newPage();
    await register.goto(`${BASE}/register`, { waitUntil: "networkidle" });
    await register.getByText("Create an account to get started").waitFor();
    await shoot(register, "register.png");
    await anon.close();

    const authed = await browser.newContext(desktop);
    await authed.route(`${API_ORIGIN}/**`, mockApi);
    await authed.addCookies([{ name: "token", value: "mock-access-token", url: BASE }]);
    const chat = await authed.newPage();
    chat.on("pageerror", (error) => console.error(`  page error: ${error.message}`));

    await chat.goto(`${BASE}/chat`, { waitUntil: "networkidle" });
    await chat.getByRole("heading", { name: "Start Chatting with Tactica" }).waitFor();
    await chat.getByText("Pressing a 4-3-3").waitFor();
    await chat.getByText("Untitled Conversation").waitFor();
    await chat.getByText(USER.email).waitFor();
    await shoot(chat, "new-chat.png");

    await chat.goto(`${BASE}/chat/${PRESSING_ID}`, { waitUntil: "networkidle" });
    await chat.getByText(QUESTION).waitFor();
    await chat.getByRole("heading", { name: "The trigger" }).waitFor();
    const sources = chat.getByRole("button", { name: /Sources \(\d+\)/ });
    await sources.click();
    await chat.getByText("Gegenpressing - wikipedia").waitFor();
    await chat.mouse.move(0, 0);
    await chat.evaluate(() => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    });
    await shoot(chat, "cited-answer.png");

    const streamed = await chat.evaluate(async (url) => {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer mock-access-token",
            },
            body: JSON.stringify({ message: "How should we press a 4-3-3?" }),
        });
        return {
            status: response.status,
            contentType: response.headers.get("content-type"),
            body: await response.text(),
        };
    }, `${API_URL}/conversations/${PRESSING_ID}/chat`);
    if (
        streamed.status !== 200 ||
        !streamed.contentType?.startsWith("text/event-stream") ||
        !streamed.body.includes('"type":"token"') ||
        !streamed.body.includes('"type":"citations"')
    ) {
        throw new Error(`SSE mock check failed: ${JSON.stringify(streamed)}`);
    }
    console.log("  sse mock ok");
    await authed.close();

    const phone = await browser.newContext({
        ...desktop,
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
    });
    await phone.route(`${API_ORIGIN}/**`, mockApi);
    const mobileLogin = await phone.newPage();
    await mobileLogin.goto(`${BASE}/login`, { waitUntil: "networkidle" });
    await mobileLogin.getByText("Login to your account").waitFor();
    await shoot(mobileLogin, "login-mobile.png");
    await phone.close();
}

let serverProcess;

process.on("SIGINT", () => {
    stop(serverProcess);
    process.exit(130);
});
process.on("SIGTERM", () => {
    stop(serverProcess);
    process.exit(143);
});

async function main() {
    if (await portInUse(PORT)) {
        throw new Error(`Port ${PORT} is already in use. Stop that process and re-run.`);
    }

    await mkdir(OUT_DIR, { recursive: true });

    console.log("Building production app…");
    const build = run(["build"], { NEXT_PUBLIC_API_URL: API_URL });
    const buildCode = await new Promise((resolve) => build.on("exit", resolve));
    if (buildCode !== 0) throw new Error(`build failed (${buildCode})`);

    console.log(`Starting server on ${BASE}…`);
    serverProcess = run(["start", "-H", "127.0.0.1", "-p", String(PORT)]);
    try {
        await waitForServer(serverProcess);
        const browser = await chromium.launch({
            channel: "chrome",
            headless: true,
            args: ["--disable-dev-shm-usage"],
        });
        try {
            await capture(browser);
        } finally {
            await browser.close();
        }
    } finally {
        stop(serverProcess);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

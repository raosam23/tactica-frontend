# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev          # start dev server
bun build        # production build
bun start        # serve production build
bun lint         # run ESLint
```

No test suite is configured yet.

## Stack

- **Next.js 16.2.6** with App Router (React 19) — see `node_modules/next/dist/docs/` for current API; this version has breaking changes from earlier releases
- **Tailwind CSS v4** — configured via `@import "tailwindcss"` in `globals.css`, no `tailwind.config.*` file; all theme tokens live in `@theme inline {}` and CSS variables
- **shadcn/ui** (`radix-nova` style) — components live in `src/components/ui/`, sourced with `bunx shadcn add <component>`; uses the unified `radix-ui` package (not individual `@radix-ui/react-*` packages)
- **Zustand 5** for client state
- **Axios** for HTTP requests
- **notistack** for toast notifications — `SnackbarProvider` wraps the app via `src/components/ui/Providers.tsx`; use `useSnackbar()` hook in client components to show toasts
- **TypeScript** strict mode; `@/*` maps to `src/*`

## Key conventions

- Dark mode is **always forced** — `<html>` always has the `.dark` class; the custom variant `@custom-variant dark (&:is(.dark *))` is defined but dark mode is not user-togglable
- Font is **Inter** (`--font-inter` CSS variable), not Geist
- All design tokens (colors, radius, sidebar, charts) are CSS custom properties defined in `globals.css`; reference them with Tailwind utility classes (`bg-background`, `text-foreground`, etc.)
- Use `cn()` from `@/lib/utils` for conditional className merging (clsx + tailwind-merge)

## Color schema (dark mode)

**STRICT RULE:** You must strictly use ONLY these colors for the application whenever styling elements. Do not invent new colors, hex codes, or raw Tailwind colors (like `bg-purple-500` or `bg-gray-900`). Always use the designated CSS variables/Tailwind classes below to maintain the consistent purple-tinted dark aesthetic.

| Purpose | CSS variable | Tailwind class | Value |
|---|---|---|---|
| Page background | `--background` | `bg-background` | `oklch(0.16 0.03 280)` — deep dark purple-gray |
| Sidebar background | `--sidebar` | `bg-sidebar` | `oklch(0.18 0.03 280)` — dark purple-gray (slightly elevated) |
| Card / Content background | `--card` | `bg-card` | `oklch(0.21 0.03 280)` — lighter purple-gray |
| Primary button / Highlight | `--primary` | `bg-primary` | `oklch(0.60 0.18 280)` — vibrant medium purple |
| Sidebar hover / active item | `--sidebar-accent` | `bg-sidebar-accent` | `oklch(0.60 0.18 280 / 15%)` — translucent purple wash |
| Border / Divider | `--border` | `border-border` | `oklch(1 0 0 / 10%)` — subtle translucent white |
| Sidebar Border | `--sidebar-border` | `border-sidebar-border`| `oklch(1 0 0 / 10%)` — subtle translucent white |
| Muted text | `--muted-foreground` | `text-muted-foreground` | `oklch(0.708 0 0)` — muted gray |
| Foreground text | `--foreground` | `text-foreground` | `oklch(0.93 0 0)` — near white |
| Primary text | `--primary-foreground` | `text-primary-foreground` | `oklch(0.985 0.01 280)` — crisp white with purple tint |

> **Rule:** Never use raw black (`#000`, `oklch(0 0 0)`, `bg-black`) as a background — always use the design tokens above.
- shadcn components use `data-slot`, `data-variant`, `data-size` attributes for styling hooks — keep these when customizing
- All store actions throw `ApiError` (from `src/lib/error.ts`) on failure — catch `ApiError` in components to display toast messages, not raw Axios errors

## Middleware note

The route-protection logic lives in `src/proxy.ts` (renamed from `src/middleware.ts`). Next.js only runs a file named `middleware.ts` in `src/` or the project root — if middleware isn't running, this rename is the cause.

---

## Project — Tactica Frontend

Tactica is a sports-only AI chatbot frontend. The UI replicates a ChatGPT/Claude-like experience — sidebar with conversation list on the left, chat window on the right.

### Backend API

The backend runs at `http://localhost:8000`. All routes are prefixed with `/api`.

**Base URL:** `http://localhost:8000/api`

**Authentication:** JWT bearer token. Store in Zustand `authStore` and attach via Axios interceptor as `Authorization: Bearer <token>`. The JWT bearer token logic in backend doesn't store it in `localStorage`. Instead we are storing it in `cookies` using `js-cookies`

#### Auth endpoints

| Method | Path             | Auth | Description                                                |
| ------ | ---------------- | ---- | ---------------------------------------------------------- |
| POST   | `/auth/register` | ❌   | Register — returns `User` object (id, email, name)         |
| POST   | `/auth/login`    | ❌   | Login — returns `TokenResponse` (access_token, token_type) |
| GET    | `/auth/me`       | ✅   | Get current user info                                      |
| DELETE | `/auth/me`       | ✅   | Delete account                                             |

#### Conversation endpoints

| Method | Path                           | Auth | Description                           |
| ------ | ------------------------------ | ---- | ------------------------------------- |
| POST   | `/conversations/`              | ✅   | Create new conversation               |
| GET    | `/conversations/`              | ✅   | List all conversations                |
| GET    | `/conversations/{id}`          | ✅   | Get single conversation               |
| DELETE | `/conversations/{id}`          | ✅   | Delete conversation                   |
| POST   | `/conversations/{id}/chat`     | ✅   | Send message — returns `ChatResponse` |
| GET    | `/conversations/{id}/messages` | ✅   | Get all messages in a conversation    |

#### Key response shapes

```typescript
// POST /auth/register
{ id: string, email: string, name: string | null }

// POST /auth/login
{ access_token: string, token_type: "bearer" }

// GET /auth/me
{ id: string, email: string, name: string | null }

// POST /conversations/{id}/chat
{
  message: string,
  citations: { source: string, relevance_score: number | null }[]
}

// Message object
{ id: string, conversation_id: string, role: "user" | "assistant", content: string, created_at: string }

// Conversation object
{ id: string, user_id: string, title: string | null, created_at: string, updated_at: string }
```

---

## Folder structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx           # Login page
│   │   └── register/page.tsx        # Register page
│   ├── (dashboard)/
│   │   ├── layout.tsx               # Dashboard layout — sidebar will live here
│   │   └── chat/
│   │       ├── page.tsx             # Empty state (no conversation selected)
│   │       └── [conversationId]/
│   │           └── page.tsx         # Active conversation
│   ├── layout.tsx                   # Root layout — wraps app in <Providers>
│   └── page.tsx                     # Root redirect (to /chat or /login)
│
├── components/
│   ├── ui/                          # shadcn components + custom UI
│   │   ├── Providers.tsx            # SnackbarProvider wrapper (notistack)
│   │   ├── Toast.tsx                # Custom toast component used by notistack
│   │   └── Spinner.tsx              # Loading spinner (ldrs LineWobble)
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   └── chat/                        # ⚠️ NOT YET BUILT — planned components:
│       ├── Sidebar.tsx              # Conversation list + new chat + user info
│       ├── ChatWindow.tsx           # Message area
│       ├── MessageBubble.tsx        # Individual message rendering
│       ├── ChatInput.tsx            # Input box at the bottom
│       └── CitationsList.tsx        # Citations rendered under assistant messages
│
├── lib/
│   ├── api.ts                       # Axios instance with base URL + auth interceptor
│   ├── error.ts                     # ApiError class for typed error propagation
│   └── utils.ts                     # cn() and other helpers
│
├── proxy.ts                         # Middleware logic (⚠️ must be named middleware.ts to run)
│
├── stores/
│   ├── authStore.ts                 # Zustand — user, isAuthenticated, login/logout/register
│   └── chatStore.ts                 # Zustand — conversations, messages, active conversation
│
└── types/
    └── index.ts                     # TypeScript types matching backend schemas
```

---

## State management

### `authStore`

- `user` — current user object or null
- `isAuthenticated` — boolean
- `isLoading` — boolean
- `login(email, password)` — calls `/auth/login`, stores token in a cookie (`js-cookie`), then fetches `/auth/me`
- `logout()` — removes cookie, clears state
- `register(name, email, password)` — calls `/auth/register`, then calls `login()` automatically

### `chatStore`

- `conversations` — list of all conversations
- `activeConversationId` — currently open conversation
- `messages` — messages for the active conversation; each `Message` object carries a `citations?: Citation[]` field (not top-level store state)
- `isLoading` — true while a request is in flight

---

## Important notes

- After registration, automatically call login to get the token — register does NOT return a token
- Chat responses can take 30+ seconds — always show a loading state in the UI
- Citations array can be empty — only render the citations section if `citations.length > 0`
- Conversation `title` can be `null` on first creation — show a placeholder like "New Conversation"
- Password minimum length is 8 characters — validate on the frontend before submitting

# Commit message format

```
bug/feat/chore/docs: brief one line summary of the changes
- point by point list of changes
- you can add
```

# Additional rules

- Do not ask for the codebase, you have access to the entire code, you can scan the code for your reference whenever needed.
- Do not use `use client` more than what is necessary, use it only when there is a need for interactivity or hooks.

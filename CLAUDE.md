# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

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
- **TypeScript** strict mode; `@/*` maps to `src/*`

## Key conventions

- Dark mode toggled via the `.dark` class on a parent (`@custom-variant dark (&:is(.dark *))`), not `prefers-color-scheme`
- All design tokens (colors, radius, sidebar, charts) are CSS custom properties defined in `globals.css`; reference them with Tailwind utility classes (`bg-background`, `text-foreground`, etc.)
- Use `cn()` from `@/lib/utils` for conditional className merging (clsx + tailwind-merge)
- shadcn components use `data-slot`, `data-variant`, `data-size` attributes for styling hooks — keep these when customizing

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
│   │   ├── layout.tsx               # Dashboard layout — sidebar lives here
│   │   └── chat/
│   │       ├── page.tsx             # Empty state (no conversation selected)
│   │       └── [conversationId]/
│   │           └── page.tsx         # Active conversation
│   ├── layout.tsx                   # Root layout
│   └── page.tsx                     # Root redirect (to /chat or /login)
│
├── components/
│   ├── ui/                          # Shadcn components (auto-generated)
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   └── chat/
│       ├── Sidebar.tsx              # Conversation list + new chat + user info
│       ├── ChatWindow.tsx           # Message area
│       ├── MessageBubble.tsx        # Individual message rendering
│       ├── ChatInput.tsx            # Input box at the bottom
│       └── CitationsList.tsx        # Citations rendered under assistant messages
│
├── lib/
│   ├── api.ts                       # Axios instance with base URL + auth interceptor
│   └── utils.ts                     # cn() and other helpers
│
├── middleware.ts                     # Protect dashboard routes, redirect to /login
│
├── stores/
│   ├── authStore.ts                 # Zustand — user, token, login/logout actions
│   └── chatStore.ts                 # Zustand — conversations, messages, active conversation
│
└── types/
    └── index.ts                     # TypeScript types matching backend schemas
```

---

## State management

### `authStore`

- `user` — current user object or null
- `token` — JWT string or null
- `login(token, user)` — sets both, persists token to localStorage
- `logout()` — clears state and localStorage
- `isAuthenticated` — derived boolean

### `chatStore`

- `conversations` — list of all conversations
- `activeConversationId` — currently open conversation
- `messages` — messages for the active conversation
- `isLoading` — true while waiting for chat response

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

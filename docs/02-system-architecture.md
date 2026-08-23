# System architecture

## Monorepo layout

```text
apps/
  web/       Next.js 16 / React 19 portfolio OS and Gemini route
  api/       Node 22 / Express / ws telemetry service
  docs/      Unused Next.js starter, not the maintained documentation
packages/
  eslint-config/       Shared ESLint flat configuration
  typescript-config/   Shared strict TypeScript configuration
  ui/                  Starter shared UI package
docs/                  Maintained Markdown knowledge base
```

Turbo runs the `web` and `webos-api` development tasks together. Root build, lint, and type-check commands continue to cover every workspace.

## Runtime data flow

```text
Browser
  ├─ Next.js desktop shell
  │    ├─ Zustand: windows, virtual filesystem, settings, controls, menu
  │    ├─ Virtual terminal: local commands only
  │    └─ Task Manager ── WebSocket /ws ──┐
  │                                       │
  └─ /api/chat ── Gemini via AI SDK       │
                                          ▼
                                  Node HTTP server
                                  ├─ Express GET /health
                                  ├─ Express GET /api/metrics
                                  └─ ws /ws → Node host metrics
```

## Frontend boundary

`apps/web/app/page.tsx` renders the client-side `Desktop` inside sound and context-menu providers. The desktop composes the boot screen, background, icons, windows, taskbar, overlays, and command palette. It is a single Next.js page route; this app's only server endpoint is the Gemini chat route.

## API boundary

`apps/api` uses one Node HTTP server. Express handles REST endpoints, and `ws` handles WebSocket upgrades on the same port. The metrics service derives aggregate CPU utilization from consecutive `node:os` CPU samples and reads memory from `os.totalmem()` and `os.freemem()`.

Metrics describe the API host—local machine, container, or server—not the browser device. The UI labels the source for this reason.

## Persistence model

| State                              | Storage                         | Rationale                                 |
| ---------------------------------- | ------------------------------- | ----------------------------------------- |
| Open windows and virtual files     | Zustand in memory               | Fast browser simulation; clears on reload |
| Appearance and control preferences | Zustand persist to localStorage | Retains personal UI preferences           |
| Copilot messages                   | Component state                 | Avoids storing conversations by default   |
| Telemetry                          | API and browser memory          | Fresh transient monitoring data           |

No MongoDB, Supabase, or external persistence is connected to Axon OS today.

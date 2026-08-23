# Axon OS

Axon OS is a browser-based portfolio operating-system simulation. It presents personal work through desktop icons, virtual files, draggable windows, a browser-safe terminal, and an optional AI copilot.

The project is a TypeScript monorepo built around a Next.js frontend and a Node.js/Express telemetry service. It runs on macOS (including Apple Silicon), Windows, and Linux with Node.js 22 or newer. Rust is not required or used.

## What is implemented

- React, Next.js, and TypeScript desktop experience with window management, a Start menu, command palette, settings, and taskbar.
- In-memory virtual filesystem with file creation, editing, ZIP export, trash/restore, and recursive permanent deletion.
- Browser-only terminal commands that operate on the virtual filesystem; it never executes commands or reads files on the backend host.
- Express REST endpoints and a WebSocket stream for server telemetry.
- Gemini-powered portfolio copilot when a valid Google AI API key is configured.
- Type checks, ESLint, API tests, Prettier checks, Docker support, and a macOS/Windows/Linux CI matrix.

The Task Manager explicitly labels its data source: live data is **server telemetry**, while the offline state uses **demo telemetry**. It does not claim to measure a visitor's device.

## Quick start

1. Install [Node.js 22 LTS](https://nodejs.org/) or newer. The repository uses npm.
2. Run `npm ci` from the repository root.
3. Create `apps/web/.env.local` from [`apps/web/.env.example`](apps/web/.env.example). A Gemini key is optional; without it, only the Copilot is unavailable.
4. Optionally create `apps/api/.env` from [`apps/api/.env.example`](apps/api/.env.example) when your frontend is not served from `http://localhost:3000`.
5. Run `npm run dev`.

Open `http://localhost:3000`. The API runs at `http://localhost:3001` and its WebSocket endpoint is `ws://localhost:3001/ws`.

## Common commands

```text
npm run dev            Start the web app and API
npm run lint           Lint all workspaces
npm run check-types    Type-check all workspaces
npm test               Run automated tests
npm run build          Create production builds
npm run format:check   Check formatting without editing files
npm run docker:check   Validate Docker Compose configuration
npm run docker:up      Build and start the hardened production stack
npm run docker:down    Stop and remove the local stack
```

For the easiest consistent setup on macOS Apple Silicon, Windows, or Linux, install
Docker Desktop, copy `.env.docker.example` to the untracked `.env`, and run
`npm run docker:up`. The web app binds to `127.0.0.1:3000` and the telemetry API
to `127.0.0.1:3001` by default.

## Repository map

- `apps/web` — Next.js portfolio OS and the Gemini chat route.
- `apps/api` — TypeScript, Node.js, Express, REST, and WebSocket telemetry service.
- `docs` — architecture, behavior, protocol, security, migration, and deployment documentation.
- `packages/*` — shared TypeScript, ESLint, and UI packages from the monorepo scaffold.

Read the [documentation index](docs/README.md) before extending the project. It records the true current architecture, cross-platform support, and remaining intentional simulations.

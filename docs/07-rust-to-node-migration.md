# Rust-to-Node migration record

## Decision

Rust was removed and replaced with a TypeScript, Node.js, Express, and `ws` service. This aligns the backend with the existing frontend and the developer's stated skills while preserving real-time telemetry.

## Removed

- `apps/api/Cargo.toml` and `Cargo.lock`
- Axum, Tokio, sysinfo, Serde, tower-http, futures, tracing, and whoami
- Rust API, socket, and shared-state source files
- Rust Docker build stages and Rust ignore rules
- Rust-specific example text and `.rs`/`.toml` editor handling

## Replaced with

| Previous concern            | New implementation                      |
| --------------------------- | --------------------------------------- |
| Axum HTTP server            | Express on a Node HTTP server           |
| Axum WebSocket endpoint     | `ws` endpoint on `/ws`                  |
| `sysinfo` metrics           | `node:os` CPU delta and memory readings |
| Cargo scripts               | `tsx`, `tsc`, and Node scripts          |
| Rust container              | Node 22 multi-stage image               |
| Underscored socket payloads | Typed `metrics.updated` contract        |

## Deliberately not migrated

The old API's `pwd`, `whoami`, `ls`, and `cd` behavior inspected the server's real working directory and username. The browser already contains a richer virtual terminal, so that API surface was removed instead of recreated.

## Compatibility changes

The browser uses `NEXT_PUBLIC_API_WS_URL` when configured and otherwise derives the local `:3001/ws` address. Client and server were migrated together to the new telemetry event. No Rust compatibility layer remains.

## Validation target

The replacement API must pass TypeScript, ESLint, REST/WebSocket tests, production build, Docker build review, and the three-operating-system CI matrix.

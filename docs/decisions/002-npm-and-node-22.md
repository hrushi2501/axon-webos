# Decision 002: standardize on npm and Node 22

## Context

The repository declares npm but previously committed both npm and pnpm lockfiles. Next.js 16 and the new Node backend require a current cross-platform runtime.

## Decision

Use npm with the root `package-lock.json` as the only dependency lock. Require Node.js 22 or newer and record Node 22 in `.node-version`.

## Consequences

- `npm ci` is the reproducible installation command for development, CI, and Docker.
- Node 22 provides supported binaries for macOS ARM64, Windows, and Linux.
- The stale pnpm lockfile is removed to eliminate package-manager ambiguity.

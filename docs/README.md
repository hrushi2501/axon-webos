# Axon OS documentation

This directory is the maintained knowledge base for Axon OS. It documents the repository as reviewed on 23 August 2026 and clearly separates implemented behavior from intentional simulations and future work.

| Document                                                           | Purpose                                                           |
| ------------------------------------------------------------------ | ----------------------------------------------------------------- |
| [Project overview](01-project-overview.md)                         | Product scope, user journey, and feature inventory                |
| [System architecture](02-system-architecture.md)                   | Monorepo layout, runtime boundaries, and data flow                |
| [Frontend design](03-frontend-design.md)                           | Window manager, Zustand stores, virtual filesystem, and terminal  |
| [API and realtime contract](04-api-and-realtime-contract.md)       | Express endpoints, WebSocket events, configuration, and fallbacks |
| [AI Copilot](05-ai-copilot.md)                                     | Gemini request flow, prompt context, tools, and limitations       |
| [Quality and security](06-quality-and-security.md)                 | Verification gates, security decisions, and remaining risks       |
| [Rust-to-Node migration](07-rust-to-node-migration.md)             | Migration scope, compatibility changes, and rationale             |
| [Resume alignment](08-resume-alignment.md)                         | Accurate project statement and evidence boundaries                |
| [Cross-platform development](09-development-and-cross-platform.md) | macOS, Windows, Linux, Docker, CI, and deployment                 |
| [Container operations](10-container-operations.md)                 | Secure images, Compose workflow, multi-architecture releases      |
| [Decision 001](decisions/001-node-telemetry-backend.md)            | Why a small Node telemetry API is retained                        |
| [Decision 002](decisions/002-npm-and-node-22.md)                   | Why the repository standardizes on npm and Node 22                |

`apps/docs` is an untouched Next.js starter from the original Turborepo scaffold. It is not the project documentation and is excluded from the focused `npm run dev` command.

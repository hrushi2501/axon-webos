# Quality and security

## Acceptance gate

Run these commands before merging:

```text
npm run format:check
npm run lint
npm run check-types
npm test
npm run build
npm audit --omit=dev --audit-level=high
npm run docker:check
```

The API tests cover CPU-delta calculation, liveness/readiness, security headers, REST metrics, origin rejection, WebSocket telemetry, client-message rejection, and production configuration. Web tests cover Copilot request rate limiting. GitHub Actions executes source gates on Ubuntu, Windows, and Apple Silicon macOS, then builds, scans, starts, and smoke-tests both Linux images.

## Security decisions implemented

- The backend cannot execute commands or read host paths, directories, usernames, or files.
- Production configuration validates and requires exact WebSocket origins.
- The browser validates telemetry structure before updating state.
- API timeouts, request size/rate limits, WebSocket caps, heartbeat, and backpressure bound resource use.
- Helmet, request IDs, no-store responses, redacted JSON logs, and controlled error shapes harden the API.
- The web app sends CSP, clickjacking, MIME, referrer, permissions, and transport headers.
- Both Docker images use digest-pinned minimal bases, multi-stage builds, non-root users, and internal readiness checks.
- Compose drops every Linux capability, prevents privilege escalation, uses read-only filesystems, and applies CPU, memory, PID, log, and shutdown limits.
- Gemini credentials remain inside the Next.js server route.
- CI pins actions by commit SHA, audits dependencies, scans both images for fixable high/critical vulnerabilities, and maintains dependencies through Dependabot.

## Remaining limitations

| Topic            | Current state                             | Recommended next step                                                 |
| ---------------- | ----------------------------------------- | --------------------------------------------------------------------- |
| Contact form     | Opens an honest prefilled `mailto:` draft | Add a validated endpoint plus a selected mail provider or Supabase    |
| Metrics endpoint | Rate limited, no authentication           | Keep internal, restrict at ingress, or add application authentication |
| UI tests         | No browser/component suite                | Add Playwright for launch, filesystem, terminal, and fallback flows   |
| Virtual files    | Lost on refresh                           | Design privacy-aware IndexedDB or Supabase persistence                |
| Copilot UI tests | Typed tools, no browser integration suite | Test streamed messages and tool dispatch with Playwright              |

This is a secure deployment baseline, not a compliance certification. A public production environment still needs managed TLS, runtime secrets, monitoring/alerting, backups where state is introduced, an incident-response process, and external penetration and accessibility testing.

## Truthful portfolio claims

This repository supports claims about React, Next.js, TypeScript, Node.js, Express, REST APIs, WebSockets, Git-based CI, strict type checks, linting, and automated API testing. It does not by itself demonstrate MongoDB, Supabase, RAG, embeddings, XGBoost, NLP pipelines, or RLHF; those should be attributed only to projects where they are implemented.

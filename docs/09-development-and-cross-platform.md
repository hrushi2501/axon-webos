# Development and cross-platform deployment

## Support target

| Platform               | Status    | Notes                                                                |
| ---------------------- | --------- | -------------------------------------------------------------------- |
| macOS on Apple Silicon | Supported | CI uses the ARM64 `macos-14` runner; native Node 22 needs no Rosetta |
| Windows 10/11          | Supported | Use Node 22 and npm from PowerShell, Command Prompt, or Git Bash     |
| Linux                  | Supported | CI uses Ubuntu and the standard Node 22/npm workflow                 |

The frontend runs in current desktop browsers. The API uses Node platform APIs, Express, and `ws`; it invokes no platform-specific shell, path, command, or binary.

## Local setup

1. Install Node.js 22 LTS or newer. `package.json` and `.node-version` record the runtime decision.
2. Run `npm ci` at the repository root.
3. Create `apps/web/.env.local` from `apps/web/.env.example` if using Copilot or a separately hosted API.
4. Set API environment values from `apps/api/.env.example` when defaults do not apply.
5. Run `npm run dev` and open `http://localhost:3000`.

The root scripts invoke JavaScript executables instead of Bash-specific commands, so the commands are identical in PowerShell and Unix-like shells.

## Production configuration

- Host `apps/web` and `apps/api` where Node WebSockets are supported.
- Set `NEXT_PUBLIC_API_WS_URL=wss://api.example.com/ws` in the web build when the API is separate.
- Set `ALLOWED_ORIGINS=https://portfolio.example.com` for the API. Multiple origins are comma-separated.
- Proxy WebSocket upgrade requests. An HTTPS frontend requires `wss://`.
- Treat CPU and memory values as host diagnostic information and restrict the service if those details are sensitive.

## Docker development and release builds

Docker Desktop provides the same Linux-container workflow on all three developer platforms. From the repository root:

```text
cp .env.docker.example .env
npm run docker:up
npm run docker:down
```

On Windows, copy the example file with PowerShell or Explorer instead of `cp`. Compose binds only to loopback by default. The images are Linux-based, while the TypeScript/Node source remains architecture-neutral.

`docker-bake.hcl` defines `linux/amd64` and `linux/arm64` release targets with provenance and SBOM attestations. This covers Intel/AMD Windows and Linux hosts plus Apple Silicon and ARM64 Linux hosts. See [Container operations](10-container-operations.md) for the build and production boundary.

## Continuous integration

`.github/workflows/ci.yml` installs locked dependencies and runs formatting, lint, type, test, and build checks on:

- `ubuntu-latest`
- `windows-latest`
- `macos-14` (Apple Silicon)

The container job additionally validates Compose and Bake, checks the runtime user, scans both images, waits for health checks, and probes web/API endpoints. Release review should still exercise current Chrome, Safari, Firefox, and Edge on the intended hosting platform.

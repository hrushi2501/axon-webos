# Container operations

## Supported workflow

Axon OS ships two independent Linux images: `axon-webos-web` and `axon-webos-api`. Docker Compose is the reproducible local production workflow on macOS Apple Silicon, Windows, and Linux.

```text
cp .env.docker.example .env
npm run docker:check
npm run docker:up
docker compose ps
npm run docker:down
```

The default ports bind to `127.0.0.1`; set `BIND_ADDRESS` deliberately if another host must reach them. Never commit `.env`. Copilot credentials are runtime environment values and must come from the deployment platform's secret manager in production.

## Image design

- Multi-stage builds install only the workspace dependencies needed by each service.
- The Node 22 Debian slim base is pinned by multi-architecture digest and updated through Dependabot.
- Production layers omit package managers and development dependencies.
- Both processes run as the unprivileged `node` user and expose internal health checks.
- OCI version, revision, and build-time labels are supplied as build arguments.
- `.dockerignore` excludes environment files, keys, credentials, source-control data, dependencies, and generated output from the build context.

## Runtime controls

Compose uses read-only root filesystems, small in-memory writable paths, `no-new-privileges`, all capabilities dropped, init process handling, restart policy, bounded shutdown, health-gated startup, resource/PID limits, and rotated JSON logs. These defaults are suitable for local validation and are a reference for Kubernetes, ECS, or another orchestrator.

For a public deployment, terminate TLS at a managed ingress, send WebSocket upgrades, overwrite forwarding headers, store secrets outside Compose, centralize logs/metrics, and restrict the telemetry API to a private network or authenticated clients. Enable `TRUST_PROXY` only when the trusted ingress is the sole direct caller.

## Multi-architecture and supply chain

Inspect the release definition with:

```text
docker buildx bake --print
```

The default Bake group targets `linux/amd64` and `linux/arm64` and requests maximum provenance plus SPDX-compatible SBOM attestations. A registry release should use an authenticated builder and an explicit immutable version, revision, and build date:

```text
VERSION=1.0.0 VCS_REF=<git-sha> BUILD_DATE=<rfc3339> docker buildx bake --push
```

CI audits production npm dependencies and scans both final images for fixable high and critical vulnerabilities before performing health probes. Dependabot covers npm, both Dockerfiles, and GitHub Actions. Image signing and deployment-environment policy enforcement belong in the release platform because this repository has no registry or cloud account configured.

## Troubleshooting

```text
docker compose ps
docker compose logs api web
docker compose config
docker system df
```

If health checks fail, verify ports are free, Docker Desktop's Linux engine is running, `ALLOWED_ORIGINS` matches the browser's exact origin, and `NEXT_PUBLIC_API_WS_URL` was present during the web image build. The public WebSocket URL is a build-time browser value; changing it requires rebuilding `web`.

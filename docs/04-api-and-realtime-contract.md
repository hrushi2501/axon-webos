# API and realtime contract

## Service

The API is a cross-platform TypeScript service in `apps/api`. It requires Node.js 22+ and listens on `PORT`, defaulting to `3001`. It has no database, shell execution, or host-file access.

## REST endpoints

| Method and path    | Response                                  | Use                                  |
| ------------------ | ----------------------------------------- | ------------------------------------ |
| `GET /`            | `{ service, status, version }`            | Service identification               |
| `GET /livez`       | `{ service, status: "alive" }`            | Process liveness                     |
| `GET /readyz`      | `{ service, status, uptimeSeconds, ... }` | Startup and graceful-drain readiness |
| `GET /health`      | Same as `/readyz`                         | Docker and legacy health-check alias |
| `GET /api/metrics` | `metrics.updated` event object            | Rate-limited polling and diagnostics |

## WebSocket endpoint

`GET /ws` performs the WebSocket upgrade. A connected browser receives an event immediately and another roughly every second.

```json
{
  "type": "metrics.updated",
  "data": {
    "cpuUsagePercent": 37.5,
    "memoryUsedBytes": 8589934592,
    "memoryTotalBytes": 17179869184,
    "observedAt": "2026-08-23T00:00:00.000Z"
  }
}
```

The server does not accept terminal commands. Terminal operations belong exclusively to the browser's virtual filesystem. Any client message is rejected with WebSocket close code `1008`. Connections have a configurable cap, 1 KiB inbound payload limit, ping/pong heartbeat, and slow-client backpressure protection.

## Configuration

| Variable                 | Owner | Default                          | Meaning                                         |
| ------------------------ | ----- | -------------------------------- | ----------------------------------------------- |
| `HOST`                   | API   | `0.0.0.0`                        | Bind address                                    |
| `PORT`                   | API   | `3001`                           | HTTP and WebSocket port                         |
| `ALLOWED_ORIGINS`        | API   | Localhost in development         | Exact comma-separated origins allowed on `/ws`  |
| `MAX_WS_CLIENTS`         | API   | `100`                            | Per-process WebSocket connection cap            |
| `SHUTDOWN_TIMEOUT_MS`    | API   | `10000`                          | Maximum graceful shutdown period                |
| `LOG_LEVEL`              | API   | `info`                           | Pino JSON log threshold                         |
| `TRUST_PROXY`            | API   | `false`                          | Trust one proxy hop; enable only behind ingress |
| `NEXT_PUBLIC_API_WS_URL` | Web   | Derived local `:3001/ws` address | Full WebSocket URL embedded in the web build    |

Production configuration fails closed when `ALLOWED_ORIGINS` is absent or invalid. An HTTPS frontend must use a `wss://` URL to avoid mixed-content blocking.

## Failure behavior

The desktop remains functional if the API is unavailable. Task Manager switches to client-generated demo metrics, labels them, and attempts to reconnect with a capped exponential delay. No other desktop feature depends on the telemetry API.

## Origin validation

The WebSocket server accepts only configured browser `Origin` values. Local defaults permit `http://localhost:3000` and `http://127.0.0.1:3000`. Origin checks protect browser access but are not client authentication. REST telemetry is intentionally unauthenticated and rate limited; keep it on a private network or add authentication when host metrics are sensitive.

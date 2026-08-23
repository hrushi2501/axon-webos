# Decision 001: retain a small Node telemetry backend

## Context

The browser can simulate its OS-like behavior without a backend. The previous Rust API provided host metrics and a restricted host-directory terminal.

## Decision

Retain a separate backend only for portfolio-relevant Node work: Express REST health/metrics endpoints and WebSocket telemetry. Keep terminal behavior entirely inside the browser virtual filesystem.

## Consequences

- The project demonstrates Node.js, Express, REST API design, WebSockets, TypeScript, and testing alongside the frontend.
- The public app cannot reveal server paths, directory names, or usernames.
- The desktop stays useful when the API is offline.
- Metrics must be labelled as server telemetry because they do not describe the visitor's computer.

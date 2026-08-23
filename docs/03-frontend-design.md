# Frontend design

## Application registry and windows

`apps/web/config/app-registry.ts` is the canonical map of app IDs to titles, icons, lazy components, and default dimensions. `window-store.ts` owns window records, focus order, geometry, minimization, and maximization.

`Window.tsx` renders active records with `react-draggable`, custom resize handles, Framer Motion transitions, and an application error boundary. Reopening an app focuses it. Updated launch data is retained, so an existing File Manager window can navigate to a newly requested folder.

## Zustand stores

| Store                  | Responsibility                                     | Persisted?                   |
| ---------------------- | -------------------------------------------------- | ---------------------------- |
| `window-store`         | Window lifecycle, position, size, and focus order  | No                           |
| `filesystem-store`     | Virtual nodes, editing, trash, restore, and delete | No                           |
| `settings-store`       | Wallpaper and accent color                         | Yes                          |
| `control-center-store` | UI toggles, brightness, and volume                 | Yes, except panel visibility |
| `context-menu-store`   | Context menu coordinates and actions               | No                           |
| `socket-store`         | Validated telemetry, reconnects, and demo fallback | No                           |

## Virtual filesystem

The active filesystem is `filesystem-store.ts`. Nodes contain parent and child IDs, optional text content, app associations, and trash metadata. The unused legacy filesystem implementation was removed.

Folder deletion and emptying Trash recursively remove descendants. Moving a folder to Trash marks its subtree while preserving hierarchy. Restoring clears that state and returns the root to its original folder when possible. The store remains intentionally ephemeral until a persistence design is chosen.

## Terminal safety model

The terminal resolves paths against the browser store. Unknown commands return a local `command not found` response and are never forwarded over the network. This keeps behavior predictable across operating systems without exposing a backend shell, username, path, or filesystem.

## Telemetry lifecycle

The socket store accepts only a structurally valid `metrics.updated` message. It reconnects with capped exponential backoff and jitter and publishes clearly labelled demo telemetry only while disconnected. An intentional disconnect clears timers and prevents reconnection; `Desktop` disconnects the store when it unmounts.

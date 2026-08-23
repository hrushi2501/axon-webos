# AI Copilot

## Request flow

The Copilot window uses Vercel AI SDK's React integration to send messages and current open-window context to `apps/web/app/api/chat/route.ts`. The route builds a portfolio system prompt from `lib/data.ts` and streams Gemini 2.5 Flash output back to the browser.

Set either `GEMINI_API_KEY` or `GOOGLE_GENERATIVE_AI_API_KEY` in `apps/web/.env.local`. The route maps the first variable to the provider's expected name for convenience. Never place the secret in a `NEXT_PUBLIC_` variable.

## Tool model

The model may request these browser-side actions:

- `openWindow({ appId, title })`
- `closeWindow({ windowId })`
- `changeTheme({ setting: "wallpaper" | "color", value })`

The route describes tools for model planning. The browser receives a tool invocation and applies it through the correct Zustand store. Requested app IDs are checked against the application registry.

## Guardrails

- The prompt treats `lib/data.ts` as the source of portfolio facts and tells the model not to invent information.
- Open-window context is descriptive only; the model cannot run host commands or inspect virtual files.
- The Gemini key is optional for the overall product. Desktop, filesystem, terminal, and telemetry behavior continue without it.

## Current limitation

The Copilot uses the installed AI SDK's typed UI-message and tool-part model, but browser integration tests are not yet present. Add Playwright coverage for streamed text, window actions, invalid app IDs, and theme actions before expanding the tool set.

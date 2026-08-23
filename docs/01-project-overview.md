# Project overview

## Purpose

Axon OS is an interactive portfolio presented as a desktop operating-system simulation in the browser. Professional information is explored through windows, desktop icons, virtual files, applications, and an optional AI assistant instead of a conventional static page.

## User journey

1. A short boot sequence introduces the desktop.
2. The About window opens automatically; desktop icons, the Start menu, taskbar, and command palette launch other apps.
3. Visitors can explore virtual folders, edit virtual text files, use terminal-like commands, view projects and resume details, or ask the Copilot about the portfolio.
4. Task Manager displays either live server telemetry or clearly labelled demo telemetry when the API is unavailable.

## Implemented feature inventory

| Area               | Implemented behavior                                                                                   | Data lifetime        |
| ------------------ | ------------------------------------------------------------------------------------------------------ | -------------------- |
| Windows            | Open, focus, drag, resize, minimize, maximize, close                                                   | Current page session |
| Virtual filesystem | Create, rename, edit, ZIP export, move to trash, restore, recursively delete                           | Current page session |
| Terminal           | `ls`, `cd`, `pwd`, `mkdir`, `touch`, `rm`, `cat`, `open`, `history`, `date`, `echo`, `clear`, `reboot` | Current page session |
| Settings           | Wallpaper, accent color, control-center toggles, brightness, volume                                    | Browser localStorage |
| Telemetry          | REST health/metrics plus a one-second WebSocket stream                                                 | API process lifetime |
| Copilot            | Streaming Gemini portfolio chat with window and theme tool requests                                    | Current chat session |

## Intentional simulations

- The filesystem is an in-browser virtual filesystem, not the visitor's disk.
- Terminal commands act only on that virtual filesystem and never execute operating-system commands.
- Task Manager process rows and per-app memory are visual simulations. Only the telemetry header can represent live API-host metrics.
- The contact form opens a prefilled draft in the visitor's email application; Axon OS does not claim that a message was delivered.
- Several control-center toggles are visual settings and do not change the visitor's operating system or hardware.
- The mounted background is CSS-based; Axon OS does not claim to use WebGPU or a 3D scene.

## Non-goals

Axon OS is not an actual operating system, remote shell, host-file manager, or monitoring agent for the visitor's computer. These boundaries are deliberate for safety and consistent behavior across macOS, Windows, Linux, and hosted deployments.

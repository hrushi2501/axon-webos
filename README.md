# 🧠 Axon OS: The Intelligent Portfolio

> **"Experience the Future of Personal Portfolios."**

Axon OS is a **Sovereign Stack** operating system running entirely in your browser. It blends high-performance web graphics (WebGPU) with a robust Rust backend and a state-of-the-art AI core to create an immersive, context-aware user experience.

---

## 🌌 Core Features

### 🤖 **Axon Copilot (Powered by Gemini 2.5 Flash)**
The heart of the OS is the **Axon Copilot**, an intelligent assistant that knows everything about the developer (Hrushi).
*   **Master Prompt Technology**: A centralized intelligence directive ensures the AI never breaks character and always provides accurate, portfolio-based answers.
*   **Context Awareness**: The AI "sees" what you see. Open a window, and the AI knows it's there.
*   **OS Control**: Ask the AI to *"Open the Resume"* or *"Open my Projects"*, and it will control the system for you.

### 🖥️ **Desktop Environment**
*   **Glassmorphism UI**: A sleek, neon-accented design language that feels premium and futuristic.
*   **Window Management**: Drag, resize, minimize, and maximize windows just like a native OS.
*   **Interactive Desktop**: 3D WebGPU backgrounds and dynamic icons.

### ⚡ **System Features**
*   **Rust Backend**: A high-performance `axum` server providing real-time system stats (CPU, RAM) via WebSockets.
*   **Live Terminal**: A ZSH-like shell that executes commands on the backend.
*   **File System**: A virtual in-memory file system for exploring the OS.

---

## 🚀 Quick Start

This monorepo uses **TurboRepo** to launch the entire stack (Next.js Frontend + Rust Backend) with one command.

### Prerequisites
1.  **Node.js** (v18+)
2.  **Rust** (Latest Stable) -> [Install Rust](https://rustup.rs/)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Set up Environment Variables
# Create apps/web/.env.local and add your Gemini API Key:
echo "GEMINI_API_KEY=your_key_here" > apps/web/.env.local

# 3. Launch the OS
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** to enter the system.
The backend API will run on `ws://localhost:3001`.

---

## 📂 Architecture

*   **`apps/web`**: Next.js 15, React 19, TailwindCSS, Framer Motion.
*   **`apps/api`**: Rust, Axum, Tokio, SystemStat.
*   **`packages/ui`**: Shared design system and utilities.

---

## 🛠️ Troubleshooting

### "Gemini API Key not found"
Make sure you have an `.env.local` file in `apps/web` with a valid `GEMINI_API_KEY`. You can get one from Google AI Studio.

### "Rust/Cargo not found"
Ensure Rust is in your system PATH. Try restarting your terminal after installing Rust.

---

*Built with ❤️ by Hrushi Bhanvadiya*

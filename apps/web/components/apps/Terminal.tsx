import React, { useState, useRef, useEffect, useMemo } from "react";
import { useWindowStore } from "@/store/window-store";
import { useFileSystem } from "@/store/filesystem-store";
import { commands } from "@/lib/terminal/commands";
import { getFullPath } from "@/lib/terminal/utils";
import { TerminalOutput, CommandContext } from "@/lib/terminal/types";

export const Terminal = () => {
  const [history, setHistory] = useState<TerminalOutput[]>([]);
  const [input, setInput] = useState("");

  // Default to resolving 'root' or 'desktop' on first load, depending on preference.
  // Let's start at desktop for better UX
  const [currentPathId, setCurrentPathId] = useState("desktop");

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { openWindow } = useWindowStore();
  const fileSystem = useFileSystem();

  const initialized = useRef(false);

  // Boot sequence effect
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const bootLines = [
      "AXON BIOS v1.0.4",
      "Copyright (C) 2024 Axon Corp.",
      "Checking Memory... OK",
      "Loading Kernel... OK",
      "Mounting VFS... OK",
      "Initializing Shell...",
      "Welcome to AxonOS Terminal.",
      "Type 'help' for available commands.",
    ];

    let delay = 0;
    bootLines.forEach((line) => {
      delay += Math.random() * 300 + 100;
      setTimeout(() => {
        setHistory((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random().toString(),
            text: line,
            color: "text-gray-300",
          },
        ]);
      }, delay);
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleCommand = async (cmdStr: string) => {
    if (!cmdStr.trim()) return;

    // Add command to history
    const currentPathStr = getFullPath(currentPathId, fileSystem.files);
    setHistory((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: cmdStr,
        isCommand: true,
        path: currentPathStr,
      },
    ]);

    const parts = cmdStr.trim().split(" ");
    const commandName = (parts[0] || "").toLowerCase();
    const args = parts.slice(1);

    // Check if it is a local VFS command
    if (commands[commandName]) {
      const context: CommandContext = {
        args,
        currentPathId,
        fileSystem,
        system: {
          openWindow,
          clear: () => setHistory([]),
          setHistory,
          getCommandHistory: () =>
            history.filter((item) => item.isCommand).map((item) => item.text),
        },
      };

      try {
        const result = await commands[commandName](context);

        if (result) {
          if (result.newPathId) {
            setCurrentPathId(result.newPathId);
          }
          if (result.output) {
            const outputs = Array.isArray(result.output)
              ? result.output
              : [result.output];
            outputs.forEach((line) => {
              if (line) {
                setHistory((prev) => [
                  ...prev,
                  {
                    id: Date.now() + Math.random().toString(),
                    text: line,
                    color: result.color,
                  },
                ]);
              }
            });
          }
        }
      } catch (error) {
        setHistory((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            text: `Error executing ${commandName}: ${error}`,
            color: "text-red-400",
          },
        ]);
      }
    } else {
      setHistory((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: `axon: ${commandName}: command not found`,
          color: "text-red-400",
        },
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCommand(input);
      setInput("");
    }
  };

  // Calculate dynamic path for prompt
  const promptPath = useMemo(() => {
    const full = getFullPath(currentPathId, fileSystem.files);
    if (full.startsWith("/Desktop")) return "~" + full.substring(8);
    if (full === "/root") return "/";
    return full;
  }, [currentPathId, fileSystem.files]);

  return (
    <div
      className="h-full w-full bg-black/80 backdrop-blur-xl text-gray-300 font-mono text-sm p-4 overflow-hidden flex flex-col selection:bg-gray-700 selection:text-white relative"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Scanline effect overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_4px,3px_100%]" />

      <div className="flex-1 overflow-auto space-y-1 pb-2 relative z-0 scrollbar-hide">
        {history.map((item) => (
          <div
            key={item.id}
            className={`${item.color || "text-gray-300"} whitespace-pre-wrap break-words`}
          >
            {item.isCommand ? (
              <div className="flex gap-2">
                <span className="text-green-400">
                  guest@axon-os:{item.path || "~"}$
                </span>
                <span className="text-gray-100">{item.text}</span>
              </div>
            ) : (
              item.text
            )}
          </div>
        ))}

        <div className="flex items-center gap-2">
          <span className="text-green-400">guest@axon-os:{promptPath}$</span>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent outline-none border-none text-gray-100 caret-transparent"
              autoFocus
            />
            {/* Custom Block Cursor */}
            <div
              className="absolute top-0 h-4 w-2 bg-gray-300 animate-pulse pointer-events-none"
              style={{ left: `${input.length * 8.4}px` }} // Approx char width for monospace
            />
          </div>
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

import React, { useEffect, useState, useRef } from "react";
import { useWindowStore } from "@/store/window-store";
import {
  Search,
  User,
  FileText,
  FolderGit2,
  Terminal as TerminalIcon,
  FolderOpen,
  Bot,
  Monitor,
  X,
} from "lucide-react";

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { openWindow } = useWindowStore();

  const commands = [
    {
      id: "about",
      label: "About Me",
      icon: User,
      action: () => openWindow("about"),
    },
    {
      id: "resume",
      label: "Resume",
      icon: FileText,
      action: () => openWindow("resume"),
    },
    {
      id: "projects",
      label: "Projects",
      icon: FolderGit2,
      action: () => openWindow("projects"),
    },
    {
      id: "files",
      label: "File Explorer",
      icon: FolderOpen,
      action: () => openWindow("files"),
    },
    {
      id: "terminal",
      label: "Terminal",
      icon: TerminalIcon,
      action: () => openWindow("terminal"),
    },
    {
      id: "copilot",
      label: "AI Assistant",
      icon: Bot,
      action: () => openWindow("copilot"),
    },
    {
      id: "reload",
      label: "Reload System",
      icon: Monitor,
      action: () => window.location.reload(),
    },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 10);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(
        (prev) =>
          (prev - 1 + filteredCommands.length) % filteredCommands.length,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[20vh]"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg bg-black border border-white/20 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center border-b border-[rgba(var(--accent-color),0.2)] px-3 py-2">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 text-[rgb(var(--accent-color))]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent outline-none text-sm text-[rgb(var(--accent-color))] placeholder:text-[rgba(var(--accent-color),0.5)] neon-text"
          />
          <button
            onClick={() => setOpen(false)}
            className="ml-2 text-white/50 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[300px] overflow-y-auto p-2 custom-scrollbar">
          {filteredCommands.length === 0 ? (
            <div className="py-6 text-center text-sm text-white/50">
              No results found.
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-xs font-medium text-white/50 px-2 py-1.5 uppercase tracking-wider">
                Apps & Commands
              </div>
              {filteredCommands.map((cmd, index) => (
                <button
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    setOpen(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors ${
                    index === selectedIndex
                      ? "bg-[rgba(var(--accent-color),0.2)] text-[rgb(var(--accent-color))]"
                      : "text-[rgba(var(--accent-color),0.8)] hover:bg-[rgba(var(--accent-color),0.1)]"
                  }`}
                >
                  <cmd.icon className="mr-2 h-4 w-4" />
                  <span>{cmd.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-white/10 px-3 py-1.5 flex justify-between items-center bg-white/5">
          <div className="text-[10px] text-white/40">
            <span className="font-medium text-white/60">↑↓</span> to navigate
          </div>
          <div className="text-[10px] text-white/40">
            <span className="font-medium text-white/60">↵</span> to select
          </div>
        </div>
      </div>
    </div>
  );
};

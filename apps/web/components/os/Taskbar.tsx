import React, { useState, useEffect, useRef } from "react";
import { useWindowStore } from "@/store/window-store";
import { cn } from "@/lib/utils";
import { Grip, Maximize2, Settings, Trash2 } from "lucide-react";
import { StartMenu } from "./StartMenu";
import { SystemTray } from "./SystemTray";
import { useSound } from "@/components/providers/sound-context";
import { useContextMenuStore } from "@/store/context-menu-store";
import { APP_REGISTRY, PINNED_APPS } from "@/config/app-registry";

export const Taskbar = () => {
  const {
    windows,
    activeWindowId,
    minimizeWindow,
    restoreWindow,
    focusWindow,
    openWindow,
    closeWindow,
  } = useWindowStore();
  const [isStartOpen, setIsStartOpen] = useState(false);
  const startMenuRef = useRef<HTMLDivElement>(null);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const { playSound } = useSound();
  const { openContextMenu } = useContextMenuStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        startMenuRef.current &&
        !startMenuRef.current.contains(event.target as Node) &&
        startButtonRef.current &&
        !startButtonRef.current.contains(event.target as Node)
      ) {
        setIsStartOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAppClick = (appId: string) => {
    playSound("click");
    const windowId = appId; // Simple mapping for pinned apps
    const isOpen = windows[windowId];

    if (isOpen) {
      if (isOpen.isMinimized) {
        restoreWindow(windowId);
      } else if (activeWindowId === windowId) {
        minimizeWindow(windowId);
      } else {
        focusWindow(windowId);
      }
    } else {
      openWindow(appId);
    }
  };

  const handleTaskbarContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openContextMenu(e.clientX, e.clientY, [
      {
        label: "Taskbar Settings",
        icon: <Settings className="w-4 h-4" />,
        action: () => openWindow("settings"),
      },
    ]);
  };

  return (
    <>
      <div ref={startMenuRef}>
        <StartMenu isOpen={isStartOpen} onClose={() => setIsStartOpen(false)} />
      </div>

      {/* Outer wrapper: centers the pill */}
      <div className="fixed bottom-0 inset-x-0 flex justify-center z-[9999] pointer-events-none">
        {/* Pill */}
        <div
          className={cn(
            "pointer-events-auto glass-panel h-14 px-12",
            "flex items-center gap-6 w-full justify-center select-none",
            "border-x-0 border-b-0 rounded-none bg-black/40 backdrop-blur-xl",
          )}
          onContextMenu={handleTaskbarContextMenu}
        >
          {/* Start button */}
          <button
            ref={startButtonRef}
            onClick={() => {
              playSound("click");
              setIsStartOpen(!isStartOpen);
            }}
            onMouseEnter={() => playSound("hover")}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl",
              "transition-all duration-300 group relative overflow-hidden active:scale-95",
              isStartOpen
                ? "bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.15)] scale-105"
                : "hover:bg-white/5 hover:scale-105",
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-[rgba(var(--accent-color),0.2)] to-[#003300]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Grip className="h-6 w-6 text-white/80 group-hover:text-white transition-colors relative z-10" />
          </button>

          {/* Divider */}
          <div className="h-8 w-px bg-[rgba(var(--accent-color),0.25)]" />

          {/* Pinned apps */}
          <div className="flex items-center gap-6">
            {PINNED_APPS.map((appId) => {
              const app = APP_REGISTRY[appId];
              if (!app) return null;

              const windowId = appId;
              const isOpen = !!windows[windowId];
              const isActive =
                activeWindowId === windowId && !windows[windowId]?.isMinimized;

              return (
                <button
                  key={appId}
                  onClick={() => handleAppClick(appId)}
                  onMouseEnter={() => playSound("hover")}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const isOpenNow = !!windows[windowId];

                    openContextMenu(e.clientX, e.clientY, [
                      {
                        label: isOpenNow ? "Focus" : "Open",
                        icon: <Maximize2 className="w-4 h-4" />,
                        action: () => handleAppClick(appId),
                      },
                      {
                        label: "Close",
                        icon: <Trash2 className="w-4 h-4" />,
                        danger: true,
                        disabled: !isOpenNow,
                        action: () => {
                          if (isOpenNow) closeWindow(windowId);
                        },
                      },
                    ]);
                  }}
                  className={cn(
                    "group relative flex h-11 w-11 items-center justify-center rounded-xl",
                    "transition-all duration-300 active:scale-95",
                    isActive
                      ? "bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)] scale-105"
                      : "hover:bg-white/5 hover:scale-110",
                    isOpen && !isActive && "bg-white/5",
                  )}
                >
                  {isOpen && (
                    <div
                      className={cn(
                        "absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full",
                        "transition-all duration-300",
                        isActive
                          ? "bg-[rgb(var(--accent-color))] shadow-[0_0_10px_rgba(var(--accent-color),0.8)]"
                          : "bg-[rgba(var(--accent-color),0.3)]",
                      )}
                    />
                  )}

                  <app.icon
                    className={cn(
                      "h-6 w-6 transition-all duration-300",
                      isActive
                        ? "text-[rgb(var(--accent-color))] drop-shadow-[0_0_8px_rgba(var(--accent-color),0.5)]"
                        : "text-[rgba(var(--accent-color),0.6)] group-hover:text-[rgb(var(--accent-color))]",
                    )}
                  />
                </button>
              );
            })}
          </div>

          {/* Divider before tray */}
          <div className="h-8 w-px bg-[rgba(var(--accent-color),0.25)] ml-2" />

          {/* System tray */}
          <div className="flex items-center h-full">
            <SystemTray />
          </div>
        </div>
      </div>
    </>
  );
};

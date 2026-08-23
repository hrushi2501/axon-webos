import React, { useRef, useEffect } from "react";
import Draggable from "react-draggable";
import { useWindowStore } from "@/store/window-store";
import { X, Minus, Square } from "lucide-react";
import { APP_REGISTRY } from "@/config/app-registry";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { AppErrorBoundary } from "./AppErrorBoundary";

interface WindowProps {
  id: string;
}

export const Window = ({ id }: WindowProps) => {
  const {
    windows,
    focusWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    updateWindowPosition,
    updateWindowSize,
    windowOrder,
  } = useWindowStore();
  const windowState = windows[id];
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = React.useState(false);

  const isActive = useWindowStore.getState().activeWindowId === id;
  const zIndex = windowOrder.indexOf(id) + 10;

  // Focus management
  useEffect(() => {
    if (isActive && nodeRef.current) {
      // Small timeout to ensure DOM is ready and prevent fighting with other focus events
      setTimeout(() => {
        nodeRef.current?.focus({ preventScroll: true });
      }, 10);
    }
  }, [isActive]);

  if (!windowState || !windowState.isOpen || windowState.isMinimized)
    return null;

  // Resize logic
  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    focusWindow(id);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = windowState.size.width;
    const startHeight = windowState.size.height;
    const startPosX = windowState.position.x;
    const startPosY = windowState.position.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startPosX;
      let newY = startPosY;

      if (direction.includes("e"))
        newWidth = Math.max(300, startWidth + deltaX);
      if (direction.includes("s"))
        newHeight = Math.max(200, startHeight + deltaY);
      if (direction.includes("w")) {
        const w = Math.max(300, startWidth - deltaX);
        newWidth = w;
        newX = startPosX + (startWidth - w);
      }
      if (direction.includes("n")) {
        const h = Math.max(200, startHeight - deltaY);
        newHeight = h;
        newY = startPosY + (startHeight - h);
      }

      if (newWidth !== startWidth || newHeight !== startHeight) {
        updateWindowSize(id, { width: newWidth, height: newHeight });
      }
      if (newX !== startPosX || newY !== startPosY) {
        updateWindowPosition(id, { x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <Draggable
      handle=".window-header"
      cancel=".no-drag"
      nodeRef={nodeRef}
      position={windowState.isMaximized ? { x: 0, y: 0 } : windowState.position}
      onStart={() => focusWindow(id)}
      onStop={(e, data) => {
        if (!windowState.isMaximized) {
          // Update store with new position
          updateWindowPosition(id, { x: data.x, y: data.y });
        }
      }}
      disabled={windowState.isMaximized || isResizing}
    >
      <div
        ref={nodeRef}
        className="absolute"
        style={{
          width: windowState.isMaximized ? "100vw" : windowState.size.width,
          height: windowState.isMaximized ? "100vh" : windowState.size.height,
          zIndex: zIndex,
        }}
      >
        <motion.div
          tabIndex={-1}
          initial={{ opacity: 0, scale: 0.9, y: 20, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.95, y: 10, filter: "blur(5px)" }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={cn(
            "flex flex-col w-full h-full overflow-hidden transition-all duration-200 pointer-events-auto outline-none glass-panel rounded-lg",
            isActive
              ? "border-[rgba(var(--accent-color),0.3)] shadow-[0_0_30px_rgba(var(--accent-color),0.15)]"
              : "border-[rgba(var(--accent-color),0.1)] shadow-none",
            windowState.isMaximized ? "rounded-none border-0" : "",
          )}
          onClick={() => focusWindow(id)}
        >
          {/* Resize Handles - Increased hit area */}
          {!windowState.isMaximized && (
            <>
              <div
                className="absolute top-0 left-0 w-full h-2 -mt-1 cursor-n-resize z-50 hover:bg-[rgba(var(--accent-color),0.2)] transition-colors"
                onMouseDown={(e) => handleResizeStart(e, "n")}
              />
              <div
                className="absolute bottom-0 left-0 w-full h-2 -mb-1 cursor-s-resize z-50 hover:bg-[rgba(var(--accent-color),0.2)] transition-colors"
                onMouseDown={(e) => handleResizeStart(e, "s")}
              />
              <div
                className="absolute top-0 left-0 h-full w-2 -ml-1 cursor-w-resize z-50 hover:bg-[rgba(var(--accent-color),0.2)] transition-colors"
                onMouseDown={(e) => handleResizeStart(e, "w")}
              />
              <div
                className="absolute top-0 right-0 h-full w-2 -mr-1 cursor-e-resize z-50 hover:bg-[rgba(var(--accent-color),0.2)] transition-colors"
                onMouseDown={(e) => handleResizeStart(e, "e")}
              />

              {/* Corners */}
              <div
                className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize z-50"
                onMouseDown={(e) => handleResizeStart(e, "nw")}
              />
              <div
                className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize z-50"
                onMouseDown={(e) => handleResizeStart(e, "ne")}
              />
              <div
                className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize z-50"
                onMouseDown={(e) => handleResizeStart(e, "sw")}
              />
              <div
                className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-50"
                onMouseDown={(e) => handleResizeStart(e, "se")}
              />
            </>
          )}

          {/* Header */}
          <div
            className="window-header relative z-50 flex h-12 w-full shrink-0 items-center justify-between px-4 select-none"
            onDoubleClick={() =>
              windowState.isMaximized ? restoreWindow(id) : maximizeWindow(id)
            }
          >
            <div className="flex items-center gap-3">
              {/* Icon Lookup */}
              {(() => {
                const AppIcon = APP_REGISTRY[windowState.appId]?.icon;
                return AppIcon ? (
                  <div className="text-[rgba(var(--accent-color),0.7)]">
                    <AppIcon className="h-5 w-5" />
                  </div>
                ) : null;
              })()}

              <span className="text-sm font-medium text-[rgba(var(--accent-color),0.9)] tracking-wide font-mono shadow-black/50 drop-shadow-sm neon-text">
                {windowState.title}
              </span>
            </div>

            <div className="flex items-center h-full gap-2">
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  minimizeWindow(id);
                }}
                className="no-drag flex h-8 w-8 items-center justify-center rounded-md hover:bg-[rgba(var(--accent-color),0.1)] text-[rgba(var(--accent-color),0.5)] hover:text-[rgb(var(--accent-color))] transition-all duration-200 cursor-pointer relative z-[60]"
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  if (windowState.isMaximized) {
                    restoreWindow(id);
                  } else {
                    maximizeWindow(id);
                  }
                }}
                className="no-drag flex h-8 w-8 items-center justify-center rounded-md hover:bg-[rgba(var(--accent-color),0.1)] text-[rgba(var(--accent-color),0.5)] hover:text-[rgb(var(--accent-color))] transition-all duration-200 cursor-pointer relative z-[60]"
              >
                {windowState.isMaximized ? (
                  <div className="relative">
                    <Square className="h-3 w-3 ml-1 mt-1" />
                    <Square className="h-3 w-3 absolute top-0 left-0 -ml-0.5 -mt-0.5" />
                  </div>
                ) : (
                  <Square className="h-3.5 w-3.5" />
                )}
              </button>
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  closeWindow(id);
                }}
                className="no-drag flex h-8 w-8 items-center justify-center rounded-md hover:bg-red-500/80 hover:shadow-[0_0_10px_rgba(239,68,68,0.5)] text-[rgba(var(--accent-color),0.5)] hover:text-white transition-all duration-200 cursor-pointer relative z-[60]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto bg-transparent p-0">
            {(() => {
              const AppComponent = APP_REGISTRY[windowState.appId]?.component;
              return AppComponent ? (
                <AppErrorBoundary appName={windowState.title}>
                  <AppComponent
                    windowId={id}
                    {...(windowState.initialData ?? {})}
                  />
                </AppErrorBoundary>
              ) : (
                <div className="flex items-center justify-center h-full text-red-500">
                  App not found
                </div>
              );
            })()}
          </div>
        </motion.div>
      </div>
    </Draggable>
  );
};

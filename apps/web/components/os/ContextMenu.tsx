"use client";

import { useEffect, useRef } from "react";
import { useContextMenuStore } from "@/store/context-menu-store";
import { motion, AnimatePresence } from "framer-motion";

export const ContextMenu = () => {
  const { isOpen, x, y, items, closeContextMenu } = useContextMenuStore();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeContextMenu();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("contextmenu", (e) => {
        // Allow opening a new context menu elsewhere, but for now just close if clicking outside
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
          // Let the new context menu event handler take over, so we don't prevent default here
        }
      });
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, closeContextMenu]);

  // Adjust position to keep menu within viewport
  const adjustedX =
    typeof window !== "undefined" && x + 200 > window.innerWidth ? x - 200 : x;
  const adjustedY =
    typeof window !== "undefined" && y + items.length * 40 > window.innerHeight
      ? y - items.length * 40
      : y;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="fixed z-[9999] min-w-[200px] glass-panel rounded-xl overflow-hidden py-1.5"
          style={{ top: adjustedY, left: adjustedX }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {items.map((item, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => {
                if (!item.disabled) {
                  item.action();
                  closeContextMenu();
                }
              }}
              disabled={item.disabled}
              className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-[rgba(var(--accent-color),0.1)] transition-colors
                ${item.danger ? "text-red-400 hover:bg-red-500/10" : "text-[rgba(var(--accent-color),0.8)] hover:text-[rgb(var(--accent-color))]"}
                ${item.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {item.icon && (
                <span className="w-4 h-4 opacity-70">{item.icon}</span>
              )}
              <span className="flex-1 font-medium">{item.label}</span>
              {item.shortcut && (
                <span className="text-xs text-[rgba(var(--accent-color),0.3)] font-mono">
                  {item.shortcut}
                </span>
              )}
            </motion.button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

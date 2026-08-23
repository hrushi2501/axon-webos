import React, { useState } from "react";
import {
  useSettingsStore,
  WALLPAPERS,
  ACCENT_COLORS,
} from "@/store/settings-store";
import { Monitor, Palette, Server, HardDrive, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "personalization", label: "Personalization", icon: Palette },
  { id: "system", label: "System", icon: Monitor },
];

export const Settings = () => {
  const [activeTab, setActiveTab] = useState("personalization");
  const { wallpaperId, setWallpaper, accentColorId, setAccentColor } =
    useSettingsStore();

  return (
    <div className="flex h-full w-full bg-black/40 backdrop-blur-xl text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r border-white/10 p-4 flex flex-col gap-2 bg-black/20">
        <div className="px-4 py-2 mb-4">
          <h1 className="text-xl font-bold tracking-tight">Settings</h1>
        </div>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-left",
              activeTab === tab.id
                ? "bg-[rgba(var(--accent-color),0.2)] text-[rgb(var(--accent-color))] border border-[rgba(var(--accent-color),0.2)]"
                : "text-[rgba(var(--accent-color),0.6)] hover:bg-[rgba(var(--accent-color),0.1)] hover:text-[rgb(var(--accent-color))]",
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8">
        {activeTab === "personalization" && (
          <div className="space-y-8 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section>
              <h2 className="text-lg font-semibold mb-4">Wallpaper</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {WALLPAPERS.map((wp) => (
                  <button
                    key={wp.id}
                    onClick={() => setWallpaper(wp.id)}
                    className={cn(
                      "relative aspect-video rounded-lg overflow-hidden border-2 transition-all group",
                      wallpaperId === wp.id
                        ? "border-[rgb(var(--accent-color))] shadow-[0_0_15px_rgba(var(--accent-color),0.3)]"
                        : "border-transparent hover:border-[rgba(var(--accent-color),0.5)]",
                    )}
                  >
                    <div
                      className="absolute inset-0"
                      style={{ background: wp.value }}
                    />
                    {wallpaperId === wp.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Check className="h-6 w-6 text-white drop-shadow-md" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-medium">{wp.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4">Accent Color</h2>
              <div className="flex flex-wrap gap-4">
                {ACCENT_COLORS.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setAccentColor(color.id)}
                    className={cn(
                      "h-12 w-12 rounded-full border-2 flex items-center justify-center transition-all",
                      accentColorId === color.id
                        ? "border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                        : "border-transparent hover:scale-105",
                    )}
                    style={{ backgroundColor: `rgb(${color.value})` }}
                  >
                    {accentColorId === color.id && (
                      <Check className="h-5 w-5 text-white drop-shadow-md" />
                    )}
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === "system" && (
          <div className="space-y-6 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-6 p-6 rounded-2xl bg-[rgba(var(--accent-color),0.05)] border border-[rgba(var(--accent-color),0.2)]">
              <div className="h-24 w-24 rounded-full bg-black border border-[rgb(var(--accent-color))] flex items-center justify-center text-3xl font-bold shadow-[0_0_20px_rgba(var(--accent-color),0.3)] text-[rgb(var(--accent-color))]">
                AX
              </div>
              <div>
                <h2 className="text-2xl font-bold">Axon OS</h2>
                <p className="text-white/60">Version 2.0.0</p>
                <div className="mt-4 flex gap-2">
                  <span className="px-2 py-1 rounded bg-[rgba(var(--accent-color),0.1)] text-xs font-mono text-[rgb(var(--accent-color))]">
                    NODE + TYPESCRIPT
                  </span>
                  <span className="px-2 py-1 rounded bg-[rgba(var(--accent-color),0.2)] text-[rgb(var(--accent-color))] text-xs font-mono">
                    CROSS-PLATFORM
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <Server className="h-5 w-5 text-[rgb(var(--accent-color))]" />
                  <span className="font-medium text-[rgb(var(--accent-color))]">
                    Runtime
                  </span>
                </div>
                <p className="text-sm text-white/70">Next.js + React</p>
                <p className="text-xs text-white/40">Browser client</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <Monitor className="h-5 w-5 text-[rgb(var(--accent-color))]" />
                  <span className="font-medium text-[rgb(var(--accent-color))]">
                    Compatibility
                  </span>
                </div>
                <p className="text-sm text-white/70">macOS, Windows, Linux</p>
                <p className="text-xs text-white/40">Including Apple Silicon</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <HardDrive className="h-5 w-5 text-[rgb(var(--accent-color))]" />
                  <span className="font-medium text-[rgb(var(--accent-color))]">
                    Storage
                  </span>
                </div>
                <p className="text-sm text-white/70">Virtual Filesystem</p>
                <p className="text-xs text-white/40">
                  Session-based browser data
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

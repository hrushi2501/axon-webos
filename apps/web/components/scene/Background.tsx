import React from "react";
import { useSettingsStore } from "@/store/settings-store";

export const Background = React.memo(() => {
  const { getWallpaperValue } = useSettingsStore();
  const [mounted, setMounted] = React.useState(false);
  const backgroundStyle = getWallpaperValue();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Default background for server-side rendering to match initial client state if possible,
  // or just a safe default to avoid mismatch.
  // Ideally, we render a static background first, then switch.
  // But to fix the specific error, we can suppress it or ensure consistency.
  // The error is because server renders one thing and client renders another immediately.
  // We'll use the store value only after mount.

  const style = mounted
    ? { background: backgroundStyle }
    : {
        background:
          "radial-gradient(circle at center, #1a1a1a 0%, #000000 100%)",
      }; // Default fallback

  return (
    <div
      className="absolute inset-0 z-0 bg-black overflow-hidden pointer-events-none transition-all duration-1000 ease-in-out"
      style={style}
    >
      {/* Base Grid of Dots (Static) */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Blinking Dots Layer 1 */}
      <div
        className="absolute inset-0 opacity-0 animate-pulse-slow"
        style={{
          backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
          backgroundSize: "120px 120px",
          backgroundPosition: "20px 20px",
        }}
      />

      {/* Blinking Dots Layer 2 (Offset & Faster) */}
      <div
        className="absolute inset-0 opacity-0 animate-pulse-fast"
        style={{
          backgroundImage: "radial-gradient(#888 1px, transparent 1px)",
          backgroundSize: "90px 90px",
          backgroundPosition: "10px 50px",
        }}
      />

      {/* Scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_4px,3px_100%] opacity-20" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.6)_100%)]" />

      {/* Noise Texture (Optional, using CSS pattern) */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
});

Background.displayName = "Background";

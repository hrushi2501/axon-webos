"use client";

import { Desktop } from "@/components/os/Desktop";
import { SoundProvider } from "@/components/providers/sound-context";
import { ContextMenu } from "@/components/os/ContextMenu";

import { useSettingsStore } from "@/store/settings-store";

import { useEffect } from "react";

export default function Home() {
  const { getAccentColorValue } = useSettingsStore();
  const accentColor = getAccentColorValue();

  useEffect(() => {
    document.documentElement.style.setProperty("--accent-color", accentColor);
  }, [accentColor]);

  return (
    <main className="h-screen w-screen overflow-hidden">
      <SoundProvider>
        <Desktop />
        <ContextMenu />
      </SoundProvider>
    </main>
  );
}

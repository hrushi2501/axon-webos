"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useControlCenterStore } from "@/store/control-center-store";

type SoundType = "click" | "open" | "close" | "error" | "startup" | "hover";

interface SoundContextType {
  playSound: (type: SoundType) => void;
  volume: number;
  setVolume: (volume: number) => void;
  isMuted: boolean;
  toggleMute: () => void;
}

const SOUND_FREQUENCIES: Record<SoundType, number> = {
  click: 520,
  open: 660,
  close: 330,
  error: 180,
  startup: 780,
  hover: 440,
};

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider = ({ children }: { children: React.ReactNode }) => {
  const { volume, setVolume } = useControlCenterStore();
  const [isMuted, setIsMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(
    () => () => {
      void audioContextRef.current?.close();
    },
    [],
  );

  const playSound = useCallback(
    (type: SoundType) => {
      if (isMuted || volume === 0) return;

      try {
        const audioContext = audioContextRef.current ?? new AudioContext();
        audioContextRef.current = audioContext;

        if (audioContext.state === "suspended") {
          void audioContext.resume();
        }

        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const now = audioContext.currentTime;
        const duration = type === "startup" ? 0.18 : 0.06;

        oscillator.type = type === "error" ? "sawtooth" : "sine";
        oscillator.frequency.setValueAtTime(SOUND_FREQUENCIES[type], now);
        gain.gain.setValueAtTime(Math.max(0.0001, (volume / 100) * 0.08), now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start(now);
        oscillator.stop(now + duration);
      } catch {
        // Audio is non-essential and may be blocked until a browser receives user input.
      }
    },
    [isMuted, volume],
  );

  const toggleMute = useCallback(() => setIsMuted((muted) => !muted), []);

  return (
    <SoundContext.Provider
      value={{ playSound, volume, setVolume, isMuted, toggleMute }}
    >
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error("useSound must be used within a SoundProvider");
  }

  return context;
};

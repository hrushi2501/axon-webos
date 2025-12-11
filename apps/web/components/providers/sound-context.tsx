"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type SoundType = "click" | "open" | "close" | "error" | "startup" | "hover";

interface SoundContextType {
    playSound: (type: SoundType) => void;
    volume: number;
    setVolume: (volume: number) => void;
    isMuted: boolean;
    toggleMute: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

import { useControlCenterStore } from "@/store/control-center-store";

// ... (imports)

export const SoundProvider = ({ children }: { children: React.ReactNode }) => {
    const { volume, setVolume } = useControlCenterStore();
    const [isMuted, setIsMuted] = useState(false);
    const [audioElements, setAudioElements] = useState<Record<SoundType, HTMLAudioElement | null>>({
        click: null,
        open: null,
        close: null,
        error: null,
        startup: null,
        hover: null,
    });

    useEffect(() => {
        // Initialize audio elements
        // Note: You need to add these files to public/sounds/
        setAudioElements({
            click: new Audio("/sounds/click.mp3"),
            open: new Audio("/sounds/open.mp3"),
            close: new Audio("/sounds/close.mp3"),
            error: new Audio("/sounds/error.mp3"),
            startup: new Audio("/sounds/startup.mp3"),
            hover: new Audio("/sounds/hover.mp3"),
        });
    }, []);

    const playSound = (type: SoundType) => {
        if (isMuted) return;

        const audio = audioElements[type];
        if (audio) {
            audio.volume = volume / 100; // Convert 0-100 to 0-1
            audio.currentTime = 0;
            audio.play().catch(e => console.log("Audio play failed:", e));
        }
    };

    const toggleMute = () => setIsMuted(!isMuted);

    return (
        <SoundContext.Provider value={{ playSound, volume, setVolume, isMuted, toggleMute }}>
            {children}
        </SoundContext.Provider>
    );
};

export const useSound = () => {
    const context = useContext(SoundContext);
    if (context === undefined) {
        throw new Error("useSound must be used within a SoundProvider");
    }
    return context;
};

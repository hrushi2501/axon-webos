import React, { useEffect, useState, useRef } from "react";
import { useSettingsStore } from "@/store/settings-store";

export const BootScreen = ({ onComplete }: { onComplete: () => void }) => {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState("Initializing System...");
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { getAccentColorValue } = useSettingsStore();
    const accentColor = getAccentColorValue();

    // Matrix Rain Effect
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const columns = Math.floor(canvas.width / 20);
        const drops: number[] = [];

        for (let i = 0; i < columns; i++) {
            drops[i] = 1;
        }

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = `rgb(${accentColor})`; // Dynamic accent color
            ctx.font = '15px monospace';

            for (let i = 0; i < drops.length; i++) {
                const text = String.fromCharCode(Math.floor(Math.random() * 128));
                const y = (drops[i] || 0) * 20;
                ctx.fillText(text, i * 20, y);

                if (y > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                if (drops[i] !== undefined) {
                    drops[i] = drops[i]! + 1;
                }
            }
        };

        const interval = setInterval(draw, 33);

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);

        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', handleResize);
        };
    }, [accentColor]);

    // Boot Progress Logic
    useEffect(() => {
        const totalDuration = 3500; // Slightly longer for dramatic effect
        const intervalTime = 20;
        const steps = totalDuration / intervalTime;
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            const newProgress = Math.min((currentStep / steps) * 100, 100);
            setProgress(newProgress);

            // Status updates based on progress
            if (newProgress < 20) setStatus("Initializing Kernel...");
            else if (newProgress < 40) setStatus("Loading System Modules...");
            else if (newProgress < 60) setStatus("Verifying User Permissions...");
            else if (newProgress < 80) setStatus("Mounting File System...");
            else if (newProgress < 95) setStatus("Starting User Interface...");
            else setStatus("System Ready.");

            if (currentStep >= steps) {
                clearInterval(timer);
                setTimeout(onComplete, 500);
            }
        }, intervalTime);

        return () => clearInterval(timer);
    }, [onComplete]);

    return (
        <div className="h-full w-full bg-black text-[rgb(var(--accent-color))] font-mono z-[9999] overflow-hidden relative flex flex-col items-center justify-center">
            {/* Matrix Rain Background */}
            <canvas ref={canvasRef} className="absolute inset-0 opacity-20 pointer-events-none" />

            {/* Dome Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />

            {/* Scanlines */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_4px,3px_100%] opacity-40" />

            {/* Central Boot Visuals */}
            <div className="relative z-20 flex flex-col items-center gap-8 w-full max-w-md p-8">
                <div className="text-6xl font-bold tracking-[0.2em] text-[rgb(var(--accent-color))] animate-pulse drop-shadow-[0_0_15px_rgba(var(--accent-color),0.8)]">
                    AXON
                </div>

                <div className="w-full h-8 flex gap-1 p-1 bg-white/5 rounded border border-white/10 backdrop-blur-sm">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div
                            key={i}
                            className={`h-full flex-1 rounded-sm transition-all duration-300 ${i < (progress / 100) * 20
                                    ? "bg-[rgb(var(--accent-color))] shadow-[0_0_10px_rgb(var(--accent-color))]"
                                    : "bg-white/5"
                                }`}
                        />
                    ))}
                </div>

                <div className="flex flex-col items-center gap-2">
                    <div className="text-sm text-[rgb(var(--accent-color))] opacity-80 font-mono tracking-wider uppercase">
                        {status}
                    </div>
                    <div className="text-xs text-[rgb(var(--accent-color))] opacity-50 font-mono">
                        {Math.round(progress)}%
                    </div>
                </div>
            </div>

            <div className="absolute bottom-8 text-[10px] text-white/20 tracking-widest uppercase">
                Axon Operating System v1.0.4
            </div>
        </div>
    );
};

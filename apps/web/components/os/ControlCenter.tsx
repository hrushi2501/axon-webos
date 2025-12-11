import React, { useRef } from "react";
import { useControlCenterStore } from "@/store/control-center-store";
import { useSettingsStore } from "@/store/settings-store";
import { useWindowStore } from "@/store/window-store";
import {
    Wifi, Bluetooth, Moon, Plane, Sun, Volume2,
    Settings, Battery, ChevronRight, Monitor
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useClickOutside } from "@/hooks/use-click-outside";

interface ControlCenterProps {
    triggerRef?: React.RefObject<HTMLElement | null>;
}

export const ControlCenter = ({ triggerRef }: ControlCenterProps) => {
    const {
        isOpen, setOpen,
        wifi, toggleWifi,
        bluetooth, toggleBluetooth,
        dnd, toggleDnd,
        airplaneMode, toggleAirplaneMode,
        nightLight, toggleNightLight,
        volume, setVolume,
        brightness, setBrightness
    } = useControlCenterStore();

    const { openWindow } = useWindowStore();
    const ref = useRef<HTMLDivElement>(null);

    useClickOutside(ref, () => setOpen(false), triggerRef);

    // Enforce minimum brightness of 10%
    const handleBrightnessChange = (val: number) => {
        setBrightness(Math.max(10, val));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "circOut" }}
                    className="absolute bottom-full right-0 mb-4 w-80 glass-panel rounded-2xl p-3 z-[9998] flex flex-col gap-3 text-white select-none origin-bottom-right"
                >
                    {/* Toggles Grid */}
                    <div className="grid grid-cols-5 gap-2 p-1">
                        <div className="flex flex-col items-center gap-1">
                            <button
                                onClick={toggleWifi}
                                disabled={airplaneMode}
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center transition-all border border-[rgba(var(--accent-color),0.2)]",
                                    airplaneMode ? "opacity-50 cursor-not-allowed bg-[rgba(var(--accent-color),0.05)] text-[rgba(var(--accent-color),0.3)]" :
                                        wifi ? "bg-[rgb(var(--accent-color))] text-black shadow-[0_0_15px_rgba(var(--accent-color),0.4)] hover:scale-105 active:scale-95" : "bg-[rgba(var(--accent-color),0.1)] text-[rgba(var(--accent-color),0.7)] hover:bg-[rgba(var(--accent-color),0.2)] hover:scale-105 active:scale-95"
                                )}
                            >
                                <Wifi className="h-5 w-5" />
                            </button>
                            <span className="text-[10px] font-medium text-[rgba(var(--accent-color),0.8)]">Wi-Fi</span>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                            <button
                                onClick={toggleBluetooth}
                                disabled={airplaneMode}
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center transition-all border border-[rgba(var(--accent-color),0.2)]",
                                    airplaneMode ? "opacity-50 cursor-not-allowed bg-[rgba(var(--accent-color),0.05)] text-[rgba(var(--accent-color),0.3)]" :
                                        bluetooth ? "bg-[rgb(var(--accent-color))] text-black shadow-[0_0_15px_rgba(var(--accent-color),0.4)] hover:scale-105 active:scale-95" : "bg-[rgba(var(--accent-color),0.1)] text-[rgba(var(--accent-color),0.7)] hover:bg-[rgba(var(--accent-color),0.2)] hover:scale-105 active:scale-95"
                                )}
                            >
                                <Bluetooth className="h-5 w-5" />
                            </button>
                            <span className="text-[10px] font-medium text-[rgba(var(--accent-color),0.8)]">Blue...</span>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                            <button
                                onClick={toggleAirplaneMode}
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center transition-all border border-[rgba(var(--accent-color),0.2)] hover:scale-105 active:scale-95",
                                    airplaneMode ? "bg-[rgb(var(--accent-color))] text-black shadow-[0_0_15px_rgba(var(--accent-color),0.4)]" : "bg-[rgba(var(--accent-color),0.1)] text-[rgba(var(--accent-color),0.7)] hover:bg-[rgba(var(--accent-color),0.2)]"
                                )}
                            >
                                <Plane className="h-5 w-5" />
                            </button>
                            <span className="text-[10px] font-medium text-[rgba(var(--accent-color),0.8)]">Plane</span>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                            <button
                                onClick={toggleDnd}
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center transition-all border border-[rgba(var(--accent-color),0.2)] hover:scale-105 active:scale-95",
                                    dnd ? "bg-[rgb(var(--accent-color))] text-black shadow-[0_0_15px_rgba(var(--accent-color),0.4)]" : "bg-[rgba(var(--accent-color),0.1)] text-[rgba(var(--accent-color),0.7)] hover:bg-[rgba(var(--accent-color),0.2)]"
                                )}
                            >
                                <Moon className="h-5 w-5" />
                            </button>
                            <span className="text-[10px] font-medium text-[rgba(var(--accent-color),0.8)]">DND</span>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                            <button
                                onClick={toggleNightLight}
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center transition-all border border-[rgba(var(--accent-color),0.2)] hover:scale-105 active:scale-95",
                                    nightLight ? "bg-[rgb(var(--accent-color))] text-black shadow-[0_0_15px_rgba(var(--accent-color),0.4)]" : "bg-[rgba(var(--accent-color),0.1)] text-[rgba(var(--accent-color),0.7)] hover:bg-[rgba(var(--accent-color),0.2)]"
                                )}
                            >
                                <Monitor className="h-5 w-5" />
                            </button>
                            <span className="text-[10px] font-medium text-[rgba(var(--accent-color),0.8)]">Night</span>
                        </div>
                    </div>

                    {/* Sliders */}
                    <div className="flex flex-col gap-4 py-2">
                        <div className="flex items-center gap-2 group">
                            <Sun className="w-4 h-4 text-[rgba(var(--accent-color),0.7)]" />
                            <div className="flex-1 h-7 bg-[rgba(var(--accent-color),0.1)] rounded-full relative overflow-hidden group-hover:bg-[rgba(var(--accent-color),0.2)] transition-colors border border-[rgba(var(--accent-color),0.2)]">
                                <div
                                    className="absolute top-0 left-0 h-full bg-[rgb(var(--accent-color))] transition-all"
                                    style={{ width: `${brightness}%` }}
                                />
                                <input
                                    type="range"
                                    min="10"
                                    max="100"
                                    value={brightness}
                                    onChange={(e) => handleBrightnessChange(parseInt(e.target.value))}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 group">
                            <Volume2 className="w-4 h-4 text-[rgba(var(--accent-color),0.7)]" />
                            <div className="flex-1 h-7 bg-[rgba(var(--accent-color),0.1)] rounded-full relative overflow-hidden group-hover:bg-[rgba(var(--accent-color),0.2)] transition-colors border border-[rgba(var(--accent-color),0.2)]">
                                <div
                                    className="absolute top-0 left-0 h-full bg-[rgb(var(--accent-color))] transition-all"
                                    style={{ width: `${volume}%` }}
                                />
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={volume}
                                    onChange={(e) => setVolume(parseInt(e.target.value))}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-[rgba(var(--accent-color),0.2)]">
                        <div className="flex items-center gap-2 text-[rgba(var(--accent-color),0.7)] hover:text-[rgb(var(--accent-color))] transition-colors cursor-default">
                            <Battery className="h-4 w-4" />
                            <span className="text-xs font-medium">79%</span>
                        </div>
                        <button
                            onClick={() => {
                                setOpen(false);
                                openWindow("settings");
                            }}
                            className="p-2 hover:bg-[rgba(var(--accent-color),0.1)] rounded-full transition-colors"
                        >
                            <Settings className="h-4 w-4 text-[rgba(var(--accent-color),0.7)]" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

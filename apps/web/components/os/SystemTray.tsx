import React, { useState, useEffect } from "react";
import { Settings2, Calendar } from "lucide-react";
import { useControlCenterStore } from "@/store/control-center-store";
import { ControlCenter } from "./ControlCenter";

export const SystemTray = () => {
    const [time, setTime] = useState<Date | null>(null);
    const { toggleOpen } = useControlCenterStore();
    const triggerRef = React.useRef<HTMLButtonElement>(null);

    useEffect(() => {
        setTime(new Date());
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);



    if (!time) return null;

    return (
        <div className="flex items-center gap-3 px-2 h-full relative">
            {/* Control Center (Embedded for positioning) */}
            <ControlCenter triggerRef={triggerRef} />

            {/* Volume Control */}


            {/* Control Center Trigger */}
            <button
                ref={triggerRef}
                onClick={toggleOpen}
                className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-[rgba(var(--accent-color),0.1)] transition-all duration-200 active:scale-95 group"
            >
                <Settings2 className="h-4 w-4 text-[rgba(var(--accent-color),0.8)] group-hover:text-[rgb(var(--accent-color))] transition-colors" />
            </button>

            <div className="h-6 w-[1px] bg-[rgba(var(--accent-color),0.1)] mx-1" />

            {/* Clock (Display Only) */}
            <div className="flex flex-col items-end justify-center px-2 py-1 rounded-lg hover:bg-[rgba(var(--accent-color),0.05)] transition-colors cursor-default select-none">
                <span className="text-sm font-medium text-[rgba(var(--accent-color),0.9)] leading-none tracking-wide font-mono neon-text">
                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-[10px] text-[rgba(var(--accent-color),0.5)] leading-none mt-1 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="h-2 w-2" />
                    {time.toLocaleDateString([], { weekday: 'short', day: 'numeric' })}
                </span>
            </div>
        </div>
    );
};

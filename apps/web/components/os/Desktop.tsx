import React, { useEffect, useState } from "react";
import { useWindowStore } from "@/store/window-store";
import { useSound } from "@/components/providers/sound-context";
import { Window } from "./Window";
import { Taskbar } from "./Taskbar";
import { BootScreen } from "./BootScreen";
import { RefreshCw, FolderPlus, Settings, FileText, User } from "lucide-react";
import { useContextMenuStore } from "@/store/context-menu-store";
import { CommandPalette } from "./CommandPalette";
import { Background } from "../scene/Background";
import { useControlCenterStore } from "@/store/control-center-store";
import { useFileSystem } from "@/store/filesystem-store";
import { useSettingsStore, ACCENT_COLORS } from "@/store/settings-store";
import { useSocketStore } from "@/store/socket-store";
import { AnimatePresence } from "framer-motion";
import { DesktopIcons } from "./DesktopIcons";

export const Desktop = () => {
    const { windows, openWindow } = useWindowStore();
    const { playSound } = useSound();
    const { brightness, nightLight } = useControlCenterStore();
    const [booted, setBooted] = useState(false);
    const { openContextMenu } = useContextMenuStore();
    const { createFolder, createFile } = useFileSystem();
    const { accentColorId } = useSettingsStore();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const { connect } = useSocketStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        connect();
    }, [connect]);

    const accentColor = mounted
        ? (ACCENT_COLORS.find(c => c.id === accentColorId)?.value || "0, 255, 65")
        : "0, 255, 65";

    useEffect(() => {
        if (mounted) {
            document.documentElement.style.setProperty("--accent-color", accentColor);
        }
    }, [accentColor, mounted]);

    useEffect(() => {
        if (booted) {
            // Boot sequence: Open About Me
            const timer = setTimeout(() => {
                openWindow("about");
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [booted, openWindow]);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 300);
    };

    const handleDesktopContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        openContextMenu(e.clientX, e.clientY, [
            { label: 'Refresh', icon: <RefreshCw className="w-4 h-4" />, action: handleRefresh },
            {
                label: 'New Folder',
                icon: <FolderPlus className="w-4 h-4" />,
                action: () => {
                    createFolder("New Folder", "desktop");
                    playSound('click');
                }
            },
            {
                label: 'New Text File',
                icon: <FileText className="w-4 h-4" />,
                action: () => {
                    createFile("New Text Document.txt", "desktop");
                    playSound('click');
                }
            },
            { label: 'Personalize', icon: <Settings className="w-4 h-4" />, action: () => openWindow("settings") },
        ]);
    };

    return (
        <div
            className="relative h-screen w-screen overflow-hidden bg-black text-foreground selection:bg-axon-accent selection:text-white"
            onContextMenu={handleDesktopContextMenu}
        >
            {/* Boot Screen - Instant Cut */}
            {!booted && (
                <div className="absolute inset-0 z-[10000]">
                    <BootScreen onComplete={() => setBooted(true)} />
                </div>
            )}

            {/* Background */}
            <Background />

            {/* Desktop Icons */}
            <DesktopIcons isRefreshing={isRefreshing} />

            {/* Windows Layer */}
            <div className="relative z-10 w-full h-full pointer-events-none">
                <AnimatePresence>
                    {Object.keys(windows).map((id) => (
                        <Window key={id} id={id} />
                    ))}
                </AnimatePresence>
            </div>

            {/* Taskbar Layer */}
            <div className="relative z-50">
                <Taskbar />
            </div>

            {/* Brightness Overlay */}
            <div
                className="pointer-events-none fixed inset-0 z-[9999] bg-black transition-opacity duration-300"
                style={{ opacity: (100 - brightness) / 100 }}
            />

            {/* Night Light Overlay */}
            <div
                className="pointer-events-none fixed inset-0 z-[9999] bg-orange-500/20 mix-blend-multiply transition-opacity duration-500"
                style={{ opacity: nightLight ? 1 : 0 }}
            />

            <CommandPalette />
        </div>
    );
};

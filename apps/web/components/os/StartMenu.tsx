import React from "react";
import { Search, Power, Settings as SettingsIcon, Shield, Pin, Trash2 } from "lucide-react";
import { useWindowStore } from "@/store/window-store";
import { useContextMenuStore } from "@/store/context-menu-store";
import { APP_REGISTRY } from "@/config/app-registry";

interface StartMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export const StartMenu = ({ isOpen, onClose }: StartMenuProps) => {
    const { openWindow } = useWindowStore();
    const { openContextMenu } = useContextMenuStore();
    const [searchQuery, setSearchQuery] = React.useState("");

    // Reset search when menu closes
    React.useEffect(() => {
        if (!isOpen) setSearchQuery("");
    }, [isOpen]);

    const allApps = Object.values(APP_REGISTRY);

    const filteredApps = allApps.filter(app =>
        app.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[400px] overflow-hidden glass-panel rounded-2xl animate-in slide-in-from-bottom-5 fade-in duration-300 z-[10000]">
            {/* Search Bar */}
            <div className="p-4 pb-2">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgba(var(--accent-color),0.4)] group-focus-within:text-[rgb(var(--accent-color))] transition-colors z-10" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                        className="w-full rounded-xl bg-[rgba(var(--accent-color),0.05)] border border-[rgba(var(--accent-color),0.1)] py-3 pl-12 pr-4 text-sm text-[rgb(var(--accent-color))] placeholder-[rgba(var(--accent-color),0.3)] focus:bg-[rgba(var(--accent-color),0.1)] focus:border-[rgba(var(--accent-color),0.3)] focus:outline-none transition-all duration-200"
                    />
                </div>
            </div>

            {/* Pinned / All Apps */}
            <div className="p-2">
                <div className="px-4 py-2 text-[10px] font-semibold text-[rgba(var(--accent-color),0.5)] uppercase tracking-widest">
                    {searchQuery ? "Search Results" : "Applications"}
                </div>
                <div className="grid grid-cols-4 gap-2 p-2">
                    {filteredApps.map((app) => (
                        <button
                            key={app.id}
                            onClick={() => {
                                openWindow(app.id);
                                onClose();
                            }}
                            className="flex flex-col items-center justify-center gap-2 rounded-xl p-3 hover:bg-white/5 transition-all duration-200 group hover:scale-105 active:scale-95"
                            onContextMenu={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openContextMenu(e.clientX, e.clientY, [
                                    {
                                        label: "Run as Administrator",
                                        icon: <Shield className="w-4 h-4" />,
                                        action: () => {
                                            openWindow(app.id);
                                            onClose();
                                        }
                                    },
                                    {
                                        label: "Pin to Taskbar",
                                        icon: <Pin className="w-4 h-4" />,
                                        action: () => console.log("Pin to taskbar")
                                    },
                                    {
                                        label: "Uninstall",
                                        icon: <Trash2 className="w-4 h-4" />,
                                        danger: true,
                                        action: () => console.log("Uninstall")
                                    }
                                ]);
                            }}
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(var(--accent-color),0.1)] text-[rgba(var(--accent-color),0.8)] group-hover:bg-[rgba(var(--accent-color),0.2)] group-hover:text-[rgb(var(--accent-color))] group-hover:shadow-[0_0_20px_rgba(var(--accent-color),0.2)] transition-all duration-300 border border-[rgba(var(--accent-color),0.1)]">
                                <app.icon className="h-6 w-6" />
                            </div>
                            <span className="text-[11px] font-medium text-[rgba(var(--accent-color),0.7)] group-hover:text-[rgb(var(--accent-color))] transition-colors">{app.title}</span>
                        </button>
                    ))}
                    {filteredApps.length === 0 && (
                        <div className="col-span-4 py-8 text-center text-[rgba(var(--accent-color),0.5)] text-sm">
                            No apps found
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 mt-2">
                <div className="flex items-center gap-3 hover:bg-[rgba(var(--accent-color),0.05)] p-2 rounded-xl cursor-pointer transition-colors group">
                    <div className="h-8 w-8 rounded-full bg-[rgba(var(--accent-color),0.2)] flex items-center justify-center text-xs font-bold text-[rgb(var(--accent-color))] group-hover:bg-[rgba(var(--accent-color),0.3)] transition-colors border border-[rgba(var(--accent-color),0.3)]">
                        AD
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-[rgb(var(--accent-color))] group-hover:text-[rgb(var(--accent-color))] transition-colors neon-text">Admin</span>
                    </div>
                </div>
                <button className="rounded-xl p-2.5 text-white/50 hover:bg-white/10 hover:text-red-400 transition-all duration-200 hover:scale-105 active:scale-95">
                    <Power className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

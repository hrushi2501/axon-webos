import React, { useEffect } from "react";
import { useWindowStore } from "@/store/window-store";
import { Activity, Cpu, HardDrive, X } from "lucide-react";
import { useSocketStore } from "@/store/socket-store";
import { APP_REGISTRY } from "@/config/app-registry";

export const TaskManager = () => {
    const { windows, closeWindow } = useWindowStore();
    const { stats, isConnected } = useSocketStore();

    useEffect(() => {
        console.log("TaskManager mounted");
    }, []);

    // Convert bytes to GB
    const formatMemory = (bytes: number) => (bytes / 1024 / 1024 / 1024).toFixed(2);
    const formatMemoryMB = (bytes: number) => (bytes / 1024 / 1024).toFixed(1);

    const memPercentage = stats ? (stats.memory_usage / stats.total_memory) * 100 : 0;

    return (
        <div className="flex flex-col h-full bg-black/40 backdrop-blur-xl text-white">
            {/* Header Stats */}
            <div className="grid grid-cols-2 gap-4 p-4 border-b border-white/10">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center gap-4">
                    <div className="p-3 rounded-full bg-[rgba(var(--accent-color),0.2)] text-[rgb(var(--accent-color))]">
                        <Cpu className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-sm text-white/60">CPU Usage</div>
                        <div className="text-2xl font-bold font-mono">
                            {isConnected && stats ? `${stats.cpu_usage.toFixed(1)}%` : "Connecting..."}
                        </div>
                    </div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center gap-4">
                    <div className="p-3 rounded-full bg-[rgba(var(--accent-color),0.2)] text-[rgb(var(--accent-color))]">
                        <Activity className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-sm text-white/60">Memory</div>
                        <div className="text-2xl font-bold font-mono">
                            {isConnected && stats ? `${memPercentage.toFixed(1)}%` : "Connecting..."}
                        </div>
                        <div className="text-xs text-white/40 mt-1">
                            {isConnected && stats ? `${formatMemory(stats.memory_usage)} GB / ${formatMemory(stats.total_memory)} GB` : ""}
                        </div>
                    </div>
                </div>
            </div>

            {/* Process List */}
            <div className="flex-1 overflow-auto p-4">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-xs text-white/40 uppercase tracking-wider border-b border-white/10">
                            <th className="pb-2 pl-2">Name</th>
                            <th className="pb-2">Status</th>
                            <th className="pb-2">Memory</th>
                            <th className="pb-2 text-right pr-2">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {Object.values(windows).map(win => {
                            const app = APP_REGISTRY[win.appId];
                            const Icon = app?.icon || Activity;
                            return (
                                <tr key={win.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="py-3 pl-2 font-medium flex items-center gap-2">
                                        <Icon className="h-4 w-4 text-[rgba(var(--accent-color),0.8)]" />
                                        {win.title}
                                    </td>
                                    <td className="py-3 text-[rgb(var(--accent-color))]">Running</td>
                                    <td className="py-3 text-white/60 font-mono">
                                        {/* Simulate memory usage per app based on total */}
                                        {isConnected && stats ? formatMemoryMB(stats.memory_usage / (Object.keys(windows).length + 5)) : "0"} MB
                                    </td>
                                    <td className="py-3 text-right pr-2">
                                        <button
                                            onClick={() => closeWindow(win.id)}
                                            className="p-1.5 hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded transition-colors"
                                            title="End Task"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}{/* System Processes */}
                        <tr className="border-b border-white/5 hover:bg-white/5 transition-colors opacity-60">
                            <td className="py-3 pl-2 font-medium flex items-center gap-2">
                                <HardDrive className="h-4 w-4" />
                                System Kernel
                            </td>
                            <td className="py-3 text-[rgba(var(--accent-color),0.7)]">System</td>
                            <td className="py-3 text-white/60 font-mono">
                                {isConnected && stats ? formatMemoryMB(stats.memory_usage * 0.2) : "0"} MB
                            </td>
                            <td className="py-3 text-right pr-2"></td>
                        </tr>
                        <tr className="border-b border-white/5 hover:bg-white/5 transition-colors opacity-60">
                            <td className="py-3 pl-2 font-medium flex items-center gap-2">
                                <Activity className="h-4 w-4" />
                                Window Manager
                            </td>
                            <td className="py-3 text-[rgba(var(--accent-color),0.7)]">System</td>
                            <td className="py-3 text-white/60 font-mono">
                                {isConnected && stats ? formatMemoryMB(stats.memory_usage * 0.1) : "0"} MB
                            </td>
                            <td className="py-3 text-right pr-2"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

import { LucideIcon } from "lucide-react";
import React from "react";

export interface AppProps {
    windowId: string;
    data?: any; // For passing initial data like file paths
}

export interface AppConfig {
    id: string;
    title: string;
    icon: LucideIcon;
    component: React.ComponentType<AppProps>;
    width?: number;
    height?: number;
    isAdmin?: boolean; // For "Run as Administrator" context
    canMaximize?: boolean;
    canResize?: boolean;
}


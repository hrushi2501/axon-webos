import { LucideIcon } from "lucide-react";
import React from "react";

export interface AppProps {
  windowId?: string;
  fileId?: string;
  initialPath?: string;
}

export type AppLaunchData = Record<string, unknown>;

export interface OpenWindowOptions {
  id?: string;
  title?: string;
  data?: AppLaunchData;
}

export interface AppConfig {
  id: string;
  title: string;
  icon: LucideIcon;
  component: React.ComponentType<AppProps>;
  width?: number;
  height?: number;
  canMaximize?: boolean;
  canResize?: boolean;
}

import { create } from "zustand";
import { APP_REGISTRY } from "@/config/app-registry";

export interface WindowState {
    id: string;
    appId: string;
    title: string;
    isOpen: boolean;
    isMinimized: boolean;
    isMaximized: boolean;
    position: { x: number; y: number };
    size: { width: number; height: number };
    zIndex: number;
    initialData?: any;
}

interface WindowStore {
    windows: Record<string, WindowState>;
    activeWindowId: string | null;
    windowOrder: string[];

    // Actions
    openWindow: (appId: string, options?: { id?: string, title?: string, data?: any }) => void;
    closeWindow: (id: string) => void;
    minimizeWindow: (id: string) => void;
    maximizeWindow: (id: string) => void;
    restoreWindow: (id: string) => void;
    focusWindow: (id: string) => void;
    updateWindowPosition: (id: string, position: { x: number; y: number }) => void;
    updateWindowSize: (id: string, size: { width: number; height: number }) => void;
}

export const useWindowStore = create<WindowStore>()((set, get) => ({
    windows: {},
    activeWindowId: null,
    windowOrder: [],

    openWindow: (appId, options) => {
        const { windows, windowOrder } = get();
        const appConfig = APP_REGISTRY[appId];

        if (!appConfig) {
            console.error(`App ${appId} not found in registry`);
            return;
        }

        const id = options?.id || appId;

        // If window already exists, focus it
        if (windows[id]) {
            get().focusWindow(id);
            return;
        }

        const newWindow: WindowState = {
            id,
            appId,
            title: options?.title || appConfig.title,
            isOpen: true,
            isMinimized: false,
            isMaximized: false,
            position: { x: 50 + windowOrder.length * 20, y: 50 + windowOrder.length * 20 },
            size: { width: appConfig.width || 600, height: appConfig.height || 400 },
            zIndex: windowOrder.length + 1,
            initialData: options?.data,
        };

        set({
            windows: { ...windows, [id]: newWindow },
            windowOrder: [...windowOrder, id],
            activeWindowId: id,
        });
    },

    closeWindow: (id) => {
        const { windows, windowOrder } = get();
        const newWindows = { ...windows };
        delete newWindows[id];
        const newOrder = windowOrder.filter((wId) => wId !== id);

        set({
            windows: newWindows,
            windowOrder: newOrder,
            activeWindowId: newOrder.length > 0 ? newOrder[newOrder.length - 1] : null,
        });
    },

    minimizeWindow: (id) => {
        set((state) => ({
            windows: {
                ...state.windows,
                [id]: { ...state.windows[id]!, isMinimized: true },
            },
            activeWindowId: null,
        }));
    },

    maximizeWindow: (id) => {
        set((state) => ({
            windows: {
                ...state.windows,
                [id]: { ...state.windows[id]!, isMaximized: true, isMinimized: false },
            },
        }));
        get().focusWindow(id);
    },

    restoreWindow: (id) => {
        set((state) => ({
            windows: {
                ...state.windows,
                [id]: { ...state.windows[id]!, isMaximized: false, isMinimized: false },
            },
        }));
        get().focusWindow(id);
    },

    focusWindow: (id) => {
        const { windowOrder } = get();
        const newOrder = [...windowOrder.filter((wId) => wId !== id), id];

        set({
            windowOrder: newOrder,
            activeWindowId: id,
            windows: {
                ...get().windows,
                [id]: { ...get().windows[id]!, isMinimized: false }
            }
        });
    },

    updateWindowPosition: (id, position) => {
        set((state) => ({
            windows: {
                ...state.windows,
                [id]: { ...state.windows[id]!, position },
            },
        }));
    },

    updateWindowSize: (id, size) => {
        set((state) => ({
            windows: {
                ...state.windows,
                [id]: { ...state.windows[id]!, size },
            },
        }));
    },
}));

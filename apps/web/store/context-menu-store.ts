import { create } from 'zustand';

export type ContextMenuItem = {
    label: string;
    action: () => void;
    icon?: React.ReactNode;
    danger?: boolean;
    disabled?: boolean;
    shortcut?: string;
};

interface ContextMenuState {
    isOpen: boolean;
    x: number;
    y: number;
    items: ContextMenuItem[];
    openContextMenu: (x: number, y: number, items: ContextMenuItem[]) => void;
    closeContextMenu: () => void;
}

export const useContextMenuStore = create<ContextMenuState>((set) => ({
    isOpen: false,
    x: 0,
    y: 0,
    items: [],
    openContextMenu: (x, y, items) => set({ isOpen: true, x, y, items }),
    closeContextMenu: () => set({ isOpen: false }),
}));

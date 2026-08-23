import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const WALLPAPERS = [
  {
    id: "default",
    name: "Axon Default",
    value: "radial-gradient(circle at center, #1a1a1a 0%, #000000 100%)",
  },
  {
    id: "neon-sunset",
    name: "Neon Sunset",
    value: "linear-gradient(to bottom right, #2d1b4e, #1c1c1c)",
  },
  {
    id: "cyber-grid",
    name: "Cyber Grid",
    value: "linear-gradient(to bottom, #0f0c29, #302b63, #24243e)",
  },
  {
    id: "deep-space",
    name: "Deep Space",
    value: "radial-gradient(circle at bottom left, #1b2735 0%, #090a0f 100%)",
  },
  {
    id: "matrix",
    name: "The Matrix",
    value: "linear-gradient(0deg, #000000 0%, #0a1a0a 100%)",
  },
];

export const ACCENT_COLORS = [
  { id: "blue", name: "Electric Blue", value: "37, 99, 235" }, // rgb values
  { id: "purple", name: "Neon Purple", value: "147, 51, 234" },
  { id: "green", name: "Cyber Green", value: "0, 255, 65" },
  { id: "pink", name: "Hot Pink", value: "236, 72, 153" },
  { id: "orange", name: "Sunset Orange", value: "249, 115, 22" },
  { id: "teal", name: "Cyber Teal", value: "20, 184, 166" },
  { id: "red", name: "Crimson Red", value: "239, 68, 68" },
  { id: "yellow", name: "Neon Yellow", value: "234, 179, 8" },
  { id: "cyan", name: "Electric Cyan", value: "6, 182, 212" },
  { id: "white", name: "Pure White", value: "255, 255, 255" },
];

interface SettingsState {
  wallpaperId: string;
  accentColorId: string;

  setWallpaper: (id: string) => void;
  setAccentColor: (id: string) => void;
  getWallpaperValue: () => string;
  getAccentColorValue: () => string;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      wallpaperId: "default",
      accentColorId: "green",

      setWallpaper: (id) => set({ wallpaperId: id }),
      setAccentColor: (id) => set({ accentColorId: id }),

      getWallpaperValue: () => {
        const { wallpaperId } = get();
        return (
          WALLPAPERS.find((w) => w.id === wallpaperId)?.value ||
          WALLPAPERS[0]?.value ||
          ""
        );
      },

      getAccentColorValue: () => {
        const { accentColorId } = get();
        return (
          ACCENT_COLORS.find((c) => c.id === accentColorId)?.value ||
          ACCENT_COLORS[0]?.value ||
          ""
        );
      },
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => window.localStorage),
    },
  ),
);

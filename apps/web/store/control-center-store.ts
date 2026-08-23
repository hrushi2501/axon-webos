import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ControlCenterState {
  isOpen: boolean;
  wifi: boolean;
  bluetooth: boolean;
  dnd: boolean;
  airplaneMode: boolean;
  nightLight: boolean;
  volume: number;
  brightness: number;

  toggleOpen: () => void;
  setOpen: (isOpen: boolean) => void;
  toggleWifi: () => void;
  toggleBluetooth: () => void;
  toggleDnd: () => void;
  toggleAirplaneMode: () => void;
  toggleNightLight: () => void;
  setVolume: (volume: number) => void;
  setBrightness: (brightness: number) => void;
}

export const useControlCenterStore = create<ControlCenterState>()(
  persist(
    (set) => ({
      isOpen: false,
      wifi: true,
      bluetooth: true,
      dnd: false,
      airplaneMode: false,
      nightLight: false,
      volume: 75,
      brightness: 100,

      toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
      setOpen: (isOpen) => set({ isOpen }),
      toggleWifi: () =>
        set((state) => (state.airplaneMode ? state : { wifi: !state.wifi })),
      toggleBluetooth: () =>
        set((state) =>
          state.airplaneMode ? state : { bluetooth: !state.bluetooth },
        ),
      toggleDnd: () => set((state) => ({ dnd: !state.dnd })),
      toggleAirplaneMode: () =>
        set((state) => {
          const newState = !state.airplaneMode;
          return {
            airplaneMode: newState,
            wifi: newState ? false : state.wifi,
            bluetooth: newState ? false : state.bluetooth,
          };
        }),
      toggleNightLight: () =>
        set((state) => ({ nightLight: !state.nightLight })),
      setVolume: (volume) => set({ volume }),
      setBrightness: (brightness) => set({ brightness }),
    }),
    {
      name: "control-center-storage",
      storage: createJSONStorage(() => window.localStorage),
      partialize: (state) => ({
        wifi: state.wifi,
        bluetooth: state.bluetooth,
        dnd: state.dnd,
        nightLight: state.nightLight,
        volume: state.volume,
        brightness: state.brightness,
      }), // Don't persist isOpen
    },
  ),
);

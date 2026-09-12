import { create } from "zustand";

interface UiState {
  isRailExpanded: boolean;
  isCreateOpen: boolean;
  setRailExpanded: (value: boolean) => void;
  setCreateOpen: (value: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isRailExpanded: false,
  isCreateOpen: false,
  setRailExpanded: (isRailExpanded) => set({ isRailExpanded }),
  setCreateOpen: (isCreateOpen) => set({ isCreateOpen }),
}));

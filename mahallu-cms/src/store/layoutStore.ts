import { create } from 'zustand';

interface LayoutState {
  isSubmenuOpen: boolean;
  setSubmenuOpen: (open: boolean) => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  isSubmenuOpen: false,
  setSubmenuOpen: (open) => set({ isSubmenuOpen: open }),
}));

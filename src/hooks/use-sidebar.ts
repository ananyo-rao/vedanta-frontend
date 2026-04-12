"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarState {
  collapsed: boolean;
  _hydrated: boolean;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      _hydrated: false,
      toggle: () => set((s) => ({ collapsed: !s.collapsed })),
      setCollapsed: (collapsed) => set({ collapsed }),
    }),
    {
      name: "sidebar-state",
      partialize: (state) => ({ collapsed: state.collapsed }),
      onRehydrateStorage: () => () => {
        useSidebarStore.setState({ _hydrated: true });
      },
    }
  )
);

/**
 * Safe sidebar hook. Returns `collapsed: false` until localStorage hydration completes.
 */
export function useSidebar() {
  const store = useSidebarStore();
  const collapsed = store._hydrated ? store.collapsed : false;
  return { collapsed, toggle: store.toggle, setCollapsed: store.setCollapsed };
}

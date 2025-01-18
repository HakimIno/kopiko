import { create } from 'zustand'

interface SidebarStore {
  isCollapsed: boolean
  toggleCollapse: () => void
}

export const useSidebar = create<SidebarStore>((set) => ({
  isCollapsed: false,
  toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
})) 
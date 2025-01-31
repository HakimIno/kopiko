import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type BoardView = 'sprint' | 'kanban' | 'calendar'

interface BoardState {
  currentView: BoardView
  selectedSprintId: string
  setCurrentView: (view: BoardView) => void
  setSelectedSprintId: (sprintId: string) => void
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set) => ({
      currentView: 'sprint',
      selectedSprintId: 'backlog',
      setCurrentView: (view) => set({ currentView: view }),
      setSelectedSprintId: (sprintId) => set({ selectedSprintId: sprintId }),
    }),
    {
      name: 'board-storage',
    }
  )
) 
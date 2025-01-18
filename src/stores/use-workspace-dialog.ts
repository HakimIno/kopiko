import { create } from "zustand";

interface WorkspaceDialogStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useWorkspaceDialog = create<WorkspaceDialogStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
})); 
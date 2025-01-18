"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditWorkspaceForm } from "./edit-workspace-form";

interface EditWorkspaceDialogProps {
  workspace: {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    theme?: {
      color: string;
    };
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditWorkspaceDialog({ workspace, open, onOpenChange }: EditWorkspaceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Workspace</DialogTitle>
          <DialogDescription>
            Update your workspace details and appearance.
          </DialogDescription>
        </DialogHeader>
        <EditWorkspaceForm workspace={workspace} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
} 
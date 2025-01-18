"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWorkspaceDialog } from "@/stores/use-workspace-dialog";
import { WorkspaceForm } from "./workspace-form";

export function CreateWorkspaceDialog() {
  const { isOpen, onClose } = useWorkspaceDialog();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Workspace</DialogTitle>
          <DialogDescription>
            Create a new workspace to organize your projects and collaborate with your team.
          </DialogDescription>
        </DialogHeader>
        <WorkspaceForm />
      </DialogContent>
    </Dialog>
  );
} 
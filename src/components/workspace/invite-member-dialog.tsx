"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InviteMemberForm } from "./invite-member-form";

interface InviteMemberDialogProps {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function InviteMemberDialog({ workspaceId, isOpen, onClose }: InviteMemberDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>
            Invite a new member to join your workspace.
          </DialogDescription>
        </DialogHeader>
        <InviteMemberForm workspaceId={workspaceId} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
} 
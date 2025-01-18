"use client";

import { Button } from "@/components/ui/button";
import { useWorkspaceDialog } from "@/stores/use-workspace-dialog";
import { PlusIcon } from "@heroicons/react/24/outline";

interface CreateWorkspaceButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function CreateWorkspaceButton({
  variant = "outline",
  size = "default",
  className,
}: CreateWorkspaceButtonProps) {
  const { onOpen } = useWorkspaceDialog();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onOpen}
      className={className}
    >
      {size === "icon" ? (
        <PlusIcon className="h-4 w-4" />
      ) : (
        <div className="flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          <span>Create Workspace</span>
        </div>
      )}
    </Button>
  );
} 
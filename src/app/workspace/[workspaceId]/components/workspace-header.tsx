"use client";

import { Button } from "@/components/ui/button";
import { UserPlus, Bell, Search, ArrowLeft } from "lucide-react";
import type { Workspace } from "@/types/workspace";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { InviteMemberDialog } from "@/components/workspace/invite-member-dialog";
import { cn } from "@/lib/utils";

interface WorkspaceHeaderProps {
  workspace: {
    name: string;
    description?: string;
    icon?: string;
    theme?: {
      color: string;
    };
  };
}

export function WorkspaceHeader({ workspace }: WorkspaceHeaderProps) {
  const router = useRouter();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  if (!workspace) {
    return (
      <div className="animate-pulse">
        <div className="h-8 w-48 bg-muted rounded" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
              <Button 
                variant="outline" 
                size="icon"
                className="p-4 bg-background rounded-full text-[#B07A57]"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-full w-full" />
              </Button>
            <div 
              className="p-2 rounded-xl flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: workspace.theme?.color || "#B07A57" }}
            >
              <div
                className={cn(
                  "w-7 h-7 rounded flex items-center justify-center text-white text-sm font-medium",
                  !workspace.icon && "bg-primary"
                )}
              >
                {workspace.icon ? (
                  <Image
                    src={workspace.icon}
                    alt={workspace.name}
                    width={28}
                    height={28}
                  />
                ) : (
                  workspace.name?.charAt(0) || '?'
                )}
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{workspace.name}</h1>
              {workspace.description && (
                <p className="text-muted-foreground">{workspace.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Bell className="w-4 h-4" />
            </Button>
            <Button 
              className="bg-[#B07A57] hover:bg-[#B07A57]/90"
              onClick={() => setIsInviteDialogOpen(true)}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Member
            </Button>
          </div>
        </div>
      </div>

      <InviteMemberDialog 
        workspaceId={workspace.id}
        isOpen={isInviteDialogOpen}
        onClose={() => setIsInviteDialogOpen(false)}
      />
    </>
  );
} 
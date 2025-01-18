"use client";

import { useEffect, useState } from 'react';
import { fetchWithAuth } from "@/lib/auth";
import { toast } from "sonner";
import { WorkspaceHeader } from "./components/workspace-header";
import { WorkspaceStats } from "./components/workspace-stats";
import { WorkspaceContent } from "./components/workspace-content";
import { Workspace } from "./types";

interface WorkspaceClientProps {
  workspaceId: string;
}

const WorkspaceClient = ({ workspaceId }: WorkspaceClientProps) => {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWorkspaceData() {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetchWithAuth(`/api/workspaces/${workspaceId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch workspace");
        }
        const data = await response.json();
        setWorkspace(data.workspace);
      } catch (error) {
        console.error(error);
        setError("Failed to load workspace");
        toast.error("Failed to load workspace");
      } finally {
        setIsLoading(false);
      }
    }

    if (workspaceId) {
      fetchWorkspaceData();
    }
  }, [workspaceId]);

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-muted rounded-lg w-1/4" />
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="grid grid-cols-4 gap-4 mt-8">
            <div className="h-32 bg-muted rounded-lg" />
            <div className="h-32 bg-muted rounded-lg" />
            <div className="h-32 bg-muted rounded-lg" />
            <div className="h-32 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  if (!workspace) {
    return null;
  }

  return (
    <div className="flex-1">
      <div className="px-6 py-3">
        <WorkspaceHeader workspace={workspace} />
        <WorkspaceStats workspace={workspace} />
        <WorkspaceContent />
      </div>
    </div>
  );
};

export default WorkspaceClient;
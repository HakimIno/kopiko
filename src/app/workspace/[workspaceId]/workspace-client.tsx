"use client";

import { fetchWithAuth } from "@/lib/auth";
import { toast } from "sonner";
import { WorkspaceHeader } from "./components/workspace-header";
import { WorkspaceStats } from "./components/workspace-stats";
import { WorkspaceContent } from "./components/workspace-content";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED' | 'ON_HOLD';
  key: string;
  isPublic: boolean;
  backgroundColor?: string
  icon?: string;
}

interface WorkspaceClientProps {
  workspaceId: string;
}

const WorkspaceClient = ({ workspaceId }: WorkspaceClientProps) => {
  const queryClient = useQueryClient();

  // Query สำหรับดึงข้อมูล Workspace
  const { data: workspace, isLoading: isWorkspaceLoading, error: workspaceError } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: async () => {
      const response = await fetchWithAuth(`/api/workspaces/${workspaceId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch workspace");
      }
      const data = await response.json();
      return data.workspace;
    }
  });

  // Query สำหรับดึงข้อมูล Projects
  const { data: projects, isLoading: isProjectsLoading } = useQuery({
    queryKey: ['projects', workspaceId],
    queryFn: async () => {
      const response = await fetchWithAuth(`/api/workspaces/${workspaceId}/projects`);
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      const data = await response.json();
      return data.projects;
    }
  });

  // Mutation สำหรับสร้าง Project
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: Omit<Project, "id">) => {
      const response = await fetchWithAuth(`/api/workspaces/${workspaceId}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: projectData.name,
          key: projectData.key,
          description: projectData.description || "",
          status: projectData.status || "ACTIVE",
          isPublic: projectData.isPublic || false,
          backgroundColor: projectData.backgroundColor || "#B07A57",
          icon: projectData.icon || null
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create project');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
      toast.success("Project created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  // Mutation สำหรับอัพเดท Project
  const updateProjectMutation = useMutation({
    mutationFn: async ({ projectId, data }: { projectId: string; data: Partial<Project> }) => {
      const response = await fetchWithAuth(`/api/workspaces/${workspaceId}/projects/${projectId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to update project");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
      toast.success("Project updated successfully");
    },
    onError: () => {
      toast.error("Failed to update project");
    }
  });

  // Mutation สำหรับลบ Project
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await fetchWithAuth(`/api/workspaces/${workspaceId}/projects/${projectId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error("Failed to delete project");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
      toast.success("Project deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete project");
    }
  });

  // Handler functions
  const handleCreateProject = () => {
    createProjectMutation.mutate({
      name: "New Project",
      description: "",
      status: "ACTIVE",
      isPublic: false,
      backgroundColor: "#B07A57",
      icon: null 
    });
  };

  const handleUpdateProject = (projectId: string, data: Partial<Project>) => {
    updateProjectMutation.mutate({ projectId, data });
  };

  const handleDeleteProject = (projectId: string) => {
    deleteProjectMutation.mutate(projectId);
  };

  if (isWorkspaceLoading || isProjectsLoading) {
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

  if (workspaceError) {
    return (
      <div className="flex-1 p-6">
        <div className="text-center text-red-500">Failed to load workspace</div>
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
        <WorkspaceContent
          projects={projects}
          onCreateProject={handleCreateProject}
          onUpdateProject={handleUpdateProject}
          onDeleteProject={handleDeleteProject}
          isLoading={{
            create: createProjectMutation.isPending,
            update: updateProjectMutation.isPending,
            delete: deleteProjectMutation.isPending
          }}
        />
      </div>

    </div>
  );
};

export default WorkspaceClient;
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/auth';
import { toast } from 'sonner';

// interface Workspace {
//   id: string;
//   name: string;
//   description?: string;
//   icon?: string;
//   theme?: {
//     color: string;
//   };
//   owner: {
//     id: string;
//     name: string;
//     email: string;
//   };
//   _count?: {
//     projects: number;
//     members: number;
//   };
//   role?: string;
//   userId?: string;
//   canEdit?: boolean;
//   canDelete?: boolean;
// }

interface WorkspaceInput {
  name: string;
  description?: string;
  icon?: string;
  theme?: {
    color: string;
  };
}

// Fetch all workspaces
export const useWorkspaces = () => {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const response = await fetchWithAuth('/api/workspaces');
      if (!response.ok) {
        throw new Error('Failed to fetch workspaces');
      }
      return response.json();
    },
  });
};

// Fetch single workspace
export const useWorkspace = (workspaceId: string) => {
  return useQuery({
    queryKey: ['workspaces', workspaceId],
    queryFn: async () => {
      const response = await fetchWithAuth(`/api/workspaces/${workspaceId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch workspace');
      }
      return response.json();
    },
    enabled: !!workspaceId,
  });
};

// Create workspace mutation
export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: WorkspaceInput) => {
      const response = await fetchWithAuth('/api/workspaces', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create workspace');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      toast.success('Workspace created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Update workspace mutation
export const useUpdateWorkspace = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: WorkspaceInput) => {
      const response = await fetchWithAuth(`/api/workspaces/${workspaceId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update workspace');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId] });
      toast.success('Workspace updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Delete workspace mutation
export const useDeleteWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workspaceId: string) => {
      const response = await fetchWithAuth(`/api/workspaces/${workspaceId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete workspace');
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      toast.success('Workspace deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

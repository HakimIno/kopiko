import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SprintStatus } from '@prisma/client';
import { fetchWithAuth } from '@/lib/auth';

interface CreateSprintData {
    name: string;
    goal?: string;
    startDate: string;
    endDate: string;
    status: SprintStatus;
}

interface UpdateSprintData {
    name?: string;
    goal?: string;
    startDate?: string;
    endDate?: string;
    status?: SprintStatus;
}

export const useSprints = (workspaceId: string, projectId: string) => {
    const queryClient = useQueryClient();

    // Fetch sprints
    const { data: sprints, error, isLoading } = useQuery({
        queryKey: ['sprints', workspaceId, projectId],
        queryFn: async () => {
            const response = await fetchWithAuth(`/api/workspaces/${workspaceId}/projects/${projectId}/sprints`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }
    });

    // Create sprint
    const createSprint = useMutation({
        mutationFn: async (data: CreateSprintData) => {
            const response = await fetchWithAuth(`/api/workspaces/${workspaceId}/projects/${projectId}/sprints`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create sprint');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['sprints',  workspaceId, projectId]
            });
        }
    });

    // Update sprint
    const updateSprint = useMutation({
        mutationFn: async ({ sprintId, data }: { sprintId: string; data: UpdateSprintData }) => {
            const response = await fetchWithAuth(`/api/workspaces/${workspaceId}/projects/${projectId}/sprints/${sprintId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update sprint');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['sprints', workspaceId, projectId]
            });
        }
    });

    // Delete sprint
    const deleteSprint = useMutation({
        mutationFn: async (sprintId: string) => {
            const response = await fetchWithAuth(`/api/workspaces/${workspaceId}/projects/${projectId}/sprints/${sprintId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete sprint');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['sprints', workspaceId, projectId]
            });
        }
    });

    return {
        sprints,
        error,
        isLoading,
        createSprint,
        updateSprint,
        deleteSprint
    };
}; 
import { fetchWithAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';

export interface Project {
    id: string;
    name: string;
    description?: string;
    key: string;
    isPublic: boolean;
    icon?: string | null;
    backgroundColor?: string | null;
    status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED' | 'ON_HOLD';
    workspace: {
        name: string;
        ownerId: string;
    };
}

async function fetchProject(workspaceId: string, projectId: string) {
    const response = await fetchWithAuth(`/api/workspaces/${workspaceId}/projects/${projectId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch project');
    }
    return response.json();
}

export function useProject(workspaceId: string, projectId: string) {
    return useQuery<{ project: Project }>({
        queryKey: ['project', workspaceId, projectId],
        queryFn: () => fetchProject(workspaceId, projectId),
    });
}
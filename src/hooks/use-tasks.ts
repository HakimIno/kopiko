import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Priority, TaskStatus } from '@prisma/client';
import { fetchWithAuth } from '@/lib/auth';

interface CreateTaskData {
    title: string;
    description?: string;
    priority: Priority;
    status: TaskStatus;
    startDate?: Date;
    dueDate?: Date;
    sprintId?: string;
    assigneeId?: string;
}

interface UpdateTaskData {
    title?: string;
    description?: string;
    priority?: Priority;
    status?: TaskStatus;
    startDate?: Date;
    dueDate?: Date;
    sprintId?: string;
    assigneeId?: string;
}

interface UpdateTaskSprintData {
    taskId: string;
    sprintId: string;
}

export const useTasks = (workspaceId: string, projectId: string, sprintId?: string) => {
    const queryClient = useQueryClient();

    // Fetch tasks
    const { data: tasks, isLoading } = useQuery({
        queryKey: ['tasks', workspaceId, projectId, sprintId],
        queryFn: async () => {
            const response = await fetchWithAuth(`/api/workspaces/${workspaceId}/projects/${projectId}/tasks${sprintId ? `?sprintId=${sprintId}` : ''}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }
    });

    // Create task
    const createTask = useMutation({
        mutationFn: async (taskData: CreateTaskData) => {
            const response = await fetchWithAuth(`/api/workspaces/${workspaceId}/projects/${projectId}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskData),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['tasks', 'sprints', workspaceId, projectId]
            });
        }
    });

    // Update task
    const updateTask = useMutation({
        mutationFn: async ({ taskId, data }: { taskId: string; data: UpdateTaskData }) => {
            const response = await fetchWithAuth(`/api/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            console.log('====================================');
            console.log("response",response);
            console.log('====================================');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['tasks', workspaceId, projectId]
            });
        }
    });

    // Delete task
    const deleteTask = useMutation({
        mutationFn: async (taskId: string) => {
            const response = await fetchWithAuth(`/api/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['tasks', workspaceId, projectId]
            });
        }
    });

    // Update task sprint
    const updateTaskSprint = useMutation({
        mutationFn: async ({ taskId, sprintId }: UpdateTaskSprintData) => {
            const response = await fetchWithAuth(
                `/api/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ sprintId }),
                }
            );
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update task sprint');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['tasks', workspaceId, projectId]
            });
            queryClient.invalidateQueries({
                queryKey: ['sprints', workspaceId, projectId]
            });
        },
    });

    return {
        tasks,
        isLoading,
        createTask,
        updateTask,
        deleteTask,
        updateTaskSprint,
    };
}; 
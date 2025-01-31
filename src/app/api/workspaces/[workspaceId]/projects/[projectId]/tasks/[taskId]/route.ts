import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '@/middleware/auth';
import { z } from 'zod';

type Variables = {
    user: {
        userId: string;
    };
};

const app = new Hono<{ Variables: Variables }>();
const prisma = new PrismaClient();

// Validation schemas
const taskSchema = z.object({
    title: z.string().min(1, "Task title is required"),
    description: z.string().optional(),
    priority: z.enum(['LOWEST', 'LOW', 'MEDIUM', 'HIGH', 'HIGHEST']),
    status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED', 'BLOCKED']),
    startDate: z.coerce.date().optional(),
    dueDate: z.coerce.date().optional(),
    sprintId: z.string().optional(),
    assigneeId: z.string().optional(),
    timeEstimate: z.number().optional(),
    timeSpent: z.number().optional(),
    isBlocked: z.boolean().optional(),
    blockReason: z.string().optional().nullable(),
    parentTaskId: z.string().optional(),
});

// PATCH - Update task
app.patch('/api/workspaces/:workspaceId/projects/:projectId/tasks/:taskId', authMiddleware, async (c) => {
    try {
        const { userId } = c.get('user');
        const { workspaceId, projectId, taskId } = c.req.param();
        const body = await c.req.json();

        // Validate input
        const validatedData = taskSchema.partial().safeParse(body);
        if (!validatedData.success) {
            return c.json({ errors: validatedData.error.errors }, 400);
        }

        // Check user's access and task existence
        const [userAccess, task] = await Promise.all([
            prisma.userWorkspace.findFirst({
                where: {
                    userId,
                    workspaceId,
                    isActive: true,
                }
            }),
            prisma.task.findFirst({
                where: {
                    id: taskId,
                    projectId,
                    deletedAt: null,
                }
            })
        ]);

        if (!userAccess) {
            return c.json({ error: 'Permission denied' }, 403);
        }

        if (!task) {
            return c.json({ error: 'Task not found' }, 404);
        }

        // Update task
        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: validatedData.data,
            include: {
                assignee: true,
                reporter: true,
                labels: true,
                sprint: true,
            },
        });

        return c.json({ task: updatedTask });
    } catch (error) {
        console.error('[UPDATE_TASK_ERROR]', error instanceof Error ? error.message : 'Unknown error');
        if (error instanceof z.ZodError) {
            return c.json({ errors: error.errors }, 400);
        }
        return c.json({ error: 'Internal server error' }, 500);
    }
});

// DELETE - Delete task
app.delete('/api/workspaces/:workspaceId/projects/:projectId/tasks/:taskId', authMiddleware, async (c) => {
    try {
        const { userId } = c.get('user');
        const { workspaceId, projectId, taskId } = c.req.param();

        // Check user's access and task existence
        const [userAccess, task] = await Promise.all([
            prisma.userWorkspace.findFirst({
                where: {
                    userId,
                    workspaceId,
                    isActive: true,
                }
            }),
            prisma.task.findFirst({
                where: {
                    id: taskId,
                    projectId,
                    deletedAt: null,
                }
            })
        ]);

        if (!userAccess) {
            return c.json({ error: 'Permission denied' }, 403);
        }

        if (!task) {
            return c.json({ error: 'Task not found' }, 404);
        }

        // Soft delete the task
        await prisma.task.update({
            where: { id: taskId },
            data: { deletedAt: new Date() }
        });

        return c.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('[DELETE_TASK_ERROR]', error);
        return c.json({ error: 'Internal server error' }, 500);
    }
});

export const PATCH = handle(app);
export const DELETE = handle(app); 
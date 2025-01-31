import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '@/middleware/auth';
import { z } from 'zod';

const app = new Hono();
const prisma = new PrismaClient();

// Validation schemas
const sprintSchema = z.object({
  name: z.string().min(1, "Sprint name is required"),
  goal: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  status: z.enum(['PLANNING', 'ACTIVE', 'COMPLETED', 'CANCELLED']),
});

// GET - Fetch all sprints for a project
app.get('/api/workspaces/:workspaceId/projects/:projectId/sprints', authMiddleware, async (c) => {
  try {
    const userId = c.req.query('userId');
    const { workspaceId, projectId } = c.req.param();

    // Check user's access
    const userAccess = await prisma.userWorkspace.findFirst({
      where: {
        userId,
        workspaceId,
        isActive: true,
      }
    });

    if (!userAccess) {
      return c.json({ error: 'Permission denied' }, 403);
    }

    // Fetch sprints with tasks
    const sprints = await prisma.sprint.findMany({
      where: {
        projectId,
      },
      include: {
        tasks: {
          where: {
            deletedAt: null,
          },
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            },
            reporter: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            },
            labels: true,
          },
          orderBy: [
            { position: 'asc' },
            { createdAt: 'desc' }
          ],
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return c.json({ sprints });
  } catch (error) {
    console.error('[GET_SPRINTS_ERROR]', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// POST - Create sprint
app.post('/api/workspaces/:workspaceId/projects/:projectId/sprints', authMiddleware, async (c) => {
  try {
    const userId = c.req.query('userId');
    const { workspaceId, projectId } = c.req.param();
    const body = await c.req.json();

    // Validate input
    const validatedData = sprintSchema.parse(body);

    // Check user's access
    const userAccess = await prisma.userWorkspace.findFirst({
      where: {
        userId,
        workspaceId,
        isActive: true,
      }
    });

    if (!userAccess) {
      return c.json({ error: 'Permission denied' }, 403);
    }

    // Check for active sprints
    if (validatedData.status === 'ACTIVE') {
      const activeSprint = await prisma.sprint.findFirst({
        where: {
          projectId,
          status: 'ACTIVE',
        }
      });

      if (activeSprint) {
        return c.json({ error: 'There is already an active sprint' }, 400);
      }
    }

    // Create sprint
    const sprint = await prisma.sprint.create({
      data: {
        ...validatedData,
        projectId,
      },
      include: {
        tasks: true,
      },
    });

    return c.json({ sprint });
  } catch (error) {
    console.error('[CREATE_SPRINT_ERROR]', error);
    if (error instanceof z.ZodError) {
      return c.json({ errors: error.errors }, 400);
    }
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// PATCH - Update sprint
app.patch('/api/workspaces/:workspaceId/projects/:projectId/sprints/:sprintId', authMiddleware, async (c) => {
  try {
    const userId = c.req.query('userId');
    const { workspaceId, projectId, sprintId } = c.req.param();
    const body = await c.req.json();

    // Validate input
    const validatedData = sprintSchema.partial().parse(body);

    // Check user's access and sprint existence
    const [userAccess, sprint] = await Promise.all([
      prisma.userWorkspace.findFirst({
        where: {
          userId,
          workspaceId,
          isActive: true,
        }
      }),
      prisma.sprint.findFirst({
        where: {
          id: sprintId,
          projectId,
        }
      })
    ]);

    if (!userAccess) {
      return c.json({ error: 'Permission denied' }, 403);
    }

    if (!sprint) {
      return c.json({ error: 'Sprint not found' }, 404);
    }

    // Check for active sprints if status is being changed to ACTIVE
    if (validatedData.status === 'ACTIVE' && sprint.status !== 'ACTIVE') {
      const activeSprint = await prisma.sprint.findFirst({
        where: {
          projectId,
          status: 'ACTIVE',
          NOT: {
            id: sprintId
          }
        }
      });

      if (activeSprint) {
        return c.json({ error: 'There is already an active sprint' }, 400);
      }
    }

    // Update sprint
    const updatedSprint = await prisma.sprint.update({
      where: { id: sprintId },
      data: validatedData,
      include: {
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            },
            reporter: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            },
            labels: true,
          }
        }
      }
    });

    return c.json({ sprint: updatedSprint });
  } catch (error) {
    console.error('[UPDATE_SPRINT_ERROR]', error);
    if (error instanceof z.ZodError) {
      return c.json({ errors: error.errors }, 400);
    }
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// DELETE - Delete sprint
app.delete('/api/workspaces/:workspaceId/projects/:projectId/sprints/:sprintId', authMiddleware, async (c) => {
  try {
    const userId = c.req.query('userId');
    const { workspaceId, projectId, sprintId } = c.req.param();

    // Check user's access and sprint existence
    const [userAccess, sprint] = await Promise.all([
      prisma.userWorkspace.findFirst({
        where: {
          userId,
          workspaceId,
          isActive: true,
        }
      }),
      prisma.sprint.findFirst({
        where: {
          id: sprintId,
          projectId,
        }
      })
    ]);

    if (!userAccess) {
      return c.json({ error: 'Permission denied' }, 403);
    }

    if (!sprint) {
      return c.json({ error: 'Sprint not found' }, 404);
    }

    // Delete sprint and move tasks to backlog
    await prisma.$transaction([
      // Move all tasks to backlog
      prisma.task.updateMany({
        where: { sprintId },
        data: { sprintId: null }
      }),
      // Delete the sprint
      prisma.sprint.delete({
        where: { id: sprintId }
      })
    ]);

    return c.json({ message: 'Sprint deleted successfully' });
  } catch (error) {
    console.error('[DELETE_SPRINT_ERROR]', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app); 
import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '@/middleware/auth'
import { z } from 'zod'

// Types
type Variables = {
    user: {
        userId: string
    }
}

// Initialize
const app = new Hono<{ Variables: Variables }>()
const prisma = new PrismaClient()

// Validation schema for Daily Standup
const standupSchema = z.object({
    yesterday: z.string().min(1, 'Yesterday\'s work is required'),
    today: z.string().min(1, 'Today\'s plan is required'),
    blockers: z.string().optional(),
})

// GET /api/workspaces/[workspaceId]/projects/[projectId]/sprints/[sprintId]/standups
app.get('/api/workspaces/:workspaceId/projects/:projectId/sprints/:sprintId/standups', authMiddleware, async (c) => {
    try {
        const userId = c.get('user').userId
        const { workspaceId, projectId, sprintId } = c.req.param()

        const standups = await prisma.dailyStandup.findMany({
            where: {
                sprintId: sprintId,
                sprint: {
                    projectId: projectId,
                    project: {
                        workspaceId: workspaceId,
                    },
                },
                userId: userId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                date: 'desc',
            },
        })

        return c.json(standups)
    } catch (error) {
        console.error('[STANDUPS_GET]', error)
        return c.json({ error: 'Internal server error' }, 500)
    }
})

// POST /api/workspaces/[workspaceId]/projects/[projectId]/sprints/[sprintId]/standups
app.post('/api/workspaces/:workspaceId/projects/:projectId/sprints/:sprintId/standups', authMiddleware, async (c) => {
    try {
        const userId = c.get('user').userId
        const { sprintId } = c.req.param()
        const body = await c.req.json()
        const validatedData = standupSchema.parse(body)

        // Check if user already submitted standup for today
        const existingStandup = await prisma.dailyStandup.findFirst({
            where: {
                sprintId: sprintId,
                userId: userId,
                date: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    lt: new Date(new Date().setHours(23, 59, 59, 999)),
                },
            },
        })

        if (existingStandup) {
            return c.json({ error: 'Already submitted standup for today' }, 400)
        }

        const standup = await prisma.dailyStandup.create({
            data: {
                ...validatedData,
                sprintId: sprintId,
                userId: userId,
                date: new Date(),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        })

        return c.json(standup)
    } catch (error) {
        console.error('[STANDUPS_POST]', error)
        
        if (error instanceof z.ZodError) {
            return c.json({ errors: error.errors }, 422)
        }
        return c.json({ error: 'Internal server error' }, 500)
    }
})

// PATCH /api/workspaces/[workspaceId]/projects/[projectId]/sprints/[sprintId]/standups/[standupId]
app.patch('/api/workspaces/:workspaceId/projects/:projectId/sprints/:sprintId/standups/:standupId', authMiddleware, async (c) => {
    try {
        const userId = c.get('user').userId
        const { standupId } = c.req.param()
        const body = await c.req.json()
        const validatedData = standupSchema.partial().parse(body)

        const standup = await prisma.dailyStandup.findUnique({
            where: { id: standupId },
        })

        if (!standup) {
            return c.json({ error: 'Standup not found' }, 404)
        }

        if (standup.userId !== userId) {
            return c.json({ error: 'Not authorized to update this standup' }, 403)
        }

        const updatedStandup = await prisma.dailyStandup.update({
            where: { id: standupId },
            data: validatedData,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        })

        return c.json(updatedStandup)
    } catch (error) {
        console.error('[STANDUPS_PATCH]', error)
        
        if (error instanceof z.ZodError) {
            return c.json({ errors: error.errors }, 422)
        }
        return c.json({ error: 'Internal server error' }, 500)
    }
})

// DELETE /api/workspaces/[workspaceId]/projects/[projectId]/sprints/[sprintId]/standups/[standupId]
app.delete('/api/workspaces/:workspaceId/projects/:projectId/sprints/:sprintId/standups/:standupId', authMiddleware, async (c) => {
    try {
        const userId = c.get('user').userId
        const { standupId } = c.req.param()

        const standup = await prisma.dailyStandup.findUnique({
            where: { id: standupId },
        })

        if (!standup) {
            return c.json({ error: 'Standup not found' }, 404)
        }

        if (standup.userId !== userId) {
            return c.json({ error: 'Not authorized to delete this standup' }, 403)
        }

        await prisma.dailyStandup.delete({
            where: { id: standupId },
        })

        return c.json({ message: 'Standup deleted successfully' })
    } catch (error) {
        console.error('[STANDUPS_DELETE]', error)
        return c.json({ error: 'Internal server error' }, 500)
    }
})

export const GET = handle(app)
export const POST = handle(app)
export const PATCH = handle(app)
export const DELETE = handle(app) 
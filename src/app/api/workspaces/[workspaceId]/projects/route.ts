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

// Validation schemas
const projectSchema = z.object({
    name: z.string().min(1, "Project name is required"),
    description: z.string().optional(),
    isPublic: z.boolean().default(false),
    icon: z.string().nullable().optional().default(null),
    backgroundColor: z.string().nullable().optional(),
    status: z.enum(["ACTIVE", "ARCHIVED", "COMPLETED", "ON_HOLD"]).default("ACTIVE"),
})

// Helper function to generate unique key
async function generateUniqueKey(workspaceId: string) {
    const generateRandomKey = () => {
        // สร้าง key ความยาว 6 ตัว ประกอบด้วยตัวอักษรและตัวเลข
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const length = 10;
        return Array.from({ length }, () => 
            characters.charAt(Math.floor(Math.random() * characters.length))
        ).join('');
    };

    let isUnique = false;
    let key = '';

    while (!isUnique) {
        key = generateRandomKey();
        const existingProject = await prisma.project.findFirst({
            where: {
                workspaceId,
                key,
                deletedAt: null
            }
        });

        if (!existingProject) {
            isUnique = true;
        }
    }

    return key;
}

// GET - Fetch all projects
app.get('/api/workspaces/:workspaceId/projects', authMiddleware, async (c) => {
    try {
        const { userId } = c.get('user');
        const workspaceId = c.req.param('workspaceId');

        // Check if workspaceId exists
        if (!workspaceId) {
            return c.json({ error: 'Workspace ID is required' }, 400);
        }

        const projects = await prisma.project.findMany({
            where: {
                workspaceId,
                deletedAt: null,
                workspace: {
                    OR: [
                        { ownerId: userId },
                        {
                            members: {
                                some: {
                                    userId,
                                    isActive: true
                                }
                            }
                        }
                    ]
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return c.json({ projects: projects || [] });

    } catch (error) {
        // ปรับปรุงการจัดการ error
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('[GET_PROJECTS_ERROR]', errorMessage);
        return c.json({
            error: 'Internal server error',
            details: errorMessage
        }, 500);
    }
});

// POST - Create new project
app.post('/api/workspaces/:workspaceId/projects', authMiddleware, async (c) => {
    try {
        const { userId } = c.get('user');
        const workspaceId = c.req.param('workspaceId');
        const body = await c.req.json();

        // Validate input
        const validatedData = projectSchema.parse(body);

        // Generate unique key
        const uniqueKey = await generateUniqueKey(workspaceId);

        // Create project
        const project = await prisma.project.create({
            data: {
                ...validatedData,
                key: uniqueKey,
                workspace: {
                    connect: {
                        id: workspaceId
                    }
                },
                createdBy: {
                    connect: {
                        id: userId
                    }
                }
            }
        });

        return c.json({ project });
    } catch (error) {
        console.error('[CREATE_PROJECT_ERROR]', error);
        if (error instanceof z.ZodError) {
            return c.json({ errors: error.errors }, 400);
        }
        return c.json({ error: 'Internal server error' }, 500);
    }
});



export const GET = handle(app);
export const POST = handle(app);

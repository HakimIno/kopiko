import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '@/middleware/auth'
import { z } from 'zod'

type Variables = {
    user: {
        userId: string
    }
}

const app = new Hono<{ Variables: Variables }>()
const prisma = new PrismaClient()

// Validation schema
const projectSchema = z.object({
    name: z.string().min(1, "Project name is required").optional(),
    description: z.string().optional(),
    key: z.string().min(1, "Project key is required").optional(),
    isPublic: z.boolean().optional(),
    icon: z.string().nullable().optional(),
    backgroundColor: z.string().nullable().optional(),
    status: z.enum(["ACTIVE", "ARCHIVED", "COMPLETED", "ON_HOLD"]).optional(),
})

// PATCH - Update project
app.patch('/api/workspaces/:workspaceId/projects/:projectId', authMiddleware, async (c) => {
    try {
        const { userId } = c.get('user');
        const workspaceId = c.req.param('workspaceId');
        const projectId = c.req.param('projectId');
        const body = await c.req.json();

        // Validate input
        const validatedData = projectSchema.parse(body);

        // ตรวจสอบสิทธิ์ของผู้ใช้ในพื้นที่ทำงาน
        const userWorkspace = await prisma.userWorkspace.findFirst({
            where: {
                userId,
                workspaceId,
                isActive: true,
            },
            select: {
                role: true,
                workspace: {
                    select: {
                        ownerId: true
                    }
                }
            }
        });

        // ตรวจสอบว่าผู้ใช้เป็น OWNER หรือ ADMIN เท่านั้น
        if (!userWorkspace || (userWorkspace.role !== 'OWNER' && userWorkspace.role !== 'ADMIN' && userWorkspace.workspace.ownerId !== userId)) {
            return c.json({ error: 'Permission denied. Only OWNER and ADMIN can update projects.' }, 403);
        }

        // Check if project exists
        const existingProject = await prisma.project.findFirst({
            where: {
                id: projectId,
                workspaceId,
                deletedAt: null,
            }
        });

        if (!existingProject) {
            return c.json({ error: 'Project not found' }, 404);
        }

        // Update project
        const project = await prisma.project.update({
            where: { id: projectId },
            data: validatedData
        });

        return c.json({ project });
    } catch (error) {
        console.error('[UPDATE_PROJECT_ERROR]', error);
        if (error instanceof z.ZodError) {
            return c.json({ errors: error.errors }, 400);
        }
        return c.json({ error: 'Internal server error' }, 500);
    }
});

// DELETE - Delete project
app.delete('/api/workspaces/:workspaceId/projects/:projectId', authMiddleware, async (c) => {
    try {
        const { userId } = c.get('user');
        const workspaceId = c.req.param('workspaceId');
        const projectId = c.req.param('projectId');

        // ตรวจสอบสิทธิ์ของผู้ใช้ในพื้นที่ทำงาน
        const userWorkspace = await prisma.userWorkspace.findFirst({
            where: {
                userId,
                workspaceId,
                isActive: true,
            },
            select: {
                role: true,
                workspace: {
                    select: {
                        ownerId: true
                    }
                }
            }
        });

        // ตรวจสอบว่าผู้ใช้เป็น OWNER เท่านั้น
        if (!userWorkspace || (userWorkspace.role !== 'OWNER' && userWorkspace.workspace.ownerId !== userId)) {
            return c.json({ error: 'Permission denied. Only OWNER can delete projects.' }, 403);
        }

        // Check if project exists
        const existingProject = await prisma.project.findFirst({
            where: {
                id: projectId,
                workspaceId,
                deletedAt: null,
            }
        });

        if (!existingProject) {
            return c.json({ error: 'Project not found' }, 404);
        }

        // Soft delete project instead of hard delete
        await prisma.project.update({
            where: { id: projectId },
            data: {
                deletedAt: new Date(),
            }
        });

        return c.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('[DELETE_PROJECT_ERROR]', error);
        return c.json({ error: 'Internal server error' }, 500);
    }
});

// GET - Fetch all projects
// app.get('/api/workspaces/:workspaceId/projects', authMiddleware, async (c) => {
//     try {
//         const { userId } = c.get('user');
//         const workspaceId = c.req.param('workspaceId');

//         if (!workspaceId) {
//             return c.json({ error: 'Workspace ID is required' }, 400);
//         }

//         const projects = await prisma.project.findMany({
//             where: {
//                 workspaceId,
//                 deletedAt: null, // เพิ่มเงื่อนไขนี้เพื่อไม่ดึงข้อมูลที่ถูก soft delete
//                 workspace: {
//                     OR: [
//                         { ownerId: userId },
//                         {
//                             members: {
//                                 some: {
//                                     userId,
//                                     isActive: true
//                                 }
//                             }
//                         }
//                     ]
//                 }
//             },
//             orderBy: { createdAt: 'desc' }
//         });

//         return c.json({ projects: projects || [] });

//     } catch (error) {
//         const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
//         console.error('[GET_PROJECTS_ERROR]', errorMessage);
//         return c.json({ 
//             error: 'Internal server error',
//             details: errorMessage 
//         }, 500);
//     }
// });

export const PATCH = handle(app);
export const DELETE = handle(app);

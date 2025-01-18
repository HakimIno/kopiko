import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { PrismaClient, WorkspaceRole } from '@prisma/client'
import { authMiddleware } from '@/middleware/auth'
import { z } from 'zod'

type Variables = {
  user: {
    userId: string
  }
}

const app = new Hono<{ Variables: Variables }>()
const prisma = new PrismaClient()

const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  icon: z.string().url("Invalid icon URL").optional(),
  theme: z.object({
    color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color"),
  }),
})

app.get('/api/workspaces', authMiddleware, async (c) => {
  try {
    const userId = c.get('user').userId
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    // First get all workspaces the user has access to
    const workspaces = await prisma.workspace.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId,
              },
            },
          },
        ],
        isActive: true,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: {
          where: {
            userId,
            isActive: true,
          },
          select: {
            role: true,
          },
        },
        _count: {
          select: {
            projects: true,
            members: {
              where: {
                isActive: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    // Transform the response to include role and permissions
    const workspacesWithPermissions = workspaces.map(workspace => {
      const isOwner = workspace.ownerId === userId;
      const userRole = isOwner ? WorkspaceRole.OWNER : (workspace.members[0]?.role || WorkspaceRole.MEMBER);

      return {
        ...workspace,
        members: undefined, // Remove the members array from response
        role: userRole,
        canEdit: userRole === WorkspaceRole.OWNER || userRole === WorkspaceRole.ADMIN,
        canDelete: userRole === WorkspaceRole.OWNER,
      };
    });

    return c.json(workspacesWithPermissions)
  } catch (error) {
    console.error('[WORKSPACES_GET]', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

app.post('/api/workspaces', authMiddleware, async (c) => {
  try {
    const userId = c.get('user').userId
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const body = await c.req.json()
    const validatedBody = createWorkspaceSchema.parse(body)

    const workspace = await prisma.workspace.create({
      data: {
        name: validatedBody.name,
        description: validatedBody.description,
        icon: validatedBody.icon,
        theme: validatedBody.theme,
        ownerId: userId,
        members: {
          create: {
            userId: userId,
            role: "OWNER",
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    return c.json(workspace)
  } catch (error) {
    console.error('[WORKSPACES_POST]', error)
    if (error instanceof z.ZodError) {
      return c.json({ errors: error.errors }, 400)
    }
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export const GET = handle(app)
export const POST = handle(app) 
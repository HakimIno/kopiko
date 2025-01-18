import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '@/middleware/auth'

type Variables = {
  user: {
    userId: string
  }
}

const app = new Hono<{ Variables: Variables }>()
const prisma = new PrismaClient()

// Get invitation details
app.get('/api/workspace-invites/:token', authMiddleware, async (c) => {
  try {
    const userId = c.get('user').userId
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const token = c.req.param('token')

    // Find invitation with workspace details
    const invitation = await prisma.workspaceInvitation.findUnique({
      where: { token },
      include: {
        workspace: true
      }
    })

    if (!invitation) {
      return c.json({ error: 'Invalid invitation' }, 404)
    }

    // Check if invitation is expired
    if (invitation.status !== 'PENDING' || invitation.expiresAt < new Date()) {
      await prisma.workspaceInvitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' }
      })
      return c.json({ error: 'Invitation has expired' }, 400)
    }

    // Check if user's email matches invitation email
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user || user.email !== invitation.email) {
      return c.json({ error: 'This invitation was sent to a different email address' }, 400)
    }

    return c.json({ 
      workspace: {
        id: invitation.workspace.id,
        name: invitation.workspace.name
      }
    })
  } catch (error) {
    console.error('[WORKSPACE_INVITE_GET]', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Accept invitation
app.post('/api/workspace-invites/:token', authMiddleware, async (c) => {
  try {
    const userId = c.get('user').userId
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const token = c.req.param('token')

    // Find invitation
    const invitation = await prisma.workspaceInvitation.findUnique({
      where: { token },
      include: {
        workspace: true
      }
    })

    if (!invitation) {
      return c.json({ error: 'Invalid invitation' }, 404)
    }

    // Check if invitation is expired
    if (invitation.status !== 'PENDING' || invitation.expiresAt < new Date()) {
      await prisma.workspaceInvitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' }
      })
      return c.json({ error: 'Invitation has expired' }, 400)
    }

    // Check if user's email matches invitation email
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user || user.email !== invitation.email) {
      return c.json({ error: 'Email mismatch' }, 400)
    }

    // Add user to workspace
    await prisma.userWorkspace.create({
      data: {
        userId,
        workspaceId: invitation.workspaceId,
        role: invitation.role
      }
    })

    // Update invitation status
    await prisma.workspaceInvitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED' }
    })

    return c.json({ 
      message: 'Invitation accepted successfully',
      workspace: {
        id: invitation.workspace.id,
        name: invitation.workspace.name
      }
    })
  } catch (error) {
    console.error('[WORKSPACE_INVITE_ACCEPT]', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export const GET = handle(app)
export const POST = handle(app) 
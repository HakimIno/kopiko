import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { PrismaClient, WorkspaceRole } from '@prisma/client'
import { authMiddleware } from '@/middleware/auth'
import { z } from 'zod'
import { Resend } from 'resend'

// Constants
const INVITATION_EXPIRY_DAYS = 7
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000

// Types
type Variables = {
    user: {
        userId: string
    }
}

// Initialize clients
const app = new Hono<{ Variables: Variables }>()
const prisma = new PrismaClient()
const resend = new Resend(process.env.RESEND_API_KEY)

// Validation schemas
const inviteSchema = z.object({
    email: z.string().email("Invalid email format"),
    role: z.enum(["ADMIN", "MEMBER", "VIEWER"]).default("MEMBER"),
})

// Helper functions
const checkWorkspacePermissions = async (userId: string, workspaceId: string) => {
    return await prisma.workspace.findFirst({
        where: {
            id: workspaceId,
            OR: [
                { ownerId: userId },
                {
                    members: {
                        some: {
                            userId,
                            role: {
                                in: ['OWNER', 'ADMIN']
                            }
                        }
                    }
                }
            ]
        },
        include: {
            owner: true
        }
    })
}

const checkExistingMember = async (workspaceId: string, email: string) => {
    return await prisma.userWorkspace.findFirst({
        where: {
            workspaceId,
            user: { email }
        }
    })
}

const checkExistingInvite = async (workspaceId: string, email: string) => {
    return await prisma.workspaceInvitation.findFirst({
        where: {
            workspaceId,
            email,
            status: 'PENDING'
        }
    })
}


const sendInvitationEmail = async (
    email: string,
    workspaceName: string,
    ownerName: string,
    inviteUrl: string
) => {
    return await resend.emails.send({
        from: 'Kopiko <onboarding@resend.dev>',
        to: email,
        subject: `You've been invited to join ${workspaceName} on Kopiko`,
        html: `
     <html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Workspace Invitation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F6F5EE; font-family: 'Arial', sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 10px 10px; text-align: center; background-color: #B07A57; border-radius: 8px 8px 0 0;">
              <div style="display: flex; width: auto; align-items: center; justify-content: center; "">
                <img src="https://i.postimg.cc/CxHWR1Dg/Screenshot-2568-01-16-at-16-02-52-removebg-preview-2.png" alt="Kopiko Logo" style="width: 80px; height: auto;">
                <span style="font-size: 1.5rem; font-weight: 600;">
                    Kopiko
                </span>
    </div>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 50px;">
              <h1 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600; text-align: center;">
                You've been invited to join ${workspaceName}
              </h1>
              
              <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 24px; text-align: center;">
                <span style="color: #B07A57; font-weight: 600;">${ownerName}</span> has invited you to join their workspace on Kopiko.
              </p>
              
              <div style="margin: 35px 0; text-align: center;">
                <a href="${inviteUrl}" 
                   style="display: inline-block; padding: 14px 32px; background-color: #B07A57; color: white; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 6px; transition: background-color 0.2s;">
                  Accept Invitation
                </a>
              </div>
              
              <p style="margin: 0 0 8px; color: #4a5568; font-size: 14px; text-align: center;">
                Or copy and paste this URL into your browser:
              </p>
              
              <p style="margin: 0 0 30px; padding: 12px; background-color: #F6F5EE; border-radius: 4px; color: #64748b; font-size: 14px; word-break: break-all; text-align: center;">
                ${inviteUrl}
              </p>
              
              <p style="margin: 0; color: #94a3b8; font-size: 14px; text-align: center;">
                This invitation will expire in ${INVITATION_EXPIRY_DAYS} days.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 50px; background-color: #f8fafc; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #64748b; font-size: 14px; text-align: center;">
                Need help? Contact us at <a href="mailto:support@kopiko.com" style="color: #B07A57; text-decoration: none;">support@kopiko.com</a>
              </p>
            </td>
          </tr>
        </table>
        
        <!-- Footer Text -->
        <table role="presentation" style="width: 600px; border-collapse: collapse;">
          <tr>
            <td style="padding: 30px 50px;">
              <p style="margin: 0; color: #94a3b8; font-size: 13px; text-align: center;">
                © ${new Date().getFullYear()} Kopiko. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
    })
}

const createInvitation = async (
    email: string,
    role: string,
    token: string,
    workspaceId: string,
    userId: string
) => {
    return await prisma.workspaceInvitation.create({
        data: {
            email,
            role: role as WorkspaceRole,
            token,
            workspaceId,
            inviterId: userId,
            expiresAt: new Date(Date.now() + INVITATION_EXPIRY_DAYS * MILLISECONDS_PER_DAY)
        }
    })
}

// Main route handler
app.post('/api/workspaces/:workspaceId/invites', authMiddleware, async (c) => {
    try {
        // Validate user authentication
        const userId = c.get('user').userId
        if (!userId) {
            return c.json({ error: 'Unauthorized' }, 401)
        }

        // Get and validate request data
        const workspaceId = c.req.param('workspaceId')
        const body = await c.req.json()
        const { email, role } = inviteSchema.parse(body)

        // Check permissions and workspace existence
        const workspace = await checkWorkspacePermissions(userId, workspaceId)
        if (!workspace) {
            return c.json({ error: 'Workspace not found or insufficient permissions' }, 404)
        }

        // Check for existing member
        const existingMember = await checkExistingMember(workspaceId, email)
        if (existingMember) {
            return c.json({ error: 'User is already a member of this workspace' }, 400)
        }

        // Check for existing invitation
        const existingInvite = await checkExistingInvite(workspaceId, email)
        if (existingInvite) {
            return c.json({ error: 'Invitation already sent to this email' }, 400)
        }

        // Generate invitation token and URL
        const token = crypto.randomUUID()
        const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/workspace-invite/${token}`

        try {
            // Send invitation email
            await sendInvitationEmail(email, workspace.name, workspace.owner.name, inviteUrl)

            // Create invitation record
            await createInvitation(email, role, token, workspaceId, userId)

            return c.json({ message: 'Invitation sent successfully' })
        } catch (emailError: any) {
            console.error('[EMAIL_SEND_ERROR]', emailError)

            if (emailError?.message?.includes('verify a domain')) {
                return c.json({
                    error: 'During testing, invitations can only be sent to the registered email (keemkeem207@gmail.com). Please use this email for testing or verify your domain at resend.com/domains for production use.'
                }, 400)
            }
            throw emailError
        }
    } catch (error) {
        console.error('[WORKSPACE_INVITE]', error)

        if (error instanceof z.ZodError) {
            return c.json({ errors: error.errors }, 400)
        }
        return c.json({ error: 'Internal server error' }, 500)
    }
})

export const POST = handle(app)
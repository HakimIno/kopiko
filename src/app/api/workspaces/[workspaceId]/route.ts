import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { WorkspaceRole } from "@prisma/client";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";

interface JwtPayload {
    userId?: string;
    currentUserId?: string;
    // add other fields if needed
}

// Helper function to get user ID from token
async function getUserId(): Promise<string | null> {
    try {
        const headersList = await headers();
        const authHeader = headersList.get("authorization");
        
        if (!authHeader?.startsWith("Bearer ")) {
            return null;
        }

        const token = authHeader.split(" ")[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
            return decoded.currentUserId || decoded.userId || null;
        } catch (error) {
            console.error("JWT verification error:", error);
            return null;
        }
    } catch (error) {
        console.error("[GET_USER_ID] Error:", error);
        return null;
    }
}

// Helper function to check permissions
async function checkWorkspacePermissions(workspaceId: string, userId: string, requiredRole: WorkspaceRole) {
    try {
        // First check if user is the workspace owner
        const workspace = await db.workspace.findFirst({
            where: {
                id: workspaceId,
                ownerId: userId,
                isActive: true
            }
        });

        if (workspace) {
            return true; // Workspace owner has all permissions
        }

        // Then check UserWorkspace role
        const userWorkspace = await db.userWorkspace.findFirst({
            where: {
                workspaceId,
                userId,
                isActive: true,
                role: {
                    in: requiredRole === WorkspaceRole.OWNER 
                        ? [WorkspaceRole.OWNER]
                        : [WorkspaceRole.OWNER, WorkspaceRole.ADMIN]
                }
            }
        });

        return userWorkspace !== null;
    } catch (error) {
        console.error("[CHECK_WORKSPACE_PERMISSIONS]", error);
        return false;
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ workspaceId: string }> }
) {
    try {
        const resolvedParams = await params;
        const workspaceId = resolvedParams.workspaceId;
        const userId = await getUserId();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const values = await req.json();

        // Check if user has ADMIN or OWNER role
        const hasPermission = await checkWorkspacePermissions(workspaceId, userId, WorkspaceRole.ADMIN || WorkspaceRole.OWNER);

        if (!hasPermission) {
            return new NextResponse(
                JSON.stringify({ 
                    code: 'UNAUTHORIZED',
                    message: "You don't have permission to edit this workspace" 
                }), 
                { status: 403 }
            );
        }

        const workspace = await db.workspace.update({
            where: {
                id: workspaceId,
                isActive: true
            },
            data: {
                ...values,
                updatedAt: new Date()
            }
        });

        return NextResponse.json(workspace);
    } catch (error) {
        console.log("[WORKSPACE_ID_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ workspaceId: string }> }
) {
    try {
        const resolvedParams = await params;
        const workspaceId = resolvedParams.workspaceId;
        const userId = await getUserId();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Check if user is the OWNER
        const hasPermission = await checkWorkspacePermissions(workspaceId, userId, WorkspaceRole.OWNER);

        if (!hasPermission) {
            return new NextResponse(
                JSON.stringify({ 
                    code: 'UNAUTHORIZED',
                    message: "Only workspace owners can delete workspaces" 
                }), 
                { status: 403 }
            );
        }

        // Soft delete the workspace
        await db.workspace.update({
            where: {
                id: workspaceId,
                isActive: true
            },
            data: {
                isActive: false,
                deletedAt: new Date()
            }
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.log("[WORKSPACE_ID_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ workspaceId: string }> }
) {
    try {
        const userId = await getUserId();
        if (!userId) {
            return new Response("Unauthorized", { status: 401 });
        }

        // รอให้ params ทั้งก้อนเสร็จก่อน
        const resolvedParams = await params;
        const workspaceId = resolvedParams.workspaceId;

        // First get user's role in the workspace
        const userWorkspace = await db.userWorkspace.findFirst({
            where: {
                workspaceId,
                userId: userId,
                isActive: true
            },
            select: {
                role: true
            }
        });

        // Then get workspace data
        const workspace = await db.workspace.findFirst({
            where: {
                id: workspaceId,
                isActive: true,
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                _count: {
                    select: {
                        members: {
                            where: {
                                isActive: true
                            }
                        },
                        projects: true
                    }
                }
            }
        });

        if (!workspace) {
            return new NextResponse(
                JSON.stringify({ 
                    code: 'NOT_FOUND',
                    message: "Workspace not found" 
                }), 
                { status: 404 }
            );
        }

        // Determine user's role and permissions
        const isOwner = workspace.ownerId === userId;
        const userRole = isOwner ? WorkspaceRole.OWNER : userWorkspace?.role || WorkspaceRole.MEMBER;

        // Create a clean response object
        const responseData = {
            workspace: {
                id: workspace.id,
                name: workspace.name,
                description: workspace.description,
                isActive: workspace.isActive,
                settings: workspace.settings,
                icon: workspace.icon,
                banner: workspace.banner,
                logo: workspace.logo,
                theme: workspace.theme,
                createdAt: workspace.createdAt,
                updatedAt: workspace.updatedAt,
                deletedAt: workspace.deletedAt,
                ownerId: workspace.ownerId,
                owner: workspace.owner,
                _count: workspace._count
            },
            permissions: {
                role: userRole,
                canEdit: userRole === WorkspaceRole.OWNER || userRole === WorkspaceRole.ADMIN,
                canDelete: userRole === WorkspaceRole.OWNER
            }
        };

        return NextResponse.json(responseData);
    } catch (error) {
        console.error("[WORKSPACE_ID_GET] Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
} 
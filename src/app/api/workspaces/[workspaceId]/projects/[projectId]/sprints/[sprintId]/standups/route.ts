import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

// Validation schema for Daily Standup
const standupSchema = z.object({
  yesterday: z.string().min(1, 'Yesterday\'s work is required'),
  today: z.string().min(1, 'Today\'s plan is required'),
  blockers: z.string().optional(),
});

// GET /api/workspaces/[workspaceId]/projects/[projectId]/sprints/[sprintId]/standups
export async function GET(
  request: Request,
  { params }: { params: { workspaceId: string; projectId: string; sprintId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const standups = await prisma.dailyStandup.findMany({
      where: {
        sprintId: params.sprintId,
        sprint: {
          projectId: params.projectId,
          project: {
            workspaceId: params.workspaceId,
          },
        },
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
    });

    return NextResponse.json(standups);
  } catch (error) {
    console.error('[STANDUPS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// POST /api/workspaces/[workspaceId]/projects/[projectId]/sprints/[sprintId]/standups
export async function POST(
  request: Request,
  { params }: { params: { workspaceId: string; projectId: string; sprintId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const validatedData = standupSchema.parse(body);

    // Check if user already submitted standup for today
    const existingStandup = await prisma.dailyStandup.findFirst({
      where: {
        sprintId: params.sprintId,
        userId: session.user.id,
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    });

    if (existingStandup) {
      return new NextResponse('Already submitted standup for today', { status: 400 });
    }

    const standup = await prisma.dailyStandup.create({
      data: {
        ...validatedData,
        sprintId: params.sprintId,
        userId: session.user.id,
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
    });

    return NextResponse.json(standup);
  } catch (error) {
    console.error('[STANDUPS_POST]', error);
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 422 });
    }
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// PATCH /api/workspaces/[workspaceId]/projects/[projectId]/sprints/[sprintId]/standups/[standupId]
export async function PATCH(
  request: Request,
  { params }: { params: { workspaceId: string; projectId: string; sprintId: string; standupId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const validatedData = standupSchema.partial().parse(body);

    const standup = await prisma.dailyStandup.findUnique({
      where: { id: params.standupId },
    });

    if (!standup) {
      return new NextResponse('Standup not found', { status: 404 });
    }

    if (standup.userId !== session.user.id) {
      return new NextResponse('Not authorized to update this standup', { status: 403 });
    }

    const updatedStandup = await prisma.dailyStandup.update({
      where: { id: params.standupId },
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
    });

    return NextResponse.json(updatedStandup);
  } catch (error) {
    console.error('[STANDUPS_PATCH]', error);
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 422 });
    }
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// DELETE /api/workspaces/[workspaceId]/projects/[projectId]/sprints/[sprintId]/standups/[standupId]
export async function DELETE(
  request: Request,
  { params }: { params: { workspaceId: string; projectId: string; sprintId: string; standupId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const standup = await prisma.dailyStandup.findUnique({
      where: { id: params.standupId },
    });

    if (!standup) {
      return new NextResponse('Standup not found', { status: 404 });
    }

    if (standup.userId !== session.user.id) {
      return new NextResponse('Not authorized to delete this standup', { status: 403 });
    }

    await prisma.dailyStandup.delete({
      where: { id: params.standupId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[STANDUPS_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 
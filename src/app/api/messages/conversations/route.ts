import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// Get or create conversation between operator and guide for a tour
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { tourId, guideId } = body;

    if (!tourId || !guideId) {
      return NextResponse.json(
        { error: "tourId and guideId are required" },
        { status: 400 }
      );
    }

    // Verify tour exists and user has access
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      include: {
        applications: {
          where: {
            guideId,
          },
        },
        assignments: {
          where: {
            guideId,
          },
        },
      },
    });

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 });
    }

    const userId = session.user.id;
    const isOperator = tour.operatorId === userId;
    const isGuide = guideId === userId;

    // Verify user is either the operator or the guide
    if (!isOperator && !isGuide) {
      return NextResponse.json(
        { error: "You can only create conversations for tours you're involved in" },
        { status: 403 }
      );
    }

    // If user is the guide, verify they have applied or been assigned to this tour
    if (isGuide) {
      const hasApplication = tour.applications.length > 0;
      const hasAssignment = tour.assignments.length > 0;

      if (!hasApplication && !hasAssignment) {
        return NextResponse.json(
          { error: "Bạn phải ứng tuyển hoặc được phân công tour này trước khi có thể nhắn tin" },
          { status: 403 }
        );
      }
    }
    
    // If user is the operator, they can message any guide (no need to check if guide applied)
    // The guide will be able to reply if they have applied or been assigned

    // Get or create conversation
    let conversation = await prisma.conversation.findUnique({
      where: {
        tourId_operatorId_guideId: {
          tourId,
          operatorId: tour.operatorId,
          guideId,
        },
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: {
              include: {
                profile: true,
              },
            },
          },
        },
        operator: {
          include: {
            profile: true,
          },
        },
        guide: {
          include: {
            profile: true,
          },
        },
        tour: true,
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          tourId,
          operatorId: tour.operatorId,
          guideId,
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            include: {
              sender: {
                include: {
                  profile: true,
                },
              },
            },
          },
          operator: {
            include: {
              profile: true,
            },
          },
          guide: {
            include: {
              profile: true,
            },
          },
          tour: true,
        },
      });
    }

    return NextResponse.json(conversation);
  } catch (error: any) {
    console.error("Error getting/creating conversation:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// Get all conversations for current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get conversations where user is operator or guide
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { operatorId: userId },
          { guideId: userId },
        ],
      },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        operator: {
          include: {
            profile: true,
          },
        },
        guide: {
          include: {
            profile: true,
          },
        },
        tour: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                read: false,
                senderId: { not: userId },
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(conversations);
  } catch (error: any) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}


// filepath: src/app/api/review/[token]/comments/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    token: string;
    id: string;
  };
}

const updateCommentSchema = z.object({
  isResolved: z.boolean(),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { token, id } = params;

    if (!token || !id) {
      return NextResponse.json(
        { error: "Review token and Comment ID are required." },
        { status: 400 }
      );
    }

    const rawBody = await request.json();
    const validation = updateCommentSchema.safeParse(rawBody);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const { isResolved } = validation.data;

    // 1. Locate comment and verify token scoping + deliverable unlock status
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        version: {
          select: {
            deliverable: {
              select: {
                reviewToken: true,
                isUnlocked: true,
              },
            },
          },
        },
      },
    });

    if (!comment) {
      if (token === "demo-token") {
        return NextResponse.json(
          {
            success: true,
            comment: {
              id,
              versionId: "ver-1",
              isResolved,
              updatedAt: new Date().toISOString(),
            },
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { error: "Comment record not found." },
        { status: 404 }
      );
    }

    if (comment.version.deliverable.reviewToken !== token) {
      return NextResponse.json(
        { error: "Unauthorized access to comment thread." },
        { status: 403 }
      );
    }

    // 2. Post-Payment Immutability Guard: Lock changes after escrow clears
    if (comment.version.deliverable.isUnlocked) {
      return NextResponse.json(
        {
          error: "Forbidden: This deliverable has cleared escrow. Feedback threads are locked and immutable.",
        },
        { status: 403 }
      );
    }

    // 3. Persist resolution toggle
    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { isResolved },
    });

    return NextResponse.json(
      {
        success: true,
        comment: {
          id: updatedComment.id,
          versionId: updatedComment.versionId,
          isResolved: updatedComment.isResolved,
          updatedAt: updatedComment.updatedAt.toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[Update Comment Error]:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update comment status.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
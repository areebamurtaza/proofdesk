// filepath: src/app/api/deliverables/[id]/comments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getOrCreateCurrentAgency } from "@/lib/agency";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    id: string;
  };
}

const agencyReplySchema = z.object({
  versionId: z.string().uuid("Invalid version ID format"),
  parentId: z.string().uuid("Parent comment ID is required for replies"),
  authorName: z.string().trim().min(1, "Author name is required").default("Agency Team"),
  content: z.string().trim().min(1, "Reply content cannot be empty").max(2000),
});

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    let agency;
    try {
      agency = await getOrCreateCurrentAgency();
    } catch {
      return NextResponse.json(
        { error: "Unauthorized. Active agency session required." },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Deliverable ID is required." },
        { status: 400 }
      );
    }

    const rawBody = await request.json();
    const validation = agencyReplySchema.safeParse(rawBody);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const { versionId, parentId, authorName, content } = validation.data;

    // 1. Verify Deliverable belongs to this Agency Workspace
    const deliverable = await prisma.deliverable.findFirst({
      where: {
        id,
        project: {
          agencyId: agency.id,
        },
      },
      select: {
        id: true,
        isUnlocked: true,
      },
    });

    if (!deliverable) {
      return NextResponse.json(
        { error: "Target deliverable not found or unauthorized access." },
        { status: 404 }
      );
    }

    // 2. Immutability Gate: Reject replies if deliverable has completed escrow
    if (deliverable.isUnlocked) {
      return NextResponse.json(
        {
          error: "Forbidden: This deliverable has cleared escrow and is immutable. Pinned feedback is locked.",
        },
        { status: 403 }
      );
    }

    // 3. Verify Parent Comment exists on this Deliverable and matches versionId
    const parentComment = await prisma.comment.findUnique({
      where: { id: parentId },
      include: {
        version: {
          select: {
            id: true,
            deliverableId: true,
          },
        },
      },
    });

    if (!parentComment || parentComment.version.deliverableId !== id) {
      return NextResponse.json(
        { error: "Parent pin comment not found on this deliverable." },
        { status: 404 }
      );
    }

    if (parentComment.versionId !== versionId) {
      return NextResponse.json(
        {
          error: "Version mismatch: Target versionId does not match the parent comment thread.",
        },
        { status: 400 }
      );
    }

    // 4. Commit agency reply inheriting parent pin normalized coordinates
    const reply = await prisma.comment.create({
      data: {
        versionId,
        parentId,
        authorType: "AGENCY",
        authorName,
        content,
        xPercent: parentComment.xPercent,
        yPercent: parentComment.yPercent,
        isResolved: false,
      },
    });

    return NextResponse.json(
      {
        success: true,
        comment: {
          id: reply.id,
          versionId: reply.versionId,
          parentId: reply.parentId,
          authorType: reply.authorType,
          authorName: reply.authorName,
          content: reply.content,
          xPercent: reply.xPercent,
          yPercent: reply.yPercent,
          isResolved: reply.isResolved,
          createdAt: reply.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("[Agency Comment Reply Error]:", error);
    const message =
      error instanceof Error ? error.message : "Failed to record agency reply.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
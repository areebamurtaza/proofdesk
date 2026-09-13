// filepath: src/app/api/deliverables/[id]/comments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: {
    id: string;
  };
}

const agencyReplySchema = z.object({
  versionId: z.string().uuid("Invalid version ID"),
  parentId: z.string().uuid("Parent comment ID is required for replies"),
  authorName: z.string().trim().min(1, "Author name required").default("Agency Team"),
  content: z.string().trim().min(1, "Reply content cannot be empty").max(2000),
});

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Deliverable ID is required" }, { status: 400 });
    }

    const rawBody = await request.json();
    const validation = agencyReplySchema.safeParse(rawBody);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { versionId, parentId, authorName, content } = validation.data;

    // 1. Validate parent comment
    const parentComment = await prisma.comment.findUnique({
      where: { id: parentId },
      include: {
        version: {
          select: { deliverableId: true },
        },
      },
    });

    if (!parentComment || parentComment.version.deliverableId !== id) {
      return NextResponse.json(
        { error: "Parent pin comment not found on this deliverable." },
        { status: 404 }
      );
    }

    // 2. Commit agency reply inheriting the spatial coordinates of the parent pin
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
    const message = error instanceof Error ? error.message : "Failed to record agency reply.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
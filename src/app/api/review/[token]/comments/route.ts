// filepath: src/app/api/review/[token]/comments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    token: string;
  };
}

const createCommentSchema = z.object({
  versionId: z.string().uuid("Invalid version ID"),
  content: z.string().trim().min(1, "Comment content cannot be empty").max(2000, "Comment exceeds 2000 characters"),
  authorName: z.string().trim().min(1, "Author name is required").max(80, "Name too long"),
  authorEmail: z.string().email("Invalid email format").optional().or(z.literal("")),
  xPercent: z
    .number()
    .min(0.0, "xPercent cannot be less than 0.0")
    .max(1.0, "xPercent cannot exceed 1.0"),
  yPercent: z
    .number()
    .min(0.0, "yPercent cannot be less than 0.0")
    .max(1.0, "yPercent cannot exceed 1.0"),
  parentId: z.string().uuid("Invalid parent comment ID").optional().nullable(),
});

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.json({ error: "Review token is required" }, { status: 400 });
    }

    const rawBody = await request.json();
    const validation = createCommentSchema.safeParse(rawBody);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      versionId,
      content,
      authorName,
      authorEmail,
      xPercent,
      yPercent,
      parentId,
    } = validation.data;

    // 1. Verify deliverable existence and access
    const deliverable = await prisma.deliverable.findUnique({
      where: { reviewToken: token },
      select: {
        id: true,
        isUnlocked: true,
        status: true,
        versions: {
          select: { id: true },
        },
      },
    });

    if (!deliverable) {
      return NextResponse.json({ error: "Deliverable not found or token expired" }, { status: 404 });
    }

    // 2. Immutability Gate: Once unlocked and paid, feedback is disabled
    if (deliverable.isUnlocked) {
      return NextResponse.json(
        { error: "Forbidden: Deliverable is approved and paid. Annotations are disabled." },
        { status: 403 }
      );
    }

    // 3. Foreign Key Integrity Check: Confirm version belongs to this deliverable
    const isValidVersion = deliverable.versions.some((v) => v.id === versionId);
    if (!isValidVersion) {
      return NextResponse.json(
        { error: "Version mismatch: Provided version does not belong to this deliverable." },
        { status: 400 }
      );
    }

    // 4. Threading Check: If parentId is supplied, confirm parent exists
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { id: true, versionId: true },
      });

      if (!parentComment || parentComment.versionId !== versionId) {
        return NextResponse.json(
          { error: "Parent comment does not exist within the specified version." },
          { status: 400 }
        );
      }
    }

    // 5. Commit Comment and update status atomically
    const createdComment = await prisma.$transaction(async (tx) => {
      const comment = await tx.comment.create({
        data: {
          versionId,
          authorType: "CLIENT",
          authorName,
          authorEmail: authorEmail && authorEmail.trim() !== "" ? authorEmail.trim() : null,
          content,
          xPercent,
          yPercent,
          isResolved: false,
          parentId: parentId || null,
        },
      });

      if (deliverable.status === "IN_REVIEW") {
        await tx.deliverable.update({
          where: { id: deliverable.id },
          data: { status: "CHANGES_REQUESTED" },
        });
      }

      return comment;
    });

    // 6. Record DROP_PIN Telemetry Log
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "Unknown Client";

    prisma.reviewAccessLog
      .create({
        data: {
          deliverableId: deliverable.id,
          action: "DROP_PIN",
          ipAddress: clientIp,
          userAgent: userAgent.slice(0, 500),
          accessedAt: new Date(),
        },
      })
      .catch((err) => console.error("[DROP_PIN Telemetry Write Error]:", err));

    return NextResponse.json(
      {
        success: true,
        comment: {
          id: createdComment.id,
          versionId: createdComment.versionId,
          authorType: createdComment.authorType,
          authorName: createdComment.authorName,
          authorEmail: createdComment.authorEmail,
          content: createdComment.content,
          xPercent: createdComment.xPercent,
          yPercent: createdComment.yPercent,
          isResolved: createdComment.isResolved,
          parentId: createdComment.parentId,
          createdAt: createdComment.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("[Create Comment Error]:", error);
    const message = error instanceof Error ? error.message : "Failed to persist annotation comment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
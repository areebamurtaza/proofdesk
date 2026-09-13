// filepath: src/app/api/deliverables/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Deliverable ID is required" }, { status: 400 });
    }

    const deliverable = await prisma.deliverable.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            clientName: true,
            clientEmail: true,
          },
        },
        versions: {
          orderBy: { versionNumber: "asc" },
          include: {
            comments: {
              orderBy: { createdAt: "asc" },
            },
          },
        },
        invoice: {
          select: {
            id: true,
            amount: true,
            currency: true,
            status: true,
            paidAt: true,
            stripeCheckoutSessionId: true,
          },
        },
        approvalRecord: true,
      },
    });

    if (!deliverable) {
      return NextResponse.json({ error: "Deliverable not found" }, { status: 404 });
    }

    // Sign ephemeral preview URLs for every version
    const mappedVersions = deliverable.versions.map((ver) => ({
      id: ver.id,
      versionNumber: ver.versionNumber,
      fileName: ver.fileName,
      fileSize: ver.fileSize,
      mimeType: ver.mimeType,
      changeLog: ver.changeLog,
      previewUrl: `/api/storage/preview?key=${encodeURIComponent(ver.previewKey)}`,
      createdAt: ver.createdAt.toISOString(),
      comments: ver.comments.map((c) => ({
        id: c.id,
        versionId: c.versionId,
        authorType: c.authorType,
        authorName: c.authorName,
        authorEmail: c.authorEmail,
        content: c.content,
        xPercent: c.xPercent,
        yPercent: c.yPercent,
        isResolved: c.isResolved,
        parentId: c.parentId,
        createdAt: c.createdAt.toISOString(),
      })),
    }));

    return NextResponse.json(
      {
        success: true,
        deliverable: {
          id: deliverable.id,
          title: deliverable.title,
          description: deliverable.description,
          fileType: deliverable.fileType,
          status: deliverable.status,
          isUnlocked: deliverable.isUnlocked,
          reviewToken: deliverable.reviewToken,
          createdAt: deliverable.createdAt.toISOString(),
          project: deliverable.project,
          invoice: deliverable.invoice
            ? {
                ...deliverable.invoice,
                paidAt: deliverable.invoice.paidAt?.toISOString() || null,
              }
            : null,
          approvalRecord: deliverable.approvalRecord
            ? {
                ...deliverable.approvalRecord,
                approvedAt: deliverable.approvalRecord.approvedAt.toISOString(),
              }
            : null,
          versions: mappedVersions,
        },
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  } catch (error: unknown) {
    console.error("[Agency Fetch Deliverable Error]:", error);
    const message = error instanceof Error ? error.message : "Failed to load deliverable.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
// filepath: src/app/api/deliverables/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getVerifiedDeliverableAgency } from "@/lib/agency";
import { isR2Configured, generatePresignedPreviewUrl } from "@/lib/r2";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Deliverable ID is required." },
        { status: 400 }
      );
    }

    const requestedOrgId =
      request.nextUrl.searchParams.get("orgId") ||
      request.headers.get("x-clerk-org-id");

    let verified;
    try {
      verified = await getVerifiedDeliverableAgency(id, requestedOrgId);
    } catch {
      return NextResponse.json(
        { error: "Unauthorized. Active agency session required." },
        { status: 401 }
      );
    }

    if (!verified) {
      return NextResponse.json(
        { error: "Deliverable record not found or access denied." },
        { status: 404 }
      );
    }

    // MULTI-TENANT VERIFIED: Scoped strictly to authorized agency
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
        approvalRecord: {
          select: {
            id: true,
            approvedVersion: true,
            signerName: true,
            signerEmail: true,
            ipAddress: true,
            userAgent: true,
            legalConsent: true,
            signatureHash: true,
            approvedAt: true,
          },
        },
      },
    });

    if (!deliverable) {
      return NextResponse.json(
        { error: "Deliverable record not found or access denied." },
        { status: 404 }
      );
    }

    // Ephemeral preview URLs (300s TTL) for agency inspection
    // When unlocked and renderable, load the clean master asset; otherwise load the preview
    const mappedVersions = await Promise.all(
      deliverable.versions.map(async (ver) => {
        const isRenderableImage =
          ver.mimeType?.startsWith("image/") ||
          /\.(png|jpe?g|webp|svg)$/i.test(ver.fileName);

        const shouldUseCleanFile = deliverable.isUnlocked && isRenderableImage;
        const targetKey = shouldUseCleanFile ? ver.cleanFileKey : ver.previewKey;
        const targetMime = shouldUseCleanFile ? ver.mimeType : "image/jpeg";

        let previewUrl = `/api/storage/preview?key=${encodeURIComponent(targetKey)}`;

        if (isR2Configured()) {
          try {
            previewUrl = await generatePresignedPreviewUrl({
              key: targetKey,
              contentType: targetMime,
              expiresIn: 300,
            });
          } catch (err) {
            console.error(`[R2 Sign Error for version ${ver.id}]:`, err);
          }
        }

        return {
          id: ver.id,
          versionNumber: ver.versionNumber,
          fileName: ver.fileName,
          fileSize: ver.fileSize,
          mimeType: ver.mimeType,
          changeLog: ver.changeLog,
          previewUrl,
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
        };
      })
    );

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
          updatedAt: deliverable.updatedAt.toISOString(),
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
    const message =
      error instanceof Error ? error.message : "Failed to load deliverable.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
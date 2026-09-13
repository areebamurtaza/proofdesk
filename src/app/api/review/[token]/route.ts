// filepath: src/app/api/review/[token]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isR2Configured, generatePresignedPreviewUrl } from "@/lib/r2";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    token: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.json(
        { error: "Review token is required." },
        { status: 400 }
      );
    }

    const forwarded = request.headers.get("x-forwarded-for");
    const ipAddress = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "Unknown Client";

    const deliverable = await prisma.deliverable.findUnique({
      where: { reviewToken: token },
      include: {
        project: {
          include: {
            agency: {
              select: {
                name: true,
                slug: true,
              },
            },
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
            approvedAt: true,
            signatureHash: true,
          },
        },
      },
    });

    if (!deliverable) {
      return NextResponse.json(
        { error: "Deliverable review vault not found or token has expired." },
        { status: 404 }
      );
    }

    // Telemetry log: Explicit VIEW_PORTAL action
    prisma.reviewAccessLog
      .create({
        data: {
          deliverableId: deliverable.id,
          action: "VIEW_PORTAL",
          ipAddress,
          userAgent: userAgent.slice(0, 500),
          accessedAt: new Date(),
        },
      })
      .catch((err) => console.error("[Review Access Log Error]:", err));

    // Sign temporary 60s R2 preview URLs for each version
    const mappedVersions = await Promise.all(
      (deliverable.versions || []).map(async (ver) => {
        let previewUrl = "";

        if (isR2Configured()) {
          try {
            previewUrl = await generatePresignedPreviewUrl({
              key: ver.previewKey,
              expiresIn: 60,
            });
          } catch (signErr) {
            console.error(`[R2 Preview Signing Failed for ${ver.previewKey}]:`, signErr);
          }
        } else {
          previewUrl = `/api/upload/local?key=${encodeURIComponent(ver.previewKey)}`;
        }

        return {
          id: ver.id,
          versionNumber: ver.versionNumber,
          fileName: ver.fileName,
          fileSize: ver.fileSize,
          mimeType: ver.mimeType,
          width: ver.width || 1600,
          height: ver.height || 1000,
          changeLog: ver.changeLog ?? undefined,
          previewUrl,
          cleanDownloadUrl: deliverable.isUnlocked
            ? `/api/review/${deliverable.reviewToken}/download`
            : null,
          createdAt: ver.createdAt.toISOString(),
          comments: (ver.comments || []).map((c) => ({
            id: c.id,
            versionId: c.versionId,
            authorType: c.authorType,
            authorName: c.authorName,
            authorEmail: c.authorEmail ?? undefined,
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

    const responsePayload = {
      id: deliverable.id,
      title: deliverable.title,
      description: deliverable.description,
      fileType: deliverable.fileType,
      status: deliverable.status,
      isUnlocked: deliverable.isUnlocked,
      reviewToken: deliverable.reviewToken,
      createdAt: deliverable.createdAt.toISOString(),
      projectName: deliverable.project?.name || "General Deliverables",
      agencyName: deliverable.project?.agency?.name || "Studio Monolith",
      agency: {
        name: deliverable.project?.agency?.name || "Studio Monolith",
        slug: deliverable.project?.agency?.slug || "studio-monolith",
      },
      project: {
        name: deliverable.project?.name || "General Deliverables",
        clientName: deliverable.project?.clientName || "Valued Client",
        clientEmail: deliverable.project?.clientEmail || "",
      },
      invoice: deliverable.invoice
        ? {
            id: deliverable.invoice.id,
            amount: deliverable.invoice.amount,
            currency: deliverable.invoice.currency,
            status: deliverable.invoice.status,
            paidAt: deliverable.invoice.paidAt?.toISOString() || null,
          }
        : null,
      invoiceAmountCents: deliverable.invoice?.amount || 0,
      currency: deliverable.invoice?.currency || "usd",
      approvalRecord: deliverable.approvalRecord
        ? {
            id: deliverable.approvalRecord.id,
            approvedVersion: deliverable.approvalRecord.approvedVersion,
            signerName: deliverable.approvalRecord.signerName,
            signerEmail: deliverable.approvalRecord.signerEmail,
            approvedAt: deliverable.approvalRecord.approvedAt.toISOString(),
            signatureHash: deliverable.approvalRecord.signatureHash,
          }
        : null,
      versions: mappedVersions,
    };

    return NextResponse.json(
      {
        success: true,
        deliverable: responsePayload,
        ...responsePayload,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  } catch (error: unknown) {
    console.error("[Review Token Ingestion Error]:", error);
    const message =
      error instanceof Error ? error.message : "Failed to load deliverable review vault.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
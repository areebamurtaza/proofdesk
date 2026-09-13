// filepath: src/app/api/review/[token]/download/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { isR2Configured, generatePresignedDownloadUrl } from "@/lib/r2";

export const dynamic = "force-dynamic";

const ParamsSchema = z.object({
  token: z.string().uuid("Invalid review token format"),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const validation = ParamsSchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid review token" },
        { status: 400 }
      );
    }

    const { token } = validation.data;
    const { searchParams } = new URL(req.url);
    const requestedVersion = searchParams.get("version");

    // Fetch deliverable, approval record, and version history
    const deliverable = await prisma.deliverable.findUnique({
      where: { reviewToken: token },
      include: {
        approvalRecord: true,
        versions: {
          orderBy: { versionNumber: "desc" },
        },
      },
    });

    if (!deliverable) {
      return NextResponse.json(
        { error: "Deliverable not found" },
        { status: 404 }
      );
    }

    // Cryptographic Escrow Security Gate
    if (!deliverable.isUnlocked) {
      return NextResponse.json(
        {
          error: "Payment required. Final clean master assets remain locked until escrow settles.",
        },
        { status: 403 }
      );
    }

    if (!deliverable.versions || deliverable.versions.length === 0) {
      return NextResponse.json(
        { error: "No version files exist for this deliverable." },
        { status: 404 }
      );
    }

    // Resolve target version:
    // 1. Explicit query parameter (?version=X)
    // 2. Legally approved version from ApprovalRecord
    // 3. Highest/latest version
    let targetVersion = deliverable.versions[0];

    if (requestedVersion) {
      const parsed = parseInt(requestedVersion, 10);
      const found = deliverable.versions.find((v) => v.versionNumber === parsed);
      if (found) targetVersion = found;
    } else if (deliverable.approvalRecord?.approvedVersion) {
      const approved = deliverable.versions.find(
        (v) => v.versionNumber === deliverable.approvalRecord?.approvedVersion
      );
      if (approved) targetVersion = approved;
    }

    if (!targetVersion || !targetVersion.cleanFileKey) {
      return NextResponse.json(
        { error: "Target master clean file record does not exist." },
        { status: 404 }
      );
    }

    // Telemetry Audit: Record download event asynchronously
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Unknown Client";

    prisma.reviewAccessLog
      .create({
        data: {
          deliverableId: deliverable.id,
          action: "DOWNLOAD_MASTER",
          ipAddress,
          userAgent: userAgent.slice(0, 500),
          accessedAt: new Date(),
        },
      })
      .catch((err) => console.error("[Telemetry Download Log Error]:", err));

    // Local Development Fallback
    if (
      !isR2Configured() ||
      (process.env.NODE_ENV === "development" && process.env.USE_LOCAL_STORAGE === "true")
    ) {
      return NextResponse.json({
        downloadUrl: `/api/upload/local?key=${encodeURIComponent(targetVersion.cleanFileKey)}`,
        fileName: targetVersion.fileName,
      });
    }

    // Generate signed download URL with 60-second TTL
    const downloadUrl = await generatePresignedDownloadUrl({
      key: targetVersion.cleanFileKey,
      downloadFileName: targetVersion.fileName,
      expiresIn: 60,
    });

    const wantsJson =
      req.headers.get("accept")?.includes("application/json") ||
      searchParams.get("format") === "json";

    if (wantsJson) {
      return NextResponse.json(
        { downloadUrl, fileName: targetVersion.fileName },
        { status: 200 }
      );
    }

    return NextResponse.redirect(downloadUrl, 307);
  } catch (error: unknown) {
    console.error("[MASTER_DOWNLOAD_ROUTE_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error occurred while processing asset download." },
      { status: 500 }
    );
  }
}
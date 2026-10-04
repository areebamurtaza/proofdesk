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
        { error: "Invalid review token format." },
        { status: 400 }
      );
    }

    const { token } = validation.data;
    const { searchParams } = new URL(req.url);
    const requestedVersion = searchParams.get("version");

    // Fetch deliverable, legal approval record, and versions
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
      if (token === "demo-token") {
        const isUnlocked = searchParams.get("unlocked") === "true";
        if (!isUnlocked) {
          return NextResponse.json(
            {
              error:
                "Payment required. Final clean master assets remain locked in escrow until payment settles.",
            },
            { status: 403 }
          );
        }

        const demoDownloadUrl =
          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop";
        const wantsJson =
          req.headers.get("accept")?.includes("application/json") ||
          searchParams.get("format") === "json";

        if (wantsJson) {
          return NextResponse.json(
            { downloadUrl: demoDownloadUrl, fileName: "aura_brand_system_master.png" },
            { status: 200 }
          );
        }
        return NextResponse.redirect(demoDownloadUrl, 307);
      }

      return NextResponse.json(
        { error: "Deliverable not found." },
        { status: 404 }
      );
    }

    // 1. Escrow Lock Check
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

    // 2. Approved-Version Binding
    // Clean file release is restricted to the legally signed version recorded in ApprovalRecord
    const approvedVersionNumber = deliverable.approvalRecord?.approvedVersion;

    if (approvedVersionNumber === undefined || approvedVersionNumber === null) {
      return NextResponse.json(
        { error: "Security violation: No formal approval record found to authorize master release." },
        { status: 403 }
      );
    }

    if (requestedVersion) {
      const parsedVersion = parseInt(requestedVersion, 10);
      if (parsedVersion !== approvedVersionNumber) {
        return NextResponse.json(
          {
            error: `Access denied: Only legally approved version (${approvedVersionNumber}) can be downloaded. Requested version (${parsedVersion}) was not signed off.`,
          },
          { status: 403 }
        );
      }
    }

    const targetVersion = deliverable.versions.find(
      (v) => v.versionNumber === approvedVersionNumber
    );

    if (!targetVersion || !targetVersion.cleanFileKey) {
      return NextResponse.json(
        { error: "The approved clean master asset was not found in storage records." },
        { status: 404 }
      );
    }

    // 3. Telemetry Audit Logging (Aligned with Prisma schema fields)
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

    // 4. Local Development Fallback
    if (
      !isR2Configured() ||
      (process.env.NODE_ENV === "development" && process.env.USE_LOCAL_STORAGE === "true")
    ) {
      return NextResponse.json({
        downloadUrl: `/api/upload/local?key=${encodeURIComponent(targetVersion.cleanFileKey)}`,
        fileName: targetVersion.fileName,
      });
    }

    // 5. Generate Signed Download URL (Attachment disposition, 120s TTL)
    const downloadUrl = await generatePresignedDownloadUrl({
      key: targetVersion.cleanFileKey,
      downloadFileName: targetVersion.fileName,
      expiresIn: 120,
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
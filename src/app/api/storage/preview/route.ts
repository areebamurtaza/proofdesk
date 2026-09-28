import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getOrCreateCurrentAgency } from "@/lib/agency";
import { isR2Configured, generatePresignedPreviewUrl } from "@/lib/r2";

export const dynamic = "force-dynamic";

const PreviewQuerySchema = z.object({
  key: z.string().min(1, "Storage key is required"),
  reviewToken: z.string().uuid("Invalid review token format").optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");
    const reviewToken = searchParams.get("token") || req.headers.get("x-review-token");

    const validation = PreviewQuerySchema.safeParse({
      key,
      reviewToken: reviewToken ?? undefined,
    });

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { key: previewKey, reviewToken: clientToken } = validation.data;

    let isAuthorized = false;

    // Authorization Path A: Zero-Auth Client with Review Token
    if (clientToken) {
      const deliverable = await prisma.deliverable.findUnique({
        where: { reviewToken: clientToken },
        select: {
          id: true,
          versions: {
            where: {
              OR: [
                { previewKey },
                { cleanFileKey: previewKey },
              ],
            },
            select: { id: true },
          },
        },
      });

      if (deliverable && deliverable.versions.length > 0) {
        isAuthorized = true;
      }
    }

    // Authorization Path B: Authenticated Agency Operator
    if (!isAuthorized) {
      try {
        const agency = await getOrCreateCurrentAgency();
        if (agency) {
          const versionOwnership = await prisma.version.findFirst({
            where: {
              OR: [
                { previewKey },
                { cleanFileKey: previewKey },
              ],
              deliverable: {
                project: {
                  agencyId: agency.id,
                },
              },
            },
            select: { id: true },
          });

          if (versionOwnership) {
            isAuthorized = true;
          }
        }
      } catch {
        // No active agency session present
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Access denied. Preview asset is unauthorized or does not exist." },
        { status: 403 }
      );
    }

    // Local Testing Mock Bypass
    if (
      !isR2Configured() ||
      (process.env.NODE_ENV === "development" && process.env.USE_LOCAL_STORAGE === "true")
    ) {
      return NextResponse.json(
        {
          url: `/api/upload/local?key=${encodeURIComponent(previewKey)}`,
          expiresIn: 60,
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "private, no-cache, no-store, must-revalidate",
          },
        }
      );
    }

    // Issue 60-Second Short-Lived Pre-Signed GET URL
    const signedUrl = await generatePresignedPreviewUrl({
      key: previewKey,
      expiresIn: 60,
    });

    return NextResponse.json(
      {
        url: signedUrl,
        expiresIn: 60,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (error: unknown) {
    console.error("[STORAGE_PREVIEW_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error occurred while retrieving asset preview." },
      { status: 500 }
    );
  }
}
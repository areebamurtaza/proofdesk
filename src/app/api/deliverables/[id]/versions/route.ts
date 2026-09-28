// filepath: src/app/api/deliverables/[id]/versions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getVerifiedDeliverableAgency } from "@/lib/agency";
import { sendReviewInviteEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    id: string;
  };
}

const createVersionSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  fileSize: z.number().int().positive("File size must be positive"),
  mimeType: z.string().min(1, "MIME type is required"),
  cleanFileKey: z.string().min(1, "Storage clean master key is required"),
  previewKey: z.string().min(1, "Storage preview key is required"),
  changeLog: z.string().trim().max(1000).optional().nullable(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Deliverable ID is required" },
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
        { error: "Deliverable record not found or access unauthorized." },
        { status: 404 }
      );
    }

    const { agency } = verified;

    // 2. Validate request payload
    const rawBody = await request.json();
    const validation = createVersionSchema.safeParse(rawBody);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      fileName,
      fileSize,
      mimeType,
      cleanFileKey,
      previewKey,
      changeLog,
      width,
      height,
    } = validation.data;

    // 3. Multi-tenant verified lookup
    const deliverable = await prisma.deliverable.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { versionNumber: "desc" },
          take: 1,
        },
        project: true,
        invoice: true,
      },
    });

    if (!deliverable) {
      return NextResponse.json(
        { error: "Deliverable record not found or access unauthorized." },
        { status: 404 }
      );
    }

    // 4. Immutability Gate: Escrow-settled deliverables cannot receive new versions
    if (deliverable.isUnlocked) {
      return NextResponse.json(
        { error: "Forbidden: Deliverable has already cleared escrow payment and is locked." },
        { status: 403 }
      );
    }

    const currentHighestVersion = deliverable.versions[0]?.versionNumber || 1;
    const nextVersionNumber = currentHighestVersion + 1;

    // 5. Atomic transaction with extended timeout for Neon cold-start resilience
    const newVersion = await prisma.$transaction(
      async (tx) => {
        const versionRecord = await tx.version.create({
          data: {
            deliverableId: deliverable.id,
            versionNumber: nextVersionNumber,
            fileName,
            fileSize,
            mimeType,
            cleanFileKey,
            previewKey,
            changeLog: changeLog || null,
            width: width || null,
            height: height || null,
          },
        });

        await tx.deliverable.update({
          where: { id: deliverable.id },
          data: {
            status: "IN_REVIEW",
          },
        });

        return versionRecord;
      },
      {
        maxWait: 5000,
        timeout: 15000,
      }
    );

    // 6. Asynchronously notify client via Resend
    sendReviewInviteEmail({
      clientEmail: deliverable.project.clientEmail,
      clientName: deliverable.project.clientName,
      agencyName: agency.name,
      projectName: deliverable.project.name,
      deliverableTitle: deliverable.title,
      versionNumber: nextVersionNumber,
      reviewToken: deliverable.reviewToken,
      escrowAmountCents: deliverable.invoice?.amount || 0,
      currency: deliverable.invoice?.currency.toUpperCase() || "USD",
    }).catch((err) => console.error("[New Version Email Dispatch Error]:", err));

    return NextResponse.json(
      {
        success: true,
        version: {
          id: newVersion.id,
          versionNumber: newVersion.versionNumber,
          fileName: newVersion.fileName,
          fileSize: newVersion.fileSize,
          changeLog: newVersion.changeLog,
          createdAt: newVersion.createdAt.toISOString(),
        },
        deliverableStatus: "IN_REVIEW",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("[Create Version Route Error]:", error);
    const message =
      error instanceof Error ? error.message : "Failed to persist version to database";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
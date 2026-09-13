// filepath: src/app/api/upload/presign/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { getOrCreateCurrentAgency } from "@/lib/agency";
import {
  isR2Configured,
  generatePresignedUploadUrl,
  buildStorageKey,
} from "@/lib/r2";

export const dynamic = "force-dynamic";

const PresignUploadSchema = z.object({
  fileName: z.string().min(1, "File name cannot be empty").max(255),
  fileType: z.enum(["PDF", "PNG", "JPG", "SVG"]),
  mimeType: z.string().regex(/^(image\/(png|jpeg|svg\+xml)|application\/pdf)$/, {
    message: "Unsupported MIME type. Allowed: PDF, PNG, JPG, SVG.",
  }),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(100 * 1024 * 1024, "File size exceeds the 100MB upload threshold"),
  projectId: z.string().optional().nullable(),
  deliverableId: z.string().uuid("Invalid deliverable UUID").optional().nullable(),
  versionNumber: z.coerce.number().int().positive().default(1),
  category: z.enum(["clean", "preview"]).default("clean"),
});

export async function POST(req: NextRequest) {
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

    const rawBody = await req.json();
    const validation = PresignUploadSchema.safeParse(rawBody);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const {
      fileName,
      mimeType,
      fileSize,
      projectId,
      deliverableId,
      versionNumber,
      category,
    } = validation.data;

    let resolvedProjectId: string | null = null;
    let targetDeliverableId: string;

    // SCENARIO A: Uploading a revision to an EXISTING deliverable (v2+)
    if (deliverableId) {
      const existingDeliverable = await prisma.deliverable.findFirst({
        where: {
          id: deliverableId,
          project: {
            agencyId: agency.id,
          },
        },
        select: {
          id: true,
          projectId: true,
          isUnlocked: true,
        },
      });

      if (!existingDeliverable) {
        return NextResponse.json(
          { error: "Target deliverable not found or unauthorized access." },
          { status: 404 }
        );
      }

      if (existingDeliverable.isUnlocked) {
        return NextResponse.json(
          { error: "Forbidden: This deliverable has settled escrow and is immutable." },
          { status: 403 }
        );
      }

      resolvedProjectId = existingDeliverable.projectId;
      targetDeliverableId = existingDeliverable.id;
    } 
    // SCENARIO B: Uploading the initial asset for a NEW deliverable (v1)
    else {
      targetDeliverableId = crypto.randomUUID();

      if (projectId) {
        const existingProject = await prisma.project.findFirst({
          where: {
            id: projectId,
            agencyId: agency.id,
          },
          select: { id: true },
        });

        if (existingProject) {
          resolvedProjectId = existingProject.id;
        }
      }

      if (!resolvedProjectId) {
        let defaultProject = await prisma.project.findFirst({
          where: {
            agencyId: agency.id,
            name: { equals: "General Deliverables", mode: "insensitive" },
          },
          select: { id: true },
        });

        if (!defaultProject) {
          defaultProject = await prisma.project.create({
            data: {
              agencyId: agency.id,
              name: "General Deliverables",
              clientName: "Valued Client",
              clientEmail: "client@example.com",
            },
            select: { id: true },
          });
        }

        resolvedProjectId = defaultProject.id;
      }
    }

    // Local Development Fallback Handler
    if (
      !isR2Configured() ||
      (process.env.NODE_ENV === "development" && process.env.USE_LOCAL_STORAGE === "true")
    ) {
      const localKey = `local-${crypto.randomUUID()}-${fileName}`;
      return NextResponse.json(
        {
          isLocal: true,
          uploadUrl: "/api/upload/local",
          cleanFileKey: localKey,
          previewKey: localKey,
          key: localKey,
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data",
          },
          expiresIn: 300,
        },
        { status: 200 }
      );
    }

    // Build the deterministic, isolated R2 storage key
    const storageKey = buildStorageKey({
      agencyId: agency.id,
      projectId: resolvedProjectId,
      deliverableId: targetDeliverableId,
      versionNumber,
      fileName,
      type: category,
    });

    const { uploadUrl } = await generatePresignedUploadUrl({
      key: storageKey,
      contentType: mimeType,
      contentLength: fileSize,
      expiresIn: 300,
    });

    return NextResponse.json(
      {
        isLocal: false,
        uploadUrl,
        cleanFileKey: storageKey,
        previewKey: storageKey,
        key: storageKey,
        method: "PUT",
        headers: {
          "Content-Type": mimeType,
        },
        expiresIn: 300,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[UPLOAD_PRESIGN_ERROR]", error);
    const message =
      error instanceof Error ? error.message : "Internal server error occurred while preparing storage ticket.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
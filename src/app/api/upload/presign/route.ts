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
  fileType: z.enum(["PDF", "PNG", "JPG", "SVG", "FIGMA", "ILLUSTRATOR", "CANVA", "ZIP"]),
  mimeType: z.string().min(1, "MIME type is required"),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(100 * 1024 * 1024, "File size exceeds the 100MB upload threshold"),
  previewMimeType: z.string().default("image/jpeg"),
  previewFileSize: z.number().int().positive().optional(),
  projectId: z.string().uuid("Invalid projectId UUID format").optional().nullable(),
  deliverableId: z.string().uuid("Invalid deliverable UUID").optional().nullable(),
  versionNumber: z.coerce.number().int().positive().default(1),
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
      previewMimeType,
      previewFileSize,
      projectId,
      deliverableId,
      versionNumber,
    } = validation.data;

    let resolvedProjectId: string | null = null;
    let targetDeliverableId: string;

    // SCENARIO A: Ingesting revision into an EXISTING deliverable (v2+)
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
    // SCENARIO B: Initial ingestion for a NEW deliverable (v1)
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
      const localCleanKey = `clean-${crypto.randomUUID()}-${fileName}`;
      const localPreviewKey = `preview-${crypto.randomUUID()}-preview.jpg`;

      return NextResponse.json(
        {
          isLocal: true,
          clean: {
            uploadUrl: `/api/upload/local?key=${encodeURIComponent(localCleanKey)}`,
            key: localCleanKey,
          },
          preview: {
            uploadUrl: `/api/upload/local?key=${encodeURIComponent(localPreviewKey)}`,
            key: localPreviewKey,
          },
          // Compatibility shortcuts
          cleanFileKey: localCleanKey,
          previewKey: localPreviewKey,
          uploadUrl: `/api/upload/local?key=${encodeURIComponent(localCleanKey)}`,
          method: "PUT",
          expiresIn: 300,
        },
        { status: 200 }
      );
    }

    // Generate isolated R2 storage keys for clean and preview versions
    const cleanStorageKey = buildStorageKey({
      agencyId: agency.id,
      projectId: resolvedProjectId,
      deliverableId: targetDeliverableId,
      versionNumber,
      fileName,
      type: "clean",
    });

    const previewFileName = `${fileName.replace(/\.[^/.]+$/, "")}-preview.jpg`;
    const previewStorageKey = buildStorageKey({
      agencyId: agency.id,
      projectId: resolvedProjectId,
      deliverableId: targetDeliverableId,
      versionNumber,
      fileName: previewFileName,
      type: "preview",
    });

    // Generate independent pre-signed upload URLs (300s TTL)
    const { uploadUrl: cleanUploadUrl } = await generatePresignedUploadUrl({
      key: cleanStorageKey,
      contentType: mimeType,
      contentLength: fileSize,
      expiresIn: 300,
    });

    const { uploadUrl: previewUploadUrl } = await generatePresignedUploadUrl({
      key: previewStorageKey,
      contentType: previewMimeType,
      contentLength: previewFileSize,
      expiresIn: 300,
    });

    return NextResponse.json(
      {
        isLocal: false,
        clean: {
          uploadUrl: cleanUploadUrl,
          key: cleanStorageKey,
          mimeType,
        },
        preview: {
          uploadUrl: previewUploadUrl,
          key: previewStorageKey,
          mimeType: previewMimeType,
        },
        // Direct flat mappings
        cleanFileKey: cleanStorageKey,
        previewKey: previewStorageKey,
        uploadUrl: cleanUploadUrl,
        method: "PUT",
        expiresIn: 300,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[UPLOAD_PRESIGN_ERROR]", error);
    const message =
      error instanceof Error ? error.message : "Internal server error preparing storage ticket.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
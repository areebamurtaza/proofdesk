import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { getOrCreateCurrentAgency } from "@/lib/agency";
import { sendReviewInviteEmail } from "@/lib/email";
import { getAppOrigin } from "@/lib/origin";

export const dynamic = "force-dynamic";

const createDeliverableSchema = z
  .object({
    title: z.string().trim().min(2, "Title must be at least 2 characters").max(120),
    description: z.string().trim().max(500).optional().nullable(),
    fileType: z.enum(["PDF", "PNG", "JPG", "SVG", "FIGMA", "ILLUSTRATOR", "CANVA", "ZIP"]),
    fileName: z.string().min(1, "File name is required"),
    fileSize: z.number().int().positive("File size must be positive"),
    mimeType: z.string().min(1, "MIME type is required"),
    cleanFileKey: z.string().min(1, "Storage clean master key is required"),
    previewKey: z.string().min(1, "Storage preview key is required"),
    priceDollars: z.coerce.number().positive().optional(),
    amountCents: z.coerce.number().int().positive().optional(),
    currency: z.string().length(3).default("USD"),
    projectName: z.string().trim().optional(),
    clientName: z.string().trim().optional(),
    clientEmail: z.string().trim().email().optional(),
    projectId: z.string().optional(),
  })
  .refine((data) => data.priceDollars !== undefined || data.amountCents !== undefined, {
    message: "Either priceDollars or amountCents must be provided.",
  });

export async function GET(request: NextRequest) {
  try {
    const requestedOrgId =
      request.nextUrl.searchParams.get("orgId") ||
      request.headers.get("x-clerk-org-id");
    const agency = await getOrCreateCurrentAgency(requestedOrgId);

    const deliverables = await prisma.deliverable.findMany({
      where: {
        project: {
          agencyId: agency.id,
        },
      },
      orderBy: { createdAt: "desc" },
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
          orderBy: { versionNumber: "desc" },
          take: 1,
        },
        invoice: {
          select: {
            id: true,
            amount: true,
            currency: true,
            status: true,
            paidAt: true,
          },
        },
        approvalRecord: {
          select: {
            signerName: true,
            signerEmail: true,
            approvedAt: true,
          },
        },
      },
    });

    const metrics = deliverables.reduce(
      (acc, item) => {
        acc.totalDeliverables += 1;

        if (item.status === "COMPLETED" || item.isUnlocked) {
          acc.clearedRevenueCents += item.invoice?.amount || 0;
          acc.completedCount += 1;
        } else {
          acc.escrowPendingCents += item.invoice?.amount || 0;
          acc.activeReviewCount += 1;
        }

        return acc;
      },
      {
        totalDeliverables: 0,
        activeReviewCount: 0,
        completedCount: 0,
        escrowPendingCents: 0,
        clearedRevenueCents: 0,
      }
    );

    return NextResponse.json(
      {
        success: true,
        agencyName: agency.name,
        isOrgWorkspace: agency.clerkOrgId.startsWith("org_"),
        metrics,
        deliverables: deliverables.map((d) => ({
          id: d.id,
          title: d.title,
          description: d.description,
          fileType: d.fileType,
          status: d.status,
          isUnlocked: d.isUnlocked,
          reviewToken: d.reviewToken,
          createdAt: d.createdAt.toISOString(),
          projectName: d.project.name,
          clientName: d.project.clientName,
          clientEmail: d.project.clientEmail,
          latestVersion: d.versions[0]
            ? {
                versionNumber: d.versions[0].versionNumber,
                fileName: d.versions[0].fileName,
                fileSize: d.versions[0].fileSize,
              }
            : null,
          invoice: d.invoice
            ? {
                amount: d.invoice.amount,
                currency: d.invoice.currency,
                status: d.invoice.status,
                paidAt: d.invoice.paidAt?.toISOString() || null,
              }
            : null,
          signerName: d.approvalRecord?.signerName || null,
        })),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error: unknown) {
    console.error("[Fetch Deliverables Error]:", error);
    const message =
      error instanceof Error ? error.message : "Failed to query deliverables from database.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestedOrgId =
      request.nextUrl.searchParams.get("orgId") ||
      request.headers.get("x-clerk-org-id");
    const agency = await getOrCreateCurrentAgency(requestedOrgId);
    const rawBody = await request.json();
    const validation = createDeliverableSchema.safeParse(rawBody);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      fileType,
      fileName,
      fileSize,
      mimeType,
      cleanFileKey,
      previewKey,
      priceDollars,
      amountCents,
      currency,
      projectName,
      clientName,
      clientEmail,
      projectId,
    } = validation.data;

    const normalizedAmountCents =
      amountCents ?? Math.round((priceDollars || 0) * 100);

    const reviewToken = crypto.randomUUID();

    // Self-healing project resolution inside an extended-timeout atomic transaction
    const deliverable = await prisma.$transaction(
      async (tx) => {
        let resolvedProjectId: string | null = null;

        // 1. If a valid UUID was passed, verify it belongs to this agency
        if (projectId) {
          const existingProject = await tx.project.findFirst({
            where: {
              id: projectId,
              agencyId: agency.id,
            },
          });
          if (existingProject) {
            resolvedProjectId = existingProject.id;
          }
        }

        // 2. If projectId is missing or invalid, resolve by name or create default
        if (!resolvedProjectId) {
          const targetName = projectName?.trim() || "General Deliverables";

          let project = await tx.project.findFirst({
            where: {
              agencyId: agency.id,
              name: { equals: targetName, mode: "insensitive" },
            },
          });

          if (!project) {
            project = await tx.project.create({
              data: {
                agencyId: agency.id,
                name: targetName,
                clientName: clientName?.trim() || "Valued Client",
                clientEmail: clientEmail?.trim() || "client@example.com",
              },
            });
          }
          resolvedProjectId = project.id;
        }

        // 3. Create Deliverable, Version 1, and Invoice with verified foreign key
        return tx.deliverable.create({
          data: {
            projectId: resolvedProjectId,
            title,
            description: description || null,
            fileType,
            status: "IN_REVIEW",
            isUnlocked: false,
            reviewToken,
            versions: {
              create: {
                versionNumber: 1,
                fileName,
                fileSize,
                mimeType,
                cleanFileKey,
                previewKey,
              },
            },
            invoice: {
              create: {
                projectId: resolvedProjectId,
                amount: normalizedAmountCents,
                currency: currency.toLowerCase(),
                status: "DRAFT",
              },
            },
          },
          include: {
            versions: true,
            invoice: true,
            project: true,
          },
        });
      },
      {
        maxWait: 10000, // Allow up to 10s to acquire a connection from the pool
        timeout: 25000, // Allow up to 25s for the transaction to complete during cold starts
      }
    );

    const origin = getAppOrigin(request);
    const reviewUrl = `${origin}/review/${deliverable.reviewToken}`;

    // Asynchronously dispatch transactional notification via Resend
    sendReviewInviteEmail({
      clientEmail: deliverable.project.clientEmail,
      clientName: deliverable.project.clientName,
      agencyName: agency.name,
      projectName: deliverable.project.name,
      deliverableTitle: deliverable.title,
      versionNumber: 1,
      reviewToken: deliverable.reviewToken,
      escrowAmountCents: normalizedAmountCents,
      currency: currency.toUpperCase(),
      appOrigin: origin,
    }).catch((err) => console.error("[Background Email Dispatch Error]:", err));

    return NextResponse.json(
      {
        success: true,
        deliverableId: deliverable.id,
        reviewToken: deliverable.reviewToken,
        reviewUrl,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("[Create Deliverable Error]:", error);
    const message =
      error instanceof Error ? error.message : "Failed to persist deliverable record to database";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
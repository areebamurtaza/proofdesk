// filepath: src/app/api/review/[token]/approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    token: string;
  };
}

const approveDeliverableSchema = z.object({
  approvedVersion: z.number().int().positive("Invalid version number"),
  signerName: z.string().trim().min(2, "Full legal name is required").max(100),
  signerEmail: z.string().trim().email("Valid email address is required"),
  legalConsent: z.string().min(10, "Legal consent text is required"),
});

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.json({ error: "Review token is required" }, { status: 400 });
    }

    const rawBody = await request.json();
    const validation = approveDeliverableSchema.safeParse(rawBody);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { approvedVersion, signerName, signerEmail, legalConsent } = validation.data;

    // 1. Locate Deliverable with target version and invoice status
    const deliverable = await prisma.deliverable.findUnique({
      where: { reviewToken: token },
      include: {
        versions: {
          where: { versionNumber: approvedVersion },
          select: { id: true, versionNumber: true },
        },
        invoice: {
          select: { id: true, amount: true, currency: true, status: true },
        },
        approvalRecord: true,
      },
    });

    if (!deliverable) {
      return NextResponse.json({ error: "Deliverable not found or review token expired" }, { status: 404 });
    }

    // 2. Strict Escrow Guard: Paid/unlocked deliverables cannot be re-approved
    if (deliverable.isUnlocked) {
      return NextResponse.json(
        { error: "Forbidden: This deliverable has already cleared escrow settlement." },
        { status: 403 }
      );
    }

    // 3. Verify version exists
    if (deliverable.versions.length === 0) {
      return NextResponse.json(
        { error: `Version ${approvedVersion} does not exist for this deliverable.` },
        { status: 400 }
      );
    }

    // 4. Capture Client Network & Machine Telemetry
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
    const userAgent = (request.headers.get("user-agent") || "Unknown Client Environment").slice(0, 500);

    // 5. Generate Cryptographic Audit Signature Hash (SHA-256)
    const timestamp = new Date();
    const hashPayload = `${deliverable.id}:${approvedVersion}:${signerEmail.toLowerCase()}:${timestamp.toISOString()}:${ipAddress}:${legalConsent}`;
    const signatureHash = crypto.createHash("sha256").update(hashPayload).digest("hex");

    // 6. Atomic Transaction: Upsert ApprovalRecord + Update Status + Write ReviewAccessLog
    const result = await prisma.$transaction(
      async (tx) => {
        // Upsert allows legal sign-off re-attempts prior to payment clearing
        const record = await tx.approvalRecord.upsert({
          where: { deliverableId: deliverable.id },
          create: {
            deliverableId: deliverable.id,
            approvedVersion,
            signerName,
            signerEmail: signerEmail.toLowerCase(),
            ipAddress,
            userAgent,
            legalConsent,
            signatureHash,
            approvedAt: timestamp,
          },
          update: {
            approvedVersion,
            signerName,
            signerEmail: signerEmail.toLowerCase(),
            ipAddress,
            userAgent,
            legalConsent,
            signatureHash,
            approvedAt: timestamp,
          },
        });

        const updatedDeliverable = await tx.deliverable.update({
          where: { id: deliverable.id },
          data: {
            status: "APPROVED",
          },
          select: {
            id: true,
            status: true,
            isUnlocked: true,
          },
        });

        // Telemetry Audit Write
        await tx.reviewAccessLog.create({
          data: {
            deliverableId: deliverable.id,
            action: "APPROVE_DELIVERABLE",
            ipAddress,
            userAgent,
            accessedAt: timestamp,
          },
        });

        return { record, deliverable: updatedDeliverable };
      },
      { maxWait: 5000, timeout: 10000 }
    );

    return NextResponse.json(
      {
        success: true,
        approvalRecord: {
          id: result.record.id,
          approvedVersion: result.record.approvedVersion,
          signerName: result.record.signerName,
          signerEmail: result.record.signerEmail,
          signatureHash: result.record.signatureHash,
          approvedAt: result.record.approvedAt.toISOString(),
        },
        deliverableStatus: result.deliverable.status,
        invoice: deliverable.invoice
          ? {
              id: deliverable.invoice.id,
              amount: deliverable.invoice.amount,
              currency: deliverable.invoice.currency,
              status: deliverable.invoice.status,
            }
          : null,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[Approval Audit Service Error]:", error);
    const message = error instanceof Error ? error.message : "Failed to record formal legal approval";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
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
  legalConsent: z.string().min(10, "Legal consent declaration is required"),
});

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.json(
        { error: "Review token is required." },
        { status: 400 }
      );
    }

    const rawBody = await request.json();
    const validation = approveDeliverableSchema.safeParse(rawBody);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const { approvedVersion, signerName, signerEmail, legalConsent } = validation.data;

    // Capture Client Network & Machine Telemetry
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
    const userAgent = (
      request.headers.get("user-agent") || "Unknown Client Environment"
    ).slice(0, 500);

    const timestamp = new Date();

    if (token === "demo-token") {
      const signatureHash = crypto
        .createHash("sha256")
        .update(`demo:${approvedVersion}:${signerEmail.toLowerCase()}:${timestamp.toISOString()}`)
        .digest("hex");

      return NextResponse.json(
        {
          success: true,
          approvalRecord: {
            id: "demo-approval-record",
            approvedVersion,
            signerName,
            signerEmail,
            signatureHash,
            approvedAt: timestamp.toISOString(),
          },
          deliverableStatus: "APPROVED",
          invoice: {
            id: "demo-inv",
            amount: 150000,
            currency: "usd",
            status: "DRAFT",
          },
        },
        { status: 200 }
      );
    }

    // Atomic Transaction: Lock deliverable state, generate signature hash, persist approval
    const result = await prisma.$transaction(
      async (tx) => {
        // 1. Fetch current record inside the transactional lock
        const deliverable = await tx.deliverable.findUnique({
          where: { reviewToken: token },
          include: {
            versions: {
              where: { versionNumber: approvedVersion },
              select: { id: true, versionNumber: true },
            },
            invoice: {
              select: { id: true, amount: true, currency: true, status: true },
            },
          },
        });

        if (!deliverable) {
          throw new Error("NOT_FOUND: Deliverable not found or review token invalid.");
        }

        // 2. Concurrency check: Reject if an escrow payment has already finalized
        if (deliverable.isUnlocked) {
          throw new Error("ESCROW_LOCKED: Deliverable has already cleared escrow settlement.");
        }

        // 3. Verify the target version exists on this deliverable
        if (deliverable.versions.length === 0) {
          throw new Error(
            `VERSION_NOT_FOUND: Version ${approvedVersion} does not exist for this deliverable.`
          );
        }

        // 4. Generate SHA-256 Cryptographic Audit Signature Hash
        const hashPayload = `${deliverable.id}:${approvedVersion}:${signerEmail.toLowerCase()}:${timestamp.toISOString()}:${ipAddress}:${legalConsent}`;
        const signatureHash = crypto
          .createHash("sha256")
          .update(hashPayload)
          .digest("hex");

        // 5. Upsert Legal Approval Record
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

        // 6. Transition Deliverable Status to APPROVED
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

        // 7. Persist Telemetry Audit Log
        await tx.reviewAccessLog.create({
          data: {
            deliverableId: deliverable.id,
            action: "APPROVE_DELIVERABLE",
            ipAddress,
            userAgent,
            accessedAt: timestamp,
          },
        });

        return { record, deliverable: updatedDeliverable, invoice: deliverable.invoice };
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
        invoice: result.invoice,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[Approval Audit Service Error]:", error);

    if (error instanceof Error) {
      if (error.message.startsWith("NOT_FOUND")) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message.startsWith("ESCROW_LOCKED")) {
        return NextResponse.json(
          { error: "Forbidden: This deliverable has already cleared escrow." },
          { status: 403 }
        );
      }
      if (error.message.startsWith("VERSION_NOT_FOUND")) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    const message =
      error instanceof Error ? error.message : "Failed to record legal approval.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
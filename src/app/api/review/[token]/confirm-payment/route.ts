import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { sendPaymentReceiptAndAssetReleaseEmail } from "@/lib/email";
import { MOCK_DELIVERABLE } from "@/types/review";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    token: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = params;
    const body = await request.json();
    const { sessionId } = body;

    if (!token || !sessionId) {
      return NextResponse.json(
        { error: "Review token and Stripe sessionId are required." },
        { status: 400 }
      );
    }

    if (token === "demo-token") {
      return NextResponse.json({
        success: true,
        unlocked: true,
        deliverable: {
          ...MOCK_DELIVERABLE,
          isUnlocked: true,
          status: "COMPLETED",
        },
      });
    }

    // 1. Retrieve session directly from Stripe API to verify clearance
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment has not been completed or cleared." },
        { status: 402 }
      );
    }

    const deliverableId = session.metadata?.deliverableId;
    const invoiceId = session.metadata?.invoiceId;

    if (!deliverableId || !invoiceId) {
      return NextResponse.json(
        { error: "Session metadata is missing deliverable linkage." },
        { status: 400 }
      );
    }

    // 2. Atomic Database Update with Neon-tolerant wait/timeout configuration
    const result = await prisma.$transaction(
      async (tx) => {
        const deliverable = await tx.deliverable.findUnique({
          where: { id: deliverableId },
          include: {
            project: {
              include: { agency: true },
            },
            approvalRecord: true,
            invoice: true,
          },
        });

        if (!deliverable || deliverable.reviewToken !== token) {
          throw new Error("Deliverable review token mismatch.");
        }

        // If already unlocked by the Stripe webhook, skip redundant writes
        if (deliverable.isUnlocked && deliverable.invoice?.status === "PAID") {
          return {
            deliverable,
            alreadyProcessed: true,
            meta: null,
          };
        }

        const paymentIntentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : null;

        // Mark invoice PAID
        await tx.invoice.update({
          where: { id: invoiceId },
          data: {
            status: "PAID",
            paidAt: new Date(),
            stripePaymentIntentId: paymentIntentId,
          },
        });

        // Unlock deliverable and update status
        const updatedDeliverable = await tx.deliverable.update({
          where: { id: deliverableId },
          data: {
            isUnlocked: true,
            status: "COMPLETED",
          },
        });

        return {
          deliverable: updatedDeliverable,
          alreadyProcessed: false,
          meta: {
            clientEmail:
              deliverable.approvalRecord?.signerEmail ||
              deliverable.project.clientEmail,
            signerName:
              deliverable.approvalRecord?.signerName ||
              deliverable.project.clientName,
            agencyName: deliverable.project.agency.name,
            projectName: deliverable.project.name,
            deliverableTitle: deliverable.title,
            reviewToken: deliverable.reviewToken,
            escrowAmountCents: deliverable.invoice?.amount || 0,
            currency: deliverable.invoice?.currency || "USD",
            signatureHash:
              deliverable.approvalRecord?.signatureHash ||
              "CRYPTOGRAPHIC_HASH_UNAVAILABLE",
          },
        };
      },
      {
        maxWait: 15000, // 15s to acquire a connection from Neon's serverless pooler
        timeout: 30000, // 30s execution window for transaction completion
      }
    );

    // 3. Dispatch Settlement Receipt asynchronously only on primary execution
    if (!result.alreadyProcessed && result.meta) {
      sendPaymentReceiptAndAssetReleaseEmail(result.meta).catch((err) =>
        console.error("[Confirm Payment Background Email Error]:", err)
      );
    }

    return NextResponse.json({
      success: true,
      unlocked: true,
      deliverable: result.deliverable,
    });
  } catch (error: unknown) {
    console.error("[Confirm Payment Error]:", error);
    const message =
      error instanceof Error ? error.message : "Failed to verify Stripe payment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
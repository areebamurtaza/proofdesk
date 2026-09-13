import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { sendPaymentReceiptAndAssetReleaseEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header." },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("CRITICAL CONFIG ERROR: STRIPE_WEBHOOK_SECRET is not set.");
    return NextResponse.json(
      { error: "Webhook secret unconfigured." },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown signature verification failure";
    console.error(`[Stripe Webhook Verification Failed]: ${message}`);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  // Handle successful escrow settlement
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const deliverableId = session.metadata?.deliverableId;
    const invoiceId = session.metadata?.invoiceId;

    if (!deliverableId || !invoiceId) {
      console.error(
        "[Stripe Webhook Error]: Missing release metadata in session.",
        session.metadata
      );
      return NextResponse.json(
        { error: "Session missing asset release metadata." },
        { status: 400 }
      );
    }

    try {
      // Atomic Idempotent Transaction
      const result = await prisma.$transaction(async (tx) => {
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

        if (!deliverable) {
          throw new Error(`Deliverable ${deliverableId} not found in database.`);
        }

        // Idempotency: skip if already unlocked by confirm-payment route
        if (deliverable.isUnlocked && deliverable.invoice?.status === "PAID") {
          return { alreadyProcessed: true, meta: null };
        }

        const paymentIntentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : null;

        // 1. Mark Invoice as PAID
        await tx.invoice.update({
          where: { id: invoiceId },
          data: {
            status: "PAID",
            paidAt: new Date(),
            stripePaymentIntentId: paymentIntentId,
          },
        });

        // 2. Unlock Deliverable & mark COMPLETED
        await tx.deliverable.update({
          where: { id: deliverableId },
          data: {
            isUnlocked: true,
            status: "COMPLETED",
          },
        });

        return {
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
      });

      // Dispatch Settlement & Release Email if not previously processed
      if (!result.alreadyProcessed && result.meta) {
        sendPaymentReceiptAndAssetReleaseEmail(result.meta).catch((err) =>
          console.error("[Webhook Background Email Dispatch Error]:", err)
        );
      }

      return NextResponse.json(
        { received: true, unlocked: true },
        { status: 200 }
      );
    } catch (dbError: unknown) {
      console.error("[Webhook Database Transaction Failed]:", dbError);
      return NextResponse.json(
        { error: "Failed to persist escrow settlement to database." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
// filepath: src/app/api/webhooks/stripe/route.ts
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

  // Support both hosted checkout sessions and Stripe direct invoice payments
  if (
    event.type === "checkout.session.completed" ||
    event.type === "invoice.payment_succeeded"
  ) {
    let deliverableId: string | undefined;
    let invoiceId: string | undefined;
    let paymentIntentId: string | null = null;
    let checkoutSessionId: string | null = null;

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      deliverableId = session.metadata?.deliverableId;
      invoiceId = session.metadata?.invoiceId;
      checkoutSessionId = session.id;

      if (typeof session.payment_intent === "string") {
        paymentIntentId = session.payment_intent;
      } else if (session.payment_intent && typeof session.payment_intent === "object") {
        paymentIntentId = session.payment_intent.id;
      }
    } else {
      const stripeInvoice = event.data.object as Stripe.Invoice;
      deliverableId = stripeInvoice.metadata?.deliverableId;
      invoiceId = stripeInvoice.metadata?.invoiceId;

      if (typeof stripeInvoice.payment_intent === "string") {
        paymentIntentId = stripeInvoice.payment_intent;
      } else if (stripeInvoice.payment_intent && typeof stripeInvoice.payment_intent === "object") {
        paymentIntentId = stripeInvoice.payment_intent.id;
      }
    }

    // Fallback: Locate records by Stripe Checkout Session ID if metadata is absent
    let targetInvoiceWhere: { id?: string; stripeCheckoutSessionId?: string } = {};

    if (invoiceId) {
      targetInvoiceWhere = { id: invoiceId };
    } else if (checkoutSessionId) {
      targetInvoiceWhere = { stripeCheckoutSessionId: checkoutSessionId };
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        // 1. Locate the targeted deliverable
        let deliverable = null;

        if (deliverableId) {
          deliverable = await tx.deliverable.findUnique({
            where: { id: deliverableId },
            include: {
              project: {
                include: { agency: true },
              },
              approvalRecord: true,
              invoice: true,
            },
          });
        } else if (targetInvoiceWhere.id || targetInvoiceWhere.stripeCheckoutSessionId) {
          const inv = await tx.invoice.findFirst({
            where: targetInvoiceWhere,
            include: {
              deliverable: {
                include: {
                  project: {
                    include: { agency: true },
                  },
                  approvalRecord: true,
                  invoice: true,
                },
              },
            },
          });
          deliverable = inv?.deliverable || null;
        }

        if (!deliverable) {
          throw new Error("Deliverable record could not be resolved from webhook payload.");
        }

        // 2. Idempotency check: Exit early if already settled
        if (deliverable.isUnlocked && deliverable.invoice?.status === "PAID") {
          return { alreadyProcessed: true, meta: null };
        }

        const resolvedInvoiceId = deliverable.invoice?.id || invoiceId;

        // 3. Mark Invoice as PAID
        if (resolvedInvoiceId) {
          await tx.invoice.update({
            where: { id: resolvedInvoiceId },
            data: {
              status: "PAID",
              paidAt: new Date(),
              ...(paymentIntentId ? { stripePaymentIntentId: paymentIntentId } : {}),
            },
          });
        }

        // 4. Unlock Clean Assets and complete deliverable lifecycle
        await tx.deliverable.update({
          where: { id: deliverable.id },
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

      // 5. Send Transactional Asset Release Email (only once per settlement)
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
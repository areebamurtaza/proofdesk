// filepath: src/app/api/review/[token]/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

interface RouteParams {
  params: {
    token: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.json({ error: "Review token is required." }, { status: 400 });
    }

    const deliverable = await prisma.deliverable.findUnique({
      where: { reviewToken: token },
      include: {
        invoice: true,
        project: {
          include: {
            agency: true,
          },
        },
        approvalRecord: true,
      },
    });

    if (!deliverable) {
      if (token === "demo-token") {
        const appOrigin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
        return NextResponse.json(
          {
            success: true,
            checkoutUrl: `${appOrigin}/review/demo-token?session_id=demo_completed_session`,
            sessionId: "demo_completed_session",
          },
          { status: 200 }
        );
      }

      return NextResponse.json({ error: "Deliverable not found." }, { status: 404 });
    }

    if (!deliverable.approvalRecord) {
      return NextResponse.json(
        { error: "Deliverable must be approved before initiating payment." },
        { status: 412 }
      );
    }

    if (deliverable.isUnlocked || deliverable.invoice?.status === "PAID") {
      return NextResponse.json(
        { error: "Deliverable is already paid and unlocked." },
        { status: 409 }
      );
    }

    if (!deliverable.invoice) {
      return NextResponse.json(
        { error: "No invoice record found for this deliverable." },
        { status: 404 }
      );
    }

    const appOrigin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

    // Create live Stripe Checkout Session on Stripe's test servers
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: deliverable.approvalRecord.signerEmail,
      client_reference_id: deliverable.id,
      line_items: [
        {
          price_data: {
            currency: deliverable.invoice.currency,
            product_data: {
              name: `${deliverable.title} — Asset Release Escrow`,
              description: `Project: ${deliverable.project.name}. Client Signer: ${deliverable.approvalRecord.signerName}.`,
            },
            unit_amount: deliverable.invoice.amount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        deliverableId: deliverable.id,
        invoiceId: deliverable.invoice.id,
        reviewToken: deliverable.reviewToken,
        projectId: deliverable.projectId,
      },
      // Passes Stripe template variable to receive confirmed session ID on return
      success_url: `${appOrigin}/review/${deliverable.reviewToken}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appOrigin}/review/${deliverable.reviewToken}?payment=cancelled`,
    });

    await prisma.invoice.update({
      where: { id: deliverable.invoice.id },
      data: {
        status: "OPEN",
        stripeCheckoutSessionId: session.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        checkoutUrl: session.url,
        sessionId: session.id,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[Stripe Checkout Session Error]:", error);
    const message = error instanceof Error ? error.message : "Failed to generate Stripe checkout session.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
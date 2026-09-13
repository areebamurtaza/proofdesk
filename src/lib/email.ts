// filepath: src/lib/email.ts
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

const EMAIL_FROM = process.env.EMAIL_FROM || "ProofDesk <onboarding@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

interface SendReviewInviteParams {
  clientEmail: string;
  clientName: string;
  agencyName: string;
  projectName: string;
  deliverableTitle: string;
  versionNumber: number;
  reviewToken: string;
  escrowAmountCents: number;
  currency?: string;
}

interface SendReleaseReceiptParams {
  clientEmail: string;
  signerName: string;
  agencyName: string;
  projectName: string;
  deliverableTitle: string;
  reviewToken: string;
  escrowAmountCents: number;
  signatureHash: string;
  currency?: string;
}

/**
 * Trigger A: Dispatched when an agency mints a new deliverable or version.
 */
export async function sendReviewInviteEmail({
  clientEmail,
  clientName,
  agencyName,
  projectName,
  deliverableTitle,
  versionNumber,
  reviewToken,
  escrowAmountCents,
  currency = "USD",
}: SendReviewInviteParams) {
  if (!resend) {
    console.warn("[Resend]: Skipped dispatch — RESEND_API_KEY is not configured.");
    return { success: false, reason: "MISSING_KEY" };
  }

  const reviewUrl = `${APP_URL}/review/${reviewToken}`;
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(escrowAmountCents / 100);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #f4f4f5; margin: 0; padding: 40px 20px; }
          .container { max-width: 560px; margin: 0 auto; background: #121215; border: 1px solid #27272a; border-radius: 16px; padding: 32px; }
          .badge { display: inline-block; padding: 4px 10px; font-size: 11px; font-family: monospace; font-weight: 600; color: #34d399; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 9999px; }
          h1 { font-size: 18px; font-weight: 700; margin: 16px 0 8px 0; color: #ffffff; }
          p { font-size: 13px; line-height: 1.6; color: #a1a1aa; margin: 0 0 16px 0; }
          .card { background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 18px; margin: 24px 0; }
          .row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px; }
          .row:last-child { margin-bottom: 0; }
          .label { color: #71717a; }
          .value { color: #ffffff; font-weight: 600; }
          .cta-btn { display: block; text-align: center; background: #10b981; color: #000000 !important; text-decoration: none; font-size: 13px; font-weight: 700; padding: 14px 24px; border-radius: 10px; margin-top: 24px; }
          .footer { margin-top: 32px; border-top: 1px solid #27272a; padding-top: 16px; font-size: 11px; color: #52525b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <span class="badge">SECURE ESCROW PROOFING</span>
          <h1>Action Required: Review "${deliverableTitle}"</h1>
          <p>Hello ${clientName},</p>
          <p><strong>${agencyName}</strong> has published Version ${versionNumber} for project <strong>${projectName}</strong>. The asset is available inside your zero-login proofing vault.</p>
          
          <div class="card">
            <table width="100%" cellpadding="4" cellspacing="0" style="font-size: 12px;">
              <tr>
                <td style="color: #71717a;">Deliverable:</td>
                <td align="right" style="color: #ffffff; font-weight: 600;">${deliverableTitle} (v${versionNumber})</td>
              </tr>
              <tr>
                <td style="color: #71717a;">Release Escrow:</td>
                <td align="right" style="color: #34d399; font-weight: 700;">${formattedPrice}</td>
              </tr>
              <tr>
                <td style="color: #71717a;">Access Protocol:</td>
                <td align="right" style="color: #ffffff;">Zero-Login Secure Link</td>
              </tr>
            </table>
          </div>

          <a href="${reviewUrl}" class="cta-btn">Open Review Canvas &rarr;</a>

          <div class="footer">
            ProofDesk Asset Protection Engine &bull; This link is cryptographically tied to your project. Do not forward.
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const data = await resend.emails.send({
      from: EMAIL_FROM,
      to: clientEmail,
      subject: `Review Ready: ${deliverableTitle} (v${versionNumber}) — ${agencyName}`,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error("[Resend Error - Review Invite]:", error);
    return { success: false, error };
  }
}

/**
 * Trigger B: Dispatched when Stripe payment confirms and assets unlock.
 */
export async function sendPaymentReceiptAndAssetReleaseEmail({
  clientEmail,
  signerName,
  agencyName,
  projectName,
  deliverableTitle,
  reviewToken,
  escrowAmountCents,
  signatureHash,
  currency = "USD",
}: SendReleaseReceiptParams) {
  if (!resend) {
    console.warn("[Resend]: Skipped dispatch — RESEND_API_KEY is not configured.");
    return { success: false, reason: "MISSING_KEY" };
  }

  const downloadUrl = `${APP_URL}/api/review/${reviewToken}/download`;
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(escrowAmountCents / 100);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #f4f4f5; margin: 0; padding: 40px 20px; }
          .container { max-width: 560px; margin: 0 auto; background: #121215; border: 1px solid #27272a; border-radius: 16px; padding: 32px; }
          .badge { display: inline-block; padding: 4px 10px; font-size: 11px; font-family: monospace; font-weight: 600; color: #34d399; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 9999px; }
          h1 { font-size: 18px; font-weight: 700; margin: 16px 0 8px 0; color: #ffffff; }
          p { font-size: 13px; line-height: 1.6; color: #a1a1aa; margin: 0 0 16px 0; }
          .card { background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 18px; margin: 24px 0; }
          .hash-box { background: #09090b; border: 1px solid #27272a; border-radius: 8px; padding: 10px; font-family: monospace; font-size: 10px; color: #34d399; word-break: break-all; margin-top: 8px; }
          .cta-btn { display: block; text-align: center; background: #10b981; color: #000000 !important; text-decoration: none; font-size: 13px; font-weight: 700; padding: 14px 24px; border-radius: 10px; margin-top: 24px; }
          .footer { margin-top: 32px; border-top: 1px solid #27272a; padding-top: 16px; font-size: 11px; color: #52525b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <span class="badge">ESCROW SETTLEMENT COMPLETE</span>
          <h1>Master Deliverables Unlocked</h1>
          <p>Hello ${signerName},</p>
          <p>Payment of <strong>${formattedPrice}</strong> has cleared successfully through Stripe Escrow. High-resolution unwatermarked assets for <strong>"${deliverableTitle}"</strong> are now available.</p>
          
          <div class="card">
            <table width="100%" cellpadding="4" cellspacing="0" style="font-size: 12px;">
              <tr>
                <td style="color: #71717a;">Agency:</td>
                <td align="right" style="color: #ffffff; font-weight: 600;">${agencyName}</td>
              </tr>
              <tr>
                <td style="color: #71717a;">Project:</td>
                <td align="right" style="color: #ffffff;">${projectName}</td>
              </tr>
              <tr>
                <td style="color: #71717a;">Settled Amount:</td>
                <td align="right" style="color: #34d399; font-weight: 700;">${formattedPrice}</td>
              </tr>
            </table>

            <div style="margin-top: 16px;">
              <span style="font-size: 11px; color: #71717a; text-transform: uppercase; font-family: monospace;">Cryptographic Signature Audit Hash:</span>
              <div class="hash-box">${signatureHash}</div>
            </div>
          </div>

          <a href="${downloadUrl}" class="cta-btn">Download Unwatermarked Master Files &rarr;</a>

          <div class="footer">
            ProofDesk Legally Binding Audit &bull; Retain this receipt for your corporate records.
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const data = await resend.emails.send({
      from: EMAIL_FROM,
      to: clientEmail,
      subject: `Asset Unlocked & Receipt: ${deliverableTitle} — ${agencyName}`,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error("[Resend Error - Release Receipt]:", error);
    return { success: false, error };
  }
}
// filepath: src/components/review/ApprovalModal.tsx
"use client";

import React, { useState, FormEvent } from "react";
import { X, Shield, Lock, Loader2, AlertCircle } from "lucide-react";
import { DeliverableReviewData, VersionItem } from "@/types/review";

interface ApprovalModalProps {
  isOpen: boolean;
  deliverable: DeliverableReviewData;
  version: VersionItem;
  onClose: () => void;
  onConfirmApproval: (
    signerName: string,
    signerEmail: string,
    consent: boolean
  ) => Promise<void> | void;
}

export function ApprovalModal({
  isOpen,
  deliverable,
  version,
  onClose,
  onConfirmApproval,
}: ApprovalModalProps) {
  const [signerName, setSignerName] = useState<string>("");
  const [signerEmail, setSignerEmail] = useState<string>("");
  const [hasConsented, setHasConsented] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const invoiceAmountFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: deliverable.currency || "USD",
  }).format((deliverable.invoiceAmountCents || 0) / 100);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!signerName.trim()) {
      setErrorMessage("Please enter your legal name.");
      return;
    }

    if (!signerEmail.trim() || !signerEmail.includes("@")) {
      setErrorMessage("Please enter a valid corporate email address.");
      return;
    }

    if (!hasConsented) {
      setErrorMessage("You must accept the legal terms to proceed.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onConfirmApproval(signerName.trim(), signerEmail.trim(), true);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Approval processing failed.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-lg rounded-2xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl text-zinc-100 space-y-5">
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Sign &amp; Authorize Handoff</h2>
              <p className="text-xs text-zinc-400">
                Deliverable Version {version.versionNumber} &bull; {version.fileName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inline Error Banner */}
        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Legal Consent Non-Repudiation Box */}
        <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800/80 space-y-2 text-xs text-zinc-300 leading-relaxed">
          <p className="font-semibold text-white">Binding Legal Non-Repudiation Terms:</p>
          <p>
            By signing, you confirm that you have reviewed Version {version.versionNumber} of &quot;{deliverable.title}&quot; and authorize its release. An escrow invoice of{" "}
            <span className="font-semibold text-emerald-400">{invoiceAmountFormatted}</span> will be generated. High-resolution master assets will unlock automatically upon payment clearance.
          </p>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              Signer Legal Name
            </label>
            <input
              type="text"
              required
              disabled={isSubmitting}
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              Signer Corporate Email
            </label>
            <input
              type="email"
              required
              disabled={isSubmitting}
              value={signerEmail}
              onChange={(e) => setSignerEmail(e.target.value)}
              placeholder="signer@company.com"
              className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50"
            />
          </div>

          <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={hasConsented}
              disabled={isSubmitting}
              onChange={(e) => setHasConsented(e.target.checked)}
              className="mt-0.5 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-xs text-zinc-300">
              I agree to the electronic signature audit trail and commit to releasing final payment of {invoiceAmountFormatted}.
            </span>
          </label>

          {/* Action Button */}
          <button
            type="submit"
            disabled={isSubmitting || !signerName.trim() || !signerEmail.trim() || !hasConsented}
            className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-black text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/30 transition-all active:scale-[0.99]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Authorizing &amp; Connecting to Stripe...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Sign &amp; Proceed to Stripe Escrow ({invoiceAmountFormatted})</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
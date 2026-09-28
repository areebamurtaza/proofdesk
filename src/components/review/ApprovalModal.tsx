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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 select-none font-sans">
      <div className="relative w-full max-w-lg rounded-2xl bg-white border border-[#DDD8CF] accent-border-top-navy p-6 shadow-2xl text-[#171A1F] space-y-5">
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#172B4D]/10 border border-[#172B4D]/20 flex items-center justify-center text-[#172B4D] font-bold shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#171A1F]">Sign &amp; Authorize Handoff</h2>
              <p className="text-xs text-[#667085]">
                Deliverable Version {version.versionNumber} &bull; {version.fileName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded-lg text-[#667085] hover:text-[#171A1F] hover:bg-[#F8F6F1] transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inline Error Banner */}
        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Legal Consent Non-Repudiation Box */}
        <div className="p-4 rounded-xl bg-[#F8F6F1] border border-[#DDD8CF] space-y-2 text-xs text-[#171A1F]/90 leading-relaxed">
          <p className="font-bold text-[#172B4D]">Binding Legal Non-Repudiation Terms:</p>
          <p>
            By signing, you confirm that you have reviewed Version {version.versionNumber} of &quot;{deliverable.title}&quot; and authorize its release. An escrow invoice of{" "}
            <span className="font-bold text-[#172B4D]">{invoiceAmountFormatted}</span> will be generated. High-resolution master assets will unlock automatically upon approval.
          </p>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#667085]">
              Signer Legal Name
            </label>
            <input
              type="text"
              required
              disabled={isSubmitting}
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8F6F1] border border-[#DDD8CF] text-xs text-[#171A1F] placeholder-[#667085] focus:outline-none focus:border-[#172B4D] transition-colors disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#667085]">
              Signer Corporate Email
            </label>
            <input
              type="email"
              required
              disabled={isSubmitting}
              value={signerEmail}
              onChange={(e) => setSignerEmail(e.target.value)}
              placeholder="signer@company.com"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8F6F1] border border-[#DDD8CF] text-xs text-[#171A1F] placeholder-[#667085] focus:outline-none focus:border-[#172B4D] transition-colors disabled:opacity-50"
            />
          </div>

          <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={hasConsented}
              disabled={isSubmitting}
              onChange={(e) => setHasConsented(e.target.checked)}
              className="mt-0.5 rounded border-[#DDD8CF] text-[#172B4D] focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-xs text-[#667085]">
              I agree to the electronic signature audit trail and commit to releasing final payment of {invoiceAmountFormatted}.
            </span>
          </label>

          {/* Action Button */}
          <button
            type="submit"
            disabled={isSubmitting || !signerName.trim() || !signerEmail.trim() || !hasConsented}
            className="w-full py-3 px-4 rounded-xl bg-[#172B4D] hover:bg-[#0B1628] disabled:bg-[#F8F6F1] disabled:text-[#667085] text-[#F8F6F1] text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#F8F6F1]" />
                <span>Authorizing &amp; Connecting to Stripe...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Sign &amp; Proceed to Escrow ({invoiceAmountFormatted})</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
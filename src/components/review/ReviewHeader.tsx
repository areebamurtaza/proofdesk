// filepath: src/components/review/ReviewHeader.tsx
"use client";

import React from "react";
import {
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Layers,
  Columns,
  Download,
} from "lucide-react";
import { DeliverableReviewData, VersionItem } from "@/types/review";

interface ReviewHeaderProps {
  deliverable: DeliverableReviewData;
  activeVersion: VersionItem;
  isCompareMode: boolean;
  onToggleCompareMode: () => void;
  onSelectVersion: (version: VersionItem) => void;
  onOpenApprovalModal: () => void;
  onToggleUnlockedState: () => void;
  onDownloadCleanFile: () => void;
}

export function ReviewHeader({
  deliverable,
  activeVersion,
  isCompareMode,
  onToggleCompareMode,
  onSelectVersion,
  onOpenApprovalModal,
  onToggleUnlockedState,
  onDownloadCleanFile,
}: ReviewHeaderProps) {
  const formattedPrice = (deliverable.invoiceAmountCents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: deliverable.currency.toUpperCase(),
  });

  return (
    <header className="h-16 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md px-6 flex items-center justify-between z-30 select-none shrink-0">
      {/* Left: Deliverable & Project Metadata */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-zinc-100 tracking-tight">
              {deliverable.title}
            </h1>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                deliverable.isUnlocked
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
              }`}
            >
              {deliverable.isUnlocked ? "UNLOCKED & PAID" : deliverable.status.replace("_", " ")}
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            {deliverable.projectName} &bull;{" "}
            <span className="text-zinc-300 font-medium">{deliverable.agencyName}</span>
          </p>
        </div>
      </div>

      {/* Middle: Version Navigator & Comparison Controls */}
      <div className="flex items-center gap-3">
        {/* Version Switcher */}
        <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
          <Layers className="w-3.5 h-3.5 text-zinc-400 ml-2" />
          <span className="text-xs text-zinc-400 font-medium mr-1">Version:</span>
          {deliverable.versions.map((ver) => {
            const isActive = ver.id === activeVersion.id;
            return (
              <button
                key={ver.id}
                onClick={() => onSelectVersion(ver)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                  isActive
                    ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/50"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                }`}
              >
                v{ver.versionNumber}
              </button>
            );
          })}
        </div>

        {/* Step 8: Side-by-Side Comparison Toggle */}
        {deliverable.versions.length > 1 && (
          <button
            onClick={onToggleCompareMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              isCompareMode
                ? "bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-900/40"
                : "bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border-zinc-800 hover:bg-zinc-800"
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>{isCompareMode ? "Exit Compare" : "Compare (v1 vs v2)"}</span>
          </button>
        )}

        {/* Security Telemetry Status */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800/60">
          {deliverable.isUnlocked ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-zinc-300">Clean Master Released</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-zinc-400">Watermarked Preview</span>
            </>
          )}
        </div>
      </div>

      {/* Right: Payment Call-to-Action & Dev Simulation Toggle */}
      <div className="flex items-center gap-3">
        {/* Dev Mode Simulation Switch */}
        <button
          onClick={onToggleUnlockedState}
          title="Developer Test Toggle: Switch between Unpaid (Locked) and Paid (Unlocked) state"
          className="hidden sm:block text-[11px] px-2 py-1 rounded bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
        >
          Toggle Paywall: {deliverable.isUnlocked ? "Paid" : "Unpaid"}
        </button>

        {deliverable.isUnlocked ? (
          /* Step 13: Clean High-Res Asset Download Trigger */
          <button
            onClick={onDownloadCleanFile}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950/40 transition-all active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>Download Master Asset</span>
          </button>
        ) : (
          /* Step 10 & 11: Escrow Approval Paywall */
          <>
            <div className="text-right hidden sm:block">
              <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                Source Release Balance
              </p>
              <p className="text-sm font-semibold text-zinc-100">{formattedPrice}</p>
            </div>
            <button
              onClick={onOpenApprovalModal}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950/40 transition-all active:scale-[0.98]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve & Unlock</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}
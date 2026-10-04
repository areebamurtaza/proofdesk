// filepath: src/components/review/ReviewHeader.tsx
"use client";

import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
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
  onToggleUnlockedState?: () => void;
  onDownloadCleanFile: () => void;
}

export function ReviewHeader({
  deliverable,
  activeVersion,
  isCompareMode,
  onToggleCompareMode,
  onSelectVersion,
  onOpenApprovalModal,
  onDownloadCleanFile,
}: ReviewHeaderProps) {
  const formattedPrice = (deliverable.invoiceAmountCents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: deliverable.currency.toUpperCase(),
  });

  return (
    <header className="h-14 sm:h-16 border-b border-[#DDD8CF] bg-[#F8F6F1]/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between z-30 select-none shrink-0 font-sans gap-2">
      {/* Left: Deliverable & Project Metadata */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <Link
          href="/"
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#172B4D] flex items-center justify-center text-[#F8F6F1] shadow-xs font-serif font-bold text-xs sm:text-sm hover:bg-[#0B1628] transition-colors shrink-0"
        >
          P
        </Link>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h1 className="text-xs sm:text-sm font-serif font-bold text-[#171A1F] tracking-tight truncate max-w-[120px] xs:max-w-[170px] md:max-w-xs">
              {deliverable.title}
            </h1>
            <span
              className={`hidden md:inline-flex text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                deliverable.isUnlocked
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-[#F8F6F1] text-[#172B4D] border border-[#172B4D]/30"
              }`}
            >
              {deliverable.isUnlocked ? "UNLOCKED" : deliverable.status.replace("_", " ")}
            </span>
            <span
              className={`hidden sm:inline-flex text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                deliverable.fileType === "ILLUSTRATOR"
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : deliverable.fileType === "ZIP"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-white text-[#171A1F] border-[#DDD8CF]"
              }`}
            >
              {deliverable.fileType}
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-[#667085] truncate max-w-[120px] xs:max-w-[170px] sm:max-w-none">
            {deliverable.projectName} &bull;{" "}
            <span className="text-[#172B4D] font-semibold">{deliverable.agencyName}</span>
          </p>
        </div>
      </div>

      {/* Middle: Version Navigator & Comparison Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Version Switcher */}
        <div className="flex items-center gap-1 bg-white border border-[#DDD8CF] rounded-lg p-0.5 sm:p-1 shadow-xs">
          <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#172B4D] ml-1 sm:ml-2 hidden xs:block" />
          <span className="text-[10px] sm:text-xs text-[#667085] font-bold mr-0.5 sm:mr-1 hidden sm:inline">
            Version:
          </span>
          {deliverable.versions.map((ver) => {
            const isActive = ver.id === activeVersion.id;
            return (
              <button
                key={ver.id}
                onClick={() => onSelectVersion(ver)}
                className={`px-2 sm:px-2.5 py-0.5 sm:py-1 text-[11px] sm:text-xs rounded-md font-extrabold transition-all ${
                  isActive
                    ? "bg-[#172B4D] text-[#F8F6F1] shadow-xs"
                    : "text-[#667085] hover:text-[#171A1F] hover:bg-[#F8F6F1]"
                }`}
              >
                v{ver.versionNumber}
              </button>
            );
          })}
        </div>

        {/* Side-by-Side Comparison Toggle */}
        {deliverable.versions.length > 1 && (
          <button
            onClick={onToggleCompareMode}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isCompareMode
                ? "bg-[#172B4D] text-[#F8F6F1] border-[#172B4D] shadow-xs"
                : "bg-white text-[#171A1F] hover:text-[#172B4D] border-[#DDD8CF] hover:bg-[#F8F6F1]"
            }`}
            title="Toggle side-by-side comparison"
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isCompareMode ? "Exit Compare" : "Compare"}
            </span>
          </button>
        )}

        {/* Security Telemetry Status */}
        <div className="hidden xl:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white border border-[#DDD8CF] shadow-xs">
          {deliverable.isUnlocked ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-800 font-medium">Clean Master Released</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-3.5 h-3.5 text-[#172B4D]" />
              <span className="text-[#667085] font-medium">Protected Preview</span>
            </>
          )}
        </div>
      </div>

      {/* Right: Payment Call-to-Action & Dev Simulation Toggle */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {deliverable.isUnlocked ? (
          /* Clean High-Res Asset Download Trigger */
          <button
            onClick={onDownloadCleanFile}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Download Master</span>
            <span className="xs:hidden">Download</span>
          </button>
        ) : (
          /* Escrow Approval Paywall */
          <>
            <div className="text-right hidden md:block">
              <p className="text-[10px] uppercase tracking-wider text-[#667085] font-bold">
                Source Release Balance
              </p>
              <p className="text-xs sm:text-sm font-bold text-[#172B4D] font-mono">{formattedPrice}</p>
            </div>
            <button
              onClick={onOpenApprovalModal}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-[#172B4D] hover:bg-[#0B1628] text-[#F8F6F1] text-xs font-semibold shadow-md transition-all active:scale-[0.98]"
            >
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D7C3A5]" />
              <span className="hidden sm:inline">Approve &amp; Unlock</span>
              <span className="sm:hidden font-mono font-bold">Approve ({formattedPrice})</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}
// filepath: src/app/(agency)/dashboard/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth, UserButton } from "@clerk/nextjs";
import { AgencySidebar } from "@/components/agency/AgencySidebar";
import { DeliverableUploadModal } from "@/components/agency/DeliverableUploadModal";
import { VersionUploadModal } from "@/components/agency/VersionUploadModal";
import {
  Lock,
  Unlock,
  Plus,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  Layers,
  Clock,
  AlertCircle,
  FileCheck,
  Eye,
  Activity,
  FolderGit2,
  CheckCircle2,
} from "lucide-react";

interface DashboardDeliverable {
  id: string;
  title: string;
  description: string | null;
  fileType: string;
  status: string;
  isUnlocked: boolean;
  reviewToken: string;
  createdAt: string;
  projectName: string;
  clientName: string;
  clientEmail: string;
  latestVersion: {
    versionNumber: number;
    fileName: string;
    fileSize: number;
  } | null;
  invoice: {
    amount: number;
    currency: string;
    status: string;
    paidAt: string | null;
  } | null;
  signerName: string | null;
}

export default function AgencyDashboardPage() {
  const { orgId, isLoaded: isAuthLoaded } = useAuth();
  const [deliverables, setDeliverables] = useState<DashboardDeliverable[]>([]);
  const [agencyName, setAgencyName] = useState<string>("Agency");
  const [isOrgWorkspace, setIsOrgWorkspace] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Version Upload Modal Target State
  const [versionTarget, setVersionTarget] = useState<{
    id: string;
    title: string;
    currentVersion: number;
  } | null>(null);

  // Fetch live deliverables committed to PostgreSQL
  const fetchDeliverables = useCallback(async (targetOrgId?: string | null) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const queryParam =
        targetOrgId !== undefined
          ? targetOrgId
            ? `?orgId=${encodeURIComponent(targetOrgId)}`
            : `?orgId=personal`
          : "";

      const res = await fetch(`/api/deliverables${queryParam}`, {
        cache: "no-store",
        headers: targetOrgId ? { "x-clerk-org-id": targetOrgId } : {},
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to load dashboard deliverables.");
      }

      const data = await res.json();
      setDeliverables(data.deliverables || []);
      if (data.agencyName) setAgencyName(data.agencyName);
      if (data.isOrgWorkspace !== undefined) setIsOrgWorkspace(Boolean(data.isOrgWorkspace));
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to load database records."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthLoaded) return;
    fetchDeliverables(orgId);
  }, [isAuthLoaded, orgId, fetchDeliverables]);

  const handleCopyLink = (reviewToken: string) => {
    const origin = window.location.origin;
    const url = `${origin}/review/${reviewToken}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(reviewToken);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const formatCurrency = (cents: number, currency: string = "usd") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  };

  // Derived metric counters for the 4 overview boxes
  const inReviewCount = deliverables.filter((d) => d.status === "IN_REVIEW").length;
  const revisionsCount = deliverables.filter((d) => d.status === "CHANGES_REQUESTED").length;
  const approvedCount = deliverables.filter((d) => d.status === "APPROVED" || d.isUnlocked).length;

  return (
    <div className="min-h-screen flex bg-[#F8F6F1] text-[#171A1F] font-sans antialiased">
      {/* 1. DEEP NAVY SIDEBAR (#0B1628) - FIXED POSITION & LENGTH */}
      <AgencySidebar currentPath="/dashboard" deliverablesCount={deliverables.length} />

      {/* 2. LIGHT WORKSPACE CANVAS (#F8F6F1) */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-64 min-h-screen">
        {/* Workspace Top Header */}
        <header className="h-16 border-b border-[#DDD8CF] bg-white/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 sticky top-0 z-10 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <h1 className="text-base sm:text-lg font-serif font-bold text-[#171A1F] tracking-tight truncate">
              {agencyName} Deliverables
            </h1>
            <span
              className={`hidden md:inline-flex px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full border shrink-0 ${
                isOrgWorkspace
                  ? "bg-[#172B4D]/10 text-[#172B4D] border-[#172B4D]/20"
                  : "bg-amber-100 text-[#B7791F] border-amber-300"
              }`}
            >
              {isOrgWorkspace ? "Shared Organization" : "Personal Studio"}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href="/activity"
              className="md:hidden px-2.5 py-1.5 rounded-lg bg-white border border-[#DDD8CF] text-xs font-semibold text-[#171A1F] flex items-center gap-1 shadow-xs"
            >
              <Activity className="w-3.5 h-3.5 text-[#172B4D]" />
              <span className="hidden xs:inline">Audit</span>
            </Link>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-3 sm:px-4 py-2 rounded-xl bg-[#172B4D] hover:bg-[#0B1628] text-[#F8F6F1] text-xs font-semibold flex items-center gap-1.5 sm:gap-2 shadow-sm transition-all active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5 text-[#D7C3A5]" />
              <span className="hidden xs:inline">Upload Deliverable</span>
              <span className="xs:hidden">Upload</span>
            </button>

            <div className="md:hidden flex items-center">
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-7 h-7 border border-[#DDD8CF]",
                  },
                }}
              />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6 lg:p-8 space-y-8 max-w-7xl w-full mx-auto">
          {/* Workspace Guidance Banner when on Personal Account */}
          {!isOrgWorkspace && (
            <div className="p-4 rounded-xl bg-[#F0E7D8] border border-[#D7C3A5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5 text-xs text-[#172B4D]">
                <AlertCircle className="w-4 h-4 text-[#B7791F] shrink-0" />
                <span>
                  You are currently in your <strong>Personal Studio</strong>. To collaborate and view team deliverables, select <strong>Zylo Technology</strong> in the bottom-left organization switcher.
                </span>
              </div>
            </div>
          )}

          {/* Headline banner */}
          <div className="space-y-1">
            <h2 className="text-xl font-serif font-bold text-[#171A1F]">Creative Operations Center</h2>
            <p className="text-xs sm:text-sm text-[#667085]">
              Linear version history, tokenized client proofing links, and legal clearance vaults.
            </p>
          </div>

          {/* ============================================================ */}
          {/* 3. FOUR OVERVIEW METRIC CARDS                                 */}
          {/* ============================================================ */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {/* Metric 1: Total Assets */}
            <div className="p-5 rounded-xl bg-white border border-[#DDD8CF] accent-border-top-navy shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[#667085]">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#171A1F] font-semibold">
                  Total Assets
                </span>
                <div className="w-7 h-7 rounded-lg bg-[#F8F6F1] border border-[#DDD8CF] flex items-center justify-center text-[#172B4D]">
                  <Layers className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-2xl font-serif font-bold text-[#171A1F] tracking-tight">
                {deliverables.length}
              </p>
              <p className="text-[11px] text-[#667085]">
                Active project deliverable vaults
              </p>
            </div>

            {/* Metric 2: Awaiting Review */}
            <div className="p-5 rounded-xl bg-white border border-[#DDD8CF] accent-border-top-navy shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[#667085]">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#172B4D] font-semibold">
                  In Client Review
                </span>
                <div className="w-7 h-7 rounded-lg bg-[#F8F6F1] border border-[#DDD8CF] flex items-center justify-center text-[#172B4D]">
                  <Lock className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-2xl font-serif font-bold text-[#172B4D] tracking-tight">
                {inReviewCount}
              </p>
              <p className="text-[11px] text-[#667085]">
                Token links awaiting client decision
              </p>
            </div>

            {/* Metric 3: Changes Requested */}
            <div className="p-5 rounded-xl bg-white border border-[#DDD8CF] accent-border-top-sand shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[#667085]">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#B7791F] font-semibold">
                  Changes Requested
                </span>
                <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-[#B7791F]">
                  <Clock className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-2xl font-serif font-bold text-[#B7791F] tracking-tight">
                {revisionsCount}
              </p>
              <p className="text-[11px] text-[#667085]">
                Feedback pins logged for revision
              </p>
            </div>

            {/* Metric 4: Approved & Cleared */}
            <div className="p-5 rounded-xl bg-white border border-[#DDD8CF] shadow-xs space-y-2 border-t-2 border-t-[#2F6B4F]">
              <div className="flex items-center justify-between text-[#667085]">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#2F6B4F] font-semibold">
                  Approved &amp; Cleared
                </span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#2F6B4F]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-2xl font-serif font-bold text-[#2F6B4F] tracking-tight">
                {approvedCount}
              </p>
              <p className="text-[11px] text-[#667085]">
                Signed off with SHA-256 audit record
              </p>
            </div>
          </motion.div>

          {/* ============================================================ */}
          {/* 4. DELIVERABLES VAULT TABLE (White surface on #F8F6F1)        */}
          {/* ============================================================ */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="rounded-2xl border border-[#DDD8CF] bg-white overflow-hidden shadow-xs"
          >
            <div className="px-6 py-4 border-b border-[#DDD8CF] bg-[#F8F6F1]/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-[#172B4D]" />
                <h3 className="font-serif font-bold text-sm text-[#171A1F]">
                  Deliverable Registry
                </h3>
              </div>
              <span className="text-xs text-[#172B4D] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#172B4D]/10 border border-[#172B4D]/20">
                {deliverables.length} Deliverables
              </span>
            </div>

            {isLoading ? (
              <div className="h-64 flex flex-col items-center justify-center gap-3 text-[#667085]">
                <Loader2 className="w-6 h-6 animate-spin text-[#172B4D]" />
                <p className="text-xs font-medium">Loading live database records...</p>
              </div>
            ) : errorMessage ? (
              <div className="h-64 flex flex-col items-center justify-center gap-3 text-rose-700 p-6 text-center">
                <AlertCircle className="w-6 h-6" />
                <p className="text-xs font-medium">{errorMessage}</p>
                <button
                  onClick={() => fetchDeliverables(orgId)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#172B4D] text-white text-xs font-semibold hover:bg-[#0B1628] transition-colors"
                >
                  Retry Fetch
                </button>
              </div>
            ) : deliverables.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center gap-3 text-[#667085] p-6 text-center">
                <Layers className="w-8 h-8 text-[#DDD8CF]" />
                <p className="text-xs font-bold text-[#171A1F]">No deliverables uploaded yet</p>
                <p className="text-[11px] text-[#667085] max-w-xs">
                  Upload your first design asset (JPG, PNG, SVG, AI, ZIP) to mint a tokenized review link.
                </p>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="mt-2 px-4 py-2 rounded-xl bg-[#172B4D] text-[#F8F6F1] text-xs font-semibold shadow-sm hover:bg-[#0B1628] transition-all"
                >
                  Upload First Deliverable
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F6F1] text-[#172B4D] uppercase font-mono text-[10px] tracking-wider border-b border-[#DDD8CF]">
                    <tr>
                      <th className="px-6 py-3.5 font-bold">Deliverable</th>
                      <th className="px-6 py-3.5 font-bold">Project &amp; Client</th>
                      <th className="px-6 py-3.5 font-bold">Status</th>
                      <th className="px-6 py-3.5 font-bold">Escrow Balance</th>
                      <th className="px-6 py-3.5 font-bold">Created</th>
                      <th className="px-6 py-3.5 text-right font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDD8CF] text-[#171A1F]">
                    {deliverables.map((item) => (
                      <tr key={item.id} className="hover:bg-[#F8F6F1]/50 transition-colors group">
                        <td className="px-6 py-4">
                          <Link
                            href={`/deliverables/${item.id}`}
                            className="font-bold text-[#171A1F] hover:text-[#172B4D] transition-colors inline-flex items-center gap-1.5"
                          >
                            <span>{item.title}</span>
                            <Eye className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-[#172B4D] transition-opacity" />
                          </Link>
                          <div className="text-[11px] text-[#667085] flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[#172B4D] font-bold">
                              v{item.latestVersion?.versionNumber || 1}
                            </span>
                            <span>&bull;</span>
                            <span className="uppercase text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F8F6F1] border border-[#DDD8CF] text-[#171A1F]">
                              {item.fileType}
                            </span>
                            <span>&bull;</span>
                            <span className="truncate max-w-[160px]">{item.latestVersion?.fileName || "master"}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-[#171A1F] font-semibold">{item.projectName}</div>
                          <div className="text-[11px] text-[#667085]">{item.clientName}</div>
                        </td>

                        <td className="px-6 py-4">
                          {item.isUnlocked ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <Unlock className="w-3 h-3 text-emerald-600" />
                              <span>Paid &amp; Unlocked</span>
                            </span>
                          ) : item.status === "APPROVED" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#F8F6F1] text-[#2F6B4F] border border-emerald-300">
                              <FileCheck className="w-3 h-3 text-[#2F6B4F]" />
                              <span>Approved (Locked)</span>
                            </span>
                          ) : item.status === "CHANGES_REQUESTED" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Revisions Requested</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#F8F6F1] text-[#172B4D] border border-[#DDD8CF]">
                              <Lock className="w-3 h-3 text-[#172B4D]" />
                              <span>In Review</span>
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="font-mono font-bold text-[#171A1F]">
                            {formatCurrency(item.invoice?.amount || 0, item.invoice?.currency)}
                          </div>
                          <div className="text-[10px] text-[#667085] uppercase font-mono">
                            {item.invoice?.status || "DRAFT"}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-[#667085] font-mono text-[11px]">
                          {new Date(item.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Internal Agency Inspector View */}
                            <Link
                              href={`/deliverables/${item.id}`}
                              title="Inspect Client Feedback & Audit Record"
                              className="p-1.5 rounded-lg bg-[#F8F6F1] hover:bg-[#DDD8CF]/40 text-[#171A1F] border border-[#DDD8CF] transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#172B4D]" />
                            </Link>

                            {/* Upload Next Version */}
                            {!item.isUnlocked && (
                              <button
                                onClick={() =>
                                  setVersionTarget({
                                    id: item.id,
                                    title: item.title,
                                    currentVersion: item.latestVersion?.versionNumber || 1,
                                  })
                                }
                                title="Upload Next Version (v2+)"
                                className="p-1.5 rounded-lg bg-[#F8F6F1] hover:bg-[#172B4D]/10 text-[#171A1F] hover:text-[#172B4D] border border-[#DDD8CF] transition-colors"
                              >
                                <Layers className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Copy Client Zero-Auth URL */}
                            <button
                              onClick={() => handleCopyLink(item.reviewToken)}
                              title="Copy Client Zero-Auth Review URL"
                              className="p-1.5 rounded-lg bg-[#F8F6F1] hover:bg-[#DDD8CF]/40 text-[#171A1F] border border-[#DDD8CF] transition-colors"
                            >
                              {copiedToken === item.reviewToken ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Launch External Client Canvas */}
                            <Link
                              href={`/review/${item.reviewToken}`}
                              target="_blank"
                              title="Launch Client Canvas View"
                              className="p-1.5 rounded-lg bg-[#F8F6F1] hover:bg-[#172B4D] hover:text-[#F8F6F1] text-[#171A1F] border border-[#DDD8CF] transition-all"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </main>
      </div>

      {/* Initial Deliverable Upload Modal */}
      <DeliverableUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        orgId={orgId}
        onUploadComplete={() => {
          fetchDeliverables(orgId);
        }}
      />

      {/* Version Revision Upload Modal */}
      <VersionUploadModal
        isOpen={versionTarget !== null}
        deliverableId={versionTarget?.id || null}
        deliverableTitle={versionTarget?.title || ""}
        currentVersionNumber={versionTarget?.currentVersion || 1}
        onClose={() => setVersionTarget(null)}
        onVersionUploaded={() => {
          fetchDeliverables(orgId);
        }}
      />
    </div>
  );
}
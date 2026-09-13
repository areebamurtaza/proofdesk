// filepath: src/app/(agency)/dashboard/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import { DeliverableUploadModal } from "@/components/agency/DeliverableUploadModal";
import { VersionUploadModal } from "@/components/agency/VersionUploadModal";
import {
  ShieldCheck,
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

interface DashboardMetrics {
  totalDeliverables: number;
  activeReviewCount: number;
  completedCount: number;
  escrowPendingCents: number;
  clearedRevenueCents: number;
}

export default function AgencyDashboardPage() {
  const [deliverables, setDeliverables] = useState<DashboardDeliverable[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalDeliverables: 0,
    activeReviewCount: 0,
    completedCount: 0,
    escrowPendingCents: 0,
    clearedRevenueCents: 0,
  });

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
  const fetchDeliverables = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const res = await fetch("/api/deliverables", { cache: "no-store" });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to load dashboard deliverables.");
      }

      const data = await res.json();
      setDeliverables(data.deliverables || []);
      setMetrics(data.metrics);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to load database records."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeliverables();
  }, [fetchDeliverables]);

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

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-8 space-y-8 select-none">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-white">Agency Deliverables</h1>
            <span className="px-2 py-0.5 text-[11px] font-mono font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Studio Monolith
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Escrow-backed proofing, versioning, and client release protocol.
          </p>
        </div>

        {/* Agency Auth & Workspace Controls */}
        <div className="flex items-center gap-3">
          <OrganizationSwitcher
            appearance={{
              elements: {
                rootBox: "bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-1",
                organizationPreviewTextContainer: "text-xs text-zinc-300 font-medium",
                organizationSwitcherTriggerIcon: "text-zinc-500",
              },
            }}
          />

          {/* Audit Trail Navigation Button */}
          <Link
            href="/activity"
            className="px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-2 transition-all active:scale-[0.98]"
          >
            <Activity className="w-4 h-4 text-indigo-400" />
            <span>Audit Trail</span>
          </Link>

          {/* Upload Deliverable Button */}
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Deliverable</span>
          </button>

          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "w-8 h-8 border border-zinc-800",
              },
            }}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Live Financial Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-medium">Locked in Escrow</span>
              <Lock className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">
              {formatCurrency(metrics.escrowPendingCents)}
            </p>
            <p className="text-[11px] text-zinc-500">
              {metrics.activeReviewCount} deliverable(s) in active client review
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-medium">Settled Revenue</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400 tracking-tight">
              {formatCurrency(metrics.clearedRevenueCents)}
            </p>
            <p className="text-[11px] text-zinc-500">
              {metrics.completedCount} project(s) paid and unlocked via Stripe
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-medium">Total Volume</span>
              <Layers className="w-4 h-4 text-zinc-400" />
            </div>
            <p className="text-2xl font-bold text-zinc-200 tracking-tight">
              {metrics.totalDeliverables}
            </p>
            <p className="text-[11px] text-zinc-500">Persistent PostgreSQL records</p>
          </div>
        </div>

        {/* Database Deliverables Table */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-md overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Active Deliverable Vault</h2>
            <span className="text-xs text-zinc-500 font-mono">
              {deliverables.length} Deliverables
            </span>
          </div>

          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-zinc-400">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
              <p className="text-xs font-medium">Loading live database records...</p>
            </div>
          ) : errorMessage ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-rose-400 p-6 text-center">
              <AlertCircle className="w-6 h-6" />
              <p className="text-xs font-medium">{errorMessage}</p>
              <button
                onClick={fetchDeliverables}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-200 text-xs hover:bg-zinc-700 transition-colors"
              >
                Retry Fetch
              </button>
            </div>
          ) : deliverables.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-zinc-500 p-6 text-center">
              <Layers className="w-8 h-8 text-zinc-700" />
              <p className="text-xs font-medium text-zinc-400">No deliverables uploaded yet</p>
              <p className="text-[11px] text-zinc-600 max-w-xs">
                Upload your first master file to mint a zero-login review token and watermark the asset.
              </p>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="mt-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 transition-colors"
              >
                Upload First Deliverable
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950/60 text-zinc-400 uppercase font-mono text-[10px] tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-3.5">Deliverable</th>
                    <th className="px-6 py-3.5">Project &amp; Client</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Escrow Release</th>
                    <th className="px-6 py-3.5">Created</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {deliverables.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-850/40 transition-colors group">
                      <td className="px-6 py-4">
                        <Link
                          href={`/deliverables/${item.id}`}
                          className="font-semibold text-white hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5"
                        >
                          <span>{item.title}</span>
                          <Eye className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-emerald-400 transition-opacity" />
                        </Link>
                        <div className="text-[11px] text-zinc-500 flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-zinc-400">
                            v{item.latestVersion?.versionNumber || 1}
                          </span>
                          <span>&bull;</span>
                          <span>{item.fileType}</span>
                          <span>&bull;</span>
                          <span>{item.latestVersion?.fileName || "master"}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-zinc-200 font-medium">{item.projectName}</div>
                        <div className="text-[11px] text-zinc-500">{item.clientName}</div>
                      </td>

                      <td className="px-6 py-4">
                        {item.isUnlocked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <Unlock className="w-3 h-3" />
                            <span>Paid &amp; Unlocked</span>
                          </span>
                        ) : item.status === "APPROVED" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                            <FileCheck className="w-3 h-3" />
                            <span>Approved (Pending Payment)</span>
                          </span>
                        ) : item.status === "CHANGES_REQUESTED" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            <Clock className="w-3 h-3" />
                            <span>Revisions Requested</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">
                            <Lock className="w-3 h-3" />
                            <span>In Review</span>
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-mono font-semibold text-white">
                          {formatCurrency(item.invoice?.amount || 0, item.invoice?.currency)}
                        </div>
                        <div className="text-[10px] text-zinc-500 uppercase font-mono">
                          {item.invoice?.status || "DRAFT"}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-zinc-500 font-mono text-[11px]">
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
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          {/* Upload Next Version (Disabled once locked/paid) */}
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
                              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-emerald-500/20 hover:text-emerald-400 text-zinc-300 transition-colors"
                            >
                              <Layers className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Copy Client Zero-Auth URL */}
                          <button
                            onClick={() => handleCopyLink(item.reviewToken)}
                            title="Copy Client Zero-Auth Review URL"
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                          >
                            {copiedToken === item.reviewToken ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Launch External Client Canvas */}
                          <Link
                            href={`/review/${item.reviewToken}`}
                            target="_blank"
                            title="Launch Client Canvas View"
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-emerald-500 hover:text-black text-zinc-300 transition-colors"
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
        </div>
      </div>

      {/* Initial Deliverable Upload Modal */}
      <DeliverableUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={() => {
          fetchDeliverables();
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
          fetchDeliverables();
        }}
      />
    </div>
  );
}
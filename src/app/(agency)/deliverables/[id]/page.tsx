// filepath: src/app/(agency)/deliverables/[id]/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Lock,
  Unlock,
  MessageSquare,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Activity,
  Laptop,
  Smartphone,
  Globe,
  RefreshCw,
} from "lucide-react";

interface CommentItem {
  id: string;
  versionId: string;
  parentId: string | null;
  authorType: "CLIENT" | "AGENCY";
  authorName: string;
  authorEmail: string | null;
  content: string;
  xPercent: number;
  yPercent: number;
  isResolved: boolean;
  createdAt: string;
}

interface VersionData {
  id: string;
  versionNumber: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
  changeLog: string | null;
  previewUrl: string;
  createdAt: string;
  comments: CommentItem[];
}

interface ActivityLogItem {
  id: string;
  action: string;
  ipAddress: string;
  userAgent: string;
  accessedAt: string;
}

interface DeliverableDetail {
  id: string;
  title: string;
  description: string | null;
  fileType: string;
  status: string;
  isUnlocked: boolean;
  reviewToken: string;
  createdAt: string;
  project: {
    id: string;
    name: string;
    clientName: string;
    clientEmail: string;
  };
  invoice: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    paidAt: string | null;
  } | null;
  approvalRecord: {
    id: string;
    approvedVersion: number;
    signerName: string;
    signerEmail: string;
    ipAddress: string;
    userAgent: string;
    legalConsent: string;
    signatureHash: string;
    approvedAt: string;
  } | null;
  versions: VersionData[];
}

function parseDevice(ua: string): { browser: string; os: string; isMobile: boolean } {
  const isMobile = /mobile|android|iphone|ipad/i.test(ua);
  let browser = "Browser";
  if (/chrome|crios/i.test(ua)) browser = "Chrome";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
  else if (/edg/i.test(ua)) browser = "Edge";

  let os = "OS";
  if (/macintosh|mac os x/i.test(ua)) os = "macOS";
  else if (/windows nt/i.test(ua)) os = "Windows";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/linux/i.test(ua)) os = "Linux";

  return { browser, os, isMobile };
}

function getActionMeta(action: string) {
  switch (action) {
    case "VIEW_PORTAL":
      return {
        label: "Viewed Vault",
        color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
      };
    case "DROP_PIN":
      return {
        label: "Feedback Pin Dropped",
        color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      };
    case "DOWNLOAD_MASTER":
      return {
        label: "Downloaded Clean Master",
        color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
      };
    default:
      return {
        label: action.replace(/_/g, " "),
        color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
      };
  }
}

export default function AgencyDeliverableDetailPage() {
  const params = useParams();
  const deliverableId = params?.id as string;

  const [deliverable, setDeliverable] = useState<DeliverableDetail | null>(null);
  const [activeVersionIndex, setActiveVersionIndex] = useState<number>(0);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<{ [commentId: string]: string }>({});
  const [isSubmittingReply, setIsSubmittingReply] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Inspector Sidebar Tab State: "comments" | "activity"
  const [activeTab, setActiveTab] = useState<"comments" | "activity">("comments");
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(false);

  const fetchDetail = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const res = await fetch(`/api/deliverables/${deliverableId}`, { cache: "no-store" });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to load deliverable details.");
      }

      const data = await res.json();
      setDeliverable(data.deliverable);

      if (data.deliverable.versions.length > 0) {
        setActiveVersionIndex(data.deliverable.versions.length - 1);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error retrieving deliverable.");
    } finally {
      setIsLoading(false);
    }
  }, [deliverableId]);

  const fetchActivityLogs = useCallback(async () => {
    try {
      setIsLoadingLogs(true);
      const res = await fetch(`/api/deliverables/${deliverableId}/activity`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setActivityLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Failed to load telemetry:", err);
    } finally {
      setIsLoadingLogs(false);
    }
  }, [deliverableId]);

  useEffect(() => {
    if (deliverableId) {
      fetchDetail();
      fetchActivityLogs();
    }
  }, [deliverableId, fetchDetail, fetchActivityLogs]);

  const handleCopyReviewLink = () => {
    if (!deliverable) return;
    const url = `${window.location.origin}/review/${deliverable.reviewToken}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSendReply = async (parentCommentId: string) => {
    const text = replyText[parentCommentId]?.trim();
    if (!text || !deliverable) return;

    const currentVersion = deliverable.versions[activeVersionIndex];

    try {
      setIsSubmittingReply(true);

      const res = await fetch(`/api/deliverables/${deliverable.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          versionId: currentVersion.id,
          parentId: parentCommentId,
          authorName: "Studio Monolith",
          content: text,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to post reply.");
      }

      const { comment: newReply } = await res.json();

      const updatedVersions = deliverable.versions.map((ver, idx) => {
        if (idx === activeVersionIndex) {
          return { ...ver, comments: [...ver.comments, newReply] };
        }
        return ver;
      });

      setDeliverable({ ...deliverable, versions: updatedVersions });
      setReplyText((prev) => ({ ...prev, [parentCommentId]: "" }));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to send reply.");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center text-zinc-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
        <p className="text-xs font-mono">Loading deliverable inspector...</p>
      </div>
    );
  }

  if (errorMessage || !deliverable) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 text-zinc-100">
        <div className="max-w-md w-full p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center space-y-4">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <h2 className="text-base font-semibold">Deliverable Unavailable</h2>
          <p className="text-xs text-zinc-400">{errorMessage || "Record could not be loaded."}</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const activeVersion = deliverable.versions[activeVersionIndex];
  const rootComments = activeVersion?.comments.filter((c) => !c.parentId) || [];

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col select-none">
      {/* Top Header Bar */}
      <header className="h-16 border-b border-zinc-800/80 bg-[#09090b]/90 backdrop-blur-md px-6 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-sm font-bold text-white tracking-tight">{deliverable.title}</h1>
              {deliverable.isUnlocked ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <Unlock className="w-3 h-3" />
                  <span>Paid &amp; Unlocked</span>
                </span>
              ) : deliverable.status === "APPROVED" ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Approved (Awaiting Stripe)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">
                  <Lock className="w-3 h-3" />
                  <span>In Review</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-500">
              Project: <span className="text-zinc-300 font-medium">{deliverable.project.name}</span> &bull; Client: {deliverable.project.clientName}
            </p>
          </div>
        </div>

        {/* Version Switcher & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-xl text-xs font-mono">
            {deliverable.versions.map((v, idx) => (
              <button
                key={v.id}
                onClick={() => {
                  setActiveVersionIndex(idx);
                  setSelectedPinId(null);
                }}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeVersionIndex === idx
                    ? "bg-zinc-800 text-emerald-400 font-semibold shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                v{v.versionNumber}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-zinc-800" />

          <button
            onClick={handleCopyReviewLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? "Link Copied" : "Copy Client Link"}</span>
          </button>

          <Link
            href={`/review/${deliverable.reviewToken}`}
            target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold shadow-lg shadow-emerald-950/40 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Launch Client Canvas</span>
          </Link>
        </div>
      </header>

      {/* Main Inspector Interface */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Asset Canvas with Spatial Feedback Pins */}
        <main className="flex-1 bg-zinc-950 p-6 overflow-auto flex items-center justify-center relative">
          {activeVersion && (
            <div className="relative max-w-full max-h-full border border-zinc-800 rounded-xl overflow-hidden shadow-2xl bg-zinc-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeVersion.previewUrl}
                alt={activeVersion.fileName}
                className="max-h-[82vh] object-contain select-none"
              />

              {rootComments.map((comment, idx) => {
                const isSelected = selectedPinId === comment.id;
                return (
                  <button
                    key={comment.id}
                    onClick={() => setSelectedPinId(comment.id)}
                    style={{
                      left: `${comment.xPercent * 100}%`,
                      top: `${comment.yPercent * 100}%`,
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-transform shadow-xl ${
                      comment.isResolved
                        ? "bg-emerald-500 text-black border-2 border-white"
                        : isSelected
                        ? "bg-white text-black scale-125 ring-4 ring-emerald-500/50"
                        : "bg-amber-500 text-black border-2 border-white hover:scale-110"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          )}
        </main>

        {/* Right Column: Tabbed Inspector (Annotations vs Telemetry) */}
        <aside className="w-96 border-l border-zinc-800/80 bg-zinc-950 flex flex-col h-[calc(100vh-4rem)] overflow-hidden shrink-0">
          {/* Tab Selector */}
          <div className="p-2 border-b border-zinc-800 bg-zinc-900/40 grid grid-cols-2 gap-1">
            <button
              onClick={() => setActiveTab("comments")}
              className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === "comments"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Annotations ({rootComments.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("activity")}
              className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === "activity"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <span>Telemetry ({activityLogs.length})</span>
            </button>
          </div>

          {activeTab === "comments" ? (
            /* Annotations View */
            <div className="flex-1 flex flex-col overflow-hidden">
              {deliverable.approvalRecord && (
                <div className="p-4 border-b border-zinc-800 bg-zinc-900/30 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[10px] uppercase tracking-wider font-mono">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Cryptographic Approval</span>
                  </div>
                  <p className="text-zinc-300 font-medium">{deliverable.approvalRecord.signerName}</p>
                  <p className="text-[10px] text-zinc-500 font-mono">
                    Hash: {deliverable.approvalRecord.signatureHash.substring(0, 18)}...
                  </p>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {rootComments.length === 0 ? (
                  <div className="h-48 flex flex-col items-center justify-center text-center text-zinc-500 space-y-2">
                    <Clock className="w-6 h-6 text-zinc-700" />
                    <p className="text-xs">No client pins on Version {activeVersion?.versionNumber}.</p>
                  </div>
                ) : (
                  rootComments.map((rootComment, idx) => {
                    const replies =
                      activeVersion?.comments.filter((c) => c.parentId === rootComment.id) || [];
                    const isSelected = selectedPinId === rootComment.id;

                    return (
                      <div
                        key={rootComment.id}
                        onClick={() => setSelectedPinId(rootComment.id)}
                        className={`p-3.5 rounded-xl border transition-all space-y-3 ${
                          isSelected
                            ? "bg-zinc-900 border-emerald-500/50 shadow-lg ring-1 ring-emerald-500/20"
                            : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-amber-500 text-black font-mono font-bold text-[10px] flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-semibold text-white">
                              {rootComment.authorName}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              CLIENT
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-500">
                            {new Date(rootComment.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-300 leading-relaxed pl-7">
                          {rootComment.content}
                        </p>

                        {replies.length > 0 && (
                          <div className="pl-7 space-y-2 border-l border-zinc-800 ml-2.5">
                            {replies.map((reply) => (
                              <div
                                key={reply.id}
                                className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800/80 space-y-1"
                              >
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-semibold text-white">{reply.authorName}</span>
                                  <span className="text-[9px] font-mono text-zinc-500">
                                    {new Date(reply.createdAt).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                                <p className="text-xs text-zinc-300">{reply.content}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="pt-2 pl-7 flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Reply to client pin..."
                            value={replyText[rootComment.id] || ""}
                            onChange={(e) =>
                              setReplyText({ ...replyText, [rootComment.id]: e.target.value })
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSendReply(rootComment.id);
                              }
                            }}
                            className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                          />
                          <button
                            onClick={() => handleSendReply(rootComment.id)}
                            disabled={isSubmittingReply || !replyText[rootComment.id]?.trim()}
                            className="p-1.5 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 disabled:opacity-30 transition-all"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            /* Telemetry & Audit Stream View */
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
                <span className="text-[11px] font-mono text-zinc-400 uppercase">
                  Zero-Auth Access Trail
                </span>
                <button
                  onClick={fetchActivityLogs}
                  disabled={isLoadingLogs}
                  className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLogs ? "animate-spin" : ""}`} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activityLogs.length === 0 ? (
                  <div className="h-48 flex flex-col items-center justify-center text-center text-zinc-500 space-y-2">
                    <Clock className="w-6 h-6 text-zinc-700" />
                    <p className="text-xs">No client events recorded yet.</p>
                  </div>
                ) : (
                  activityLogs.map((log) => {
                    const meta = getActionMeta(log.action);
                    const device = parseDevice(log.userAgent);
                    const date = new Date(log.accessedAt);

                    return (
                      <div
                        key={log.id}
                        className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${meta.color}`}
                          >
                            {meta.label}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500">
                            {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>

                        <div className="space-y-1 text-[11px] font-mono text-zinc-400">
                          <div className="flex items-center gap-1.5">
                            {device.isMobile ? (
                              <Smartphone className="w-3 h-3 text-zinc-500" />
                            ) : (
                              <Laptop className="w-3 h-3 text-zinc-500" />
                            )}
                            <span>
                              {device.browser} &bull; {device.os}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-zinc-500">
                            <Globe className="w-3 h-3" />
                            <span>{log.ipAddress}</span>
                            <span>&bull;</span>
                            <span>{date.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
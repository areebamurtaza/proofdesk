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
        label: "Vault Opened",
        icon: Activity,
        color: "text-[#172B4D] bg-[#F8F6F1] border-[#DDD8CF]",
      };
    case "DROP_PIN":
      return {
        label: "Pin Placed",
        icon: MessageSquare,
        color: "text-[#172B4D] bg-[#F8F6F1] border-[#D7C3A5]",
      };
    case "APPROVE_DELIVERABLE":
      return {
        label: "Legally Approved",
        icon: CheckCircle2,
        color: "text-[#2F6B4F] bg-emerald-50 border-emerald-200",
      };
    default:
      return {
        label: action.replace(/_/g, " "),
        icon: Activity,
        color: "text-[#667085] bg-[#F8F6F1] border-[#DDD8CF]",
      };
  }
}

export default function DeliverableDetailPage() {
  const params = useParams();
  const deliverableId = params?.id as string;

  const [deliverable, setDeliverable] = useState<DeliverableDetail | null>(null);
  const [activeVersionIndex, setActiveVersionIndex] = useState<number>(0);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
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
        const errorData = await res.json().catch(() => ({}));
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
        const errData = await res.json().catch(() => ({}));
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
      <div className="min-h-screen bg-[#F8F6F1] flex flex-col items-center justify-center text-[#667085] gap-3">
        <Loader2 className="w-7 h-7 animate-spin text-[#172B4D]" />
        <p className="text-xs font-mono tracking-wider uppercase">Loading deliverable inspector...</p>
      </div>
    );
  }

  if (errorMessage || !deliverable) {
    return (
      <div className="min-h-screen bg-[#F8F6F1] flex flex-col items-center justify-center p-6 text-[#171A1F]">
        <div className="max-w-md w-full p-6 rounded-2xl bg-white border border-[#DDD8CF] text-center space-y-4 accent-border-top-navy shadow-xl">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
          <h2 className="text-base font-bold text-[#171A1F] tracking-tight">Deliverable Unavailable</h2>
          <p className="text-xs text-[#667085]">{errorMessage || "Record could not be loaded."}</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#172B4D] hover:bg-[#0B1628] text-xs font-semibold text-[#F8F6F1] shadow-sm transition-all"
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
    <div className="min-h-screen bg-[#F8F6F1] text-[#171A1F] flex flex-col select-none font-sans">
      {/* Top Header Bar */}
      <header className="h-16 border-b border-[#DDD8CF] bg-white/90 backdrop-blur-md px-6 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl bg-white hover:bg-[#F8F6F1] border border-[#DDD8CF] text-[#171A1F] transition-colors shadow-xs"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-4 h-4 text-[#172B4D]" />
          </Link>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-sm font-serif font-bold text-[#171A1F] tracking-tight">{deliverable.title}</h1>
              {deliverable.isUnlocked ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <Unlock className="w-3 h-3 text-emerald-600" />
                  <span>Paid &amp; Unlocked</span>
                </span>
              ) : deliverable.status === "APPROVED" ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F8F6F1] text-[#2F6B4F] border border-emerald-300">
                  <CheckCircle2 className="w-3 h-3 text-[#2F6B4F]" />
                  <span>Approved (Locked)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F8F6F1] text-[#172B4D] border border-[#DDD8CF]">
                  <Lock className="w-3 h-3 text-[#172B4D]" />
                  <span>In Review</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#667085]">
              Project: <span className="text-[#171A1F] font-semibold">{deliverable.project.name}</span> &bull; Client: {deliverable.project.clientName}
            </p>
          </div>
        </div>

        {/* Version Switcher & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white border border-[#DDD8CF] p-1 rounded-xl text-xs font-mono shadow-xs">
            {deliverable.versions.map((v, idx) => (
              <button
                key={v.id}
                onClick={() => {
                  setActiveVersionIndex(idx);
                  setSelectedPinId(null);
                }}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeVersionIndex === idx
                    ? "bg-[#172B4D] text-[#F8F6F1] font-bold shadow-xs"
                    : "text-[#667085] hover:text-[#171A1F]"
                }`}
              >
                v{v.versionNumber}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-[#DDD8CF]" />

          <button
            onClick={handleCopyReviewLink}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#F8F6F1] border border-[#DDD8CF] text-xs font-semibold text-[#171A1F] transition-colors shadow-xs"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#172B4D]" />}
            <span>{copiedLink ? "Link Copied" : "Copy Client Link"}</span>
          </button>

          <Link
            href={`/review/${deliverable.reviewToken}`}
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#172B4D] hover:bg-[#0B1628] text-[#F8F6F1] text-xs font-semibold shadow-sm transition-all active:scale-[0.99]"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Launch Client Canvas</span>
          </Link>
        </div>
      </header>

      {/* Main Inspector Interface */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Asset Canvas with Spatial Feedback Pins */}
        <main className="flex-1 bg-[#F5F3EE] p-6 overflow-auto flex items-center justify-center relative">
          {activeVersion && (
            <div className="relative max-w-full max-h-full border border-[#DDD8CF] rounded-xl overflow-hidden shadow-xl bg-white">
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
                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-transform shadow-lg ${
                      comment.isResolved
                        ? "bg-[#2F6B4F] text-white border-2 border-white"
                        : isSelected
                        ? "bg-[#D7C3A5] text-[#0B1628] scale-125 ring-4 ring-[#172B4D]/30"
                        : "bg-[#172B4D] text-[#F8F6F1] border-2 border-white hover:scale-110"
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
        <aside className="w-96 border-l border-[#DDD8CF] bg-white flex flex-col h-[calc(100vh-4rem)] overflow-hidden shrink-0 shadow-xs">
          {/* Tab Selector */}
          <div className="p-2 border-b border-[#DDD8CF] bg-[#F8F6F1] grid grid-cols-2 gap-1">
            <button
              onClick={() => setActiveTab("comments")}
              className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === "comments"
                  ? "bg-white text-[#172B4D] shadow-xs font-bold"
                  : "text-[#667085] hover:text-[#171A1F]"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#172B4D]" />
              <span>Annotations ({rootComments.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("activity")}
              className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === "activity"
                  ? "bg-white text-[#172B4D] shadow-xs font-bold"
                  : "text-[#667085] hover:text-[#171A1F]"
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-[#172B4D]" />
              <span>Telemetry ({activityLogs.length})</span>
            </button>
          </div>

          {activeTab === "comments" ? (
            /* Annotations View */
            <div className="flex-1 flex flex-col overflow-hidden">
              {deliverable.approvalRecord && (
                <div className="p-4 border-b border-[#DDD8CF] bg-[#F8F6F1] space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-semibold text-[10px] uppercase tracking-wider font-mono">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Cryptographic Approval</span>
                  </div>
                  <p className="text-[#171A1F] font-medium">{deliverable.approvalRecord.signerName}</p>
                  <p className="text-[10px] text-[#667085] font-mono">
                    Hash: {deliverable.approvalRecord.signatureHash.substring(0, 18)}...
                  </p>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {rootComments.length === 0 ? (
                  <div className="h-48 flex flex-col items-center justify-center text-center text-[#667085] space-y-2">
                    <Clock className="w-6 h-6 text-[#DDD8CF]" />
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
                            ? "bg-[#F8F6F1] border-[#172B4D] shadow-xs ring-1 ring-[#D7C3A5]"
                            : "bg-white border-[#DDD8CF] hover:border-[#D7C3A5]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#172B4D] text-[#F8F6F1] font-mono font-bold text-[10px] flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-semibold text-[#171A1F]">
                              {rootComment.authorName}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#F8F6F1] text-[#172B4D] border border-[#DDD8CF]">
                              CLIENT
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-[#667085]">
                            {new Date(rootComment.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <p className="text-xs text-[#171A1F]/90 leading-relaxed pl-7">
                          {rootComment.content}
                        </p>

                        {replies.length > 0 && (
                          <div className="pl-7 space-y-2 border-l border-[#DDD8CF] ml-2.5">
                            {replies.map((reply) => (
                              <div
                                key={reply.id}
                                className="p-2.5 rounded-lg bg-[#F8F6F1] border border-[#DDD8CF] space-y-1"
                              >
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-semibold text-[#171A1F]">{reply.authorName}</span>
                                  <span className="text-[9px] font-mono text-[#667085]">
                                    {new Date(reply.createdAt).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                                <p className="text-xs text-[#171A1F]/80">{reply.content}</p>
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
                            className="flex-1 px-3 py-1.5 rounded-lg bg-[#F8F6F1] border border-[#DDD8CF] text-xs text-[#171A1F] placeholder:text-[#667085] focus:outline-none focus:border-[#172B4D] transition-colors"
                          />
                          <button
                            onClick={() => handleSendReply(rootComment.id)}
                            disabled={isSubmittingReply || !replyText[rootComment.id]?.trim()}
                            className="p-1.5 rounded-lg bg-[#172B4D] text-[#F8F6F1] hover:bg-[#0B1628] disabled:opacity-30 transition-all font-bold shadow-xs"
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
              <div className="p-3 border-b border-[#DDD8CF] flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#667085] uppercase">
                  Zero-Auth Access Trail
                </span>
                <button
                  onClick={fetchActivityLogs}
                  disabled={isLoadingLogs}
                  className="p-1.5 rounded-md hover:bg-[#F8F6F1] text-[#667085] hover:text-[#171A1F] transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#172B4D] ${isLoadingLogs ? "animate-spin" : ""}`} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activityLogs.length === 0 ? (
                  <div className="h-48 flex flex-col items-center justify-center text-center text-[#667085] space-y-2">
                    <Clock className="w-6 h-6 text-[#DDD8CF]" />
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
                        className="p-3 rounded-xl bg-white border border-[#DDD8CF] space-y-2 text-xs shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${meta.color}`}
                          >
                            {meta.label}
                          </span>
                          <span className="text-[10px] font-mono text-[#667085]">
                            {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>

                        <div className="space-y-1 text-[11px] font-mono text-[#667085]">
                          <div className="flex items-center gap-1.5">
                            {device.isMobile ? (
                              <Smartphone className="w-3.5 h-3.5 text-[#667085]" />
                            ) : (
                              <Laptop className="w-3.5 h-3.5 text-[#667085]" />
                            )}
                            <span>
                              {device.browser} &bull; {device.os}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[#667085]">
                            <Globe className="w-3.5 h-3.5" />
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
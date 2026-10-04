// filepath: src/app/(client)/review/[token]/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import { ReviewHeader } from "@/components/review/ReviewHeader";
import { CommentSidebar } from "@/components/review/CommentSidebar";
import { ApprovalModal } from "@/components/review/ApprovalModal";
import { VersionItem, CommentItem, DeliverableReviewData } from "@/types/review";
import {
  MessageSquare,
  MousePointer,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";

const ProofingCanvas = dynamic(
  () => import("@/components/canvas/ProofingCanvas"),
  { ssr: false }
);

interface ClientReviewPageProps {
  params: {
    token: string;
  };
}

export default function ClientReviewPage({ params }: ClientReviewPageProps) {
  const { token } = params;
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [deliverable, setDeliverable] = useState<DeliverableReviewData | null>(null);
  const [activeVersion, setActiveVersion] = useState<VersionItem | null>(null);
  const [compareVersion, setCompareVersion] = useState<VersionItem | null>(null);
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [isPinModeActive, setIsPinModeActive] = useState<boolean>(false);
  const [showPinsInPaidMode, setShowPinsInPaidMode] = useState<boolean>(false);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const [pendingPin, setPendingPin] = useState<{ xPercent: number; yPercent: number } | null>(null);
  const [isMobileCommentsOpen, setIsMobileCommentsOpen] = useState<boolean>(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState<boolean>(false);
  const paymentVerifiedRef = useRef<string | null>(null);

  // Load deliverable state with resilient payload extraction
  const loadDeliverable = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const res = await fetch(`/api/review/${encodeURIComponent(token)}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to load proofing deliverable.");
      }

      const raw = await res.json();
      const data = raw.deliverable ?? raw;

      const rawVersions = Array.isArray(data.versions) ? data.versions : [];
      if (rawVersions.length === 0) {
        throw new Error("No reviewable asset versions exist for this deliverable.");
      }

      const sanitizedVersions: VersionItem[] = rawVersions.map((v: Record<string, unknown>) => ({
        id: String(v.id || ""),
        versionNumber: typeof v.versionNumber === "number" ? v.versionNumber : 1,
        fileName: typeof v.fileName === "string" ? v.fileName : "master-file",
        fileSize: typeof v.fileSize === "number" ? v.fileSize : 0,
        mimeType: typeof v.mimeType === "string" ? v.mimeType : "image/png",
        previewUrl: typeof v.previewUrl === "string" ? v.previewUrl : "",
        fallbackPreviewUrl: typeof v.fallbackPreviewUrl === "string" ? v.fallbackPreviewUrl : undefined,
        cleanDownloadUrl: typeof v.cleanDownloadUrl === "string" ? v.cleanDownloadUrl : null,
        width: typeof v.width === "number" ? v.width : 1600,
        height: typeof v.height === "number" ? v.height : 1000,
        changeLog: typeof v.changeLog === "string" ? v.changeLog : undefined,
        createdAt: typeof v.createdAt === "string" ? v.createdAt : new Date().toISOString(),
        comments: Array.isArray(v.comments)
          ? v.comments.map((c: Record<string, unknown>) => ({
              id: String(c.id || ""),
              versionId: String(c.versionId || v.id || ""),
              authorType: (c.authorType as "CLIENT" | "AGENCY") || "CLIENT",
              authorName: typeof c.authorName === "string" ? c.authorName : "Reviewer",
              authorEmail: typeof c.authorEmail === "string" ? c.authorEmail : undefined,
              content: typeof c.content === "string" ? c.content : "",
              xPercent: typeof c.xPercent === "number" ? c.xPercent : 0,
              yPercent: typeof c.yPercent === "number" ? c.yPercent : 0,
              isResolved: Boolean(c.isResolved),
              createdAt: typeof c.createdAt === "string" ? c.createdAt : new Date().toISOString(),
            }))
          : [],
      }));

      const mappedData: DeliverableReviewData = {
        id: data.id,
        title: data.title || "Untitled Deliverable",
        description: data.description ?? null,
        projectName: data.projectName || data.project?.name || "General Deliverables",
        agencyName:
          data.agencyName ||
          data.agency?.name ||
          data.project?.agency?.name ||
          "Studio Monolith",
        fileType: data.fileType || "PNG",
        status: data.status || "IN_REVIEW",
        isUnlocked: Boolean(data.isUnlocked),
        reviewToken: data.reviewToken || token,
        invoiceAmountCents:
          typeof data.invoiceAmountCents === "number"
            ? data.invoiceAmountCents
            : data.invoice?.amount || 0,
        currency: data.currency || data.invoice?.currency || "usd",
        versions: sanitizedVersions,
      };

      setDeliverable(mappedData);

      // Default active version to the latest version
      const latestVersion = sanitizedVersions[sanitizedVersions.length - 1];
      setActiveVersion(latestVersion);

      // Default compare version to immediate predecessor (e.g. v2 compares against v1)
      if (sanitizedVersions.length > 1) {
        const predecessor = [...sanitizedVersions]
          .reverse()
          .find((v) => v.versionNumber < latestVersion.versionNumber);
        setCompareVersion(predecessor || sanitizedVersions[0]);
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Deliverable could not be retrieved."
      );
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Handle return from Stripe Checkout
  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      if (!paymentVerifiedRef.current) {
        loadDeliverable();
      }
      return;
    }

    if (paymentVerifiedRef.current === sessionId) return;
    paymentVerifiedRef.current = sessionId;

    const confirmPayment = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(
          `/api/review/${encodeURIComponent(token)}/confirm-payment`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
          }
        );

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Payment verification failed.");
        }

        router.replace(`/review/${token}`);
        await loadDeliverable();
      } catch (err: unknown) {
        setErrorMessage(
          err instanceof Error ? err.message : "Payment confirmation failed."
        );
        setIsLoading(false);
      }
    };

    confirmPayment();
  }, [token, searchParams, router, loadDeliverable]);

  // Asset Protection: Block Right-Click & Print/Save Commands
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "s" || e.key === "p" || e.key === "u")
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#F8F6F1] text-[#667085] gap-3 select-none">
        <Loader2 className="w-7 h-7 animate-spin text-[#172B4D]" />
        <p className="text-xs font-mono text-[#667085] tracking-wide uppercase">
          Syncing proofing vault &amp; escrow status...
        </p>
      </div>
    );
  }

  if (errorMessage || !deliverable || !activeVersion) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#F8F6F1] text-[#171A1F] p-6 select-none font-sans">
        <div className="max-w-md w-full p-6 rounded-2xl bg-white border border-[#DDD8CF] text-center space-y-4 accent-border-top-navy shadow-xl">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-serif font-bold text-[#171A1F] tracking-tight">Deliverable Unavailable</h2>
          <p className="text-xs text-[#667085] leading-relaxed">
            {errorMessage || "The review link may have expired or is invalid."}
          </p>
          <button
            onClick={loadDeliverable}
            className="px-4 py-2 rounded-xl bg-[#172B4D] hover:bg-[#0B1628] text-[#F8F6F1] text-xs font-semibold transition-all shadow-sm"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const handleToggleUnlockedState = () => {
    const nextUnlocked = !deliverable.isUnlocked;
    setDeliverable((prev) =>
      prev
        ? {
            ...prev,
            isUnlocked: nextUnlocked,
            status: nextUnlocked ? "COMPLETED" : "IN_REVIEW",
          }
        : null
    );
    setIsPinModeActive(false);
    setPendingPin(null);
  };

  const handleAddCommentPin = (xPercent: number, yPercent: number) => {
    if (deliverable.isUnlocked) return;
    setPendingPin({ xPercent, yPercent });
    setIsPinModeActive(false);
    setIsMobileCommentsOpen(true);
  };

  const handleSubmitComment = async (content: string, authorName: string) => {
    if (!pendingPin || deliverable.isUnlocked || !activeVersion) return;

    try {
      const response = await fetch(
        `/api/review/${encodeURIComponent(token)}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            versionId: activeVersion.id,
            content,
            authorName,
            xPercent: pendingPin.xPercent,
            yPercent: pendingPin.yPercent,
          }),
        }
      );

      if (!response.ok) {
        const errPayload = await response.json().catch(() => ({}));
        throw new Error(errPayload.error || "Failed to save comment.");
      }

      const data = await response.json();
      const savedComment: CommentItem = data.comment;

      const updatedVersions = deliverable.versions.map((ver) => {
        if (ver.id === activeVersion.id) {
          return { ...ver, comments: [...ver.comments, savedComment] };
        }
        return ver;
      });

      setDeliverable({ ...deliverable, versions: updatedVersions });
      setActiveVersion({
        ...activeVersion,
        comments: [...activeVersion.comments, savedComment],
      });
      setPendingPin(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Could not save pin to database.");
    }
  };

  const handleToggleResolve = async (commentId: string) => {
    if (!activeVersion) return;

    const targetComment = activeVersion.comments.find((c) => c.id === commentId);
    if (!targetComment) return;

    const nextState = !targetComment.isResolved;

    const updatedVersions = deliverable.versions.map((ver) => {
      if (ver.id === activeVersion.id) {
        const updatedComments = ver.comments.map((c) =>
          c.id === commentId ? { ...c, isResolved: nextState } : c
        );
        return { ...ver, comments: updatedComments };
      }
      return ver;
    });

    setDeliverable({ ...deliverable, versions: updatedVersions });
    setActiveVersion({
      ...activeVersion,
      comments: activeVersion.comments.map((c) =>
        c.id === commentId ? { ...c, isResolved: nextState } : c
      ),
    });

    try {
      const res = await fetch(
        `/api/review/${encodeURIComponent(token)}/comments/${commentId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isResolved: nextState }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to persist resolution state to database.");
      }
    } catch (err: unknown) {
      console.error(err);
      loadDeliverable();
    }
  };

  const handleConfirmApproval = async (
    signerName: string,
    signerEmail: string,
    consent: boolean = true
  ) => {
    if (!activeVersion || !consent) {
      throw new Error("Missing active deliverable version or legal consent.");
    }

    const legalText = `I, ${signerName}, hereby confirm that I have reviewed version ${activeVersion.versionNumber} of this deliverable and grant final approval for production release subject to agreed payment terms.`;

    const approveRes = await fetch(
      `/api/review/${encodeURIComponent(token)}/approve`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approvedVersion: activeVersion.versionNumber,
          signerName,
          signerEmail,
          legalConsent: legalText,
        }),
      }
    );

    if (!approveRes.ok && approveRes.status !== 409) {
      const errPayload = await approveRes.json().catch(() => ({}));
      throw new Error(errPayload.error || "Failed to commit legal approval record.");
    }

    const checkoutRes = await fetch(
      `/api/review/${encodeURIComponent(token)}/checkout`,
      {
        method: "POST",
      }
    );

    if (!checkoutRes.ok) {
      const errPayload = await checkoutRes.json().catch(() => ({}));
      throw new Error(errPayload.error || "Failed to initialize Stripe payment session.");
    }

    const { checkoutUrl } = await checkoutRes.json();

    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    } else {
      throw new Error("Stripe checkout URL was not generated.");
    }
  };

  const handleDownloadCleanFile = async () => {
    if (!deliverable.isUnlocked) {
      alert("Payment required: Final clean master assets remain locked until escrow settles.");
      return;
    }

    try {
      const versionParam = activeVersion ? `?version=${activeVersion.versionNumber}&format=json` : "?format=json";
      const res = await fetch(`/api/review/${deliverable.reviewToken}/download${versionParam}`);

      if (!res.ok) {
        const errorPayload = await res.json().catch(() => ({}));
        throw new Error(errorPayload.error || "Failed to authorize master asset download.");
      }

      const { downloadUrl } = await res.json();
      if (downloadUrl) {
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.setAttribute("download", "");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Download failed.";
      alert(msg);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#F8F6F1] text-[#171A1F] overflow-hidden select-none font-sans">
      <ReviewHeader
        deliverable={deliverable}
        activeVersion={activeVersion}
        isCompareMode={isCompareMode}
        onToggleCompareMode={() => {
          const next = !isCompareMode;
          setIsCompareMode(next);
          setIsPinModeActive(false);
          setPendingPin(null);

          if (next && deliverable && activeVersion) {
            if (!compareVersion || compareVersion.id === activeVersion.id) {
              const predecessor = deliverable.versions
                .filter((v) => v.id !== activeVersion.id)
                .sort((a, b) => b.versionNumber - a.versionNumber)
                .find((v) => v.versionNumber < activeVersion.versionNumber);
              const fallback = deliverable.versions.find((v) => v.id !== activeVersion.id);
              setCompareVersion(predecessor || fallback || null);
            }
          }
        }}
        onSelectVersion={(v) => {
          setActiveVersion(v);
          setIsCompareMode(false);
          setSelectedCommentId(null);
          setPendingPin(null);

          if (deliverable) {
            const predecessor = deliverable.versions
              .filter((cand) => cand.id !== v.id)
              .sort((a, b) => b.versionNumber - a.versionNumber)
              .find((cand) => cand.versionNumber < v.versionNumber);
            const fallback = deliverable.versions.find((cand) => cand.id !== v.id);
            setCompareVersion(predecessor || fallback || null);
          }
        }}
        onOpenApprovalModal={() => setIsApprovalModalOpen(true)}
        onToggleUnlockedState={handleToggleUnlockedState}
        onDownloadCleanFile={handleDownloadCleanFile}
      />

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 relative bg-[#F5F3EE] flex flex-col items-center justify-center overflow-hidden">
          {/* Standard HUD */}
          {!isCompareMode && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 p-1.5 rounded-xl bg-white/95 border border-[#DDD8CF] backdrop-blur-md shadow-xl text-xs max-w-[calc(100vw-2rem)] overflow-x-auto">
              {deliverable.isUnlocked ? (
                <>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Approved &amp; Unlocked</span>
                  </div>
                  <div className="h-4 w-px bg-[#DDD8CF]" />
                  <button
                    onClick={() => setShowPinsInPaidMode(!showPinsInPaidMode)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      showPinsInPaidMode
                        ? "bg-[#F8F6F1] text-[#172B4D]"
                        : "text-[#667085] hover:text-[#171A1F]"
                    }`}
                  >
                    {showPinsInPaidMode ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {showPinsInPaidMode
                        ? "Hide Pins"
                        : `Show Pins (${(activeVersion.comments || []).length})`}
                    </span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsPinModeActive(false);
                      setPendingPin(null);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      !isPinModeActive
                        ? "bg-[#F8F6F1] text-[#171A1F] shadow-xs font-bold"
                        : "text-[#667085] hover:text-[#171A1F]"
                    }`}
                  >
                    <MousePointer className="w-3.5 h-3.5" />
                    <span>Select</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsPinModeActive(!isPinModeActive);
                      setSelectedCommentId(null);
                      if (isPinModeActive) setPendingPin(null);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isPinModeActive
                        ? "bg-[#172B4D] text-[#F8F6F1] shadow-xs ring-1 ring-[#D7C3A5]"
                        : "text-[#667085] hover:text-[#171A1F] hover:bg-[#F8F6F1]"
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{isPinModeActive ? "Click canvas to place" : `Drop Pin (${(activeVersion.comments || []).length})`}</span>
                  </button>
                </>
              )}
            </div>
          )}

          <ProofingCanvas
            version={activeVersion}
            compareVersion={compareVersion || undefined}
            allVersions={deliverable.versions}
            isCompareMode={isCompareMode}
            isUnlocked={deliverable.isUnlocked}
            showPins={showPinsInPaidMode}
            isPinModeActive={isPinModeActive}
            selectedCommentId={selectedCommentId}
            pendingPin={pendingPin}
            onSelectComment={(id) => {
              setSelectedCommentId(id);
              if (id) setIsMobileCommentsOpen(true);
            }}
            onAddCommentPin={handleAddCommentPin}
            onSelectCompareVersion={(ver) => setCompareVersion(ver)}
          />

          {/* Mobile Floating Comments Button */}
          <button
            onClick={() => setIsMobileCommentsOpen(true)}
            className="lg:hidden absolute bottom-4 right-4 z-20 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-[#172B4D] text-[#F8F6F1] shadow-2xl hover:bg-[#0B1628] active:scale-95 transition-all text-xs font-semibold ring-2 ring-white/60"
            aria-label="View comments"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#D7C3A5]" />
            <span>Pins ({(activeVersion.comments || []).length})</span>
            {pendingPin && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>
        </main>

        {/* Desktop Sidebar */}
        <div className="hidden lg:flex shrink-0">
          <CommentSidebar
            comments={activeVersion.comments || []}
            selectedCommentId={selectedCommentId}
            pendingPin={pendingPin}
            onSelectComment={setSelectedCommentId}
            onSubmitComment={handleSubmitComment}
            onCancelPendingPin={() => setPendingPin(null)}
            onToggleResolve={handleToggleResolve}
          />
        </div>
      </div>

      {/* Mobile Slide-Over Drawer */}
      {isMobileCommentsOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileCommentsOpen(false)}
          />
          {/* Drawer content */}
          <div className="relative w-full max-w-sm h-full z-10 flex flex-col shadow-2xl bg-white animate-in slide-in-from-right duration-200">
            <CommentSidebar
              comments={activeVersion.comments || []}
              selectedCommentId={selectedCommentId}
              pendingPin={pendingPin}
              onSelectComment={setSelectedCommentId}
              onSubmitComment={handleSubmitComment}
              onCancelPendingPin={() => setPendingPin(null)}
              onToggleResolve={handleToggleResolve}
              onClose={() => setIsMobileCommentsOpen(false)}
            />
          </div>
        </div>
      )}

      <ApprovalModal
        isOpen={isApprovalModalOpen}
        deliverable={deliverable}
        version={activeVersion}
        onClose={() => setIsApprovalModalOpen(false)}
        onConfirmApproval={handleConfirmApproval}
      />
    </div>
  );
}
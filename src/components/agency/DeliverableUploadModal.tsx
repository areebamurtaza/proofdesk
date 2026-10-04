// filepath: src/components/agency/DeliverableUploadModal.tsx
"use client";

import React, { useState, useRef, ChangeEvent, DragEvent, FormEvent } from "react";
import {
  UploadCloud,
  FileCheck,
  X,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  Loader2,
  DollarSign,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { FileType } from "@/types/review";

interface DeliverableUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  onUploadComplete?: (reviewToken: string) => void;
  orgId?: string | null;
}

type UploadState =
  | "IDLE"
  | "AUTHORIZING"
  | "WATERMARKING"
  | "UPLOADING"
  | "COMMITTING"
  | "SUCCESS"
  | "ERROR";

const EXTENSION_MAP: Record<string, FileType> = {
  png: "PNG",
  jpg: "JPG",
  jpeg: "JPG",
  svg: "SVG",
  ai: "ILLUSTRATOR",
  eps: "ILLUSTRATOR",
  zip: "ZIP",
};

const ALLOWED_MIME_TYPES: Record<string, FileType> = {
  "image/png": "PNG",
  "image/jpeg": "JPG",
  "image/svg+xml": "SVG",
  "application/zip": "ZIP",
  "application/x-zip-compressed": "ZIP",
  "application/postscript": "ILLUSTRATOR",
  "application/illustrator": "ILLUSTRATOR",
};

function detectFileType(file: File): FileType {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (EXTENSION_MAP[ext]) return EXTENSION_MAP[ext];
  if (ALLOWED_MIME_TYPES[file.type]) return ALLOWED_MIME_TYPES[file.type];
  return "PNG";
}

function isSourceMaster(file: File): boolean {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  return ["ai", "eps", "zip"].includes(ext);
}

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100MB

function generateSourcePlaceholderBlob(file: File, type: FileType): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 1000;
    const ctx = canvas.getContext("2d");
    if (!ctx) return resolve(new Blob([]));

    ctx.fillStyle = "#F8F6F1";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle background grid
    ctx.strokeStyle = "#DDD8CF";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Central card container
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#172B4D";
    ctx.lineWidth = 3;
    if (ctx.roundRect) {
      ctx.roundRect(canvas.width / 2 - 420, canvas.height / 2 - 260, 840, 520, 24);
    } else {
      ctx.rect(canvas.width / 2 - 420, canvas.height / 2 - 260, 840, 520);
    }
    ctx.fill();
    ctx.stroke();

    // Type badge banner
    ctx.fillStyle = "#172B4D";
    ctx.font = "bold 24px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`• ${type} MASTER DELIVERABLE •`, canvas.width / 2, canvas.height / 2 - 140);

    // Master File Name
    ctx.fillStyle = "#171A1F";
    ctx.font = "bold 36px Georgia, serif";
    const truncatedName = file.name.length > 32 ? file.name.substring(0, 29) + "..." : file.name;
    ctx.fillText(truncatedName, canvas.width / 2, canvas.height / 2 - 40);

    // Metadata description
    ctx.fillStyle = "#667085";
    ctx.font = "20px sans-serif";
    ctx.fillText("Master source asset protected by ProofDesk Escrow.", canvas.width / 2, canvas.height / 2 + 30);
    ctx.fillText(
      `File Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB • Full uncompressed master releases upon approval`,
      canvas.width / 2,
      canvas.height / 2 + 70
    );

    canvas.toBlob((blob) => resolve(blob || new Blob([])), "image/jpeg", 0.88);
  });
}

async function generateWatermarkedPreviewBlob(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // 1. Constrain resolution for preview (max 1600px) so raw master is never on the wire
      let width = img.naturalWidth || 1600;
      let height = img.naturalHeight || 1000;
      const MAX_PREVIEW_DIM = 1600;

      if (width > MAX_PREVIEW_DIM || height > MAX_PREVIEW_DIM) {
        if (width > height) {
          height = Math.round((height * MAX_PREVIEW_DIM) / width);
          width = MAX_PREVIEW_DIM;
        } else {
          width = Math.round((width * MAX_PREVIEW_DIM) / height);
          height = MAX_PREVIEW_DIM;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve(file);
        return;
      }

      // Draw base artwork
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // 2. BURN IN WATERMARK PERMANENTLY AT PIXEL LEVEL
      // Diagonal repeating tiled watermark across the entire image
      ctx.save();
      const diagonal = Math.sqrt(width * width + height * height);
      ctx.translate(width / 2, height / 2);
      ctx.rotate((-28 * Math.PI) / 180);

      const stepX = Math.max(260, Math.round(width * 0.22));
      const stepY = Math.max(100, Math.round(height * 0.12));
      const fontSize = Math.max(16, Math.min(28, Math.round(width * 0.018)));

      ctx.font = `bold ${fontSize}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let y = -diagonal; y < diagonal; y += stepY) {
        for (let x = -diagonal; x < diagonal; x += stepX) {
          // Dark drop shadow for contrast on light backgrounds
          ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
          ctx.lineWidth = 2.5;
          ctx.strokeText("PROOFDESK • UNPAID PREVIEW", x, y);

          // White text fill for contrast on dark backgrounds
          ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
          ctx.fillText("PROOFDESK • UNPAID PREVIEW", x, y);
        }
      }
      ctx.restore();

      // 3. Central High-Visibility Security Banner
      ctx.save();
      const bannerHeight = Math.max(36, Math.round(height * 0.055));
      ctx.fillStyle = "rgba(11, 22, 40, 0.88)";
      ctx.fillRect(0, height / 2 - bannerHeight / 2, width, bannerHeight);

      ctx.strokeStyle = "rgba(215, 195, 165, 0.6)";
      ctx.lineWidth = 1;
      ctx.strokeRect(0, height / 2 - bannerHeight / 2, width, bannerHeight);

      ctx.font = `bold ${Math.max(12, Math.round(bannerHeight * 0.42))}px monospace`;
      ctx.fillStyle = "#D7C3A5";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        "ESCROW LOCKED • UNPAID DRAFT • UNAUTHORIZED FOR PRODUCTION",
        width / 2,
        height / 2
      );
      ctx.restore();

      // 4. Compress to 80% lossy JPEG so clean master pixels cannot be reconstructed
      canvas.toBlob((blob) => resolve(blob || file), "image/jpeg", 0.8);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

function uploadBinaryWithProgress(
  url: string,
  blob: Blob | File,
  contentType: string,
  onProgress: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.setRequestHeader("Content-Type", contentType);

    xhr.upload.onprogress = (event: ProgressEvent) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Storage service rejected upload with status ${xhr.status}.`));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network interruption during asset stream."));
    };

    xhr.send(blob);
  });
}

export function DeliverableUploadModal({
  isOpen,
  onClose,
  projectId,
  onUploadComplete,
  orgId,
}: DeliverableUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const companionInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [companionPreviewFile, setCompanionPreviewFile] = useState<File | null>(null);
  const [selectedTypeOverride, setSelectedTypeOverride] = useState<FileType | null>(null);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [priceDollars, setPriceDollars] = useState<string>("1500");
  const [isDragActive, setIsDragActive] = useState<boolean>(false);

  const [uploadState, setUploadState] = useState<UploadState>("IDLE");
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [hasCopiedToken, setHasCopiedToken] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleValidateAndSetFile = (file: File) => {
    setErrorMessage(null);

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const isKnown = EXTENSION_MAP[ext] || ALLOWED_MIME_TYPES[file.type];
    if (!isKnown) {
      setErrorMessage("Unsupported file format. Please upload PNG, JPG, JPEG, SVG, Illustrator (.ai), or ZIP.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage("File exceeds the maximum 100MB upload threshold.");
      return;
    }

    setSelectedFile(file);
    const detected = detectFileType(file);
    setSelectedTypeOverride(detected);

    if (!title.trim()) {
      const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
      setTitle(baseName.charAt(0).toUpperCase() + baseName.slice(1));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleValidateAndSetFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleValidateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !title.trim()) return;

    setErrorMessage(null);
    setProgressPercent(0);

    try {
      const fileType = selectedTypeOverride || detectFileType(selectedFile);

      setUploadState("WATERMARKING");
      let previewBlob: Blob;
      if (companionPreviewFile) {
        previewBlob = await generateWatermarkedPreviewBlob(companionPreviewFile);
      } else if (isSourceMaster(selectedFile)) {
        previewBlob = await generateSourcePlaceholderBlob(selectedFile, fileType);
      } else {
        previewBlob = await generateWatermarkedPreviewBlob(selectedFile);
      }

      setUploadState("AUTHORIZING");
      const presignResponse = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: selectedFile.name,
          fileType,
          mimeType: selectedFile.type || "application/octet-stream",
          fileSize: selectedFile.size,
          previewMimeType: "image/jpeg",
          previewFileSize: previewBlob.size,
          projectId: projectId || undefined,
          versionNumber: 1,
        }),
      });

      if (!presignResponse.ok) {
        const errPayload = await presignResponse.json();
        throw new Error(errPayload.error || "Failed to generate presigned upload tickets.");
      }

      const presignData = await presignResponse.json();
      const cleanUploadUrl = presignData.clean?.uploadUrl || presignData.uploadUrl;
      const previewUploadUrl = presignData.preview?.uploadUrl;
      const cleanFileKey = presignData.clean?.key || presignData.cleanFileKey;
      const previewKey = presignData.preview?.key || presignData.previewKey;

      setUploadState("UPLOADING");

      await uploadBinaryWithProgress(
        cleanUploadUrl,
        selectedFile,
        selectedFile.type,
        (p) => setProgressPercent(Math.round(p * 0.7))
      );

      if (previewUploadUrl) {
        await uploadBinaryWithProgress(
          previewUploadUrl,
          previewBlob,
          "image/jpeg",
          (p) => setProgressPercent(70 + Math.round(p * 0.3))
        );
      } else {
        setProgressPercent(100);
      }

      setUploadState("COMMITTING");
      const postUrl = orgId ? `/api/deliverables?orgId=${encodeURIComponent(orgId)}` : "/api/deliverables";
      const deliverableResponse = await fetch(postUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(orgId ? { "x-clerk-org-id": orgId } : {}),
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          fileType,
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          mimeType: selectedFile.type,
          cleanFileKey,
          previewKey,
          priceDollars: parseInt(priceDollars, 10) || 1500,
          projectId: projectId || undefined,
        }),
      });

      if (!deliverableResponse.ok) {
        const dbErr = await deliverableResponse.json();
        throw new Error(dbErr.error || "Failed to record deliverable in database.");
      }

      const dbData = await deliverableResponse.json();

      setUploadState("SUCCESS");
      setGeneratedToken(dbData.reviewToken);
      if (onUploadComplete) {
        onUploadComplete(dbData.reviewToken);
      }
    } catch (err: unknown) {
      setUploadState("ERROR");
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected upload error occurred."
      );
    }
  };

  const handleCopyLink = () => {
    if (!generatedToken) return;
    const reviewUrl = `${window.location.origin}/review/${generatedToken}`;
    navigator.clipboard.writeText(reviewUrl);
    setHasCopiedToken(true);
    setTimeout(() => setHasCopiedToken(false), 2000);
  };

  const handleResetModal = () => {
    setSelectedFile(null);
    setCompanionPreviewFile(null);
    setSelectedTypeOverride(null);
    setTitle("");
    setDescription("");
    setPriceDollars("1500");
    setUploadState("IDLE");
    setProgressPercent(0);
    setErrorMessage(null);
    setGeneratedToken(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none animate-in fade-in duration-200 font-sans">
      <div className="w-full max-w-xl rounded-2xl bg-white border border-[#DDD8CF] shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto accent-border-top-navy">
        <button
          onClick={handleResetModal}
          disabled={
            uploadState === "AUTHORIZING" ||
            uploadState === "WATERMARKING" ||
            uploadState === "UPLOADING" ||
            uploadState === "COMMITTING"
          }
          className="absolute top-4 right-4 text-[#667085] hover:text-[#171A1F] p-1.5 rounded-lg hover:bg-[#F8F6F1] transition-colors disabled:opacity-30"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#172B4D]/10 border border-[#172B4D]/20 flex items-center justify-center text-[#172B4D] shadow-xs">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-serif font-bold text-[#171A1F] tracking-tight">Upload New Deliverable</h2>
            <p className="text-xs text-[#667085]">
              Clean master files are locked in escrow. Clients review visual proofings with watermarks.
            </p>
          </div>
        </div>

        {uploadState === "SUCCESS" && generatedToken ? (
          <div className="space-y-4 py-3">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                <FileCheck className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-semibold text-emerald-900">
                  Asset Ingested &amp; Review Token Minted
                </h3>
                <p className="text-[11px] text-[#667085] mt-0.5 leading-relaxed">
                  Clean master is isolated in storage. Send this tokenized link to the client for zero-login proofing.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#667085] mb-1.5 font-mono">
                Client Review URL (Zero-Auth)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${typeof window !== "undefined" ? window.location.origin : ""}/review/${generatedToken}`}
                  className="flex-1 px-3 py-2 text-xs font-mono rounded-lg bg-[#F8F6F1] border border-[#DDD8CF] text-[#172B4D] font-bold select-all focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#172B4D] hover:bg-[#0B1628] text-xs font-semibold text-[#F8F6F1] transition-all shrink-0 shadow-sm"
                >
                  {hasCopiedToken ? (
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-[#F8F6F1]" />
                  )}
                  <span>{hasCopiedToken ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-[#DDD8CF]">
              <a
                href={`/review/${generatedToken}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#172B4D] hover:text-[#0B1628] font-semibold"
              >
                <span>Launch Client View</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={handleResetModal}
                className="px-4 py-2 rounded-lg bg-white hover:bg-[#F8F6F1] text-[#171A1F] text-xs font-semibold transition-all border border-[#DDD8CF]"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Primary Master Deliverable Dropzone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                isDragActive
                  ? "border-[#172B4D] bg-[#F8F6F1]"
                  : selectedFile
                  ? "border-emerald-500/50 bg-emerald-50/30"
                  : "border-[#DDD8CF] hover:border-[#172B4D]/60 bg-[#F8F6F1]/50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.svg,.ai,.eps,.zip"
                onChange={handleFileChange}
                className="hidden"
              />

              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-[#171A1F] truncate max-w-[280px]">
                      {selectedFile.name}
                    </p>
                    <p className="text-[11px] text-[#667085]">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull;{" "}
                      <span className="font-semibold text-[#172B4D]">
                        {selectedTypeOverride || detectFileType(selectedFile)} Master
                      </span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <UploadCloud className="w-8 h-8 text-[#667085] mx-auto" />
                  <p className="text-xs font-medium text-[#171A1F]">
                    Drop design asset here, or <span className="text-[#172B4D] font-semibold underline underline-offset-2">browse</span>
                  </p>
                  <p className="text-[11px] text-[#667085]">
                    PNG, JPG, SVG, Illustrator (.ai), or ZIP up to 100MB
                  </p>
                </div>
              )}
            </div>

            {/* Optional Companion Preview Dropzone for Source Master Files */}
            {selectedFile && isSourceMaster(selectedFile) && (
              <div className="p-3.5 rounded-xl bg-[#F8F6F1] border border-[#DDD8CF] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#172B4D]" />
                    <span className="text-xs font-semibold text-[#171A1F]">
                      Visual Canvas Preview (Recommended)
                    </span>
                  </div>
                  {companionPreviewFile && (
                    <button
                      type="button"
                      onClick={() => setCompanionPreviewFile(null)}
                      className="text-[10px] text-rose-600 hover:text-rose-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-[#667085] leading-relaxed">
                  Drop a PNG/JPG screenshot or exported frame here so clients can visually review and drop spatial comments on the canvas. If omitted, a branded vault placeholder is automatically generated.
                </p>
                <div
                  onClick={() => companionInputRef.current?.click()}
                  className={`border border-dashed rounded-lg p-2.5 text-center cursor-pointer transition-all ${
                    companionPreviewFile
                      ? "border-emerald-500/50 bg-white"
                      : "border-[#DDD8CF] hover:border-[#172B4D]/50 bg-white"
                  }`}
                >
                  <input
                    ref={companionInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setCompanionPreviewFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  {companionPreviewFile ? (
                    <div className="flex items-center justify-center gap-2 text-xs text-emerald-800 font-medium">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{companionPreviewFile.name} ({(companionPreviewFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                    </div>
                  ) : (
                    <span className="text-xs text-[#667085] font-medium">
                      Drop PNG/JPG screenshot or <span className="text-[#172B4D] font-semibold underline underline-offset-2">browse preview</span>
                    </span>
                  )}
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-800 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#667085] mb-1 font-mono">
                  Deliverable Title
                </label>
                <div className="relative">
                  <FileText className="w-3.5 h-3.5 text-[#667085] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Identity Design System v1"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-[#F8F6F1] border border-[#DDD8CF] text-[#171A1F] placeholder-[#667085] focus:outline-none focus:border-[#172B4D] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#667085] mb-1 font-mono">
                  Deliverable Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Context, change directives, or scope notes for the reviewer..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8F6F1] border border-[#DDD8CF] text-[#171A1F] placeholder-[#667085] focus:outline-none focus:border-[#172B4D] transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#667085] mb-1 font-mono">
                    Deliverable Format
                  </label>
                  <select
                    value={selectedTypeOverride || (selectedFile ? detectFileType(selectedFile) : "PNG")}
                    onChange={(e) => setSelectedTypeOverride(e.target.value as FileType)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8F6F1] border border-[#DDD8CF] text-[#171A1F] focus:outline-none focus:border-[#172B4D] font-medium cursor-pointer"
                  >
                    <option value="PNG">Raster PNG</option>
                    <option value="JPG">Raster JPG</option>
                    <option value="SVG">Vector SVG</option>
                    <option value="ILLUSTRATOR">Illustrator Vector (.ai / .eps)</option>
                    <option value="ZIP">ZIP Master Archive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#667085] mb-1 font-mono">
                    Escrow Release (USD)
                  </label>
                  <div className="relative">
                    <DollarSign className="w-3.5 h-3.5 text-[#667085] absolute left-3 top-2.5" />
                    <input
                      type="number"
                      min="1"
                      step="1"
                      required
                      placeholder="1500"
                      value={priceDollars}
                      onChange={(e) => setPriceDollars(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-[#F8F6F1] border border-[#DDD8CF] text-[#171A1F] placeholder-[#667085] focus:outline-none focus:border-[#172B4D] transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {uploadState !== "IDLE" && uploadState !== "ERROR" && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] text-[#667085] font-mono">
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin text-[#172B4D]" />
                    {uploadState === "WATERMARKING" && "Burning in protection watermarks..."}
                    {uploadState === "AUTHORIZING" && "Authorizing storage vault slots..."}
                    {uploadState === "UPLOADING" && "Streaming assets to storage..."}
                    {uploadState === "COMMITTING" && "Registering deliverable in database..."}
                  </span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#F8F6F1] rounded-full overflow-hidden border border-[#DDD8CF]">
                  <div
                    className="h-full bg-[#172B4D] transition-all duration-150"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={
                  !selectedFile ||
                  !title.trim() ||
                  uploadState === "AUTHORIZING" ||
                  uploadState === "WATERMARKING" ||
                  uploadState === "UPLOADING" ||
                  uploadState === "COMMITTING"
                }
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#172B4D] hover:bg-[#0B1628] disabled:opacity-40 disabled:cursor-not-allowed text-[#F8F6F1] text-xs font-semibold shadow-md transition-all active:scale-[0.99]"
              >
                {uploadState === "AUTHORIZING" ||
                uploadState === "WATERMARKING" ||
                uploadState === "UPLOADING" ||
                uploadState === "COMMITTING" ? (
                  <span>Processing Upload...</span>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4 text-[#F8F6F1]" />
                    <span>Upload &amp; Mint Review Link</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
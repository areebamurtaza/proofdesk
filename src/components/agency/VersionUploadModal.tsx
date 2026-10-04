// filepath: src/components/agency/VersionUploadModal.tsx
"use client";

import React, { useState, useRef, FormEvent, ChangeEvent, useCallback } from "react";
import { X, UploadCloud, Layers, CheckCircle2, AlertCircle, Loader2, FileCheck, Image as ImageIcon } from "lucide-react";
import { FileType } from "@/types/review";

interface VersionUploadModalProps {
  isOpen: boolean;
  deliverableId: string | null;
  deliverableTitle: string;
  currentVersionNumber: number;
  onClose: () => void;
  onVersionUploaded: () => void;
}

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

function generateSourcePlaceholderBlob(file: File, type: FileType): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 1000;
    const ctx = canvas.getContext("2d");
    if (!ctx) return resolve(new Blob([]));

    ctx.fillStyle = "#F8F6F1";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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

    ctx.fillStyle = "#172B4D";
    ctx.font = "bold 24px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`• ${type} REVISED VERSION •`, canvas.width / 2, canvas.height / 2 - 140);

    ctx.fillStyle = "#171A1F";
    ctx.font = "bold 38px Georgia, serif";
    const truncatedName = file.name.length > 32 ? file.name.substring(0, 29) + "..." : file.name;
    ctx.fillText(truncatedName, canvas.width / 2, canvas.height / 2 - 40);

    ctx.fillStyle = "#667085";
    ctx.font = "20px sans-serif";
    ctx.fillText("Revised source asset protected by ProofDesk Escrow.", canvas.width / 2, canvas.height / 2 + 30);
    ctx.fillText(
      `File Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB • Full uncompressed master releases upon approval`,
      canvas.width / 2,
      canvas.height / 2 + 70
    );

    canvas.toBlob((blob) => resolve(blob || new Blob([])), "image/jpeg", 0.88);
  });
}

function getImageDimensions(file: File): Promise<{ width?: number; height?: number }> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) {
      return resolve({});
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({});
    };

    img.src = objectUrl;
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
      reject(new Error("Network interruption during asset streaming."));
    };

    xhr.send(blob);
  });
}

export function VersionUploadModal({
  isOpen,
  deliverableId,
  deliverableTitle,
  currentVersionNumber,
  onClose,
  onVersionUploaded,
}: VersionUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const companionInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [companionPreviewFile, setCompanionPreviewFile] = useState<File | null>(null);
  const [changeLog, setChangeLog] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const nextVersionNumber = currentVersionNumber + 1;

  const resetState = useCallback(() => {
    setSelectedFile(null);
    setCompanionPreviewFile(null);
    setChangeLog("");
    setIsSubmitting(false);
    setUploadProgress(0);
    setErrorMessage(null);
    setIsSuccess(false);
  }, []);

  const handleClose = () => {
    if (isSubmitting) return;
    resetState();
    onClose();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const isKnown = EXTENSION_MAP[ext] || ALLOWED_MIME_TYPES[file.type];

    if (!isKnown) {
      setErrorMessage("Unsupported file type. Please upload PNG, JPG, JPEG, SVG, Illustrator (.ai), or ZIP.");
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setErrorMessage("Version file exceeds the 100MB limit.");
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !deliverableId) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setUploadProgress(0);

    try {
      const fileType = detectFileType(selectedFile);

      let previewBlob: Blob;
      if (companionPreviewFile) {
        previewBlob = await generateWatermarkedPreviewBlob(companionPreviewFile);
      } else if (isSourceMaster(selectedFile)) {
        previewBlob = await generateSourcePlaceholderBlob(selectedFile, fileType);
      } else {
        previewBlob = await generateWatermarkedPreviewBlob(selectedFile);
      }

      const { width, height } = await getImageDimensions(
        companionPreviewFile || selectedFile
      );

      const presignRes = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: selectedFile.name,
          fileType,
          mimeType: selectedFile.type || "application/octet-stream",
          fileSize: selectedFile.size,
          previewMimeType: "image/jpeg",
          previewFileSize: previewBlob.size,
          versionNumber: nextVersionNumber,
        }),
      });

      if (!presignRes.ok) {
        const errData = await presignRes.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to obtain authorized upload URL.");
      }

      const presignData = await presignRes.json();
      const cleanUploadUrl = presignData.clean?.uploadUrl || presignData.uploadUrl;
      const previewUploadUrl = presignData.preview?.uploadUrl;
      const cleanFileKey = presignData.clean?.key || presignData.cleanFileKey;
      const previewKey = presignData.preview?.key || presignData.previewKey;

      await uploadBinaryWithProgress(
        cleanUploadUrl,
        selectedFile,
        selectedFile.type || "application/octet-stream",
        (pct) => setUploadProgress(Math.round(pct * 0.7))
      );

      if (previewUploadUrl) {
        await uploadBinaryWithProgress(
          previewUploadUrl,
          previewBlob,
          "image/jpeg",
          (pct) => setUploadProgress(70 + Math.round(pct * 0.3))
        );
      } else {
        setUploadProgress(100);
      }

      const commitRes = await fetch(`/api/deliverables/${deliverableId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          mimeType: selectedFile.type,
          cleanFileKey,
          previewKey,
          changeLog: changeLog.trim() || undefined,
          width,
          height,
        }),
      });

      if (!commitRes.ok) {
        const dbErr = await commitRes.json().catch(() => ({}));
        throw new Error(dbErr.error || "Failed to persist version record in database.");
      }

      setIsSuccess(true);
      setTimeout(() => {
        resetState();
        onVersionUploaded();
        onClose();
      }, 1200);
    } catch (err: unknown) {
      setIsSubmitting(false);
      setErrorMessage(err instanceof Error ? err.message : "Version upload failed.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 select-none font-sans">
      <div className="relative w-full max-w-lg rounded-2xl bg-white border border-[#DDD8CF] p-6 shadow-2xl text-[#171A1F] space-y-5 accent-border-top-navy">
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#172B4D]/10 border border-[#172B4D]/20 flex items-center justify-center text-[#172B4D] shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#171A1F] tracking-tight">Upload Revised Asset</h2>
              <p className="text-xs text-[#667085]">
                {deliverableTitle} &bull; Iterating to{" "}
                <span className="font-mono text-[#172B4D] font-bold">v{nextVersionNumber}</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-1 rounded-lg text-[#667085] hover:text-[#171A1F] hover:bg-[#F8F6F1] transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 animate-in zoom-in" />
            <p className="text-sm font-serif font-bold text-[#171A1F]">Version {nextVersionNumber} Published</p>
            <p className="text-xs text-[#667085]">Live split-comparison is now active in the client vault.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* File Dropzone */}
            <div
              onClick={() => !isSubmitting && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                selectedFile
                  ? "border-emerald-500/50 bg-emerald-50/40"
                  : "border-[#DDD8CF] hover:border-[#172B4D]/60 bg-[#F8F6F1]/50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.svg,.ai,.eps,.zip"
                className="hidden"
                onChange={handleFileChange}
                disabled={isSubmitting}
              />
              <UploadCloud className="w-8 h-8 text-[#667085] mx-auto mb-2" />
              {selectedFile ? (
                <div>
                  <p className="text-xs font-semibold text-[#171A1F]">{selectedFile.name}</p>
                  <p className="text-[11px] text-[#667085] mt-0.5">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; Ready for upload &bull;{" "}
                    <span className="font-semibold text-[#172B4D]">
                      {detectFileType(selectedFile)} Version
                    </span>
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-medium text-[#171A1F]">
                    Click to select revised version file
                  </p>
                  <p className="text-[11px] text-[#667085] mt-1">
                    PNG, JPG, SVG, Illustrator (.ai), or ZIP up to 100MB
                  </p>
                </div>
              )}
            </div>

            {/* Optional Companion Preview Dropzone for Source Master Versions */}
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
                  Drop a PNG/JPG screenshot or exported frame here so clients can visually review and drop spatial comments on the revised canvas. If omitted, a branded vault placeholder is automatically generated.
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

            {/* Changelog Directives */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#667085]">
                Changelog Notes (Optional)
              </label>
              <textarea
                rows={3}
                value={changeLog}
                onChange={(e) => setChangeLog(e.target.value)}
                disabled={isSubmitting}
                placeholder="e.g. Adjusted brand typography contrast and corrected footer margins per client feedback."
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8F6F1] border border-[#DDD8CF] text-xs text-[#171A1F] placeholder-[#667085] focus:outline-none focus:border-[#172B4D] transition-colors resize-none disabled:opacity-50"
              />
            </div>

            {/* Binary Streaming Progress */}
            {isSubmitting && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-[#667085] font-mono">
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin text-[#172B4D]" />
                    Streaming Asset to Vault...
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#F8F6F1] overflow-hidden border border-[#DDD8CF]">
                  <div
                    className="h-full bg-[#172B4D] transition-all duration-150"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isSubmitting || !selectedFile}
              className="w-full py-3 px-4 rounded-xl bg-[#172B4D] hover:bg-[#0B1628] disabled:opacity-40 disabled:cursor-not-allowed text-[#F8F6F1] text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#F8F6F1]" />
                  <span>Committing Version {nextVersionNumber}...</span>
                </>
              ) : (
                <>
                  <Layers className="w-4 h-4 text-[#F8F6F1]" />
                  <span>Publish Version {nextVersionNumber}</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
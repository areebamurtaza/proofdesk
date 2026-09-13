// filepath: src/components/agency/VersionUploadModal.tsx
"use client";

import React, { useState, useRef, FormEvent, ChangeEvent, useCallback } from "react";
import { X, UploadCloud, Layers, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface VersionUploadModalProps {
  isOpen: boolean;
  deliverableId: string | null;
  deliverableTitle: string;
  currentVersionNumber: number;
  onClose: () => void;
  onVersionUploaded: () => void;
}

const ALLOWED_MIME_TYPES: Record<string, "PNG" | "JPG" | "PDF" | "SVG"> = {
  "image/png": "PNG",
  "image/jpeg": "JPG",
  "image/svg+xml": "SVG",
  "application/pdf": "PDF",
};

/**
 * Extracts natural image dimensions in-browser prior to upload.
 * Provides instant dimensions to the database for zero-layout-shift canvas rendering.
 */
function getImageDimensions(file: File): Promise<{ width?: number; height?: number }> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/") || file.type === "application/pdf") {
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

export function VersionUploadModal({
  isOpen,
  deliverableId,
  deliverableTitle,
  currentVersionNumber,
  onClose,
  onVersionUploaded,
}: VersionUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [changeLog, setChangeLog] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const resetState = useCallback(() => {
    setSelectedFile(null);
    setChangeLog("");
    setIsSubmitting(false);
    setUploadProgress(0);
    setErrorMessage(null);
    setIsSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleClose = () => {
    if (isSubmitting) return;
    resetState();
    onClose();
  };

  if (!isOpen || !deliverableId) return null;

  const nextVersionNumber = currentVersionNumber + 1;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!ALLOWED_MIME_TYPES[file.type]) {
        setErrorMessage("Invalid file type. Please upload a PNG, JPG, SVG, or PDF.");
        return;
      }
      setSelectedFile(file);
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage("Please select a revised asset to upload.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setUploadProgress(0);

    try {
      const fileType = ALLOWED_MIME_TYPES[selectedFile.type];

      // 1. In-browser natural dimension extraction
      const { width, height } = await getImageDimensions(selectedFile);

      // 2. Request ephemeral presigned upload target from R2 using real deliverable context
      const presignRes = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliverableId,
          fileName: selectedFile.name,
          fileType,
          mimeType: selectedFile.type,
          fileSize: selectedFile.size,
          versionNumber: nextVersionNumber,
        }),
      });

      if (!presignRes.ok) {
        const errPayload = await presignRes.json().catch(() => ({}));
        throw new Error(errPayload.error || "Failed to authorize storage upload.");
      }

      const { uploadUrl, cleanFileKey, previewKey } = await presignRes.json();

      // 3. Stream binary directly to Cloudflare R2 via presigned PUT URL
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl, true);
        xhr.setRequestHeader("Content-Type", selectedFile.type);

        xhr.upload.onprogress = (evt: ProgressEvent) => {
          if (evt.lengthComputable) {
            const percent = Math.round((evt.loaded / evt.total) * 100);
            setUploadProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Storage service rejected upload (HTTP ${xhr.status}).`));
          }
        };

        xhr.onerror = () => {
          reject(new Error("Network connection interrupted during file transmission."));
        };

        xhr.send(selectedFile);
      });

      // 4. Commit Version to PostgreSQL (Atomic bump and client notification)
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-lg rounded-2xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl text-zinc-100 space-y-5">
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Upload Revised Asset</h2>
              <p className="text-xs text-zinc-400">
                {deliverableTitle} &bull; Iterating to{" "}
                <span className="font-mono text-emerald-400 font-semibold">v{nextVersionNumber}</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-in zoom-in" />
            <p className="text-sm font-semibold text-white">Version {nextVersionNumber} Published</p>
            <p className="text-xs text-zinc-500">Live split-comparison is now active in the client vault.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* File Dropzone */}
            <div
              onClick={() => !isSubmitting && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                selectedFile
                  ? "border-emerald-500/50 bg-emerald-500/5"
                  : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/30"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.svg,.pdf"
                className="hidden"
                onChange={handleFileChange}
                disabled={isSubmitting}
              />
              <UploadCloud className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
              {selectedFile ? (
                <div>
                  <p className="text-xs font-semibold text-white">{selectedFile.name}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; Ready for upload
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-medium text-zinc-300">
                    Click to select revised version file
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    PNG, JPG, SVG, or PDF up to 50MB
                  </p>
                </div>
              )}
            </div>

            {/* Changelog Directives */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                Changelog Notes (Optional)
              </label>
              <textarea
                rows={3}
                value={changeLog}
                onChange={(e) => setChangeLog(e.target.value)}
                disabled={isSubmitting}
                placeholder="e.g. Adjusted brand typography contrast and corrected footer margins per client feedback."
                className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none disabled:opacity-50"
              />
            </div>

            {/* Binary Streaming Progress */}
            {isSubmitting && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                  <span>Streaming Asset to R2 Vault...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-150"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isSubmitting || !selectedFile}
              className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-black text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/30 transition-all active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Committing Version {nextVersionNumber}...</span>
                </>
              ) : (
                <>
                  <Layers className="w-4 h-4" />
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
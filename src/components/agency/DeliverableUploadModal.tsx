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
} from "lucide-react";

interface DeliverableUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: (reviewToken: string) => void;
}

type UploadState = "IDLE" | "AUTHORIZING" | "UPLOADING" | "SUCCESS" | "ERROR";

const ALLOWED_MIME_TYPES: Record<string, "PDF" | "PNG" | "JPG" | "SVG"> = {
  "application/pdf": "PDF",
  "image/png": "PNG",
  "image/jpeg": "JPG",
  "image/svg+xml": "SVG",
};

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100MB

export function DeliverableUploadModal({
  isOpen,
  onClose,
  onUploadComplete,
}: DeliverableUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [priceDollars, setPriceDollars] = useState<string>("1500");
  const [isDragActive, setIsDragActive] = useState<boolean>(false);

  // Upload Progress State
  const [uploadState, setUploadState] = useState<UploadState>("IDLE");
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [hasCopiedToken, setHasCopiedToken] = useState<boolean>(false);

  if (!isOpen) return null;

  // File Validation Logic
  const handleValidateAndSetFile = (file: File) => {
    setErrorMessage(null);

    if (!ALLOWED_MIME_TYPES[file.type]) {
      setErrorMessage("Unsupported file format. Please upload a PDF, PNG, JPG, or SVG.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage("File exceeds the maximum 100MB upload threshold.");
      return;
    }

    setSelectedFile(file);
    if (!title.trim()) {
      // Clean base name for title placeholder
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

  // Execution: Presign Request -> Binary Upload Pipeline
  // Execution: Presign Request -> Binary Upload -> DB Transaction
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !title.trim()) return;

    setErrorMessage(null);
    setUploadState("AUTHORIZING");
    setProgressPercent(0);

    try {
      const fileType = ALLOWED_MIME_TYPES[selectedFile.type];

      // 1. Authorize Upload Target via Presign Route Handler
      const presignResponse = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: selectedFile.name,
          fileType,
          mimeType: selectedFile.type,
          fileSize: selectedFile.size,
          projectId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
          versionNumber: 1,
        }),
      });

      if (!presignResponse.ok) {
        const errPayload = await presignResponse.json();
        throw new Error(errPayload.error || "Failed to generate presigned upload ticket.");
      }

      const { uploadUrl, cleanFileKey, previewKey } = await presignResponse.json();

      // 2. Direct-to-Storage Binary Stream
      setUploadState("UPLOADING");

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl, true);
        xhr.setRequestHeader("Content-Type", selectedFile.type);

        xhr.upload.onprogress = (event: ProgressEvent) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setProgressPercent(percent);
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
          reject(new Error("Network interruption during asset upload."));
        };

        xhr.send(selectedFile);
      });

      // 3. Commit Metadata to PostgreSQL via /api/deliverables
      const deliverableResponse = await fetch("/api/deliverables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description.trim() || undefined,
          fileType,
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          mimeType: selectedFile.type,
          cleanFileKey,
          previewKey,
          priceDollars: parseInt(priceDollars, 10) || 1500,
          projectId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
        }),
      });

      if (!deliverableResponse.ok) {
        const dbErr = await deliverableResponse.json();
        throw new Error(dbErr.error || "Failed to save deliverable record in database.");
      }

      const dbData = await deliverableResponse.json();

      // 4. Ingestion Complete: Expose Real DB Review Token
      setUploadState("SUCCESS");
      setGeneratedToken(dbData.reviewToken);
      if (onUploadComplete) {
        onUploadComplete(dbData.reviewToken);
      }
    } catch (err: unknown) {
      setUploadState("ERROR");
      setErrorMessage(err instanceof Error ? err.message : "An unexpected upload error occurred.");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-xl rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl p-6 relative">
        {/* Close Button */}
        <button
          onClick={handleResetModal}
          disabled={uploadState === "AUTHORIZING" || uploadState === "UPLOADING"}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 disabled:opacity-30"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-100">Upload New Deliverable</h2>
            <p className="text-xs text-zinc-400">
              Files are watermarked on ingestion and locked behind escrow paywalls.
            </p>
          </div>
        </div>

        {/* SUCCESS VIEW: Token Link Generator */}
        {uploadState === "SUCCESS" && generatedToken ? (
          <div className="space-y-4 py-3">
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <FileCheck className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-semibold text-emerald-300">
                  Asset Ingested & Review Token Minted
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                  Version 1 has been stored in the vault. Send this tokenized link to the client for zero-login proofing.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Client Review URL (Zero-Auth)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${typeof window !== "undefined" ? window.location.origin : ""}/review/${generatedToken}`}
                  className="flex-1 px-3 py-2 text-xs font-mono rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 select-all focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-medium text-zinc-100 transition-all shrink-0"
                >
                  {hasCopiedToken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{hasCopiedToken ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-zinc-900">
              <a
                href={`/review/${generatedToken}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                <span>Launch Client View</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={handleResetModal}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-all"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* FORM VIEW: Upload & Metadata */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Drag & Drop Surface */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isDragActive
                  ? "border-indigo-500 bg-indigo-950/20"
                  : selectedFile
                  ? "border-emerald-500/40 bg-emerald-950/10"
                  : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/40"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.svg"
                onChange={handleFileChange}
                className="hidden"
              />

              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-medium text-zinc-100 truncate max-w-[280px]">
                      {selectedFile.name}
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull;{" "}
                      {ALLOWED_MIME_TYPES[selectedFile.type]}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <UploadCloud className="w-8 h-8 text-zinc-500 mx-auto" />
                  <p className="text-xs font-medium text-zinc-300">
                    Drop design asset here, or <span className="text-indigo-400">browse</span>
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    PDF, PNG, JPG, or SVG up to 100MB
                  </p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/30 flex items-center gap-2 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Metadata Fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                  Deliverable Title
                </label>
                <div className="relative">
                  <FileText className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Modern Architecture Brand Book"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                  Deliverable Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Context, change directives, or scope notes for the reviewer..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                  Escrow Balance Release (USD)
                </label>
                <div className="relative">
                  <DollarSign className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    placeholder="1500"
                    value={priceDollars}
                    onChange={(e) => setPriceDollars(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">
                  Amount charged to client upon approval before unwatermarked files release.
                </p>
              </div>
            </div>

            {/* Upload Progress Bar */}
            {(uploadState === "AUTHORIZING" || uploadState === "UPLOADING") && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                    {uploadState === "AUTHORIZING"
                      ? "Authorizing storage slot..."
                      : "Streaming asset directly to storage..."}
                  </span>
                  <span className="font-mono">{progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-150"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={
                  !selectedFile ||
                  !title.trim() ||
                  uploadState === "AUTHORIZING" ||
                  uploadState === "UPLOADING"
                }
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-lg shadow-indigo-950/40 transition-all"
              >
                {uploadState === "AUTHORIZING" || uploadState === "UPLOADING" ? (
                  <span>Processing Upload...</span>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload & Mint Review Link</span>
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
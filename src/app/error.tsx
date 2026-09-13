// filepath: src/app/error.tsx
"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AppError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log exception telemetry
    console.error("[ProofDesk App Runtime Exception]:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex items-center justify-center p-6 select-none">
      <div className="max-w-lg w-full rounded-2xl bg-zinc-950 border border-zinc-800 p-8 shadow-2xl space-y-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Runtime Exception Encountered
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            The application intercepted an unhandled fault while rendering this segment.
          </p>
        </div>

        {/* Error Details Box */}
        <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-left font-mono text-[11px] text-rose-300 overflow-x-auto max-h-40">
          <p className="font-semibold text-zinc-400 mb-1">
            Digest: {error.digest || "N/A"}
          </p>
          <p className="break-words">{error.message || "Unknown error"}</p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold shadow-lg shadow-emerald-950/30 transition-all active:scale-[0.98]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
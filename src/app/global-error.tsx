// filepath: src/app/global-error.tsx
"use client";

import React, { useEffect } from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("[ProofDesk Root Layout Exception]:", error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="bg-[#09090b] text-zinc-100 min-h-screen flex items-center justify-center p-6 antialiased font-sans">
        <div className="max-w-md w-full rounded-2xl bg-zinc-950 border border-zinc-800 p-8 shadow-2xl space-y-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertOctagon className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h1 className="text-lg font-bold text-white tracking-tight">
              Root Level Fatal Exception
            </h1>
            <p className="text-xs text-zinc-400 leading-relaxed">
              A critical exception occurred inside the root shell of the platform.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-left font-mono text-[11px] text-rose-300 overflow-x-auto max-h-36">
            <p className="break-words">{error.message || "Critical layout crash"}</p>
          </div>

          <button
            onClick={() => reset()}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold shadow-lg shadow-emerald-950/30 transition-all active:scale-[0.98]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Recover Platform Shell</span>
          </button>
        </div>
      </body>
    </html>
  );
}
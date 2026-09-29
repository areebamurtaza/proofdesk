"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MessageSquare, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { CampaignBannerArtboard } from "./DesignArtboards";

export function ClientReviewSection() {
  const [selectedPin, setSelectedPin] = useState<number>(1);
  const [clientDecision, setClientDecision] = useState<"NONE" | "REVISIONS" | "APPROVED">("NONE");

  const pinDetails = [
    {
      id: 1,
      x: "34%",
      y: "40%",
      author: "Elena Rostova",
      role: "Client Lead",
      comment: "The geometric typography grid and embossed gold foil contrast on the warm paper stock is approved for final production.",
      status: "APPROVED",
    },
    {
      id: 2,
      x: "68%",
      y: "55%",
      author: "Marcus Vance",
      role: "Design Director",
      comment: "Updated the vector baseline alignment to 24px and embedded Pantone 405C color swatches in the master AI asset.",
      status: "VERIFIED",
    },
  ];

  const currentPin = pinDetails.find((p) => p.id === selectedPin) || pinDetails[0];

  return (
    <section id="client-review" className="py-24 border-t border-[#DDD8CF] bg-[#F0E7D8]/50 px-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center max-w-2xl mx-auto space-y-3"
        >
          <span className="text-xs font-mono uppercase tracking-widest text-[#172B4D] font-bold">
            Zero-Auth Client Experience
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#171A1F]">
            Clients don&apos;t need another dashboard.
          </h2>
          <p className="text-base text-[#667085]">
            Send one encrypted link. Clients view full-resolution creative work, drop pinpoint comments, and give binding sign-offs with zero sign-ups.
          </p>
        </motion.div>

        {/* Minimal Client-Facing Review Screen Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-5xl mx-auto rounded-2xl border border-[#DDD8CF] bg-white shadow-lg overflow-hidden text-left"
        >
          {/* Minimal Top Header */}
          <div className="p-4 border-b border-[#DDD8CF] bg-[#F8F6F1] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#172B4D]" />
              <div>
                <h4 className="text-sm font-bold text-[#171A1F]">
                  Apex Stationery &amp; Brand Guidelines &bull; Vector Master
                </h4>
                <p className="text-[11px] font-mono text-[#667085]">
                  Secure Link: proofdesk.io/review/tok_client_apex &bull; End-to-End Escrow
                </p>
              </div>
            </div>

            {/* Version Selector in Client View */}
            <div className="flex items-center gap-1.5 bg-white border border-[#DDD8CF] p-1 rounded-lg text-xs font-mono">
              <span className="text-[#667085] px-2 text-[10px]">Version:</span>
              <span className="px-2 py-0.5 rounded bg-[#F8F6F1] text-[#667085]">v1</span>
              <span className="px-2 py-0.5 rounded bg-[#F8F6F1] text-[#667085]">v2</span>
              <span className="px-2.5 py-0.5 rounded bg-[#172B4D] text-white font-bold">v3 (Current)</span>
            </div>
          </div>

          {/* Minimal Canvas Area with Annotations & Pins */}
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[420px]">
            {/* Visual Canvas (8 cols) */}
            <div className="md:col-span-8 p-6 sm:p-8 bg-[#F5F3EE] flex flex-col justify-between relative">
              <div className="relative w-full aspect-[16/10] rounded-xl border border-[#DDD8CF] shadow-sm overflow-hidden bg-slate-900 group">
                <CampaignBannerArtboard className="w-full h-full" />

                {/* Subtle dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

                {/* Numbered Pins */}
                {pinDetails.map((pin) => {
                  const isSelected = selectedPin === pin.id;
                  return (
                    <div
                      key={pin.id}
                      style={{ top: pin.y, left: pin.x }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                    >
                      {isSelected && (
                        <span className="absolute -inset-1 rounded-full bg-[#D7C3A5] animate-ping opacity-75 pointer-events-none" />
                      )}
                      <button
                        onClick={() => setSelectedPin(pin.id)}
                        className={`relative w-7 h-7 rounded-full text-xs font-mono font-bold flex items-center justify-center transition-all shadow-md ${
                          isSelected
                            ? "bg-[#D7C3A5] text-[#0B1628] ring-4 ring-white/60 scale-110"
                            : "bg-[#172B4D] text-white hover:scale-105"
                        }`}
                      >
                        {pin.id}
                      </button>
                    </div>
                  );
                })}

                <div className="absolute bottom-3 left-3 text-[10px] font-mono text-white/90 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded">
                  Format: AI Master + Vector SVG &bull; Lossless
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-[#667085]">
                <span>Click pins to inspect pinpoint client feedback</span>
                <span className="font-mono text-[11px] text-[#172B4D]">Client Viewport &bull; Live</span>
              </div>
            </div>

            {/* Client Comments & Action Bar (4 cols) */}
            <div className="md:col-span-4 p-6 bg-white border-t md:border-t-0 md:border-l border-[#DDD8CF] flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#DDD8CF]">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#172B4D]" />
                    <span className="text-xs font-bold text-[#171A1F]">Pinpoint Note 0{selectedPin}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#D7C3A5] bg-[#0B1628] px-2 py-0.5 rounded font-bold">
                    {currentPin.status}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F8F6F1] border border-[#DDD8CF] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-[#171A1F]">{currentPin.author}</p>
                    <span className="text-[10px] text-[#667085]">{currentPin.role}</span>
                  </div>
                  <p className="text-[#667085] leading-relaxed">
                    &ldquo;{currentPin.comment}&rdquo;
                  </p>
                </div>
              </div>

              {/* The Two Unambiguous Client Action Buttons */}
              <div className="space-y-2.5 pt-4 border-t border-[#DDD8CF]">
                <p className="text-[10px] font-mono uppercase tracking-wider text-[#667085]">
                  Issue Decision:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setClientDecision("REVISIONS")}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                      clientDecision === "REVISIONS"
                        ? "bg-[#B7791F] text-white border-[#B7791F]"
                        : "bg-white border-[#DDD8CF] text-[#171A1F] hover:bg-[#F8F6F1]"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Request Edits</span>
                  </button>
                  <button
                    onClick={() => setClientDecision("APPROVED")}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      clientDecision === "APPROVED"
                        ? "bg-[#2F6B4F] text-white"
                        : "bg-[#172B4D] hover:bg-[#0B1628] text-white"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Work</span>
                  </button>
                </div>

                {clientDecision !== "NONE" && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-2.5 rounded-lg text-[11px] font-mono text-center border ${
                      clientDecision === "APPROVED"
                        ? "bg-emerald-50 text-[#2F6B4F] border-emerald-200"
                        : "bg-amber-50 text-[#B7791F] border-amber-200"
                    }`}
                  >
                    {clientDecision === "APPROVED"
                      ? "✓ Work approved. Clean asset release authorized."
                      : "⚠ Revision request logged in agency activity ledger."}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Supporting Feature Link */}
        <div className="text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#172B4D] hover:underline"
          >
            <span>See how proofing links operate inside the agency workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

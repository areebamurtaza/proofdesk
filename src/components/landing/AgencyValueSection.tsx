"use client";

import React from "react";
import { FolderLock, GitBranch, ShieldCheck, Check, Clock } from "lucide-react";
import { motion } from "framer-motion";

export function AgencyValueSection() {
  return (
    <section id="agency" className="py-24 px-6 bg-[#F0E7D8] font-sans border-y border-[#DDD8CF]">
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
            Agency Operations
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#171A1F]">
            Built around the way agencies actually work.
          </h2>
          <p className="text-base text-[#667085]">
            Engineered for studios, creative boutiques, and production teams managing multiple client deliverables simultaneously.
          </p>
        </motion.div>

        {/* 3 Large Editorial Compositions */}
        <div className="space-y-8">
          {/* Composition 01: Client Review Links & Deliverable Isolation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="p-8 rounded-xl bg-white border border-[#DDD8CF] shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            <div className="lg:col-span-5 space-y-4 text-left">
              <div className="w-10 h-10 rounded-lg bg-[#F8F6F1] border border-[#DDD8CF] text-[#172B4D] flex items-center justify-center font-bold">
                <FolderLock className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#D7C3A5] font-bold">
                Composition 01 &bull; Client Isolation
              </span>
              <h3 className="text-2xl font-bold text-[#171A1F] tracking-tight">
                Private Client Review Silos
              </h3>
              <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
                Each client project exists in a private encrypted container. Clients only see their own deliverables, brand assets, and feedback threads with zero risk of cross-account data leaks.
              </p>
              <div className="pt-2 text-xs font-mono text-[#172B4D] font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#2F6B4F]" />
                <span>Zero login &bull; Cryptographic link gating</span>
              </div>
            </div>

            {/* Real Product UI Mockup */}
            <div className="lg:col-span-7 p-6 rounded-lg bg-[#F8F6F1] border border-[#DDD8CF] space-y-3 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-[#DDD8CF] text-xs font-mono">
                <span className="text-[#171A1F] font-bold">Project: Aura Spatial Audio</span>
                <span className="text-[10px] text-[#667085]">Client Silo: ENCRYPTED</span>
              </div>
              <div className="space-y-2">
                <div className="p-3 rounded bg-white border border-[#DDD8CF] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#2F6B4F]" />
                    <span className="font-bold text-[#171A1F]">Packaging_Master_Dieline.ai</span>
                  </div>
                  <span className="font-mono text-[10px] bg-[#F0E7D8] text-[#172B4D] px-2 py-0.5 rounded font-bold">
                    ✓ APPROVED
                  </span>
                </div>
                <div className="p-3 rounded bg-white border border-[#DDD8CF] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#172B4D]" />
                    <span className="font-bold text-[#171A1F]">Brand_Identity_Guidelines.svg</span>
                  </div>
                  <span className="font-mono text-[10px] bg-[#F8F6F1] text-[#172B4D] px-2 py-0.5 rounded border border-[#DDD8CF]">
                    IN REVIEW (v3)
                  </span>
                </div>
                <div className="p-3 rounded bg-white border border-[#DDD8CF] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#B7791F]" />
                    <span className="font-bold text-[#171A1F]">Social_Launch_Pack.zip</span>
                  </div>
                  <span className="font-mono text-[10px] bg-[#F0E7D8] text-[#B7791F] px-2 py-0.5 rounded font-bold">
                    CHANGES REQUESTED (v2)
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Composition 02: Centralized Feedback & Linear Version Lineage */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="p-8 rounded-xl bg-white border border-[#DDD8CF] shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            {/* Real Product UI Mockup */}
            <div className="lg:col-span-7 p-6 rounded-lg bg-[#F8F6F1] border border-[#DDD8CF] space-y-3 text-left order-2 lg:order-1">
              <div className="flex items-center justify-between pb-3 border-b border-[#DDD8CF] text-xs font-mono">
                <span className="text-[#171A1F] font-bold">Version History &bull; Centralized Feedback</span>
                <span className="text-[#172B4D] font-bold">4 Checkpoints</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded bg-white border-2 border-[#172B4D] flex items-center justify-between shadow-xs">
                  <div>
                    <span className="font-mono font-bold text-[#172B4D] mr-2">V4.0</span>
                    <span className="font-bold text-[#171A1F]">Elena Rostova: &ldquo;Color grading matches approved palette.&rdquo;</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#2F6B4F] font-bold">Ready</span>
                </div>
                <div className="p-3 rounded bg-white border border-[#DDD8CF] flex items-center justify-between opacity-80">
                  <div>
                    <span className="font-mono font-bold text-[#667085] mr-2">V3.0</span>
                    <span className="text-[#667085]">Marcus Vance: &ldquo;Adjusted margin offsets per pin #2.&rdquo;</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#667085]">Revised</span>
                </div>
                <div className="p-3 rounded bg-white border border-[#DDD8CF] flex items-center justify-between opacity-60">
                  <div>
                    <span className="font-mono font-bold text-[#667085] mr-2">V2.0</span>
                    <span className="text-[#667085]">Initial vector proofing artboard</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#667085]">Superseded</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4 text-left order-1 lg:order-2">
              <div className="w-10 h-10 rounded-lg bg-[#F8F6F1] border border-[#DDD8CF] text-[#172B4D] flex items-center justify-center font-bold">
                <GitBranch className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#D7C3A5] font-bold">
                Composition 02 &bull; Linear Lineage
              </span>
              <h3 className="text-2xl font-bold text-[#171A1F] tracking-tight">
                No Lost Comments. No Accidental Overwrites.
              </h3>
              <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
                Centralized feedback stays linked to the exact version it was left on. When round 3 starts, round 1 comments remain in the permanent history for full accountability.
              </p>
              <div className="pt-2 text-xs font-mono text-[#172B4D] font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#2F6B4F]" />
                <span>Revisions cap enforcement built-in</span>
              </div>
            </div>
          </motion.div>

          {/* Composition 03: Approval Tracking & Cash Flow Release */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="p-8 rounded-xl bg-white border border-[#DDD8CF] shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            <div className="lg:col-span-5 space-y-4 text-left">
              <div className="w-10 h-10 rounded-lg bg-[#F8F6F1] border border-[#DDD8CF] text-[#172B4D] flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#D7C3A5] font-bold">
                Composition 03 &bull; Milestone Approvals
              </span>
              <h3 className="text-2xl font-bold text-[#171A1F] tracking-tight">
                Accelerated Cash Flow &amp; Sign-Offs
              </h3>
              <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
                Faster approvals clear invoices on schedule. Tie milestone sign-offs directly to final production releases or escrow settlements with complete digital audit trails.
              </p>
              <div className="pt-2 text-xs font-mono text-[#172B4D] font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#172B4D]" />
                <span>Average approval turnaround: &lt; 2 hours</span>
              </div>
            </div>

            {/* Real Product UI Mockup */}
            <div className="lg:col-span-7 p-6 rounded-lg bg-[#0B1628] text-white border border-white/10 space-y-3 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono">
                <span className="text-white font-bold">Milestone Sign-Off: Master Package Release</span>
                <span className="text-[#D7C3A5]">SHA-256 Verified</span>
              </div>
              <div className="p-4 rounded bg-white/[0.04] border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Cryptographic Certificate Committed</p>
                  <p className="text-[11px] font-mono text-white/60 mt-0.5">Signer: Elena Rostova &bull; IP: Verified &bull; Lock: Active</p>
                </div>
                <span className="font-mono text-xs font-bold px-3 py-1 rounded bg-[#2F6B4F] text-white">
                  ✓ SIGNED
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-white/60 pt-1">
                <span>Clean files released to production</span>
                <span className="text-[#D7C3A5]">Audit Certificate Exportable</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

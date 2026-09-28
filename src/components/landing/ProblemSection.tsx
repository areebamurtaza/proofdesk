"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowDown, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck } from "lucide-react";

export function ProblemSection() {
  const brokenSteps = [
    { title: "EMAIL", desc: "Long, multi-person threads with lost attachments" },
    { title: "WHATSAPP", desc: "Voice notes and casual remarks after hours" },
    { title: "SCREENSHOT", desc: "Low-res captures with drawn circles and arrows" },
    { title: "WHICH VERSION?", desc: "Confusion over Brand_v3_final_v2_FINAL.ai" },
    { title: "MORE REVISIONS", desc: "Unrecorded work done out of scope" },
    { title: "MISSED FEEDBACK", desc: "Client complaints after files sent to print" },
  ];

  const proofdeskSteps = [
    { title: "ONE SECURE LINK", desc: "Zero-login tokenized link sent to all stakeholders" },
    { title: "SPATIAL CANVAS", desc: "Feedback pinned to exact pixel coordinates" },
    { title: "CLEAR LINEAGE", desc: "V1 → V2 → V3 → V4 with side-by-side comparison" },
    { title: "EXPLICIT SIGN-OFF", desc: "Cryptographic SHA-256 seal and locked master package" },
  ];

  return (
    <section id="problem" className="py-24 bg-[#0B1628] text-[#F8F6F1] px-6 font-sans relative overflow-hidden">
      {/* Background Subtle Gradient Accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#172B4D]/30 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#D7C3A5]/5 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <span className="text-xs font-mono uppercase tracking-widest text-[#D7C3A5] font-semibold">
            The Approval Bottleneck
          </span>
          <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
            Your work isn&apos;t the problem. <br />
            <span className="text-[#D7C3A5]">The approval process is.</span>
          </h2>
          <p className="text-base sm:text-lg text-[#F8F6F1]/75 leading-relaxed">
            Great creative work gets derailed when feedback is scattered across messaging apps, buried in inbox threads, and untracked across revisions.
          </p>
        </motion.div>

        {/* Visual Workflow Comparison: Broken Chain vs ProofDesk */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: The Broken Workflow (5 cols) */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="lg:col-span-5 p-8 rounded-xl bg-white/[0.03] border border-white/10 space-y-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-mono uppercase text-[#B7791F] font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>The Fragmented Reality</span>
                </span>
                <span className="text-[10px] font-mono text-white/50">Chaos &amp; Delays</span>
              </div>

              {/* Vertical Chain of Problem Steps */}
              <div className="space-y-2.5">
                {brokenSteps.map((step, idx) => (
                  <div key={idx} className="space-y-2.5">
                    <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between">
                      <div>
                        <p className="font-mono text-xs font-bold text-white/90">{step.title}</p>
                        <p className="text-[11px] text-[#F8F6F1]/60 mt-0.5">{step.desc}</p>
                      </div>
                      <span className="text-xs font-mono text-[#B7791F] font-bold">✕</span>
                    </div>
                    {idx < brokenSteps.length - 1 && (
                      <div className="flex justify-center text-white/20">
                        <ArrowDown className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 text-xs font-mono text-[#B7791F]">
              Outcome: Unpaid revisions, missing context, and client disputes.
            </div>
          </motion.div>

          {/* Transition Graphic Connector (hidden on small screens, shown in flow) */}

          {/* Right Column: The ProofDesk Standard (7 cols) */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="lg:col-span-7 p-8 rounded-xl bg-gradient-to-br from-[#172B4D]/60 to-[#0B1628] border-2 border-[#D7C3A5]/40 space-y-6 flex flex-col justify-between shadow-2xl relative"
          >
            {/* Signature Sand Accent Pill */}
            <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-[#D7C3A5] text-[#0B1628] text-[10px] font-mono font-bold tracking-wider uppercase">
              The ProofDesk Standard
            </div>

            <div className="space-y-5">
              <div className="pb-3 border-b border-white/10">
                <span className="text-xs font-mono uppercase text-[#D7C3A5] font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#D7C3A5]" />
                  <span>Sovereign Client Proofing</span>
                </span>
                <p className="text-xs text-[#F8F6F1]/70 mt-1">
                  A structured four-phase pipeline moving work forward without confusion.
                </p>
              </div>

              {/* 4 Standard Phase Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {proofdeskSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-lg bg-white/[0.04] border border-[#D7C3A5]/20 hover:border-[#D7C3A5]/60 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-[#D7C3A5] font-bold">
                        0{idx + 1}
                      </span>
                      <ShieldCheck className="w-4 h-4 text-[#D7C3A5]" />
                    </div>
                    <h4 className="font-bold text-sm text-white">{step.title}</h4>
                    <p className="text-xs text-[#F8F6F1]/70 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Interactive Proof Progress Indicator */}
              <div className="p-4 rounded-lg bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="text-white/70">Client Link Status:</span>
                <span className="text-[#D7C3A5] font-bold flex items-center gap-1">
                  <span>TOKEN VERIFIED &bull; ZERO LOGIN NEEDED</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 text-xs font-mono text-[#D7C3A5] flex items-center justify-between">
              <span>Result: Clear approvals. Fast turnaround. Zero revision disputes.</span>
              <span className="text-sm font-bold">&check;</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

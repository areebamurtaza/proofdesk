"use client";

import React, { useState } from "react";
import { CheckCircle2, Lock, Check } from "lucide-react";
import { motion } from "framer-motion";

export function ApprovalSection() {
  const [activeStep, setActiveStep] = useState<number>(2); // 2 = Approved

  const stages = [
    {
      id: 0,
      title: "Changes Requested",
      label: "ROUND 02 REVISIONS",
      desc: "Specific spatial pins submitted by client. Agency alerted with itemized action list.",
      color: "text-[#B7791F]",
      dotBg: "bg-[#B7791F]",
    },
    {
      id: 1,
      title: "Resubmitted",
      label: "V3 DEPLOYED",
      desc: "Updated creative assets published. Previous comments flagged for verification.",
      color: "text-blue-400",
      dotBg: "bg-blue-400",
    },
    {
      id: 2,
      title: "Approved",
      label: "SIGN-OFF COMMITTED",
      desc: "Cryptographic signature logged. Approved deliverable permanently sealed for production.",
      color: "text-[#D7C3A5]",
      dotBg: "bg-[#D7C3A5]",
    },
  ];

  return (
    <section id="decisions" className="py-24 bg-[#0B1628] text-[#F8F6F1] px-6 font-sans relative overflow-hidden">
      {/* Background Subtle Atmosphere */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#172B4D]/40 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#D7C3A5]/5 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center max-w-2xl mx-auto space-y-3"
        >
          <span className="text-xs font-mono uppercase tracking-widest text-[#D7C3A5] font-bold">
            Unambiguous Decision Engine
          </span>
          <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
            Know when it&apos;s <span className="text-[#D7C3A5]">actually</span> approved.
          </h2>
          <p className="text-base sm:text-lg text-[#F8F6F1]/75 leading-relaxed">
            Eliminate &ldquo;I thought you approved this&rdquo; disputes forever. ProofDesk introduces formal status states and an immutable audit trail.
          </p>
        </motion.div>

        {/* Progression: Changes Requested → Resubmitted → Approved */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stages.map((st, idx) => {
            const isActive = activeStep === st.id;
            return (
              <motion.div
                key={st.id}
                onClick={() => setActiveStep(st.id)}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.45, delay: idx * 0.1, ease: "easeOut" }}
                whileHover={{ y: -2 }}
                className={`p-6 rounded-xl border cursor-pointer transition-all space-y-3 ${
                  isActive
                    ? "bg-[#172B4D]/50 border-[#D7C3A5] shadow-xl ring-1 ring-[#D7C3A5]/30"
                    : "bg-white/[0.02] hover:bg-white/[0.05] border-white/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${st.dotBg}`} />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-white/50">
                      Phase 0{st.id + 1}
                    </span>
                  </div>
                  <span className={`font-mono text-[10px] font-bold ${st.color}`}>
                    {st.label}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-white">{st.title}</h3>
                <p className="text-xs text-[#F8F6F1]/70 leading-relaxed">{st.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Large UI: ✓ APPROVED Showcase Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-xl border border-white/15 bg-white/[0.03] p-8 shadow-2xl space-y-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#D7C3A5]/10 text-[#D7C3A5] border border-[#D7C3A5]/30 flex items-center justify-center font-bold text-xl">
                <Check className="w-6 h-6 text-[#D7C3A5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-2xl text-white">
                    ✓ APPROVED
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#D7C3A5]/15 text-[#D7C3A5] font-bold border border-[#D7C3A5]/30">
                    SEALED
                  </span>
                </div>
                <p className="text-xs font-mono text-[#F8F6F1]/70 mt-1">
                  Final review completed &bull; Approved by client
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-3.5 py-1.5 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>LEGAL CONSENT LOGGED</span>
              </span>
            </div>
          </div>

          {/* Cryptographic Audit Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-4 rounded-lg bg-black/40 border border-white/5 space-y-1">
              <span className="text-white/50 block uppercase text-[10px]">Approved By</span>
              <span className="text-white font-bold block text-sm">Elena Rostova</span>
              <span className="text-[10px] text-white/50">elena@auraspatial.com</span>
            </div>
            <div className="p-4 rounded-lg bg-black/40 border border-white/5 space-y-1">
              <span className="text-white/50 block uppercase text-[10px]">Timestamp (UTC)</span>
              <span className="text-white font-bold block text-sm">2026-09-23 11:02:44</span>
              <span className="text-[10px] text-[#D7C3A5]">Cryptographic Token Match</span>
            </div>
            <div className="p-4 rounded-lg bg-black/40 border border-white/5 space-y-1">
              <span className="text-white/50 block uppercase text-[10px]">Artifact SHA-256</span>
              <span className="text-[#D7C3A5] font-bold block text-[11px] truncate">
                7f4a8b29c1...9d02e4
              </span>
              <span className="text-[10px] text-emerald-400">Checksum Confirmed</span>
            </div>
            <div className="p-4 rounded-lg bg-black/40 border border-white/5 space-y-1">
              <span className="text-white/50 block uppercase text-[10px]">Master Lock Status</span>
              <span className="text-white font-bold block text-sm flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Vault Released</span>
              </span>
              <span className="text-[10px] text-white/50">Production Ready</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

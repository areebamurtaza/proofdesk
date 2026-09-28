"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Eye, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function FinalCTA() {
  return (
    <section className="py-24 bg-[#0B1628] text-[#F8F6F1] px-6 font-sans relative overflow-hidden">
      {/* Background Subtle Accent Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#172B4D]/40 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-[#D7C3A5]/5 blur-[100px] pointer-events-none rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-4xl mx-auto text-center space-y-8 relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-[#D7C3A5] text-xs font-mono font-semibold tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5 text-[#D7C3A5]" />
          <span>Sovereign Client Proofing Protocol</span>
        </div>

        <h2 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight">
          Stop chasing approvals.
        </h2>

        <p className="text-lg sm:text-xl text-[#F8F6F1]/80 max-w-xl mx-auto leading-relaxed">
          Give every project a place to move forward.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 rounded-lg bg-[#D7C3A5] hover:bg-[#c9b494] text-[#0B1628] text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
          >
            <span>Start with ProofDesk</span>
            <ArrowRight className="w-4 h-4 text-[#0B1628]" />
          </Link>
          <a
            href="#product"
            className="w-full sm:w-auto px-8 py-4 rounded-lg bg-transparent hover:bg-white/10 border border-white/40 text-white text-sm font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Eye className="w-4 h-4 text-white" />
            <span>See How It Works</span>
          </a>
        </div>

        <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-[#F8F6F1]/60">
          <span>&bull; Zero client sign-ups</span>
          <span>&bull; 5-minute agency setup</span>
          <span>&bull; Lossless JPG, PNG, SVG, AI &amp; ZIP</span>
          <span>&bull; SHA-256 audit certificates</span>
        </div>
      </motion.div>
    </section>
  );
}

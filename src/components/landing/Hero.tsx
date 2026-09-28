"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Eye, ShieldCheck, CheckCircle2 } from "lucide-react";
import { HeroProductVisual } from "./HeroProductVisual";

export function Hero() {
  return (
    <section className="relative pt-36 pb-20 px-6 max-w-7xl mx-auto text-center font-sans">
      {/* Decorative Warm Sand Accent Element */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-48 h-1 bg-[#D7C3A5]/40 rounded-full blur-[1px] pointer-events-none" />

      {/* Small Eyebrow above headline */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F0E7D8] border border-[#DDD8CF] text-[#172B4D] text-[11px] font-mono font-semibold tracking-widest uppercase mb-6"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#D7C3A5]" />
        <span>CLIENT REVIEW &amp; APPROVAL</span>
      </motion.div>

      {/* Main Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
        className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-[#171A1F] max-w-5xl mx-auto leading-[1.05]"
      >
        Get creative work <br />
        <span className="text-[#172B4D] underline decoration-[#D7C3A5] decoration-wavy decoration-2 underline-offset-8">
          approved without
        </span>{" "}
        the back-and-forth.
      </motion.h1>

      {/* Supporting Text */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.2, ease: "easeOut" }}
        className="mt-6 text-lg sm:text-xl text-[#667085] max-w-2xl mx-auto leading-relaxed"
      >
        ProofDesk gives agencies and clients one focused place to review, comment, revise, and approve every deliverable.
      </motion.p>

      {/* Primary & Secondary CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.3, ease: "easeOut" }}
        className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5"
      >
        <Link
          href="/dashboard"
          className="w-full sm:w-auto px-7 py-3.5 rounded-lg bg-[#172B4D] hover:bg-[#0B1628] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
        >
          <span>Start Reviewing</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <a
          href="#product"
          className="w-full sm:w-auto px-7 py-3.5 rounded-lg bg-transparent hover:bg-white border border-[#DDD8CF] text-[#171A1F] text-sm font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <Eye className="w-4 h-4 text-[#667085]" />
          <span>See How It Works</span>
        </a>
      </motion.div>

      {/* Editorial Trust Bullets */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.55, delay: 0.4 }}
        className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-[#667085]"
      >
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#2F6B4F]" />
          <span>Zero client registration needed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-[#DDD8CF]" />
          <span>Supports JPG, PNG, SVG, AI &amp; ZIP packages</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#172B4D]" />
          <span>SHA-256 cryptographic sign-offs</span>
        </div>
      </motion.div>

      {/* Art-Directed Product UI Visual */}
      <motion.div
        id="product"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
        className="mt-14"
      >
        <HeroProductVisual />
      </motion.div>
    </section>
  );
}

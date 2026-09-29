"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Eye, ShieldCheck, CheckCircle2 } from "lucide-react";
import { HeroProductVisual } from "./HeroProductVisual";

export function Hero() {
  return (
    <section className="relative pt-36 pb-20 px-6 max-w-7xl mx-auto text-center font-sans">
      {/* Outcrowd-Inspired Luminous Atmospheric Glow Orbs */}
      <div className="absolute top-28 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] sm:w-[900px] h-[450px] bg-gradient-to-tr from-[#D7C3A5]/35 via-[#29466F]/15 to-transparent rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-[#172B4D]/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Small Eyebrow above headline */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#DDD8CF] text-[#172B4D] text-xs font-mono font-semibold tracking-wider uppercase mb-7 shadow-xs"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>SOVEREIGN ESCROW PROOFING v2.4</span>
      </motion.div>

      {/* Main Headline styled in Fraunces Serif */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
        className="text-5xl sm:text-7xl lg:text-[84px] font-serif font-bold tracking-tight text-[#171A1F] max-w-5xl mx-auto leading-[1.06]"
      >
        Where creative work <br />
        <span className="italic text-[#172B4D] relative">
          gets approved
          <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
            <path d="M2 9C70 3 150 3 298 9" stroke="#D7C3A5" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </span>{" "}
        and paid without friction.
      </motion.h1>

      {/* Supporting Text */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.2, ease: "easeOut" }}
        className="mt-6 text-lg sm:text-xl text-[#667085] max-w-2xl mx-auto leading-relaxed"
      >
        ProofDesk gives agencies and clients one focused place to review, comment, revise, and approve every deliverable — backed by automated escrow protection.
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
          className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#172B4D] hover:bg-[#0B1628] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
        >
          <span>Open Studio Vault</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <a
          href="#product"
          className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-[#F8F6F1] border border-[#DDD8CF] text-[#171A1F] text-sm font-medium flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98]"
        >
          <Eye className="w-4 h-4 text-[#667085]" />
          <span>Explore Live Stage</span>
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

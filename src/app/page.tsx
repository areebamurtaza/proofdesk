// filepath: src/app/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  Unlock,
  CheckCircle2,
  DollarSign,
  Layers,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Eye,
  FileCheck,
  Zap,
  Sliders,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function LandingPage() {
  const [demoState, setDemoState] = useState<"LOCKED" | "UNLOCKED">("LOCKED");

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-emerald-500/30 selection:text-emerald-200 antialiased relative overflow-hidden">
      {/* Background Subtle Geometric Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a15_1px,transparent_1px),linear-gradient(to_bottom,#27272a15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent blur-3xl pointer-events-none" />

      {/* ============================================================ */}
      {/* NAVIGATION BAR                                               */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-[#09090b]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700/80 flex items-center justify-center font-mono font-bold text-xs text-emerald-400 shadow-inner">
              PD
            </div>
            <span className="font-semibold text-sm tracking-tight text-zinc-100">
              ProofDesk <span className="text-zinc-500 font-normal">/ Agency OS</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs text-zinc-400">
            <a href="#how-it-works" className="hover:text-zinc-200 transition-colors">How It Works</a>
            <a href="#security" className="hover:text-zinc-200 transition-colors">Escrow Security</a>
            <a href="#features" className="hover:text-zinc-200 transition-colors">Canvas Engine</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/review/demo-token"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-medium text-zinc-300 transition-all"
            >
              <Eye className="w-3.5 h-3.5 text-zinc-400" />
              <span>Live Client Demo</span>
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold shadow-lg shadow-emerald-950/40 transition-all active:scale-[0.98]"
            >
              <span>Agency Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* HERO SECTION                                                 */}
      {/* ============================================================ */}
      <section className="relative pt-20 pb-16 px-6 max-w-7xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-950/20 text-[11px] font-medium text-emerald-400 tracking-wide">
          <Sparkles className="w-3 h-3" />
          <span>The Sovereign Proofing & Escrow Release Protocol</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-[1.12]">
          Never release unwatermarked deliverables{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-zinc-400">
            before payment clears.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Zero-login client proofing on high-resolution canvas with spatial pins. 
          Legally binding sign-offs trigger Stripe escrow payouts that release 
          master files automatically.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/50 transition-all active:scale-95"
          >
            <span>Launch Agency Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/review/demo-token"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>Inspect Zero-Auth Client View</span>
          </Link>
        </div>

        {/* ============================================================ */}
        {/* INTERACTIVE HERO CANVASES PREVIEW                            */}
        {/* ============================================================ */}
        <div className="pt-12 max-w-5xl mx-auto">
          <div className="rounded-2xl border border-zinc-800/90 bg-zinc-900/40 backdrop-blur-xl p-3 shadow-2xl shadow-black/80">
            {/* Interactive Control Header */}
            <div className="flex items-center justify-between pb-3 px-3 border-b border-zinc-800/80 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <span className="text-zinc-500 ml-2 font-mono text-[11px]">
                  proofdesk.com/review/aura-brand-identity-v2
                </span>
              </div>

              {/* State Switcher Tabs */}
              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                <button
                  onClick={() => setDemoState("LOCKED")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-medium transition-all ${
                    demoState === "LOCKED"
                      ? "bg-zinc-800 text-amber-400 border border-zinc-700/60 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Lock className="w-3 h-3" />
                  <span>Proofing (Watermarked)</span>
                </button>
                <button
                  onClick={() => setDemoState("UNLOCKED")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-medium transition-all ${
                    demoState === "UNLOCKED"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Unlock className="w-3 h-3" />
                  <span>Escrow Cleared (Master Released)</span>
                </button>
              </div>
            </div>

            {/* Interactive Canvas Simulator */}
            <div className="relative h-[420px] rounded-xl bg-zinc-950 border border-zinc-800/80 overflow-hidden flex items-center justify-center">
              {/* Simulated Master Design (Brand Guideline Screen) */}
              <div className="w-[82%] h-[82%] rounded-lg bg-gradient-to-br from-zinc-900 via-[#111115] to-zinc-950 border border-zinc-800 p-8 flex flex-col justify-between relative select-none">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                      Design System &bull; Version 2.4
                    </p>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      Aura Brand Identity Guidelines
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-mono text-xs text-emerald-400">
                      Aa
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono text-xs text-zinc-400">
                      #0F
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="h-16 rounded-md bg-zinc-850/80 border border-zinc-800 p-3 space-y-1">
                    <div className="w-8 h-2 bg-zinc-700 rounded-sm" />
                    <div className="w-14 h-1.5 bg-zinc-800 rounded-sm" />
                  </div>
                  <div className="h-16 rounded-md bg-zinc-850/80 border border-zinc-800 p-3 space-y-1">
                    <div className="w-10 h-2 bg-zinc-700 rounded-sm" />
                    <div className="w-12 h-1.5 bg-zinc-800 rounded-sm" />
                  </div>
                  <div className="h-16 rounded-md bg-zinc-850/80 border border-zinc-800 p-3 space-y-1">
                    <div className="w-6 h-2 bg-zinc-700 rounded-sm" />
                    <div className="w-16 h-1.5 bg-zinc-800 rounded-sm" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono border-t border-zinc-800/80 pt-3">
                  <span>Studio Monolith &copy; 2026</span>
                  <span>Strictly Protected</span>
                </div>

                {/* Pin Feedback Marker (Simulated Pin 1) */}
                {demoState === "LOCKED" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-[38%] left-[28%]"
                  >
                    <div className="w-7 h-7 rounded-full bg-amber-500 border-2 border-white shadow-xl flex items-center justify-center font-bold text-xs text-black cursor-pointer">
                      1
                    </div>
                    <div className="absolute left-9 top-0 bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 shadow-2xl text-[11px] text-zinc-200 whitespace-nowrap z-20">
                      <p className="font-semibold text-white">Sarah Jenkins (Client)</p>
                      <p className="text-zinc-400">Increase header contrast on 4K displays.</p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* WATERMARK OVERLAY (When LOCKED) */}
              <AnimatePresence>
                {demoState === "LOCKED" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 pointer-events-none flex flex-col justify-around py-12 select-none"
                  >
                    <div className="w-full text-center -rotate-12">
                      <p className="font-mono text-sm sm:text-base font-bold text-white/30 tracking-[0.3em] uppercase drop-shadow">
                        PROOFDESK PREVIEW &bull; UNPAID DRAFT
                      </p>
                    </div>
                    <div className="w-full text-center -rotate-12">
                      <p className="font-mono text-xs sm:text-sm font-bold text-white/30 tracking-[0.3em] uppercase drop-shadow">
                        CONFIDENTIAL &bull; PENDING FINAL APPROVAL
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* UNLOCKED BADGE HUD (When UNLOCKED) */}
              <AnimatePresence>
                {demoState === "UNLOCKED" && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    className="absolute bottom-6 bg-zinc-900/90 border border-emerald-500/40 rounded-xl px-5 py-3 shadow-2xl flex items-center gap-4"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-white">Escrow $1,500.00 Settled</p>
                      <p className="text-[11px] text-emerald-400">
                        Audit signed by Sarah Jenkins. Clean master files unlocked.
                      </p>
                    </div>
                    <a
                      href="/review/demo-token"
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black text-[11px] font-semibold hover:bg-emerald-400 transition-colors"
                    >
                      Download Clean Asset
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* THE PROBLEM VS SOLUTION BENTO GRID                           */}
      {/* ============================================================ */}
      <section id="how-it-works" className="py-24 px-6 max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-xs font-mono uppercase tracking-widest text-emerald-400">
            The Escrow Advantage
          </h2>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Built for agencies tired of chasing invoices for work already delivered.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento Card 1 */}
          <div className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700/80 transition-all space-y-4">
            <div className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700/80 flex items-center justify-center text-zinc-300">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Zero-Login Client Proofing</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Clients don't need another password. Send a tokenized URL with short-lived 60s signed preview keys. Viewports support Figma frames and 8K diagrams without bilinear compression.
            </p>
          </div>

          {/* Bento Card 2 */}
          <div className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700/80 transition-all space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Normalized Spatial Coordinates</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Pins are saved as dimensionless percentages (<span className="font-mono text-zinc-300">xPercent, yPercent</span>). Whether inspected on an iPhone or an Apple Pro Display XDR, comments anchor to the exact pixel feature.
            </p>
          </div>

          {/* Bento Card 3 */}
          <div className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700/80 transition-all space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Automated Stripe Paywall</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Master assets are never sent over Slack or email attachments. When the client approves, Stripe Checkout processes payment, triggers the webhook, and unlocks the high-resolution file instantly.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3-STEP PIPELINE WALKTHROUGH                                  */}
      {/* ============================================================ */}
      <section id="features" className="py-20 border-t border-zinc-800/80 bg-zinc-950/60 px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-xs font-mono uppercase tracking-widest text-emerald-400">
              Lifecycle Blueprint
            </h2>
            <p className="text-2xl font-bold tracking-tight text-white">
              From raw export to cleared funds in 3 steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="space-y-3">
              <div className="font-mono text-2xl font-bold text-zinc-700">01</div>
              <h4 className="text-sm font-semibold text-zinc-100">Upload & Mint Review Link</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Drop your PDF, PNG, or SVG master file. ProofDesk stores it in the private vault, generates an ephemeral preview, and issues a zero-login client link with an automated watermark overlay.
              </p>
            </div>

            <div className="space-y-3">
              <div className="font-mono text-2xl font-bold text-zinc-700">02</div>
              <h4 className="text-sm font-semibold text-zinc-100">Client Reviews & Pins Feedback</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                The reviewer zooms, pans, drops pins, and compares v1 vs v2 with a live split-slider. Right-click, print, and save keyboard shortcuts are completely suppressed at the canvas level.
              </p>
            </div>

            <div className="space-y-3">
              <div className="font-mono text-2xl font-bold text-zinc-700">03</div>
              <h4 className="text-sm font-semibold text-zinc-100">Sign-Off, Stripe Settlement & Release</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                The client signs legal consent. ProofDesk creates an immutable audit record and triggers Stripe Checkout. Once paid, the watermark drops and the clean master file unlocks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* BOTTOM ACTION BANNER                                         */}
      {/* ============================================================ */}
      <section className="py-24 px-6 max-w-5xl mx-auto text-center">
        <div className="p-12 rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-900/50 to-zinc-950 border border-zinc-800 space-y-6 shadow-2xl">
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
            Stop giving away your master files for free.
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
            Test the live demo portal as a client, or open the agency dashboard to upload production assets right now.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all"
            >
              <span>Go to Agency Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/review/demo-token"
              className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <span>Test Client Portal</span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* MINIMALIST FOOTER                                            */}
      {/* ============================================================ */}
      <footer className="border-t border-zinc-800/60 py-8 px-6 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-zinc-800 flex items-center justify-center font-mono text-[10px] text-emerald-400 font-bold">
              PD
            </div>
            <span>ProofDesk Architecture Protocol &bull; 2026 Beta</span>
          </div>
          <p className="text-zinc-600 text-[11px]">
            Cloudflare R2 &bull; PostgreSQL &bull; Prisma &bull; Stripe Escrow Integration
          </p>
        </div>
      </footer>
    </div>
  );
}
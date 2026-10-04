"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Upload,
  Share2,
  MessageCircle,
  GitCompare,
  CheckCircle2,
  Play,
  Pause,
  ArrowRight,
  Sparkles,
  Link2,
  Copy,
  Check,
  Lock,
  Unlock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WorkflowStep {
  id: string;
  num: string;
  tag: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  specs: { label: string; value: string }[];
}

const STEP_DURATION = 5000; // 5 seconds per step

export function WorkflowSection() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const steps: WorkflowStep[] = [
    {
      id: "ingest",
      num: "01",
      tag: "INGESTION",
      title: "Upload Master",
      shortDesc: "Lossless vector vault",
      fullDesc:
        "Upload print-ready AI, SVG, or high-res masters directly to the encrypted escrow vault. Metadata and color spaces are preserved automatically.",
      badge: "300 DPI • Ingested",
      icon: Upload,
      specs: [
        { label: "Color Profile", value: "Adobe RGB / CMYK" },
        { label: "Integrity", value: "SHA-256 Verified" },
        { label: "Escrow Deposit", value: "$4,500.00 Locked" },
      ],
    },
    {
      id: "dispatch",
      num: "02",
      tag: "DISPATCH",
      title: "Zero-Auth URL",
      shortDesc: "Passwordless review link",
      fullDesc:
        "Generate a client-specific cryptographic review token. Clients review immediately in their browser without account creation or login friction.",
      badge: "Zero-Auth Token",
      icon: Share2,
      specs: [
        { label: "Authentication", value: "Cryptographic Token" },
        { label: "Client Login", value: "Zero Sign-up" },
        { label: "Access Security", value: "Read / Annotate" },
      ],
    },
    {
      id: "proofing",
      num: "03",
      tag: "PROOFING",
      title: "Spatial Pins",
      shortDesc: "Pixel-accurate feedback",
      fullDesc:
        "Clients click directly on canvas pixels to leave unambiguous spatial pins. Threads are tied to exact visual coordinates so feedback is never misread.",
      badge: "Spatial Coordinates",
      icon: MessageCircle,
      specs: [
        { label: "Coordinates", value: "Sub-pixel (X, Y)" },
        { label: "Open Issues", value: "1 Active • 2 Resolved" },
        { label: "Client Lead", value: "Elena Rostova" },
      ],
    },
    {
      id: "iteration",
      num: "04",
      tag: "ITERATION",
      title: "Version Lineage",
      shortDesc: "Side-by-side diffing",
      fullDesc:
        "Audit version progression from V1 to V4. Split comparator highlights visual revisions so both studio and client verify edits in seconds.",
      badge: "V1 ↔ V4 Comparator",
      icon: GitCompare,
      specs: [
        { label: "Active Version", value: "V4 (Master Proof)" },
        { label: "Diff Verification", value: "100% Cleared" },
        { label: "Revision Audit", value: "Immutable Log" },
      ],
    },
    {
      id: "clearance",
      num: "05",
      tag: "CLEARANCE",
      title: "Escrow Release",
      shortDesc: "Instant payout release",
      fullDesc:
        "One-click client sign-off records an ESIGN audit seal and triggers automated Stripe escrow settlement directly to your studio bank account.",
      badge: "Funds Released",
      icon: CheckCircle2,
      specs: [
        { label: "Escrow Amount", value: "$4,500.00 USD" },
        { label: "Payout Protocol", value: "Stripe Connect" },
        { label: "Compliance", value: "ESIGN & UETA Seal" },
      ],
    },
  ];

  // Auto-advance timer logic
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalMs = 50;
    const increment = (intervalMs / STEP_DURATION) * 100;

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveStep((current) => (current + 1) % steps.length);
          return 0;
        }
        return prev + increment;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, steps.length]);

  const handleStepSelect = (index: number) => {
    setActiveStep(index);
    setProgress(0);
  };

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleCopyLink = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const currentStep = steps[activeStep];
  const CurrentIcon = currentStep.icon;

  return (
    <section
      id="workflow"
      className="py-14 sm:py-16 border-t border-[#DDD8CF] bg-[#F8F6F1] px-4 sm:px-6 font-sans overflow-hidden"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Compact Header: Fits within viewport alongside the stage */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#172B4D]/5 border border-[#172B4D]/10 text-[#172B4D] text-[11px] font-mono font-semibold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-[#B7791F]" />
              <span>Interactive Pipeline</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold tracking-tight text-[#171A1F]">
              From first draft to sealed release.
            </h2>
          </div>

          {/* Compact Story Controller */}
          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
            <button
              onClick={togglePlayPause}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#DDD8CF] hover:border-[#172B4D] text-[#171A1F] text-xs font-mono font-medium shadow-2xs transition-all active:scale-95 cursor-pointer"
              title={isPlaying ? "Pause auto-advancing story" : "Play auto-advancing story"}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3 h-3 text-[#172B4D]" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                  <span>Auto-Play</span>
                </>
              )}
            </button>
            <div className="text-xs font-mono text-[#667085] px-2.5 py-1.5 bg-[#EBE7DF] rounded-lg">
              <span className="font-bold text-[#171A1F]">0{activeStep + 1}</span> / 0{steps.length}
            </div>
          </div>
        </div>

        {/* ── Compact Stepper Strip with Live Filling Progress Line ── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {steps.map((step, idx) => {
            const isActive = activeStep === idx;
            const Icon = step.icon;

            return (
              <button
                key={step.id}
                onClick={() => handleStepSelect(idx)}
                className={`relative text-left p-2.5 sm:p-3 rounded-xl border transition-all overflow-hidden flex flex-col justify-between cursor-pointer last:col-span-2 sm:last:col-span-1 ${
                  isActive
                    ? "bg-white border-[#172B4D] shadow-xs ring-1 ring-[#172B4D]"
                    : "bg-white/60 hover:bg-white border-[#DDD8CF] hover:border-[#172B4D]/30"
                }`}
              >
                {/* Thin Top Progress Line */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-transparent overflow-hidden">
                  {isActive && (
                    <div
                      className="h-full bg-gradient-to-r from-[#172B4D] to-[#D7C3A5] transition-all duration-75 ease-linear"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                </div>

                <div className="flex items-center justify-between w-full mb-1.5">
                  <span
                    className={`font-mono text-[11px] font-bold ${
                      isActive ? "text-[#172B4D]" : "text-[#667085]"
                    }`}
                  >
                    {step.num}
                  </span>
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                      isActive
                        ? "bg-[#172B4D] text-[#D7C3A5]"
                        : "bg-[#F0E7D8]/60 text-[#667085]"
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                  </div>
                </div>

                <div>
                  <h4
                    className={`text-xs font-semibold tracking-tight truncate ${
                      isActive ? "text-[#171A1F]" : "text-[#475467]"
                    }`}
                  >
                    {step.title}
                  </h4>
                  <p className="text-[10px] text-[#667085] truncate hidden sm:block">
                    {step.shortDesc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Main Unified Viewport-Friendly Stage ── */}
        <div
          onMouseEnter={() => setIsPlaying(false)}
          onMouseLeave={() => setIsPlaying(true)}
          className="relative rounded-2xl bg-[#0B1628] border border-[#172B4D] overflow-hidden shadow-xl text-white"
        >
          {/* Mac Window Title Bar */}
          <div className="px-4 py-2.5 bg-[#070E1A] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-[11px] text-white/50 hidden sm:inline">
                proofdesk.app &bull; {currentStep.tag.toLowerCase()} / {currentStep.id}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono text-[#D7C3A5] font-semibold">
                STAGE 0{activeStep + 1}: {currentStep.tag}
              </span>
            </div>
          </div>

          {/* Stage Body: Split 40% Editorial / 60% Real UI Mockup */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px] lg:min-h-[420px]">
            {/* Left Column: Context & Micro Specs */}
            <div className="lg:col-span-5 p-5 sm:p-6 lg:p-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 text-left bg-gradient-to-b from-[#0B1628] to-[#0E1B33]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 border border-white/15 text-[#D7C3A5] font-mono text-[11px] font-bold tracking-wider uppercase">
                    <CurrentIcon className="w-3.5 h-3.5" />
                    <span>{currentStep.badge}</span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
                      {currentStep.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-sans">
                      {currentStep.fullDesc}
                    </p>
                  </div>

                  {/* Micro Specs Grid */}
                  <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 pt-1">
                    {currentStep.specs.map((spec, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-lg bg-white/[0.04] border border-white/10 space-y-0.5"
                      >
                        <span className="text-[9px] font-mono uppercase tracking-wider text-white/50 block">
                          {spec.label}
                        </span>
                        <span className="text-[11px] font-mono font-semibold text-white/90 block truncate">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Step Navigation Pill */}
              <div className="pt-4 mt-2 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={() => handleStepSelect((activeStep + 1) % steps.length)}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#D7C3A5] hover:bg-white text-[#0B1628] font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  <span>Next: {steps[(activeStep + 1) % steps.length].title}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono text-white/40 hidden sm:inline">
                  Hover pauses playback
                </span>
              </div>
            </div>

            {/* Right Column: ACTUAL PROOFDESK SCREENSHOTS & REAL UI MOCKUPS */}
            <div className="lg:col-span-7 p-4 sm:p-6 flex items-center justify-center bg-[#070E1A]/60">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full flex flex-col justify-center"
                >
                  {/* ──────────────── STAGE 1: REAL UPLOAD & ESCROW INGESTION UI ──────────────── */}
                  {currentStep.id === "ingest" && (
                    <div className="w-full bg-[#121E36] rounded-xl border border-white/15 p-4 sm:p-5 space-y-4 shadow-xl text-left font-sans">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#172B4D] flex items-center justify-center text-[#D7C3A5]">
                            <Upload className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">Deliverable Master Ingestion</h4>
                            <p className="text-[10px] font-mono text-white/50">Lossless Studio Vault &bull; Project #PR-8402</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Ready for Dispatch
                        </span>
                      </div>

                      {/* File Card with Real Specs */}
                      <div className="bg-[#0B1628] rounded-lg border border-white/10 p-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[#B7791F]/20 border border-[#B7791F]/30 flex items-center justify-center text-[#D7C3A5] font-mono font-bold text-xs">
                            AI
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">Apex_Brand_Packaging_Master.ai</span>
                            <span className="text-[10px] font-mono text-white/60">
                              84.2 MB &bull; 300 DPI Vector &bull; CMYK (FOGRA39) & Adobe RGB
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-1 rounded bg-white/10 text-white/90">
                          100% Ingested
                        </span>
                      </div>

                      {/* Escrow Lock Banner */}
                      <div className="p-3 rounded-lg bg-gradient-to-r from-[#172B4D] to-[#1F3A60] border border-white/15 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-[#D7C3A5]" />
                          <div>
                            <div className="text-xs font-bold text-white">Stripe Escrow Lock Active</div>
                            <div className="text-[10px] text-white/70">Payment held safely until formal client digital clearance.</div>
                          </div>
                        </div>
                        <span className="font-mono text-xs font-bold text-[#D7C3A5] bg-black/40 px-2 py-1 rounded border border-white/10">
                          $4,500.00 USD
                        </span>
                      </div>
                    </div>
                  )}

                  {/* ──────────────── STAGE 2: REAL ZERO-AUTH DISPATCH DIALOG UI ──────────────── */}
                  {currentStep.id === "dispatch" && (
                    <div className="w-full bg-[#121E36] rounded-xl border border-white/15 p-4 sm:p-5 space-y-4 shadow-xl text-left font-sans">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#172B4D] flex items-center justify-center text-[#D7C3A5]">
                            <Link2 className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">Cryptographic Review Token</h4>
                            <p className="text-[10px] font-mono text-white/50">One-click client entry &bull; Zero login required</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Token Valid
                        </span>
                      </div>

                      {/* Live Token URL Copy Bar */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-white/60">
                          Direct Client Review URL
                        </label>
                        <div className="flex items-center gap-2 bg-[#0B1628] rounded-lg border border-white/10 p-2">
                          <span className="font-mono text-xs text-white/90 flex-1 truncate select-all">
                            https://proofdesk.io/review/tok_client_apex_9a8f2
                          </span>
                          <button
                            onClick={handleCopyLink}
                            className="px-2.5 py-1 rounded bg-[#D7C3A5] text-[#0B1628] text-xs font-bold flex items-center gap-1 hover:bg-white transition-all active:scale-95 cursor-pointer"
                          >
                            {copiedLink ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedLink ? "Copied" : "Copy"}</span>
                          </button>
                        </div>
                      </div>

                      {/* Client Permissions Matrix */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-white/[0.04] border border-white/10">
                          <div className="text-[10px] font-mono text-white/50 uppercase">Recipient</div>
                          <div className="text-xs font-semibold text-white truncate mt-0.5">elena@apexbrands.co</div>
                          <div className="text-[10px] text-white/60">Lead Brand Reviewer</div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white/[0.04] border border-white/10">
                          <div className="text-[10px] font-mono text-white/50 uppercase">Permissions</div>
                          <div className="text-xs font-semibold text-white truncate mt-0.5">Annotate & Sign-Off</div>
                          <div className="text-[10px] text-emerald-400">Escrow Release Permitted</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ──────────────── STAGE 3: REAL SPATIAL PROOFING CANVAS UI ──────────────── */}
                  {currentStep.id === "proofing" && (
                    <div className="w-full bg-[#121E36] rounded-xl border border-white/15 overflow-hidden shadow-xl text-left font-sans">
                      {/* Canvas Header */}
                      <div className="px-4 py-2 bg-[#0B1628] border-b border-white/10 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="font-bold text-white">Client Review Canvas</span>
                          <span className="font-mono text-[10px] text-white/50">100% Zoom &bull; 2 Pins Active</span>
                        </div>
                        <span className="font-mono text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/80">
                          Version 3 Master
                        </span>
                      </div>

                      {/* Interactive Proof Canvas Mockup with Spatial Pins */}
                      <div className="relative aspect-[16/9] w-full bg-[#182339] p-4 flex items-center justify-center overflow-hidden">
                        {/* Authentic Brand Deliverable Artwork */}
                        <div className="relative w-4/5 h-4/5 rounded-lg bg-gradient-to-tr from-[#1E293B] via-[#0F172A] to-[#1E293B] border border-white/20 p-4 flex flex-col justify-between shadow-2xl">
                          <div className="flex items-center justify-between">
                            <span className="font-serif tracking-widest text-xs font-bold text-[#D7C3A5]">APEX LUXURY LABS</span>
                            <span className="font-mono text-[9px] text-white/50">PACKAGING SPEC 04</span>
                          </div>

                          <div className="text-center space-y-1">
                            <div className="w-12 h-12 mx-auto rounded-full border border-[#D7C3A5]/40 flex items-center justify-center text-[#D7C3A5]">
                              <Sparkles className="w-5 h-5" />
                            </div>
                            <div className="font-serif text-sm tracking-wide text-white">AURA EXTRACT</div>
                            <div className="text-[9px] font-mono text-white/40">300 DPI MASTER VECTOR</div>
                          </div>

                          <div className="flex items-center justify-between text-[9px] font-mono text-white/40">
                            <span>CMYK 40/30/20/100</span>
                            <span>PANTONE 871 C FOIL</span>
                          </div>
                        </div>

                        {/* Real Spatial Coordinate Pin #1 */}
                        <div className="absolute top-[28%] left-[26%] z-20 group cursor-pointer">
                          <span className="absolute -inset-1 rounded-full bg-[#D7C3A5] animate-ping opacity-75 pointer-events-none" />
                          <div className="relative w-6 h-6 rounded-full bg-[#D7C3A5] text-[#0B1628] font-mono text-[11px] font-bold flex items-center justify-center shadow-lg ring-2 ring-white">
                            1
                          </div>
                          {/* Pin Comment Box */}
                          <div className="absolute left-7 -top-2 w-48 p-2 rounded-lg bg-[#070E1A]/95 border border-white/20 shadow-xl backdrop-blur-md">
                            <div className="flex items-center justify-between text-[9px] font-mono text-[#D7C3A5]">
                              <span>Elena R. (Client Lead)</span>
                              <span>10:24 AM</span>
                            </div>
                            <p className="text-[10px] text-white/90 mt-0.5">
                              Deepen bronze foil density on primary wordmark.
                            </p>
                          </div>
                        </div>

                        {/* Real Spatial Coordinate Pin #2 */}
                        <div className="absolute bottom-[24%] right-[22%] z-20">
                          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white font-mono text-[11px] font-bold flex items-center justify-center shadow-lg ring-2 ring-white">
                            ✓
                          </div>
                        </div>
                      </div>

                      {/* Canvas Status Footer */}
                      <div className="px-4 py-2 bg-[#0B1628] border-t border-white/10 flex items-center justify-between text-[11px]">
                        <span className="text-white/60">Clicking pixels records exact (X, Y) coordinates</span>
                        <span className="text-[#D7C3A5] font-mono font-semibold">1 Pin Pending Revision</span>
                      </div>
                    </div>
                  )}

                  {/* ──────────────── STAGE 4: REAL VERSION COMPARATOR UI ──────────────── */}
                  {currentStep.id === "iteration" && (
                    <div className="w-full bg-[#121E36] rounded-xl border border-white/15 p-4 sm:p-5 space-y-3.5 shadow-xl text-left font-sans">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                        <div className="flex items-center gap-2">
                          <GitCompare className="w-4 h-4 text-[#D7C3A5]" />
                          <h4 className="text-xs font-bold text-white">Version Comparator & Lineage</h4>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-[10px]">
                          <span className="px-2 py-0.5 rounded bg-white/10 text-white/60">V1</span>
                          <span className="px-2 py-0.5 rounded bg-white/10 text-white/60">V2</span>
                          <span className="px-2 py-0.5 rounded bg-white/10 text-white/60">V3</span>
                          <span className="px-2 py-0.5 rounded bg-[#172B4D] border border-[#D7C3A5]/40 text-[#D7C3A5] font-bold">
                            V4 (Current)
                          </span>
                        </div>
                      </div>

                      {/* Side-by-Side Comparison Split */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#0B1628] rounded-lg border border-rose-500/20 p-3 space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="text-rose-400 font-bold">Version 1 (Initial)</span>
                            <span className="text-white/50">Oct 12</span>
                          </div>
                          <div className="h-16 rounded bg-slate-900/80 border border-white/10 p-2 flex items-center justify-center text-center">
                            <span className="text-[10px] text-white/50 line-through">Loose Kerning & Standard Ink</span>
                          </div>
                          <span className="text-[10px] text-rose-300/80 block font-mono">3 client change requests</span>
                        </div>

                        <div className="bg-[#0B1628] rounded-lg border border-emerald-500/30 p-3 space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="text-emerald-400 font-bold">Version 4 (Final Master)</span>
                            <span className="text-emerald-400">Resolved</span>
                          </div>
                          <div className="h-16 rounded bg-slate-900/80 border border-emerald-500/30 p-2 flex items-center justify-center text-center">
                            <span className="text-[10px] text-white/90 font-medium">Calibrated Bronze Foil & Tight Kerning</span>
                          </div>
                          <span className="text-[10px] text-emerald-400 block font-mono">✓ All 9 diff items resolved</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-between text-[11px] font-mono">
                        <span className="text-white/70">Diff Delta: Vector Kerning + Pantone Foil Spec</span>
                        <span className="text-emerald-400 font-bold">Ready For Sign-Off &bull; 100%</span>
                      </div>
                    </div>
                  )}

                  {/* ──────────────── STAGE 5: REAL DIGITAL SIGN-OFF & ESCROW CLEARANCE UI ──────────────── */}
                  {currentStep.id === "clearance" && (
                    <div className="w-full bg-[#121E36] rounded-xl border border-white/15 p-4 sm:p-5 space-y-3.5 shadow-xl text-left font-sans">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">Escrow Clearance Certificate</h4>
                            <p className="text-[10px] font-mono text-emerald-400">ESIGN & UETA Cryptographic Seal</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500 text-[#0B1628] font-bold">
                          Settled
                        </span>
                      </div>

                      {/* Payout Clearance Card */}
                      <div className="p-3.5 rounded-lg bg-gradient-to-r from-[#0B1628] to-[#162744] border border-emerald-500/30 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="text-[10px] font-mono text-white/60 uppercase">Stripe Connect Transfer</div>
                          <div className="text-base font-mono font-bold text-white">$4,500.00 USD</div>
                          <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Released to Studio Payout Account</span>
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                          <Unlock className="w-5 h-5" />
                        </div>
                      </div>

                      {/* Audit Seal Metadata */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                        <div className="p-2 rounded bg-white/[0.04] border border-white/10">
                          <span className="text-white/50 block">Signed By</span>
                          <span className="text-white/90 font-bold block truncate">Elena Rostova (Client)</span>
                        </div>
                        <div className="p-2 rounded bg-white/[0.04] border border-white/10">
                          <span className="text-white/50 block">SHA-256 Audit Seal</span>
                          <span className="text-white/90 font-bold block truncate">7f9a84...bc291</span>
                        </div>
                      </div>

                      <div className="text-[10px] font-mono text-white/60 flex items-center justify-between pt-1">
                        <span>Watermark automatically purged</span>
                        <span className="text-[#D7C3A5]">Master Package Download Active &rarr;</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

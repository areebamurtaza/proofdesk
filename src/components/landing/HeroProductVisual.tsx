"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Check,
  Clock,
  Layers,
  Sparkles,
  Copy,
  CheckCircle2,
  Lock,
  Unlock,
} from "lucide-react";
import {
  LogoConstructionArtboard,
  CampaignBannerArtboard,
  MonogramIdentityArtboard,
  MasterBrandSystemArtboard,
} from "./DesignArtboards";

interface VersionItem {
  num: number;
  label: string;
  date: string;
  title: string;
  format: string;
  status: string;
  component: React.ComponentType<{ className?: string }>;
}

export function HeroProductVisual() {
  const [selectedVersion, setSelectedVersion] = useState<number>(4);
  const [demoStatus, setDemoStatus] = useState<"CHANGES_REQUESTED" | "APPROVED">("CHANGES_REQUESTED");
  const [activePin, setActivePin] = useState<number>(1);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const versions: VersionItem[] = [
    {
      num: 1,
      label: "V1",
      date: "Oct 12",
      title: "Logo Construction & Vector Grid Matrix",
      format: "AI / SVG • 42 MB",
      status: "Superseded",
      component: LogoConstructionArtboard,
    },
    {
      num: 2,
      label: "V2",
      date: "Oct 14",
      title: "Digital Display Campaign Ad Banner (1920×1080)",
      format: "AI / 300DPI PNG • 58 MB",
      status: "Revised",
      component: CampaignBannerArtboard,
    },
    {
      num: 3,
      label: "V3",
      date: "Oct 15",
      title: "Luxury Monogram & Pantone 871C Hot Foil Sheet",
      format: "AI / PDF Die-Cut • 74 MB",
      status: "Changes Requested",
      component: MonogramIdentityArtboard,
    },
    {
      num: 4,
      label: "V4",
      date: "Today",
      title: "Master Brand Identity & Multi-Variant System",
      format: "Lossless Master Suite • 98 MB",
      status: demoStatus === "APPROVED" ? "Approved" : "Active Review",
      component: MasterBrandSystemArtboard,
    },
  ];

  const currentVersion = versions.find((v) => v.num === selectedVersion) || versions[3];

  const pins = [
    {
      id: 1,
      x: "34%",
      y: "32%",
      author: "Marcus Vance",
      role: "Art Director",
      time: "10:14 AM",
      text: "Increase optical breathing room between primary wordmark and geometric apex. Calibrate tight kerning for large-format print.",
      status: "OPEN",
    },
    {
      id: 2,
      x: "66%",
      y: "40%",
      author: "Elena Rostova",
      role: "Client Lead",
      time: "10:35 AM",
      text: "The chromatic gradient balance is exceptional on the metallic packaging mockup. Approved for master packaging proofing.",
      status: "RESOLVED",
    },
    {
      id: 3,
      x: "52%",
      y: "72%",
      author: "Sarah Chen",
      role: "Senior Designer",
      time: "11:02 AM",
      text: "Ensure secondary icon symbols export in lossless SVG along with 300DPI vector master for packaging production.",
      status: "OPEN",
    },
  ];

  const currentPin = pins.find((p) => p.id === activePin) || pins[0];

  const handleCopyDemoLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText("https://proofdesk.io/review/aura_v4_910x");
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto font-sans select-none">
      {/* ── Atmospheric Glow Backdrop behind the Stage ── */}
      <div className="absolute -inset-4 bg-gradient-to-r from-[#D7C3A5]/25 via-[#29466F]/15 to-[#D7C3A5]/20 rounded-3xl blur-2xl -z-10 pointer-events-none" />

      {/* ── FLOATING GLASS HUD CARD 1: Top-Left Escrow Lock Pill ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: [0, -4, 0] }}
        transition={{
          opacity: { duration: 0.5 },
          y: { repeat: Infinity, duration: 4.5, ease: "easeInOut" },
        }}
        className="hidden sm:flex absolute -top-5 left-4 lg:left-8 z-30 items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/60 shadow-[0_12px_32px_rgba(11,22,40,0.12)]"
      >
        <div className="w-8 h-8 rounded-xl bg-[#172B4D]/10 border border-[#172B4D]/15 flex items-center justify-center text-[#172B4D]">
          {demoStatus === "APPROVED" ? (
            <Unlock className="w-4 h-4 text-emerald-600" />
          ) : (
            <Lock className="w-4 h-4 text-[#B7791F]" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#171A1F]">
            <span>Escrow Vault:</span>
            <span className="font-mono text-sm text-[#172B4D] font-extrabold">$4,500.00</span>
          </div>
          <p className="text-[10px] text-[#667085] flex items-center gap-1">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                demoStatus === "APPROVED" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
              }`}
            />
            <span>{demoStatus === "APPROVED" ? "Funds Released to Studio" : "Stripe Escrow Locked"}</span>
          </p>
        </div>
      </motion.div>

      {/* ── FLOATING GLASS HUD CARD 2: Top-Right Zero-Auth Review Token Chip ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: [0, 4, 0] }}
        transition={{
          opacity: { duration: 0.5, delay: 0.1 },
          y: { repeat: Infinity, duration: 5, ease: "easeInOut" },
        }}
        className="hidden sm:flex absolute -top-5 right-4 lg:right-8 z-30 items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/60 shadow-[0_12px_32px_rgba(11,22,40,0.12)] cursor-pointer hover:bg-white transition-all"
        onClick={handleCopyDemoLink}
      >
        <div className="w-7 h-7 rounded-lg bg-[#F0E7D8] flex items-center justify-center text-[#172B4D]">
          <Sparkles className="w-3.5 h-3.5 text-[#B7791F]" />
        </div>
        <div className="text-left">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#667085]">Zero-Auth Client Link</p>
          <p className="text-xs font-mono font-semibold text-[#171A1F]">proofdesk.io/review/aura_v4</p>
        </div>
        <button
          className="ml-1 p-1.5 rounded-md hover:bg-[#F8F6F1] text-[#667085] hover:text-[#171A1F] transition-colors"
          title="Copy demo review link"
        >
          {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </motion.div>

      {/* ── MAIN STAGE CONTAINER ── */}
      <div className="w-full rounded-3xl border border-[#DDD8CF] bg-white shadow-[0_28px_80px_rgba(11,22,40,0.1)] overflow-hidden text-left transition-all">
        {/* Deep Navy Top Frame Bar */}
        <div className="bg-[#0B1628] text-white px-5 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-[#172B4D]">
          {/* Left: Window controls & active file specs */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
            </div>
            <div className="h-4 w-px bg-white/20 mx-1" />
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-xs sm:text-sm text-white tracking-tight truncate max-w-xs sm:max-w-md">
                {currentVersion.title}
              </span>
              <span className="hidden md:inline font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-[#D7C3A5]">
                {currentVersion.format}
              </span>
            </div>
          </div>

          {/* Right: Interactive One-Click Approval Switcher */}
          <div className="flex items-center gap-2">
            <span className="hidden lg:inline text-[11px] font-mono text-[#DDD8CF]/80">Client Sign-Off:</span>
            <button
              onClick={() =>
                setDemoStatus(demoStatus === "APPROVED" ? "CHANGES_REQUESTED" : "APPROVED")
              }
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
                demoStatus === "APPROVED"
                  ? "bg-[#2F6B4F] text-white ring-2 ring-emerald-400/40"
                  : "bg-[#172B4D] hover:bg-[#29466F] text-[#D7C3A5] border border-[#29466F]"
              }`}
            >
              {demoStatus === "APPROVED" ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>✓ APPROVED &amp; SEALED</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-[#D7C3A5]" />
                  <span>Click to Simulate Sign-off</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Central Creative Canvas Viewport with Overlapping HUD ── */}
        <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-[#0B1628]/95 overflow-hidden group">
          {/* Genuine Creative Design Asset */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentVersion.num}
              initial={{ opacity: 0.4, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0.4 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full h-full"
            >
              <currentVersion.component className="w-full h-full" />
            </motion.div>
          </AnimatePresence>

          {/* Atmospheric Vignette & Subtle Watermark Overlay (Only when in proofing state) */}
          <div
            className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${
              demoStatus === "APPROVED" ? "bg-black/10" : "bg-black/30"
            }`}
          />

          {demoStatus !== "APPROVED" && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <span className="text-4xl sm:text-6xl lg:text-7xl font-mono font-black text-white uppercase tracking-[0.25em] -rotate-12 select-none">
                PROOFDESK &bull; ESCROW
              </span>
            </div>
          )}

          {/* Top Stage Specs Ribbon */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-white/90 pointer-events-none">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20">
              <Layers className="w-3 h-3 text-[#D7C3A5]" />
              <span>Checkpoint: {currentVersion.label} ({currentVersion.date})</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>3 Spatial Review Coordinates</span>
            </div>
          </div>

          {/* ── Interactive Coordinate Pins on Artwork ── */}
          {pins.map((pin) => {
            const isSelected = activePin === pin.id;
            return (
              <div
                key={pin.id}
                style={{ top: pin.y, left: pin.x }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
              >
                {/* Pulsing ring animation */}
                {isSelected && (
                  <span className="absolute -inset-2 rounded-full bg-[#D7C3A5] animate-ping opacity-75 pointer-events-none" />
                )}

                <button
                  onClick={() => setActivePin(pin.id)}
                  className={`relative w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all shadow-xl active:scale-95 ${
                    isSelected
                      ? "bg-[#D7C3A5] text-[#0B1628] ring-4 ring-white/80 scale-110"
                      : "bg-[#172B4D] text-white hover:scale-110 hover:bg-[#0B1628] ring-2 ring-white/40"
                  }`}
                  title={`Pin 0${pin.id}: ${pin.author}`}
                >
                  {pin.id}
                </button>
              </div>
            );
          })}

          {/* ── FLOATING GLASS HUD CARD 3 (Bottom-Left): Version Lineage Controller ── */}
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 p-1.5 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/20 shadow-xl">
            <span className="hidden sm:inline text-[10px] font-mono text-[#DDD8CF]/80 uppercase px-2 font-semibold">
              Lineage:
            </span>
            {versions.map((v) => (
              <button
                key={v.num}
                onClick={() => setSelectedVersion(v.num)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  selectedVersion === v.num
                    ? "bg-[#D7C3A5] text-[#0B1628] shadow-sm scale-105"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* ── FLOATING GLASS HUD CARD 4 (Bottom-Right): Pinpoint Inspector ── */}
          <motion.div
            key={currentPin.id}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute bottom-4 right-4 z-20 max-w-[280px] sm:max-w-sm p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/60 shadow-[0_16px_40px_rgba(11,22,40,0.18)]"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#DDD8CF]/60">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#172B4D] text-[#D7C3A5] flex items-center justify-center font-mono text-[10px] font-bold">
                  {currentPin.author.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#171A1F] leading-none">{currentPin.author}</p>
                  <p className="text-[10px] text-[#667085] mt-0.5">{currentPin.role}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#F0E7D8] text-[#172B4D]">
                Pin 0{currentPin.id}
              </span>
            </div>

            <p className="text-xs text-[#171A1F] leading-relaxed my-2.5 line-clamp-2">
              &ldquo;{currentPin.text}&rdquo;
            </p>

            <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-[#667085]">
              <span>Status</span>
              <span
                className={`font-bold px-2 py-0.5 rounded-full ${
                  currentPin.status === "RESOLVED"
                    ? "bg-emerald-50 text-[#2F6B4F] border border-emerald-200"
                    : "bg-amber-50 text-[#B7791F] border border-amber-200"
                }`}
              >
                {currentPin.status}
              </span>
            </div>
          </motion.div>
        </div>

        {/* ── Bottom Telemetry Ledger Strip ── */}
        <div className="bg-[#F8F6F1] px-5 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-[#DDD8CF]">
          <div className="flex items-center gap-2 text-[#667085]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#172B4D]" />
            <span className="font-mono text-[11px]">
              SHA-256: <span className="text-[#171A1F] font-bold">9b40...21799</span> &bull; Cryptographically Sealed
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-[#667085]">
            <span className="hidden sm:inline">Zero-Login Client Proofing</span>
            <span className="w-1 h-1 rounded-full bg-[#DDD8CF]" />
            <span className="text-[#2F6B4F] font-bold">Escrow Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}

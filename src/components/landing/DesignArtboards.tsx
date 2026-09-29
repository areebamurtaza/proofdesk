"use client";

import React from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";

interface ArtboardProps {
  className?: string;
}

/**
 * V1: Logo Construction & Vector Grid Artboard
 * Features geometric construction guides, anchor points, kerning calipers, and color swatches.
 */
export function LogoConstructionArtboard({ className = "" }: ArtboardProps) {
  return (
    <div
      className={`relative w-full h-full bg-[#090F1C] overflow-hidden flex flex-col justify-between p-6 sm:p-8 select-none font-sans ${className}`}
    >
      {/* Blueprint Grid Pattern */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(215, 195, 165, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(215, 195, 165, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Top Metadata Header */}
      <div className="relative z-10 flex items-center justify-between text-[11px] font-mono border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-white/80 font-bold tracking-wider uppercase">
            Artboard 01 &bull; Logo Geometry &amp; Grid
          </span>
        </div>
        <span className="text-[#D7C3A5] bg-[#172B4D]/60 px-2 py-0.5 rounded border border-[#D7C3A5]/30">
          Scale: 1:1 Vector AI
        </span>
      </div>

      {/* Center: Vector Logo Construction with Construction Circles & Guides */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center py-4">
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center">
          {/* Construction Circles */}
          <div className="absolute inset-0 rounded-full border border-dashed border-[#D7C3A5]/25" />
          <div className="absolute inset-4 rounded-full border border-dashed border-cyan-400/20" />
          <div className="absolute inset-10 rounded-full border border-dashed border-white/15" />

          {/* Alignment Crosshairs */}
          <div className="absolute inset-x-0 top-1/2 h-[1px] bg-cyan-500/20" />
          <div className="absolute inset-y-0 left-1/2 w-[1px] bg-cyan-500/20" />

          {/* Golden Ratio Angle Lines */}
          <div className="absolute w-full h-[1px] bg-amber-400/20 rotate-45" />
          <div className="absolute w-full h-[1px] bg-amber-400/20 -rotate-45" />

          {/* Vector Geometric Emblem */}
          <svg
            viewBox="0 0 100 100"
            className="w-28 h-28 sm:w-32 sm:h-32 text-[#D7C3A5] drop-shadow-[0_0_24px_rgba(215,195,165,0.3)]"
          >
            <polygon
              points="50,8 92,88 8,88"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <polygon
              points="50,28 76,78 24,78"
              fill="none"
              stroke="#29466F"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <circle cx="50" cy="58" r="8" fill="#D7C3A5" />
          </svg>

          {/* Anchor Points / Vector Node Indicators */}
          <span className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-xs bg-cyan-400 border border-black ring-1 ring-cyan-200" />
          <span className="absolute bottom-2 left-3 w-2 h-2 rounded-xs bg-cyan-400 border border-black ring-1 ring-cyan-200" />
          <span className="absolute bottom-2 right-3 w-2 h-2 rounded-xs bg-cyan-400 border border-black ring-1 ring-cyan-200" />
        </div>

        {/* Wordmark with Kerning Metric Guide */}
        <div className="mt-4 text-center space-y-1">
          <div className="relative inline-block">
            <h3 className="text-xl sm:text-2xl font-serif font-black tracking-[0.35em] text-white">
              A U R A
            </h3>
            {/* Kerning caliper indicator line */}
            <div className="absolute -bottom-2 inset-x-0 flex items-center justify-between text-[9px] font-mono text-cyan-400 border-t border-cyan-400/40 pt-0.5">
              <span>|</span>
              <span className="text-[8px] bg-[#090F1C] px-1">kerning: 24pt (+0.35em)</span>
              <span>|</span>
            </div>
          </div>
          <p className="text-[10px] font-mono text-white/50 tracking-widest pt-2">
            SPATIAL IDENTITY PROTOCOL
          </p>
        </div>
      </div>

      {/* Bottom Swatches & Specs Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10 text-[10px] font-mono">
        {/* Color Palette Chips */}
        <div className="flex items-center gap-1.5">
          <span className="text-white/40 mr-1">PALETTE:</span>
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 rounded-xs bg-[#0B1628] border border-white/20" title="#0B1628" />
            <span className="w-4 h-4 rounded-xs bg-[#172B4D] border border-white/20" title="#172B4D" />
            <span className="w-4 h-4 rounded-xs bg-[#D7C3A5]" title="#D7C3A5" />
            <span className="w-4 h-4 rounded-xs bg-white" title="#FFFFFF" />
          </div>
        </div>

        <div className="text-white/60">
          <span>Grid: 8pt Golden Ratio</span> &bull; <span>Anchor Nodes: 12 Bezier</span>
        </div>
      </div>
    </div>
  );
}

/**
 * V2: Digital Campaign Ad Banner (1920x1080)
 * High-impact editorial marketing banner with typography, 3D vector emblem, and campaign badges.
 */
export function CampaignBannerArtboard({ className = "" }: ArtboardProps) {
  return (
    <div
      className={`relative w-full h-full bg-gradient-to-br from-[#0D182E] via-[#09101F] to-[#162744] overflow-hidden flex flex-col justify-between p-6 sm:p-8 select-none font-sans ${className}`}
    >
      {/* Dynamic Lighting Glows */}
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#D7C3A5]/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-[#29466F]/40 blur-3xl pointer-events-none" />

      {/* Top Banner Tagline & Format Indicator */}
      <div className="relative z-10 flex items-center justify-between text-[11px] font-mono border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
            BANNER &bull; 1920 &times; 1080
          </span>
          <span className="text-white/60 hidden sm:inline">Q4 Global Campaign Master</span>
        </div>
        <span className="text-[10px] font-mono text-white/50">300 DPI Lossless RGB</span>
      </div>

      {/* Main Campaign Hero Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center max-w-xl text-left py-4 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-[#D7C3A5] text-[10px] font-mono uppercase tracking-wider w-fit">
          <Sparkles className="w-3 h-3 text-[#D7C3A5]" />
          <span>The Next Architectural Frontier</span>
        </div>

        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black text-white tracking-tight leading-[1.08]">
          Sovereign Assets.
          <br />
          <span className="italic font-light text-[#D7C3A5]">Zero-Latency</span> Yield.
        </h2>

        <p className="text-xs sm:text-sm text-white/75 font-sans leading-relaxed max-w-md">
          A high-throughput liquidity network engineered for modern digital institutions and autonomous treasury vaults.
        </p>

        <div className="pt-2 flex items-center gap-3">
          <span className="px-4 py-2 rounded-lg bg-[#D7C3A5] text-[#0B1628] font-bold text-xs shadow-md">
            Launch Protocol &rarr;
          </span>
          <span className="text-[10px] font-mono text-white/60">
            AUDITED BY TRAIL OF BITS
          </span>
        </div>
      </div>

      {/* Bottom Ad Specs Footer */}
      <div className="relative z-10 flex items-center justify-between pt-3 border-t border-white/10 text-[10px] font-mono text-white/50">
        <span>CAMPAIGN ID: #AD-9821</span>
        <span>RGB &bull; 4K DISPLAY COMPLIANT</span>
      </div>
    </div>
  );
}

/**
 * V3: Luxury Brand Identity Monogram & Foil Artboard
 * Features metallic bronze/gold interlocking monogram, Pantone specifications, and deboss guidelines.
 */
export function MonogramIdentityArtboard({ className = "" }: ArtboardProps) {
  return (
    <div
      className={`relative w-full h-full bg-[#080D1A] overflow-hidden flex flex-col justify-between p-6 sm:p-8 select-none font-sans ${className}`}
    >
      {/* Metallic Texture Shimmer */}
      <div className="absolute inset-0 bg-radial from-[#1E2D4A]/30 via-transparent to-transparent pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between text-[11px] font-mono border-b border-white/10 pb-3">
        <span className="text-white/80 font-bold uppercase tracking-wider">
          Artboard 03 &bull; Luxury Monogram &amp; Hot Foil
        </span>
        <span className="text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
          Client Feedback Applied
        </span>
      </div>

      {/* Center: Luxury Interlocking Monogram Emblem */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center py-4 text-center space-y-3">
        <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-2xl bg-gradient-to-b from-[#18263E] to-[#0D1525] border-2 border-[#D7C3A5]/50 flex items-center justify-center shadow-[0_16px_40px_rgba(215,195,165,0.15)] group">
          {/* Metallic Sheen */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />

          {/* Interlocking Monogram Emblem */}
          <svg viewBox="0 0 100 100" className="w-20 h-20 text-[#D7C3A5]">
            <path
              d="M50 15 L80 80 L65 80 L57 60 L43 60 L35 80 L20 80 Z"
              fill="currentColor"
            />
            <polygon points="50,34 54,48 46,48" fill="#0D1525" />
            <circle cx="50" cy="50" r="32" fill="none" stroke="#D7C3A5" strokeWidth="2" strokeDasharray="4 2" />
          </svg>
        </div>

        <div className="space-y-1">
          <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-widest text-white">
            ATELIER AURA
          </h3>
          <p className="text-[10px] font-mono text-[#D7C3A5] tracking-widest uppercase">
            Haute Parfumerie &bull; Paris
          </p>
        </div>

        {/* Spec Callouts */}
        <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-[10px] font-mono text-white/70">
          <span>PANTONE 871 C FOIL</span>
          <span>&bull;</span>
          <span>BLIND DEBOSS 0.8MM</span>
          <span>&bull;</span>
          <span>350GSM HEAVY COTTON</span>
        </div>
      </div>

      {/* Bottom Specs Footer */}
      <div className="relative z-10 flex items-center justify-between pt-3 border-t border-white/10 text-[10px] font-mono text-white/50">
        <span>DIE-CUT SPEC: #DC-340</span>
        <span>PRODUCTION VERIFIED</span>
      </div>
    </div>
  );
}

/**
 * V4: Master Brand Identity System Artboard
 * Comprehensive master design sheet showing horizontal & vertical logo lockups, typography scales, and registered mark.
 */
export function MasterBrandSystemArtboard({ className = "" }: ArtboardProps) {
  return (
    <div
      className={`relative w-full h-full bg-[#0A1020] overflow-hidden flex flex-col justify-between p-6 sm:p-8 select-none font-sans ${className}`}
    >
      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between text-[11px] font-mono border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-white font-bold uppercase tracking-wider">
            Artboard 04 &bull; Master Brand Identity System
          </span>
        </div>
        <span className="text-[#D7C3A5] font-bold bg-[#172B4D] px-2.5 py-0.5 rounded border border-[#D7C3A5]/40">
          V4 Master Sealed
        </span>
      </div>

      {/* Grid of Master Deliverable Assets */}
      <div className="relative z-10 flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center py-3">
        {/* Left: Primary Horizontal Logo Lockup */}
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col justify-between h-full space-y-3">
          <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">
            01 &bull; Primary Lockup (Dark)
          </span>

          <div className="flex items-center gap-3 my-auto py-2">
            <div className="w-10 h-10 rounded-lg bg-[#D7C3A5] flex items-center justify-center text-[#0B1628] font-serif font-black text-lg">
              A
            </div>
            <div>
              <div className="font-serif font-bold text-lg text-white tracking-wider flex items-center gap-1">
                <span>AURA</span>
                <span className="text-[9px] font-mono text-[#D7C3A5]">&reg;</span>
              </div>
              <div className="text-[9px] font-mono text-white/50 tracking-widest">
                SYSTEM ARCHITECTURE
              </div>
            </div>
          </div>

          <div className="text-[9px] font-mono text-white/50 flex justify-between pt-1 border-t border-white/5">
            <span>Min Width: 120px</span>
            <span>Clearance: 1X</span>
          </div>
        </div>

        {/* Right: Inverted Light Secondary Lockup & Typography Specimen */}
        <div className="p-4 rounded-xl bg-[#F8F6F1] text-[#171A1F] flex flex-col justify-between h-full space-y-3">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#667085]">
            02 &bull; Editorial Light Variant
          </span>

          <div className="flex items-center gap-3 my-auto py-2">
            <div className="w-10 h-10 rounded-lg bg-[#172B4D] flex items-center justify-center text-[#D7C3A5] font-serif font-black text-lg">
              A
            </div>
            <div>
              <div className="font-serif font-bold text-lg text-[#171A1F] tracking-wider">
                AURA
              </div>
              <div className="text-[9px] font-mono text-[#667085] tracking-widest">
                EDITORIAL MASTER
              </div>
            </div>
          </div>

          <div className="text-[9px] font-mono text-[#667085] flex justify-between pt-1 border-t border-[#DDD8CF]">
            <span>Fraunces + Plus Jakarta</span>
            <span>Pantone 405C</span>
          </div>
        </div>
      </div>

      {/* Bottom Technical Clearance Bar */}
      <div className="relative z-10 flex items-center justify-between pt-3 border-t border-white/10 text-[10px] font-mono text-white/60">
        <span>DELIVERABLE SUITE: AI &bull; SVG &bull; EPS &bull; PDF</span>
        <span className="text-emerald-400 font-bold">&check; Production Sign-Off Approved</span>
      </div>
    </div>
  );
}

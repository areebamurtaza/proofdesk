"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  ShieldCheck,
  Check,
  Clock,
  Layers,
  Sparkles,
  ZoomIn,
} from "lucide-react";

interface VersionItem {
  num: number;
  label: string;
  date: string;
  image: string;
  title: string;
  format: string;
  status: string;
}

export function HeroProductVisual() {
  const [selectedVersion, setSelectedVersion] = useState<number>(4);
  const [demoStatus, setDemoStatus] = useState<"CHANGES_REQUESTED" | "APPROVED">("CHANGES_REQUESTED");
  const [activePin, setActivePin] = useState<number>(1);

  const versions: VersionItem[] = [
    {
      num: 1,
      label: "V1",
      date: "Oct 12",
      image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1600&q=80",
      title: "Exploratory Acrylic & Form System",
      format: "AI / SVG • 42 MB",
      status: "Superseded",
    },
    {
      num: 2,
      label: "V2",
      date: "Oct 14",
      image: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1600&q=80",
      title: "Stationery & Typography Matrix",
      format: "AI / PDF / PNG • 58 MB",
      status: "Revised",
    },
    {
      num: 3,
      label: "V3",
      date: "Oct 15",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80",
      title: "Fluid Identity Architecture",
      format: "SVG / PNG • 72 MB",
      status: "Changes Requested",
    },
    {
      num: 4,
      label: "V4",
      date: "Today",
      image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1600&q=80",
      title: "Aura Spatial 3D Identity Master",
      format: "AI / SVG / 300DPI PNG • 94 MB",
      status: demoStatus === "APPROVED" ? "Approved" : "Active Review",
    },
  ];

  const currentVersion = versions.find((v) => v.num === selectedVersion) || versions[3];

  const pins = [
    {
      id: 1,
      x: "36%",
      y: "34%",
      author: "Marcus Vance",
      role: "Art Director",
      time: "10:14 AM",
      text: "Increase optical breathing room between the primary wordmark and geometric apex. Calibrate tight kerning for large-format print.",
      status: "OPEN",
    },
    {
      id: 2,
      x: "68%",
      y: "42%",
      author: "Elena Rostova",
      role: "Client Lead",
      time: "10:35 AM",
      text: "The chromatic gradient balance is exceptional on the metallic packaging mockup. Approved for test proofing.",
      status: "RESOLVED",
    },
    {
      id: 3,
      x: "52%",
      y: "74%",
      author: "Sarah Chen",
      role: "Senior Designer",
      time: "11:02 AM",
      text: "Ensure secondary icon symbols export in lossless SVG along with 300DPI vector master for packaging production.",
      status: "OPEN",
    },
  ];

  const currentPin = pins.find((p) => p.id === activePin) || pins[0];

  return (
    <div className="w-full max-w-6xl mx-auto rounded-2xl border border-[#DDD8CF] bg-white shadow-[0_24px_64px_rgba(11,22,40,0.08)] overflow-hidden text-left transition-all">
      {/* ── Sub-Nav: Deep Navy Frame / Workspace Bar ── */}
      <div className="bg-[#0B1628] text-white px-5 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <div className="h-4 w-px bg-white/15 mx-1" />
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-white truncate max-w-xs sm:max-w-md">
              {currentVersion.title}
            </span>
            <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-[#D7C3A5]">
              {currentVersion.format}
            </span>
          </div>
        </div>

        {/* Right Status Switcher in Top Bar */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-[11px] font-mono text-[#D7C3A5]">
            Client Decision:
          </span>
          <button
            onClick={() =>
              setDemoStatus(demoStatus === "APPROVED" ? "CHANGES_REQUESTED" : "APPROVED")
            }
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
              demoStatus === "APPROVED"
                ? "bg-[#2F6B4F] text-white ring-2 ring-emerald-400/40"
                : "bg-[#B7791F] text-white ring-2 ring-amber-400/40"
            }`}
          >
            {demoStatus === "APPROVED" ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>✓ APPROVED &amp; SEALED</span>
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5" />
                <span>Changes Requested</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Linear Version Lineage Bar: V1 → V2 → V3 → V4 ── */}
      <div className="bg-[#F8F6F1] border-b border-[#DDD8CF] px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-[#667085] uppercase text-[10px] tracking-wider">
            Version Lineage:
          </span>
          <div className="flex items-center gap-1.5">
            {versions.map((v, i) => (
              <React.Fragment key={v.num}>
                <button
                  onClick={() => setSelectedVersion(v.num)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    selectedVersion === v.num
                      ? "bg-[#172B4D] text-[#D7C3A5] shadow-xs"
                      : "bg-white border border-[#DDD8CF] text-[#171A1F] hover:bg-[#F0E7D8]"
                  }`}
                >
                  {v.label}
                </button>
                {i < versions.length - 1 && (
                  <span className="text-[#DDD8CF] text-[10px]">&bull;</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-[#667085]">Active Checkpoint:</span>
          <span className="font-bold text-[#172B4D]">{currentVersion.label} ({currentVersion.date})</span>
          <span className="w-1 h-1 rounded-full bg-[#DDD8CF]" />
          <span className="text-[#667085]">3 Spatial Pins</span>
        </div>
      </div>

      {/* ── Main Canvas & Inspector Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
        {/* Left Side: Real Graphic Design Deliverable Canvas (8 cols) */}
        <div className="lg:col-span-8 p-5 sm:p-7 bg-[#0B1628]/[0.02] flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Canvas Dot Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#DDD8CF_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-50" />

          {/* Canvas Sub-Header HUD */}
          <div className="relative z-10 flex items-center justify-between pb-3 border-b border-[#DDD8CF]/70 text-xs">
            <div className="flex items-center gap-2 font-mono text-[#667085]">
              <Layers className="w-3.5 h-3.5 text-[#172B4D]" />
              <span className="truncate">Canvas 100% &bull; 3840 &times; 2400 @ 300 DPI</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-white border border-[#DDD8CF] text-[#172B4D]">
                <Sparkles className="w-2.5 h-2.5 text-[#B7791F]" />
                Interactive Pins Live
              </span>
            </div>
          </div>

          {/* Genuine Creative Design Asset Viewport */}
          <div className="relative z-10 my-4 mx-auto w-full aspect-[16/10] rounded-xl border border-[#DDD8CF] shadow-lg overflow-hidden bg-slate-900 group">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentVersion.image}
                src={currentVersion.image}
                alt={currentVersion.title}
                initial={{ opacity: 0.4, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0.4 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="w-full h-full object-cover select-none"
              />
            </AnimatePresence>

            {/* Subtle Gradient Vignette Over Real Visual */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

            {/* Bottom Overlay Info Tag */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-white/90 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg pointer-events-none">
              <span className="truncate">{currentVersion.title}</span>
              <span className="text-[#D7C3A5] font-semibold shrink-0 ml-2">Click pin to review</span>
            </div>

            {/* ── Interactive Pins Placed on Creative Asset ── */}
            {pins.map((pin) => {
              const isSelected = activePin === pin.id;
              return (
                <div
                  key={pin.id}
                  style={{ top: pin.y, left: pin.x }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                >
                  {/* Ping Animation Indicator */}
                  {isSelected && (
                    <span className="absolute -inset-1 rounded-full bg-[#D7C3A5] animate-ping opacity-75 pointer-events-none" />
                  )}

                  <button
                    onClick={() => setActivePin(pin.id)}
                    className={`relative w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all shadow-md active:scale-95 ${
                      isSelected
                        ? "bg-[#D7C3A5] text-[#0B1628] ring-4 ring-white/60 scale-110"
                        : "bg-[#172B4D] text-white hover:scale-110 hover:bg-[#0B1628]"
                    }`}
                    title={`Pin 0${pin.id}: ${pin.author}`}
                  >
                    {pin.id}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Canvas Bottom Quick Guide */}
          <div className="relative z-10 flex items-center justify-between text-xs text-[#667085] pt-1">
            <span className="flex items-center gap-1.5">
              <ZoomIn className="w-3.5 h-3.5 text-[#172B4D]" />
              <span>Click numbered pins or version checkpoints to review changes</span>
            </span>
            <span className="font-mono text-[11px] text-[#172B4D] font-semibold">
              Pixel Accuracy &bull; 100%
            </span>
          </div>
        </div>

        {/* Right Side: Comments Inspector Panel (4 cols) */}
        <div className="lg:col-span-4 p-6 bg-white border-t lg:border-t-0 lg:border-l border-[#DDD8CF] flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDD8CF]">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#172B4D]" />
                <h4 className="text-sm font-bold text-[#171A1F]">Pinpoint Comments</h4>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#F0E7D8] text-[#172B4D]">
                Pin 0{currentPin.id}
              </span>
            </div>

            {/* Active Selected Comment Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPin.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="p-4 rounded-xl bg-[#F8F6F1] border border-[#DDD8CF] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#172B4D] text-[#D7C3A5] flex items-center justify-center font-mono text-[10px] font-bold">
                      {currentPin.author.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#171A1F]">{currentPin.author}</p>
                      <p className="text-[10px] text-[#667085]">{currentPin.role}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#667085]">{currentPin.time}</span>
                </div>

                <p className="text-xs text-[#171A1F] leading-relaxed">
                  &ldquo;{currentPin.text}&rdquo;
                </p>

                <div className="pt-2 border-t border-[#DDD8CF] flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#667085]">Review State</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded ${
                      currentPin.status === "RESOLVED"
                        ? "bg-emerald-50 text-[#2F6B4F] border border-emerald-200"
                        : "bg-amber-50 text-[#B7791F] border border-amber-200"
                    }`}
                  >
                    {currentPin.status}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* All Pins Quick Feed */}
            <div className="space-y-1.5 pt-2">
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#667085]">
                Deliverable Pins ({pins.length}):
              </p>
              {pins.map((pin) => (
                <button
                  key={pin.id}
                  onClick={() => setActivePin(pin.id)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-center justify-between ${
                    activePin === pin.id
                      ? "bg-[#172B4D] text-white font-semibold shadow-xs"
                      : "bg-[#F8F6F1] hover:bg-[#F0E7D8] text-[#171A1F] border border-[#DDD8CF]"
                  }`}
                >
                  <span className="truncate pr-2">
                    0{pin.id}. {pin.author} ({pin.role})
                  </span>
                  <span
                    className={`font-mono text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      activePin === pin.id
                        ? "bg-white/20 text-[#D7C3A5]"
                        : "bg-white text-[#667085]"
                    }`}
                  >
                    {pin.status}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Cryptographic Seal Callout */}
          <div className="p-4 rounded-xl bg-[#0B1628] text-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#D7C3A5]">
                Verified Escrow
              </span>
              <ShieldCheck className="w-4 h-4 text-[#D7C3A5]" />
            </div>
            <p className="text-xs font-bold text-white">Immutable Decision Record</p>
            <p className="text-[11px] text-white/70 leading-relaxed font-sans">
              Client reviews are signed with tokenized SHA-256 hashes. Clean deliverables unlock exclusively upon approval.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

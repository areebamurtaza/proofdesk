"use client";

import React, { useState } from "react";
import { History, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogoConstructionArtboard,
  CampaignBannerArtboard,
  MonogramIdentityArtboard,
  MasterBrandSystemArtboard,
} from "./DesignArtboards";

export function VersionControlSection() {
  const [selectedVersion, setSelectedVersion] = useState<number>(4);

  const versions = [
    {
      version: 1,
      tag: "V1",
      date: "Oct 10, 2:15 PM",
      creator: "Marcus Vance",
      status: "Superseded",
      commentsCount: 8,
      changes: "Initial 3 artboard exploratory routes submitted.",
      description: "Concept Route 01: Logo geometry & golden ratio grid matrix",
      component: LogoConstructionArtboard,
    },
    {
      version: 2,
      tag: "V2",
      date: "Oct 12, 11:30 AM",
      creator: "Marcus Vance",
      status: "Revised",
      commentsCount: 5,
      changes: "Selected Route B. Digital display ad campaign banner (1920x1080).",
      description: "Concept Route 02: Digital display campaign banner with typography",
      component: CampaignBannerArtboard,
    },
    {
      version: 3,
      tag: "V3",
      date: "Oct 14, 4:20 PM",
      creator: "Elena Rostova",
      status: "Changes Requested",
      commentsCount: 12,
      changes: "Client requested darker background & Pantone 871C metallic foil spec.",
      description: "Iteration 03: Luxury interlocking monogram & hot foil stamp",
      component: MonogramIdentityArtboard,
    },
    {
      version: 4,
      tag: "V4",
      date: "Today, 10:00 AM",
      creator: "Elena Rostova (Client)",
      status: "Approved",
      commentsCount: 0,
      changes: "Final master release signed and verified for production.",
      description: "Master Release: Master brand identity & multi-variant logo system",
      component: MasterBrandSystemArtboard,
    },
  ];

  const current = versions.find((v) => v.version === selectedVersion) || versions[3];

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto space-y-16 font-sans">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center max-w-2xl mx-auto space-y-3"
      >
        <span className="text-xs font-mono uppercase tracking-widest text-[#172B4D] font-bold">
          Immutable Design Lineage
        </span>
        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#171A1F]">
          Every version has an audit trail.
        </h2>
        <p className="text-base text-[#667085]">
          No more guessing which file is final. No accidental overwrites. ProofDesk preserves every iteration, feedback thread, and sign-off in a permanent timeline.
        </p>
      </motion.div>

      {/* Version History Showcase Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-30px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="rounded-2xl border border-[#DDD8CF] bg-white shadow-md overflow-hidden grid grid-cols-1 lg:grid-cols-12"
      >
        {/* Left: Version Stack Timeline (5 cols) */}
        <div className="lg:col-span-5 p-6 lg:p-8 bg-[#F8F6F1] border-b lg:border-b-0 lg:border-r border-[#DDD8CF] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DDD8CF]">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#172B4D]" />
              <h3 className="font-bold text-sm text-[#171A1F]">
                Deliverable Version Log
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#667085]">4 Checkpoints Stored</span>
          </div>

          <div className="space-y-2.5">
            {versions.map((v) => {
              const isSelected = selectedVersion === v.version;
              return (
                <button
                  key={v.version}
                  onClick={() => setSelectedVersion(v.version)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all space-y-1.5 ${
                    isSelected
                      ? "bg-white border-[#172B4D] shadow-xs ring-1 ring-[#172B4D]"
                      : "bg-[#F8F6F1] hover:bg-white border-transparent text-[#667085]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                          isSelected
                            ? "bg-[#172B4D] text-white"
                            : "bg-[#DDD8CF] text-[#171A1F]"
                        }`}
                      >
                        {v.tag}
                      </span>
                      <span className="text-xs font-bold text-[#171A1F]">{v.creator}</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        v.status === "Approved"
                          ? "bg-emerald-50 text-[#2F6B4F] border border-emerald-200"
                          : v.status === "Changes Requested"
                          ? "bg-amber-50 text-[#B7791F] border border-amber-200"
                          : "bg-gray-100 text-[#667085]"
                      }`}
                    >
                      {v.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#667085] leading-relaxed line-clamp-1">{v.changes}</p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-[#667085]">
                    <span>{v.date}</span>
                    <span>{v.commentsCount} comments logged</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Version Inspector & Diff Visualizer (7 cols) */}
        <div className="lg:col-span-7 p-6 lg:p-8 flex flex-col justify-between space-y-6 bg-white">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#D7C3A5] font-bold">
                  Visual Diff Inspection: Version 0{selectedVersion}
                </span>
                <h4 className="font-bold text-lg text-[#171A1F] mt-0.5">
                  {current.description}
                </h4>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono bg-[#F8F6F1] border border-[#DDD8CF] px-3 py-1 rounded-lg">
                <span className="text-[#667085]">Status:</span>
                <span className="font-bold text-[#172B4D]">{current.status}</span>
              </div>
            </div>

            {/* Real Artwork Comparison Canvas Preview */}
            <div className="rounded-xl border border-[#DDD8CF] bg-[#F8F6F1] p-4 relative aspect-[16/9] flex items-center justify-center overflow-hidden">
              <div className="grid grid-cols-2 gap-3 w-full h-full">
                {/* Left Side: Prior Version Visual (Blueprint Grid) */}
                <div className="rounded-lg overflow-hidden border border-[#DDD8CF] bg-[#090F1C] relative group">
                  <div className="w-full h-full filter grayscale contrast-125 opacity-70">
                    <LogoConstructionArtboard className="w-full h-full" />
                  </div>
                  <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-white z-20">
                    Prior &bull; V1
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-md px-2 py-1 rounded text-[10px] font-mono text-white/80 truncate z-20">
                    Logo Geometry &amp; Grid Matrix
                  </div>
                </div>

                {/* Right Side: Current Selected Version Visual (Active Graphic Deliverable) */}
                <div className="rounded-lg overflow-hidden border-2 border-[#172B4D] bg-[#090F1C] relative group shadow-sm">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={current.version}
                      initial={{ opacity: 0.6 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0.6 }}
                      transition={{ duration: 0.2 }}
                      className="w-full h-full"
                    >
                      <current.component className="w-full h-full" />
                    </motion.div>
                  </AnimatePresence>
                  <div className="absolute top-2 right-2 bg-[#D7C3A5] text-[#0B1628] font-bold px-2 py-0.5 rounded text-[10px] font-mono z-20">
                    Active &bull; {current.tag}
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-md px-2 py-1 rounded text-[10px] font-mono text-white/90 truncate z-20">
                    {current.description}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F8F6F1] border border-[#DDD8CF] flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <p className="font-semibold text-[#171A1F]">Never lose an earlier client-approved direction</p>
              <p className="text-[11px] text-[#667085]">Every asset upload creates a permanent, immutable checkpoint with rollback capabilities.</p>
            </div>
            <div className="flex items-center gap-1 font-mono text-xs font-bold text-[#172B4D] shrink-0 ml-4">
              <CheckCircle2 className="w-4 h-4 text-[#2F6B4F]" />
              <span>Immutable</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

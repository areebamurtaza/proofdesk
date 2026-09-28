"use client";

import React, { useState } from "react";
import { MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function AnnotationsSection() {
  const [activePinId, setActivePinId] = useState<number>(1);
  const [filterState, setFilterState] = useState<"ALL" | "OPEN" | "RESOLVED">("ALL");

  const pins = [
    {
      id: 1,
      num: "01",
      title: "Move this slightly left.",
      x: "28%",
      y: "36%",
      author: "Elena Rostova (Client)",
      detail: "Shift the main title block 16px to align with the left vertical grid guideline.",
      status: "OPEN",
      timestamp: "10:14 AM",
    },
    {
      id: 2,
      num: "02",
      title: "Updated logo here.",
      x: "70%",
      y: "25%",
      author: "Marcus Vance (Agency)",
      detail: "Replaced legacy raster PNG with 300DPI vector SVG badge. Sharpness confirmed.",
      status: "RESOLVED",
      timestamp: "11:20 AM",
    },
    {
      id: 3,
      num: "03",
      title: "Looks good.",
      x: "52%",
      y: "74%",
      author: "Sarah Chen (Legal)",
      detail: "Trademark notice, copyright line, and barcode positioning are verified.",
      status: "RESOLVED",
      timestamp: "11:45 AM",
    },
  ];

  const filteredPins = pins.filter((p) => {
    if (filterState === "ALL") return true;
    return p.status === filterState;
  });

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
          Spatial Pin Engine
        </span>
        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#171A1F]">
          Feedback that stays attached to the work.
        </h2>
        <p className="text-base text-[#667085]">
          No more deciphering vague sentences like &ldquo;Can you fix the bottom right?&rdquo; Every comment is pinned to the exact pixel coordinate and tracked to resolution.
        </p>
      </motion.div>

      {/* Interactive Demonstration Panel */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-30px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="rounded-xl border border-[#DDD8CF] bg-white shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12"
      >
        {/* Left Side: Large Visual Asset Canvas with Pins Over It (7 cols) */}
        <div className="lg:col-span-7 p-8 bg-[#F5F3EE] flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-[#DDD8CF] text-xs font-mono">
            <span className="text-[#667085]">Deliverable Viewport: Packaging_Guide_Master.ai</span>
            <span className="px-2 py-0.5 rounded bg-white border border-[#DDD8CF] text-[#172B4D] font-bold">
              3 Active Pins
            </span>
          </div>

          {/* Simulated Design Artboard with Numbered Markers */}
          <div className="relative my-8 mx-auto w-full max-w-lg aspect-[16/10] bg-white rounded-lg border border-[#DDD8CF] shadow-md p-8 flex flex-col justify-between overflow-hidden">
            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-widest text-[#D7C3A5] font-bold">
                PROD SPEC &bull; ARTBOARD 01
              </span>
              <h3 className="text-xl font-bold text-[#171A1F]">Kroma Brand Identity</h3>
            </div>

            <div className="grid grid-cols-3 gap-2 my-auto py-4 border-y border-[#DDD8CF]">
              <div className="h-14 bg-[#F8F6F1] rounded border border-[#DDD8CF] flex items-center justify-center font-mono text-xs text-[#172B4D] font-bold">
                LOGO
              </div>
              <div className="h-14 bg-[#F8F6F1] rounded border border-[#DDD8CF] flex items-center justify-center font-mono text-xs text-[#172B4D] font-bold">
                COLOR
              </div>
              <div className="h-14 bg-[#F8F6F1] rounded border border-[#DDD8CF] flex items-center justify-center font-mono text-xs text-[#172B4D] font-bold">
                TYPE
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-[#667085]">
              <span>Dimensions: 3840 &times; 2160 px</span>
              <span className="text-[#172B4D] font-bold">Lossless Canvas Active</span>
            </div>

            {/* Pins directly placed over the visual asset */}
            {pins.map((pin) => {
              const isSelected = activePinId === pin.id;
              return (
                <button
                  key={pin.id}
                  onClick={() => setActivePinId(pin.id)}
                  style={{ top: pin.y, left: pin.x }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all shadow-md ${
                    isSelected
                      ? "bg-[#D7C3A5] text-[#0B1628] ring-4 ring-[#D7C3A5]/40 scale-110 z-20"
                      : "bg-[#172B4D] text-white hover:scale-105 z-10"
                  }`}
                >
                  {pin.num}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-[#667085]">
            <span>Click any marker (01, 02, 03) to inspect pin details</span>
            <span className="font-mono text-[#172B4D] font-bold">Spatial Engine Active</span>
          </div>
        </div>

        {/* Right Side: Comments Panel using WHITE, NAVY, SAND accents (5 cols) */}
        <div className="lg:col-span-5 p-6 lg:p-8 bg-white border-t lg:border-t-0 lg:border-l border-[#DDD8CF] flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDD8CF]">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#172B4D]" />
                <h3 className="font-bold text-base text-[#171A1F]">
                  Contextual Comments
                </h3>
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1 bg-[#F8F6F1] p-1 rounded border border-[#DDD8CF] text-xs font-mono">
                <button
                  onClick={() => setFilterState("ALL")}
                  className={`px-2 py-0.5 rounded transition-all ${
                    filterState === "ALL"
                      ? "bg-[#172B4D] text-white font-bold"
                      : "text-[#667085] hover:text-[#171A1F]"
                  }`}
                >
                  All (3)
                </button>
                <button
                  onClick={() => setFilterState("OPEN")}
                  className={`px-2 py-0.5 rounded transition-all ${
                    filterState === "OPEN"
                      ? "bg-[#172B4D] text-white font-bold"
                      : "text-[#667085] hover:text-[#171A1F]"
                  }`}
                >
                  Open
                </button>
                <button
                  onClick={() => setFilterState("RESOLVED")}
                  className={`px-2 py-0.5 rounded transition-all ${
                    filterState === "RESOLVED"
                      ? "bg-[#172B4D] text-white font-bold"
                      : "text-[#667085] hover:text-[#171A1F]"
                  }`}
                >
                  Resolved
                </button>
              </div>
            </div>

            {/* List of Feedback Pins with Active Highlight */}
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredPins.map((item) => {
                  const isSelected = activePinId === item.id;
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      onClick={() => setActivePinId(item.id)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all space-y-2.5 ${
                        isSelected
                          ? "bg-white border-[#172B4D] shadow-sm ring-1 ring-[#172B4D]/20"
                          : "bg-[#F8F6F1] hover:bg-[#F0E7D8]/60 border-[#DDD8CF]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                              isSelected
                                ? "bg-[#D7C3A5] text-[#0B1628]"
                                : "bg-[#172B4D] text-white"
                            }`}
                          >
                            {item.num}
                          </span>
                          <span className="text-xs font-bold text-[#171A1F]">
                            &ldquo;{item.title}&rdquo;
                          </span>
                        </div>
                        <span
                          className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                            item.status === "RESOLVED"
                              ? "bg-emerald-50 text-[#2F6B4F] border border-emerald-200"
                              : "bg-[#F0E7D8] text-[#172B4D]"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <p className="text-xs text-[#667085] leading-relaxed pl-8">
                        {item.detail}
                      </p>

                      <div className="pt-2 border-t border-[#DDD8CF]/50 flex items-center justify-between text-[10px] text-[#667085] pl-8">
                        <span>{item.author}</span>
                        <span className="font-mono">{item.timestamp}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          <div className="pt-3 border-t border-[#DDD8CF] flex items-center justify-between text-xs text-[#667085]">
            <span>Normalized percentage coordinates</span>
            <span className="font-mono text-[#172B4D] font-bold">Zero Guesswork</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

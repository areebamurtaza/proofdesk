"use client";

import React from "react";
import { Check, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export function FeatureShowcase() {
  const features = [
    {
      badge: "FEATURE 01",
      title: "Review anything.",
      subtitle: "Universal creative format verification without compression.",
      description:
        "Whether proofing high-resolution brand visuals, scalable vector identity guidelines, packaging die-lines, or full project deliverable bundles, ProofDesk renders assets at native retina sharpness.",
      points: [
        "Raster Branding: JPG, JPEG, and PNG master exports",
        "Vector Systems: SVG scalable identity guidelines",
        "Packaging & Print: AI / Illustrator vector package inspection",
        "Deliverable Archives: ZIP package preview and automated release",
      ],
      visual: (
        <div className="p-6 rounded-xl bg-[#F8F6F1] border border-[#DDD8CF] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DDD8CF] text-xs font-mono">
            <span className="text-[#171A1F] font-bold">Supported Master Formats</span>
            <span className="text-[#D7C3A5] font-bold">LOSSLESS</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 bg-white rounded border border-[#DDD8CF]">
              <span className="text-[10px] text-[#667085] block">RASTER ASSET</span>
              <span className="font-bold text-[#171A1F] mt-1 block">JPG &bull; PNG</span>
            </div>
            <div className="p-3 bg-white rounded border border-[#DDD8CF]">
              <span className="text-[10px] text-[#667085] block">VECTOR SYSTEM</span>
              <span className="font-bold text-[#171A1F] mt-1 block">SVG SCALABLE</span>
            </div>
            <div className="p-3 bg-white rounded border border-[#DDD8CF]">
              <span className="text-[10px] text-[#667085] block">PACKAGING SPEC</span>
              <span className="font-bold text-[#171A1F] mt-1 block">AI PACKAGES</span>
            </div>
            <div className="p-3 bg-white rounded border border-[#DDD8CF]">
              <span className="text-[10px] text-[#667085] block">PROJECT VAULT</span>
              <span className="font-bold text-[#171A1F] mt-1 block">ZIP ARCHIVES</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      badge: "FEATURE 02",
      title: "Keep every version connected.",
      subtitle: "Linear checkpoint tracking that ends filename chaos.",
      description:
        "Every revision is permanently tied to its deliverable thread. Compare prior rounds side-by-side to verify requested changes without downloading dozens of duplicate attachments.",
      points: [
        "Chronological checkpoint tracking (V1 → V2 → V3 → V4)",
        "Permanent comments anchoring per version",
        "Visual split-slider and side-by-side comparator",
        "Instant rollback to prior client-approved directions",
      ],
      visual: (
        <div className="p-6 rounded-xl bg-[#F8F6F1] border border-[#DDD8CF] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DDD8CF] text-xs font-mono">
            <span className="text-[#171A1F] font-bold">Version Comparison</span>
            <span className="text-[#172B4D] font-bold">v3.0 vs v2.0</span>
          </div>
          <div className="p-4 bg-white rounded border border-[#DDD8CF] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#171A1F]">V3.0 (Active Iteration)</span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#F0E7D8] text-[#172B4D] font-bold">
                Ready for Review
              </span>
            </div>
            <div className="h-8 bg-[#F8F6F1] rounded flex items-center px-3 text-xs font-mono text-[#667085]">
              &rarr; Optical kerning widened + Pantone 405C applied
            </div>
          </div>
          <div className="p-4 bg-white/60 rounded border border-[#DDD8CF] space-y-2 opacity-75">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#667085]">V2.0 (Previous Iteration)</span>
              <span className="font-mono text-[10px] text-[#667085]">Revised</span>
            </div>
            <div className="h-8 bg-[#F8F6F1] rounded flex items-center px-3 text-xs font-mono text-[#667085]">
              &rarr; Initial Route B presentation
            </div>
          </div>
        </div>
      ),
    },
    {
      badge: "FEATURE 03",
      title: "Make client review effortless.",
      subtitle: "Tokenized, zero-login links designed for busy stakeholders.",
      description:
        "No passwords to remember. No complex project software to install. Clients receive a direct cryptographic URL and land in a focused review viewport with intuitive touch and mouse controls.",
      points: [
        "Cryptographic token-gated access with zero friction",
        "Native pinch-to-zoom and touch support on mobile & desktop",
        "85% faster client feedback turnaround",
        "Private deliverable silos with strict agency isolation",
      ],
      visual: (
        <div className="p-6 rounded-xl bg-[#F8F6F1] border border-[#DDD8CF] space-y-4">
          <div className="p-4 bg-white rounded border border-[#DDD8CF] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#667085] uppercase">Review Link Minted</span>
              <span className="w-2 h-2 rounded-full bg-[#2F6B4F]" />
            </div>
            <p className="font-mono text-xs font-bold text-[#172B4D] truncate">
              https://proofdesk.app/review/tok_aura_8f29c1
            </p>
            <div className="pt-2 border-t border-[#DDD8CF] flex items-center justify-between text-[11px] text-[#667085]">
              <span>Client access: Instant</span>
              <span className="text-[#172B4D] font-bold">Zero Password Required</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      badge: "FEATURE 04",
      title: "Turn feedback into decisions.",
      subtitle: "Structured progression: Comment → Revision → Approval.",
      description:
        "Replace vague comments with actionable, coordinate-pinned tasks. Once revisions are verified, stakeholders commit an unambiguous sign-off recorded with a SHA-256 cryptographic certificate.",
      points: [
        "Numbered spatial pins attached to exact pixel coordinates",
        "Actionable task resolution engine (Open → Resolved)",
        "Formal status progression (Changes Requested → Resubmitted → Approved)",
        "Exportable legal audit certificates for scope protection",
      ],
      visual: (
        <div className="p-6 rounded-xl bg-[#0B1628] text-white border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono">
            <span className="text-[#D7C3A5]">Linear Progression</span>
            <span className="text-white font-bold">Decision Committed</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded bg-white/[0.04] border border-white/10 text-xs font-mono">
            <span>Comment</span>
            <span className="text-[#D7C3A5]">&rarr;</span>
            <span>Revision</span>
            <span className="text-[#D7C3A5]">&rarr;</span>
            <span className="text-[#2F6B4F] font-bold">✓ Approved</span>
          </div>
          <div className="p-3 rounded bg-white/[0.04] border border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#D7C3A5]" />
              <span className="font-bold">Cryptographic Certificate</span>
            </div>
            <span className="font-mono text-[10px] text-[#D7C3A5]">SHA-256 Verified</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto space-y-24 font-sans">
      {features.map((feat, idx) => {
        const isReversed = idx % 2 === 1;
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left ${
              isReversed ? "lg:flex-row-reverse" : ""
            }`}
          >
            {/* Text Side (6 cols) */}
            <div
              className={`space-y-4 ${
                isReversed ? "lg:col-span-6 lg:order-2" : "lg:col-span-6 lg:order-1"
              }`}
            >
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#D7C3A5]">
                {feat.badge}
              </span>
              <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#171A1F]">
                {feat.title}
              </h3>
              <p className="text-sm font-semibold text-[#172B4D]">
                {feat.subtitle}
              </p>
              <p className="text-sm text-[#667085] leading-relaxed">
                {feat.description}
              </p>

              <ul className="space-y-2.5 pt-2">
                {feat.points.map((pt, pIdx) => (
                  <li key={pIdx} className="flex items-start gap-2.5 text-xs text-[#171A1F]">
                    <div className="w-4 h-4 rounded-full bg-[#D7C3A5]/25 text-[#172B4D] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 text-[#172B4D]" />
                    </div>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual Graphic Side (6 cols) */}
            <div
              className={`rounded-xl border border-[#DDD8CF] bg-white p-6 shadow-sm ${
                isReversed ? "lg:col-span-6 lg:order-1" : "lg:col-span-6 lg:order-2"
              }`}
            >
              {feat.visual}
            </div>
          </motion.div>
        );
      })}
    </section>
  );
}

"use client";

import React, { useState } from "react";
import { Upload, Share2, MessageCircle, GitCompare, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function WorkflowSection() {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  const steps = [
    {
      num: "01",
      title: "UPLOAD",
      subtitle: "Creative Deliverable Vault",
      description:
        "Upload production assets. ProofDesk creates a secure version-controlled vault entry with automated high-resolution preview rendering.",
      icon: Upload,
      detail: "Supports JPG, SVG, PNG, JPEG, ZIP, & AI packages",
      uiSnippet: {
        badge: "Ingestion Engine",
        primary: "Aura_Brand_Master_Package.ai",
        secondary: "Vector die-lines & 300DPI print assets mapped",
      },
    },
    {
      num: "02",
      title: "SHARE",
      subtitle: "Cryptographic Review Link",
      description:
        "Mint a tokenized, zero-login review URL. Send via email, Slack, or messaging. Clients review immediately with zero credentials required.",
      icon: Share2,
      detail: "Tokenized, zero-auth access URL",
      uiSnippet: {
        badge: "Token Security",
        primary: "proofdesk.app/review/tok_948f2c",
        secondary: "Zero sign-up required for client stakeholders",
      },
    },
    {
      num: "03",
      title: "REVIEW",
      subtitle: "Spatial Coordinate Pins",
      description:
        "Clients inspect the asset at native pixel resolution and click directly onto pixels to drop numbered comment pins with unambiguous tasks.",
      icon: MessageCircle,
      detail: "Normalized percentage coordinates",
      uiSnippet: {
        badge: "Spatial Engine",
        primary: "Pin #1: 'Scale primary wordmark by 15%'",
        secondary: "Anchored to x: 42.5%, y: 31.8% on artboard",
      },
    },
    {
      num: "04",
      title: "REVISE",
      subtitle: "Linear Version Comparator",
      description:
        "Upload V2 or V3 to the existing deliverable link. Reviewers can compare iterations side-by-side with split sliders or instant toggles.",
      icon: GitCompare,
      detail: "Side-by-side visual diff comparator",
      uiSnippet: {
        badge: "Version Lineage",
        primary: "Comparing: v3.0 (Active) vs v2.0 (Previous)",
        secondary: "All historical feedback threads permanently preserved",
      },
    },
    {
      num: "05",
      title: "APPROVE",
      subtitle: "Binding Digital Sign-Off",
      description:
        "Client issues an explicit digital approval. ProofDesk generates a timestamped SHA-256 audit certificate and unlocks the master file release.",
      icon: CheckCircle2,
      detail: "SHA-256 cryptographic audit certificate",
      uiSnippet: {
        badge: "Escrow Release",
        primary: "✓ APPROVED & SIGNED: Elena Rostova",
        secondary: "SHA-256: 7f4a... Master package unlocked for release",
      },
    },
  ];

  const currentStep = steps[activeStepIndex];

  return (
    <section id="workflow" className="py-24 border-t border-[#DDD8CF] bg-[#F8F6F1] px-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center max-w-2xl mx-auto space-y-3"
        >
          <span className="text-xs font-mono uppercase tracking-widest text-[#172B4D] font-bold">
            Structured Workflow
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#171A1F]">
            From first draft to final approval.
          </h2>
          <p className="text-base text-[#667085]">
            A five-step operational pipeline designed to eliminate ambiguity, version collisions, and endless revision loops.
          </p>
        </motion.div>

        {/* 5-Step Pipeline Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeStepIndex === idx;

            return (
              <motion.div
                key={step.num}
                onClick={() => setActiveStepIndex(idx)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: idx * 0.08, ease: "easeOut" }}
                whileHover={{ y: -3 }}
                className={`p-6 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-6 ${
                  isActive
                    ? "bg-white border-[#172B4D] shadow-md ring-1 ring-[#172B4D]/20"
                    : "bg-[#F0E7D8]/60 hover:bg-white border-[#DDD8CF]"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-mono text-2xl font-bold transition-colors ${
                        isActive ? "text-[#172B4D]" : "text-[#667085]"
                      }`}
                    >
                      {step.num}
                    </span>
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        isActive
                          ? "bg-[#172B4D] text-white"
                          : "bg-white border border-[#DDD8CF] text-[#171A1F]"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-[#171A1F]">
                      {step.title}
                    </h3>
                    <p className="text-[11px] font-mono text-[#D7C3A5] font-semibold mt-0.5">
                      {step.subtitle}
                    </p>
                    <p className="text-xs text-[#667085] mt-2 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                <div
                  className={`pt-3 border-t text-[10px] font-mono transition-colors ${
                    isActive
                      ? "border-[#172B4D]/20 text-[#172B4D] font-bold"
                      : "border-[#DDD8CF] text-[#667085]"
                  }`}
                >
                  {step.detail}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Accompanying Step UI Graphics Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.num}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="p-6 rounded-xl bg-white border border-[#DDD8CF] shadow-xs flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="space-y-1 text-left">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#F0E7D8] text-[#172B4D] font-bold">
                Step {currentStep.num} &bull; {currentStep.uiSnippet.badge}
              </span>
              <h4 className="text-base font-bold text-[#171A1F] pt-1">
                {currentStep.uiSnippet.primary}
              </h4>
              <p className="text-xs text-[#667085]">
                {currentStep.uiSnippet.secondary}
              </p>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs text-[#172B4D] font-bold">
              <span>Stage 0{activeStepIndex + 1} of 05</span>
              <span className="w-2 h-2 rounded-full bg-[#D7C3A5]" />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

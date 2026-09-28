"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "Do clients need to create an account or install any software?",
      a: "No. ProofDesk provides zero-auth tokenized access. You send clients a private review URL. They open the link in any web browser on desktop or mobile, view the deliverable at native resolution, drop spatial comments, and approve or request changes immediately without creating a username or password.",
    },
    {
      q: "How does ProofDesk prevent confusion across multiple versions?",
      a: "Every upload creates an immutable checkpoint (v1, v2, v3, etc.). Reviewers can switch between versions or use the built-in diff comparator to see exactly what changed. Comments and pins remain anchored to the specific version they were left on, preventing historical context from ever getting lost.",
    },
    {
      q: "What file formats can our agency upload for client review?",
      a: "ProofDesk natively supports high-resolution graphics and design assets: JPG, JPEG, PNG, vector SVG, Adobe Illustrator (AI), and project ZIP archives. All visual previews are rendered with lossless native fidelity for precision feedback.",
    },
    {
      q: "How are approvals made legally binding?",
      a: "When a reviewer clicks 'Approve & Sign', ProofDesk logs the exact deliverable version, signer identity, IP address, user-agent telemetry, and generates a SHA-256 cryptographic hash of the asset state. This record can be exported as an official audit certificate to prevent scope creep disputes.",
    },
    {
      q: "Is client feedback kept private between different clients?",
      a: "Yes. Every client deliverable has its own isolated, cryptographically tokenized environment. Clients never see your internal agency workspace, other clients' projects, or unrelated deliverables.",
    },
  ];

  return (
    <section id="faq" className="py-24 border-t border-[#DDD8CF] bg-[#F8F6F1] px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center space-y-3"
        >
          <span className="text-xs font-mono uppercase tracking-widest text-[#172B4D] font-semibold">
            Frequently Asked Questions
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#171A1F]">
            Clear answers for agency leaders
          </h2>
          <p className="text-sm sm:text-base text-[#667085]">
            Everything you need to know about adopting ProofDesk in your creative pipeline.
          </p>
        </motion.div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="rounded-xl border border-[#DDD8CF] bg-[#FFFFFF] transition-all overflow-hidden shadow-xs hover:border-[#D7C3A5]"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-serif font-bold text-base sm:text-lg text-[#171A1F] hover:text-[#172B4D] transition-colors"
                >
                  <span>{faq.q}</span>
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                    isOpen ? "bg-[#172B4D] text-[#F8F6F1] border-[#172B4D]" : "bg-[#F8F6F1] border-[#DDD8CF] text-[#172B4D]"
                  }`}>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 text-xs sm:text-sm text-[#667085] leading-relaxed border-t border-[#DDD8CF]/50 pt-4 font-sans">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

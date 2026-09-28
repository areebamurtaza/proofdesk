"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, History, ShieldCheck } from "lucide-react";

export function TrustSection() {
  const pillars = [
    {
      icon: CheckCircle2,
      title: "One place for every review",
      detail: "Direct pixel pins, revision notes, and client discussion gathered into a single clean thread.",
    },
    {
      icon: History,
      title: "Every version tracked",
      detail: "Linear checkpoints from draft to final release. Never overwrite or mistake which asset is active.",
    },
    {
      icon: ShieldCheck,
      title: "Every decision documented",
      detail: "Binding digital sign-offs backed by immutable timestamp records and deliverable checksums.",
    },
  ];

  return (
    <section className="py-20 border-y border-[#DDD8CF] bg-[#F0E7D8] font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="space-y-3"
        >
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#172B4D] font-bold">
            Operational Reliability
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#171A1F]">
            Everything your team needs to move work forward.
          </h2>
          <p className="text-sm sm:text-base text-[#667085] max-w-xl mx-auto">
            Engineered specifically for creative teams managing high-stakes client approvals.
          </p>
        </motion.div>

        {/* 3 Product Facts Grid with Subtle Graphics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.45, delay: idx * 0.1, ease: "easeOut" }}
                className="p-6 rounded-xl bg-white border border-[#DDD8CF] space-y-3 shadow-xs hover:border-[#172B4D]/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-[#F8F6F1] border border-[#DDD8CF] text-[#172B4D] flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#171A1F] tracking-tight">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
                  {pillar.detail}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

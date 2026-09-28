"use client";

import React from "react";
import { Layers, Folder, File, GitBranch, MessageSquare, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export function ProductEcosystem() {
  const nodes = [
    { title: "Agency Workspace", desc: "Private multi-client tenant", icon: Layers },
    { title: "Client Project", desc: "Isolated project scope", icon: Folder },
    { title: "Deliverable", desc: "Asset container & token link", icon: File },
    { title: "Version (v1..vN)", desc: "Immutable file binary", icon: GitBranch },
    { title: "Spatial Review", desc: "Contextual pins & comments", icon: MessageSquare },
    { title: "Binding Decision", desc: "Approved & locked vault", icon: CheckCircle },
  ];

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto space-y-16">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center max-w-2xl mx-auto space-y-3"
      >
        <span className="text-xs font-mono uppercase tracking-widest text-[#172B4D] font-semibold">
          System Architecture
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#171A1F]">
          The ProofDesk Review Hierarchy
        </h2>
        <p className="text-sm sm:text-base text-[#667085]">
          A clean, structured lifecycle that moves every creative deliverable forward without chaos.
        </p>
      </motion.div>

      {/* Elegant Flow Diagram */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-30px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="rounded-2xl border border-[#DDD8CF] bg-[#FFFFFF] p-8 lg:p-12 shadow-sm"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 relative">
          {nodes.map((node, idx) => {
            const Icon = node.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ y: -3 }}
                className="relative flex flex-col justify-between p-5 rounded-xl bg-[#F8F6F1] border border-[#DDD8CF] hover:border-[#D7C3A5] transition-all space-y-3 group"
              >
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-[#FFFFFF] border border-[#DDD8CF] flex items-center justify-center text-[#172B4D] group-hover:text-[#D7C3A5] group-hover:bg-[#172B4D] transition-colors shadow-xs">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-mono text-[10px] text-[#667085] uppercase">
                    Stage 0{idx + 1}
                  </span>
                  <h4 className="font-serif font-bold text-sm text-[#171A1F]">
                    {node.title}
                  </h4>
                  <p className="text-[11px] text-[#667085] leading-tight">
                    {node.desc}
                  </p>
                </div>

                {idx < nodes.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-[#667085]">
                    <div className="w-6 h-6 rounded-full bg-white border border-[#DDD8CF] flex items-center justify-center text-[10px] shadow-xs text-[#172B4D]">
                      &rarr;
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");

  const pricing = {
    freelance: billingCycle === "annual" ? 29 : 39,
    agency: billingCycle === "annual" ? 89 : 119,
    enterprise: billingCycle === "annual" ? 239 : 299,
  };

  return (
    <section id="pricing" className="py-24 border-t border-[#DDD8CF] bg-white px-6 font-sans">
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
            Subscription Planner
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#171A1F]">
            Simple plans for modern studios
          </h2>
          <p className="text-base text-[#667085]">
            Eliminate endless revision cycles and unpaid scope disputes. Choose the tier suited to your client volume.
          </p>

          {/* Billing Toggle */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span
              onClick={() => setBillingCycle("monthly")}
              className={`text-xs font-semibold cursor-pointer transition-colors ${
                billingCycle === "monthly" ? "text-[#171A1F]" : "text-[#667085]"
              }`}
            >
              Monthly Billing
            </span>
            <button
              onClick={() =>
                setBillingCycle(billingCycle === "annual" ? "monthly" : "annual")
              }
              className="w-12 h-6 rounded-full bg-[#F0E7D8] border border-[#DDD8CF] p-0.5 flex items-center transition-colors relative"
            >
              <motion.div
                layout
                className={`w-5 h-5 rounded-full bg-[#172B4D] shadow-sm transition-transform ${
                  billingCycle === "annual" ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
            <div className="flex items-center gap-2">
              <span
                onClick={() => setBillingCycle("annual")}
                className={`text-xs font-semibold cursor-pointer transition-colors ${
                  billingCycle === "annual" ? "text-[#171A1F]" : "text-[#667085]"
                }`}
              >
                Annual Billing
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#F0E7D8] text-[#172B4D] border border-[#DDD8CF]">
                SAVE 25%
              </span>
            </div>
          </div>
        </motion.div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* TIER 1: FREELANCE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.45, delay: 0.1 }}
            whileHover={{ y: -3 }}
            className="rounded-xl bg-[#F8F6F1] border border-[#DDD8CF] p-8 flex flex-col justify-between space-y-6 shadow-xs text-left"
          >
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-lg text-[#171A1F]">Freelance Studio</h3>
                <p className="text-xs text-[#667085] mt-1">
                  For solo creative consultants and independent designers.
                </p>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-bold text-[#171A1F]">${pricing.freelance}</span>
                <span className="text-xs text-[#667085]">/ month</span>
              </div>

              <div className="pt-3 border-t border-[#DDD8CF] space-y-3 text-xs text-[#171A1F]/90">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#172B4D] shrink-0" />
                  <span>5 active client deliverable links</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#172B4D] shrink-0" />
                  <span>50GB secure cloud asset storage</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#172B4D] shrink-0" />
                  <span>Zero-login client review tokens</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#172B4D] shrink-0" />
                  <span>Full version history &amp; audit trails</span>
                </div>
              </div>
            </div>

            <Link
              href="/dashboard"
              className="w-full py-3 rounded-lg bg-white hover:bg-[#F0E7D8] border border-[#DDD8CF] text-[#171A1F] text-xs font-semibold text-center transition-all block"
            >
              Start Freelance
            </Link>
          </motion.div>

          {/* TIER 2: AGENCY PRO (STUDIO CHOICE - NAVY & SAND ACCENT) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.45, delay: 0.2 }}
            whileHover={{ y: -4 }}
            className="rounded-xl bg-white border-2 border-[#172B4D] p-8 flex flex-col justify-between space-y-6 shadow-xl relative scale-105 z-10 text-left"
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#172B4D] text-[#D7C3A5] text-[10px] font-mono font-bold tracking-wider uppercase shadow-xs">
              STUDIO CHOICE &bull; MOST POPULAR
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-xl text-[#171A1F]">Agency Pro</h3>
                <p className="text-xs text-[#667085] mt-1">
                  For design agencies, creative boutiques, and production teams.
                </p>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-5xl font-bold text-[#172B4D]">${pricing.agency}</span>
                <span className="text-xs text-[#667085] font-medium">/ month</span>
              </div>

              <div className="pt-3 border-t border-[#DDD8CF] space-y-3 text-xs text-[#171A1F]">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#172B4D] shrink-0" />
                  <span className="font-bold">Unlimited client deliverable links</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#172B4D] shrink-0" />
                  <span>500GB secure cloud asset storage</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#172B4D] shrink-0" />
                  <span className="font-bold">Multi-version split-screen comparator</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#172B4D] shrink-0" />
                  <span>Custom agency branding &amp; logo badge</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#172B4D] shrink-0" />
                  <span>Multi-seat internal team review</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#172B4D] shrink-0" />
                  <span>Exportable SHA-256 legal audit records</span>
                </div>
              </div>
            </div>

            <Link
              href="/dashboard"
              className="w-full py-3.5 rounded-lg bg-[#172B4D] hover:bg-[#0B1628] text-white text-xs font-semibold text-center transition-all shadow-md shadow-[#172B4D]/20 block"
            >
              Get Started with Agency Pro
            </Link>
          </motion.div>

          {/* TIER 3: ENTERPRISE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.45, delay: 0.3 }}
            whileHover={{ y: -3 }}
            className="rounded-xl bg-[#F8F6F1] border border-[#DDD8CF] p-8 flex flex-col justify-between space-y-6 shadow-xs text-left"
          >
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-lg text-[#171A1F]">Studio Enterprise</h3>
                <p className="text-xs text-[#667085] mt-1">
                  For large multi-department studios and enterprise brands.
                </p>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-bold text-[#171A1F]">${pricing.enterprise}</span>
                <span className="text-xs text-[#667085]">/ month</span>
              </div>

              <div className="pt-3 border-t border-[#DDD8CF] space-y-3 text-xs text-[#171A1F]/90">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#172B4D] shrink-0" />
                  <span>Everything in Agency Pro</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#172B4D] shrink-0" />
                  <span>2TB dedicated vault storage</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#172B4D] shrink-0" />
                  <span>Custom domain review URLs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#172B4D] shrink-0" />
                  <span>SAML / SSO &amp; custom security policies</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#172B4D] shrink-0" />
                  <span>Dedicated account manager &amp; SLA</span>
                </div>
              </div>
            </div>

            <Link
              href="/dashboard"
              className="w-full py-3 rounded-lg bg-white hover:bg-[#F0E7D8] border border-[#DDD8CF] text-[#171A1F] text-xs font-semibold text-center transition-all block"
            >
              Contact Enterprise
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

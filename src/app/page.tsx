"use client";

import React from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { WorkflowSection } from "@/components/landing/WorkflowSection";
import { ClientReviewSection } from "@/components/landing/ClientReviewSection";
import { VersionControlSection } from "@/components/landing/VersionControlSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8F6F1] text-[#171A1F] selection:bg-[#D7C3A5]/40 selection:text-[#172B4D] antialiased relative overflow-hidden font-sans">
      {/* 1. Ultra-Premium Editorial Navbar (Fixed) */}
      <Navbar />

      {/* 2. Hero Section with Real Design Workspace Visual & Animated Pins */}
      <Hero />

      {/* 3. Streamlined Agency Operational Workflow */}
      <WorkflowSection />

      {/* 4. Interactive Zero-Auth Client Review Showcase with Real Deliverable */}
      <ClientReviewSection />

      {/* 5. Immutable Version Control & Diff Comparison */}
      <VersionControlSection />

      {/* 6. Transparent 3-Tier Subscription Planner */}
      <PricingSection />

      {/* 7. FAQ, Final Conversion Call-to-Action & Deep Navy Studio Footer */}
      <FAQSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
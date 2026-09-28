// filepath: src/app/sign-up/[[...sign-up]]/page.tsx
"use client";

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#F8F6F1] flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Background Subtle Navy Atmosphere */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#172B4D]/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#172B4D08_1px,transparent_1px),linear-gradient(to_bottom,#172B4D08_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />

      {/* Brand Monogram Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 text-center"
      >
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#172B4D] flex items-center justify-center text-white font-bold text-lg shadow-md shadow-[#172B4D]/20 group-hover:bg-[#0B1628] transition-colors">
            P
          </div>
          <span className="font-bold text-2xl tracking-tight text-[#171A1F]">
            ProofDesk
          </span>
        </Link>
        <p className="text-xs text-[#667085] mt-2 font-mono">
          Create Agency Workspace &bull; Sign Up
        </p>
      </motion.div>

      {/* Clerk Sign Up Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-white border border-[#DDD8CF] shadow-xl rounded-2xl p-6",
              headerTitle: "text-[#171A1F] font-bold text-xl",
              headerSubtitle: "text-[#667085] text-xs",
              formButtonPrimary:
                "bg-[#172B4D] hover:bg-[#0B1628] text-white text-xs font-semibold py-2.5 rounded-xl shadow-md shadow-[#172B4D]/20 normal-case",
              formFieldInput:
                "bg-[#F8F6F1] border-[#DDD8CF] text-[#171A1F] text-xs rounded-xl focus:border-[#172B4D]",
              footerActionLink: "text-[#172B4D] hover:text-[#0B1628] text-xs font-semibold",
              identityPreviewText: "text-[#171A1F] text-xs",
              identityPreviewEditButton: "text-[#172B4D] hover:text-[#0B1628]",
            },
          }}
        />
      </motion.div>
    </div>
  );
}
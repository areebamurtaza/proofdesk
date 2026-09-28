"use client";

import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#0B1628] border-t border-white/10 text-[#F8F6F1] px-6 py-16 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Info (2 cols) */}
          <div className="md:col-span-2 space-y-4 text-left">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#0B1628] font-bold text-sm">
                P
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                ProofDesk
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-[#F8F6F1]/70 max-w-sm leading-relaxed">
              The high-end client review and approval software for serious creative teams. Built to eliminate revision chaos and secure explicit sign-offs.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="w-2 h-2 rounded-full bg-[#2F6B4F] animate-pulse" />
              <span className="text-[11px] font-mono text-[#F8F6F1]/60">
                Systems Operational &bull; Protocol v2.5
              </span>
            </div>
          </div>

          {/* Column 1: Product */}
          <div className="space-y-3 text-left">
            <h4 className="font-bold text-sm text-white">Product</h4>
            <ul className="space-y-2 text-xs text-[#F8F6F1]/70">
              <li>
                <a href="#product" className="hover:text-[#D7C3A5] transition-colors">
                  Review Canvas
                </a>
              </li>
              <li>
                <a href="#workflow" className="hover:text-[#D7C3A5] transition-colors">
                  Spatial Annotations
                </a>
              </li>
              <li>
                <a href="#decisions" className="hover:text-[#D7C3A5] transition-colors">
                  Version Lineage
                </a>
              </li>
              <li>
                <a href="#decisions" className="hover:text-[#D7C3A5] transition-colors">
                  Cryptographic Sign-Off
                </a>
              </li>
              <li>
                <Link href="/review/demo-token" className="hover:text-[#D7C3A5] transition-colors font-semibold text-[#D7C3A5]">
                  Client Review Demo &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Company */}
          <div className="space-y-3 text-left">
            <h4 className="font-bold text-sm text-white">Company</h4>
            <ul className="space-y-2 text-xs text-[#F8F6F1]/70">
              <li>
                <span className="hover:text-[#D7C3A5] cursor-pointer transition-colors">
                  About ProofDesk
                </span>
              </li>
              <li>
                <span className="hover:text-[#D7C3A5] cursor-pointer transition-colors">
                  Agency Methodology
                </span>
              </li>
              <li>
                <span className="hover:text-[#D7C3A5] cursor-pointer transition-colors">
                  Security &amp; Encryption
                </span>
              </li>
              <li>
                <span className="hover:text-[#D7C3A5] cursor-pointer transition-colors">
                  Press Kit
                </span>
              </li>
              <li>
                <span className="hover:text-[#D7C3A5] cursor-pointer transition-colors">
                  Contact Support
                </span>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources & Account */}
          <div className="space-y-3 text-left">
            <h4 className="font-bold text-sm text-white">Resources &amp; Account</h4>
            <ul className="space-y-2 text-xs text-[#F8F6F1]/70">
              <li>
                <a href="#pricing" className="hover:text-[#D7C3A5] transition-colors">
                  Subscription Plans
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-[#D7C3A5] transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <Link href="/sign-in" className="hover:text-[#D7C3A5] transition-colors">
                  Agency Sign In
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#D7C3A5] transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <span className="hover:text-[#D7C3A5] cursor-pointer transition-colors">
                  Privacy Policy &bull; Terms
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-[#F8F6F1]/50 gap-4">
          <p>&copy; {new Date().getFullYear()} ProofDesk Inc. All rights reserved.</p>
          <div className="flex items-center gap-6 font-mono text-[11px]">
            <span>Sovereign Client Proofing Protocol</span>
            <span className="text-[#D7C3A5]">Navy &times; Warm Sand Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

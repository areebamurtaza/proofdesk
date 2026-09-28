"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-[#F8F6F1]/95 backdrop-blur-md border-b border-[#DDD8CF] py-3 shadow-[0_2px_12px_rgba(11,22,40,0.03)]"
          : "bg-[#F8F6F1] border-b border-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* LEFT: ProofDesk Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#172B4D] flex items-center justify-center text-white font-bold text-sm shadow-sm transition-transform group-hover:scale-105">
            P
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-lg tracking-tight text-[#171A1F]">
              ProofDesk
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-wider text-[#667085]">
              Creative Approval
            </span>
          </div>
        </Link>

        {/* CENTER: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-[#171A1F]/80">
          <a
            href="#product"
            className="hover:text-[#172B4D] transition-colors py-1 hover:border-b-2 hover:border-[#172B4D]"
          >
            Product
          </a>
          <a
            href="#workflow"
            className="hover:text-[#172B4D] transition-colors py-1 hover:border-b-2 hover:border-[#172B4D]"
          >
            How it Works
          </a>
          <a
            href="#client-review"
            className="hover:text-[#172B4D] transition-colors py-1 hover:border-b-2 hover:border-[#172B4D]"
          >
            Client Review
          </a>
          <a
            href="#pricing"
            className="hover:text-[#172B4D] transition-colors py-1 hover:border-b-2 hover:border-[#172B4D]"
          >
            Pricing
          </a>
          <a
            href="#faq"
            className="hover:text-[#172B4D] transition-colors py-1 hover:border-b-2 hover:border-[#172B4D]"
          >
            FAQ
          </a>
        </nav>

        {/* RIGHT: Login & Primary Get Started */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-[13px] font-medium text-[#171A1F] hover:text-[#172B4D] px-3.5 py-2 rounded-lg border border-[#DDD8CF] hover:bg-white transition-all"
          >
            Log in
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#172B4D] hover:bg-[#0B1628] text-white text-[13px] font-semibold shadow-sm transition-all active:scale-[0.98]"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-[#171A1F] hover:text-[#172B4D] rounded-lg"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F8F6F1] border-b border-[#DDD8CF] px-6 py-6 space-y-4 shadow-lg">
          <nav className="flex flex-col gap-3 text-sm font-medium text-[#171A1F]">
            <a
              href="#product"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#172B4D]"
            >
              Product
            </a>
            <a
              href="#workflow"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#172B4D]"
            >
              How it Works
            </a>
            <a
              href="#client-review"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#172B4D]"
            >
              Client Review
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#172B4D]"
            >
              Pricing
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#172B4D]"
            >
              FAQ
            </a>
          </nav>
          <div className="pt-3 border-t border-[#DDD8CF] flex flex-col gap-2">
            <Link
              href="/sign-in"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-lg border border-[#DDD8CF] text-xs font-semibold text-[#171A1F]"
            >
              Log in
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-lg bg-[#172B4D] text-white text-xs font-semibold shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

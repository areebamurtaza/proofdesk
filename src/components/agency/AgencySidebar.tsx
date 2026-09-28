// filepath: src/components/agency/AgencySidebar.tsx
"use client";

import React from "react";
import Link from "next/link";
import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import { LayoutDashboard, Activity, FolderGit2 } from "lucide-react";

interface AgencySidebarProps {
  currentPath: "/dashboard" | "/activity";
  deliverablesCount?: number;
}

export function AgencySidebar({ currentPath, deliverablesCount }: AgencySidebarProps) {
  return (
    <aside className="fixed top-0 left-0 bottom-0 h-screen w-64 bg-[#0B1628] text-[#F8F6F1] border-r border-[#172B4D] flex flex-col justify-between hidden md:flex shrink-0 z-30">
      <div>
        {/* Logo & Brand Header */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-[#172B4D]">
          <Link
            href="/"
            className="w-8 h-8 rounded-lg bg-[#172B4D] flex items-center justify-center font-serif font-bold text-sm text-[#F8F6F1] shadow-xs hover:bg-[#29466F] transition-colors"
          >
            P
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-sm tracking-tight text-white">ProofDesk</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#D7C3A5]" />
            <span className="text-[10px] font-mono text-[#D7C3A5] uppercase tracking-wider">Studio</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold relative transition-all shadow-xs ${
              currentPath === "/dashboard"
                ? "bg-[#172B4D] text-white"
                : "text-[#DDD8CF]/80 hover:text-white hover:bg-[#172B4D]/60"
            }`}
          >
            {currentPath === "/dashboard" && (
              <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-[#D7C3A5]" />
            )}
            <LayoutDashboard className={`w-4 h-4 ${currentPath === "/dashboard" ? "text-[#D7C3A5]" : "text-[#DDD8CF]/60"}`} />
            <span>Deliverables Vault</span>
          </Link>

          <Link
            href="/activity"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold relative transition-all shadow-xs ${
              currentPath === "/activity"
                ? "bg-[#172B4D] text-white"
                : "text-[#DDD8CF]/80 hover:text-white hover:bg-[#172B4D]/60"
            }`}
          >
            {currentPath === "/activity" && (
              <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-[#D7C3A5]" />
            )}
            <Activity className={`w-4 h-4 ${currentPath === "/activity" ? "text-[#D7C3A5]" : "text-[#DDD8CF]/60"}`} />
            <span>Audit Trail</span>
          </Link>

          <div className="pt-4 pb-2 px-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#DDD8CF]/50">
              Workspace
            </span>
          </div>

          <div className="px-3 py-2 text-xs text-[#DDD8CF]/70 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FolderGit2 className="w-3.5 h-3.5 text-[#D7C3A5]" />
              <span>Active Vaults</span>
            </span>
            {deliverablesCount !== undefined && (
              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#172B4D] text-[#D7C3A5]">
                {deliverablesCount}
              </span>
            )}
          </div>
        </nav>
      </div>

      {/* Sidebar Footer: Organization and User */}
      <div className="p-4 border-t border-[#172B4D] space-y-3">
        <div className="flex items-center justify-between">
          <OrganizationSwitcher
            afterSelectOrganizationUrl="/dashboard"
            afterCreateOrganizationUrl="/dashboard"
            afterLeaveOrganizationUrl="/dashboard"
            appearance={{
              elements: {
                rootBox: "bg-[#172B4D] border border-[#29466F] rounded-lg px-2 py-1 text-white shadow-xs",
                organizationPreviewTextContainer: "text-xs text-white font-medium",
                organizationSwitcherTriggerIcon: "text-[#D7C3A5]",
              },
            }}
          />
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "w-8 h-8 border border-[#29466F]",
              },
            }}
          />
        </div>
        <p className="text-[10px] text-[#DDD8CF]/50 font-mono text-center">
          ProofDesk &bull; Sovereign Review v2.4
        </p>
      </div>
    </aside>
  );
}

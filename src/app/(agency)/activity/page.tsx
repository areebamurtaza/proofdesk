// filepath: src/app/(agency)/activity/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  Eye,
  MessageSquare,
  CheckCircle2,
  Download,
  Laptop,
  Smartphone,
  Globe,
  Clock,
  RefreshCw,
  Filter,
  ExternalLink,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { AgencySidebar } from "@/components/agency/AgencySidebar";

interface ActivityItem {
  id: string;
  action: string;
  ipAddress: string;
  userAgent: string;
  accessedAt: string;
  deliverable: {
    id: string;
    title: string;
    reviewToken: string;
    status: string;
    isUnlocked: boolean;
    projectName: string;
    clientName: string;
    clientEmail: string;
  };
}

interface ActivityStats {
  totalViews: number;
  totalPins: number;
  totalDownloads: number;
  totalApprovals: number;
}

function parseDevice(ua: string): { browser: string; os: string; isMobile: boolean } {
  const isMobile = /mobile|android|iphone|ipad/i.test(ua);
  let browser = "Browser";
  if (/chrome|crios/i.test(ua)) browser = "Chrome";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
  else if (/edg/i.test(ua)) browser = "Edge";

  let os = "OS";
  if (/macintosh|mac os x/i.test(ua)) os = "macOS";
  else if (/windows nt/i.test(ua)) os = "Windows";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/linux/i.test(ua)) os = "Linux";

  return { browser, os, isMobile };
}

function getActionMeta(action: string) {
  switch (action) {
    case "VIEW_PORTAL":
      return {
        label: "Vault Opened",
        icon: Eye,
        color: "text-[#172B4D] bg-[#F8F6F1] border-[#DDD8CF]",
      };
    case "DROP_PIN":
      return {
        label: "Pin Placed",
        icon: MessageSquare,
        color: "text-[#172B4D] bg-[#F8F6F1] border-[#D7C3A5]",
      };
    case "APPROVE_DELIVERABLE":
      return {
        label: "Legally Approved",
        icon: CheckCircle2,
        color: "text-[#2F6B4F] bg-emerald-50 border-emerald-200",
      };
    case "DOWNLOAD_MASTER":
      return {
        label: "Master Downloaded",
        icon: Download,
        color: "text-purple-700 bg-purple-50 border-purple-200",
      };
    default:
      return {
        label: action.replace(/_/g, " "),
        icon: Activity,
        color: "text-[#667085] bg-[#F8F6F1] border-[#DDD8CF]",
      };
  }
}

export default function AgencyActivityPage() {
  const [logs, setLogs] = useState<ActivityItem[]>([]);
  const [stats, setStats] = useState<ActivityStats>({
    totalViews: 0,
    totalPins: 0,
    totalDownloads: 0,
    totalApprovals: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionFilter, setActionFilter] = useState<string>("ALL");

  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const query = actionFilter !== "ALL" ? `?action=${actionFilter}` : "";
      const res = await fetch(`/api/activity${query}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to load activity stream:", err);
    } finally {
      setIsLoading(false);
    }
  }, [actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="min-h-screen flex bg-[#F8F6F1] text-[#171A1F] font-sans antialiased">
      {/* 1. DEEP NAVY SIDEBAR (#0B1628) - FIXED POSITION & LENGTH */}
      <AgencySidebar currentPath="/activity" />

      {/* 2. LIGHT WORKSPACE CANVAS (#F8F6F1) */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-64 min-h-screen">
        {/* Workspace Top Header */}
        <header className="h-16 border-b border-[#DDD8CF] bg-white/80 backdrop-blur-md px-6 lg:px-8 flex items-center justify-between shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 rounded-xl bg-white hover:bg-[#F8F6F1] border border-[#DDD8CF] text-[#171A1F] transition-colors shadow-xs md:hidden"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-4 h-4 text-[#172B4D]" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-serif font-bold tracking-tight text-[#171A1F]">
                  Client Audit &amp; Telemetry
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-[#172B4D]/10 text-[#172B4D] border border-[#172B4D]/20">
                  Audit Trail
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchLogs}
              disabled={isLoading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#172B4D] hover:bg-[#0B1628] text-white text-xs font-semibold transition-colors disabled:opacity-50 shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#D7C3A5] ${isLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh Feed</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6 lg:p-8 space-y-8 max-w-7xl w-full mx-auto">
          <div className="space-y-1">
            <h2 className="text-xl font-serif font-bold text-[#171A1F]">Cryptographic Telemetry Ledger</h2>
            <p className="text-xs sm:text-sm text-[#667085]">
              Real-time audit records of client token views, pin drops, reviews, and unlocked deliverable downloads.
            </p>
          </div>

          <div className="space-y-6">
        {/* Metric Summary Counters */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          <div className="p-5 rounded-2xl bg-white border border-[#DDD8CF] accent-border-top-navy space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-[#667085] text-xs font-mono">
              <span>Vault Opens</span>
              <Eye className="w-4 h-4 text-[#172B4D]" />
            </div>
            <p className="text-2xl font-bold font-serif text-[#171A1F]">{stats.totalViews}</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#DDD8CF] accent-border-top-sand space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-[#667085] text-xs font-mono">
              <span>Feedback Pins</span>
              <MessageSquare className="w-4 h-4 text-[#172B4D]" />
            </div>
            <p className="text-2xl font-bold font-serif text-[#172B4D]">{stats.totalPins}</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#DDD8CF] shadow-xs space-y-1 border-t-2 border-t-[#2F6B4F]">
            <div className="flex items-center justify-between text-[#667085] text-xs font-mono">
              <span>Legal Sign-offs</span>
              <CheckCircle2 className="w-4 h-4 text-[#2F6B4F]" />
            </div>
            <p className="text-2xl font-bold font-serif text-[#2F6B4F]">{stats.totalApprovals}</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#DDD8CF] accent-border-top-navy space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-[#667085] text-xs font-mono">
              <span>Master Downloads</span>
              <Download className="w-4 h-4 text-[#172B4D]" />
            </div>
            <p className="text-2xl font-bold font-serif text-[#171A1F]">{stats.totalDownloads}</p>
          </div>
        </motion.div>

        {/* Action Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-2 rounded-2xl bg-white border border-[#DDD8CF] shadow-xs">
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
            <Filter className="w-3.5 h-3.5 text-[#667085] ml-2 mr-1" />
            {[
              { key: "ALL", label: "All Events" },
              { key: "VIEW_PORTAL", label: "Vault Opens" },
              { key: "DROP_PIN", label: "Pins Placed" },
              { key: "APPROVE_DELIVERABLE", label: "Legal Approvals" },
              { key: "DOWNLOAD_MASTER", label: "Master Downloads" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActionFilter(key)}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  actionFilter === key
                    ? "bg-[#172B4D] text-[#F8F6F1] font-semibold shadow-xs"
                    : "text-[#667085] hover:text-[#171A1F] hover:bg-[#F8F6F1]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <span className="text-[11px] font-mono text-[#667085] mr-3">
            {logs.length} logged event(s)
          </span>
        </div>

        {/* Activity Stream Table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-2xl border border-[#DDD8CF] bg-white overflow-hidden shadow-xs"
        >
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-[#667085]">
              <Loader2 className="w-7 h-7 animate-spin text-[#172B4D]" />
              <p className="text-xs font-mono tracking-wider">Querying audit events from PostgreSQL...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2 text-[#667085] text-center p-6">
              <ShieldAlert className="w-8 h-8 text-[#DDD8CF]" />
              <p className="text-xs font-semibold text-[#171A1F]">No telemetry records match this filter</p>
              <p className="text-[11px] text-[#667085]">
                Client link opens and interactions will log here automatically.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#DDD8CF]">
              {logs.map((log) => {
                const meta = getActionMeta(log.action);
                const Icon = meta.icon;
                const device = parseDevice(log.userAgent);
                const date = new Date(log.accessedAt);

                return (
                  <div
                    key={log.id}
                    className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#F8F6F1]/60 transition-colors"
                  >
                    {/* Left: Event Details */}
                    <div className="flex items-start gap-3.5">
                      <div className={`p-2 rounded-xl border mt-0.5 ${meta.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[#171A1F]">{meta.label}</span>
                          <span className="text-[#667085]">&bull;</span>
                          <Link
                            href={`/deliverables/${log.deliverable.id}`}
                            className="text-xs text-[#172B4D] hover:underline font-semibold"
                          >
                            {log.deliverable.title}
                          </Link>
                        </div>
                        <p className="text-[11px] text-[#667085]">
                          Project: <span className="text-[#171A1F] font-medium">{log.deliverable.projectName}</span> &bull;
                          Client: {log.deliverable.clientName} ({log.deliverable.clientEmail})
                        </p>
                      </div>
                    </div>

                    {/* Right: Technical Device & Network Footprint */}
                    <div className="flex items-center gap-3 text-[11px] font-mono text-[#667085] self-end sm:self-center">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F8F6F1] border border-[#DDD8CF]">
                        {device.isMobile ? (
                          <Smartphone className="w-3.5 h-3.5 text-[#667085]" />
                        ) : (
                          <Laptop className="w-3.5 h-3.5 text-[#667085]" />
                        )}
                        <span>
                          {device.browser} / {device.os}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F8F6F1] border border-[#DDD8CF]">
                        <Globe className="w-3.5 h-3.5 text-[#667085]" />
                        <span>{log.ipAddress}</span>
                      </div>

                      <div className="flex items-center gap-1 text-[#667085] text-[10px]">
                        <Clock className="w-3 h-3 text-[#172B4D]" />
                        <span>
                          {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>

                      <Link
                        href={`/review/${log.deliverable.reviewToken}`}
                        target="_blank"
                        title="Open Token View"
                        className="p-1.5 rounded-lg text-[#667085] hover:text-[#171A1F] hover:bg-[#F8F6F1] transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </main>
  </div>
</div>
  );
}
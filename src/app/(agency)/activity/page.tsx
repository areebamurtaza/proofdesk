// filepath: src/app/(agency)/activity/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
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
        color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
      };
    case "DROP_PIN":
      return {
        label: "Pin Placed",
        icon: MessageSquare,
        color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      };
    case "APPROVE_DELIVERABLE":
      return {
        label: "Legally Approved",
        icon: CheckCircle2,
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      };
    case "DOWNLOAD_MASTER":
      return {
        label: "Master Downloaded",
        icon: Download,
        color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
      };
    default:
      return {
        label: action.replace(/_/g, " "),
        icon: Activity,
        color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
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
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-8 space-y-8 select-none">
      {/* Top Navigation & Header */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-white">Client Audit &amp; Telemetry</h1>
              <span className="px-2 py-0.5 text-[11px] font-mono font-medium rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                Zero-Auth Audit Trail
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Cryptographic log of all client link opens, pin drops, approvals, and clean downloads.
            </p>
          </div>
        </div>

        <button
          onClick={fetchLogs}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh Feed</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Metric Summary Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-1">
            <div className="flex items-center justify-between text-zinc-500 text-xs font-mono">
              <span>Vault Opens</span>
              <Eye className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-bold text-white font-mono">{stats.totalViews}</p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-1">
            <div className="flex items-center justify-between text-zinc-500 text-xs font-mono">
              <span>Feedback Pins</span>
              <MessageSquare className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-white font-mono">{stats.totalPins}</p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-1">
            <div className="flex items-center justify-between text-zinc-500 text-xs font-mono">
              <span>Legal Sign-offs</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white font-mono">{stats.totalApprovals}</p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-1">
            <div className="flex items-center justify-between text-zinc-500 text-xs font-mono">
              <span>Master Downloads</span>
              <Download className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-bold text-white font-mono">{stats.totalDownloads}</p>
          </div>
        </div>

       {/* Action Filter Bar */}
<div className="flex flex-wrap items-center justify-between gap-4 p-2 rounded-2xl bg-zinc-900/30 border border-zinc-800/80">
  <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
    <Filter className="w-3.5 h-3.5 text-zinc-500 ml-2 mr-1" />
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
            ? "bg-zinc-800 text-white font-semibold shadow-sm"
            : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        {label}
      </button>
    ))}
  </div>

  <span className="text-[11px] font-mono text-zinc-500 mr-3">
    {logs.length} logged event(s)
  </span>
</div>

        {/* Activity Stream Table */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-md overflow-hidden shadow-xl">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-zinc-500">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <p className="text-xs font-mono">Querying audit events from PostgreSQL...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2 text-zinc-500 text-center p-6">
              <ShieldAlert className="w-8 h-8 text-zinc-700" />
              <p className="text-xs font-medium text-zinc-400">No telemetry records match this filter</p>
              <p className="text-[11px] text-zinc-600">
                Client link opens and interactions will log here automatically.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {logs.map((log) => {
                const meta = getActionMeta(log.action);
                const Icon = meta.icon;
                const device = parseDevice(log.userAgent);
                const date = new Date(log.accessedAt);

                return (
                  <div
                    key={log.id}
                    className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-zinc-850/30 transition-colors"
                  >
                    {/* Left: Event Details */}
                    <div className="flex items-start gap-3.5">
                      <div className={`p-2 rounded-xl border mt-0.5 ${meta.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">{meta.label}</span>
                          <span className="text-zinc-600">&bull;</span>
                          <Link
                            href={`/deliverables/${log.deliverable.id}`}
                            className="text-xs text-indigo-400 hover:underline font-medium"
                          >
                            {log.deliverable.title}
                          </Link>
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          Project: <span className="text-zinc-300">{log.deliverable.projectName}</span> &bull;
                          Client: {log.deliverable.clientName} ({log.deliverable.clientEmail})
                        </p>
                      </div>
                    </div>

                    {/* Right: Technical Device & Network Footprint */}
                    <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-400 self-end sm:self-center">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800">
                        {device.isMobile ? (
                          <Smartphone className="w-3.5 h-3.5 text-zinc-500" />
                        ) : (
                          <Laptop className="w-3.5 h-3.5 text-zinc-500" />
                        )}
                        <span>
                          {device.browser} / {device.os}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800">
                        <Globe className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{log.ipAddress}</span>
                      </div>

                      <div className="flex items-center gap-1 text-zinc-500 text-[10px]">
                        <Clock className="w-3 h-3" />
                        <span>
                          {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>

                      <Link
                        href={`/review/${log.deliverable.reviewToken}`}
                        target="_blank"
                        title="Open Token View"
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
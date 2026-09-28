// filepath: src/components/review/CommentSidebar.tsx
"use client";

import React, { useState } from "react";
import { MessageSquare, Check, Send } from "lucide-react";
import { CommentItem } from "@/types/review";

interface CommentSidebarProps {
  comments: CommentItem[];
  selectedCommentId: string | null;
  pendingPin: { xPercent: number; yPercent: number } | null;
  onSelectComment: (id: string | null) => void;
  onSubmitComment: (content: string, authorName: string) => void;
  onCancelPendingPin: () => void;
  onToggleResolve: (id: string) => void;
}

export function CommentSidebar({
  comments,
  selectedCommentId,
  pendingPin,
  onSelectComment,
  onSubmitComment,
  onCancelPendingPin,
  onToggleResolve,
}: CommentSidebarProps) {
  const [authorName, setAuthorName] = useState("Reviewer");
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmitComment(content.trim(), authorName.trim());
    setContent("");
  };

  return (
    <aside className="w-80 border-l border-[#DDD8CF] bg-white flex flex-col h-full shrink-0 select-none shadow-sm font-sans">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-[#DDD8CF] bg-[#F8F6F1]/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-[#172B4D]/10 text-[#172B4D]">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-xs font-bold text-[#171A1F] uppercase tracking-wider font-mono">
            Feedback Pins ({comments.length})
          </h2>
        </div>
      </div>

      {/* Pending Pin Input Box */}
      {pendingPin && (
        <div className="p-4 border-b border-[#DDD8CF] bg-[#F8F6F1]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#172B4D]">New Pin Draft</span>
            <button
              onClick={onCancelPendingPin}
              className="text-[11px] text-[#667085] hover:text-[#171A1F] transition-colors"
            >
              Cancel
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              type="text"
              placeholder="Your name"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white border border-[#DDD8CF] text-[#171A1F] placeholder-[#667085] focus:outline-none focus:border-[#172B4D]"
            />
            <textarea
              placeholder="Describe revision or feedback..."
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              autoFocus
              className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white border border-[#DDD8CF] text-[#171A1F] placeholder-[#667085] focus:outline-none focus:border-[#172B4D] resize-none"
            />
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#172B4D] hover:bg-[#0B1628] text-[#F8F6F1] text-xs font-semibold shadow-sm transition-all active:scale-[0.99]"
            >
              <Send className="w-3 h-3 text-[#F8F6F1]" />
              <span>Post Pin</span>
            </button>
          </form>
        </div>
      )}

      {/* Comment Thread List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#DDD8CF]/60 p-2 space-y-2">
        {comments.length === 0 && !pendingPin && (
          <div className="p-8 text-center text-[#667085]">
            <p className="text-xs font-medium">No feedback pins dropped yet.</p>
            <p className="text-[11px] text-[#667085] mt-1">
              Select &quot;Drop Pin&quot; above and click anywhere on the design.
            </p>
          </div>
        )}

        {comments.map((comment, index) => {
          const isSelected = comment.id === selectedCommentId;
          return (
            <div
              key={comment.id}
              onClick={() => onSelectComment(comment.id)}
              className={`p-3 rounded-xl cursor-pointer transition-all ${
                isSelected
                  ? "bg-[#F8F6F1] border border-[#172B4D] shadow-sm ring-1 ring-[#D7C3A5]"
                  : "bg-white hover:bg-[#F8F6F1]/50 border border-[#DDD8CF] hover:border-[#D7C3A5]"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                      comment.isResolved
                        ? "bg-[#2F6B4F] text-white"
                        : isSelected
                        ? "bg-[#D7C3A5] text-[#0B1628]"
                        : "bg-[#172B4D] text-[#F8F6F1]"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="text-xs font-semibold text-[#171A1F]">
                    {comment.authorName}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-[#F8F6F1] text-[#172B4D] border border-[#DDD8CF]">
                    {comment.authorType}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleResolve(comment.id);
                  }}
                  title={comment.isResolved ? "Mark unresolved" : "Mark resolved"}
                  className={`p-1 rounded-md text-xs transition-colors ${
                    comment.isResolved
                      ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                      : "text-[#667085] hover:text-[#171A1F] hover:bg-[#F8F6F1]"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-[#171A1F]/85 leading-relaxed pl-7">
                {comment.content}
              </p>
              <div className="text-[10px] font-mono text-[#667085] pl-7 mt-1">
                {new Date(comment.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
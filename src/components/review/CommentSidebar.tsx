// filepath: src/components/review/CommentSidebar.tsx
"use client";

import React, { useState } from "react";
import { MessageSquare, Check, CornerDownRight, Send } from "lucide-react";
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
  const [authorName, setAuthorName] = useState("Sarah Jenkins");
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmitComment(content.trim(), authorName.trim());
    setContent("");
  };

  return (
    <aside className="w-80 border-l border-zinc-800 bg-zinc-950 flex flex-col h-full shrink-0 select-none">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-400" />
          <h2 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
            Feedback Pins ({comments.length})
          </h2>
        </div>
      </div>

      {/* Pending Pin Input Box */}
      {pendingPin && (
        <div className="p-4 border-b border-indigo-950/60 bg-indigo-950/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-indigo-300">New Pin Draft</span>
            <button
              onClick={onCancelPendingPin}
              className="text-[11px] text-zinc-400 hover:text-zinc-200"
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
              className="w-full text-xs px-2.5 py-1.5 rounded-md bg-zinc-900 border border-zinc-700 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
            <textarea
              placeholder="Describe revision or feedback..."
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              autoFocus
              className="w-full text-xs px-2.5 py-1.5 rounded-md bg-zinc-900 border border-zinc-700 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-all"
            >
              <Send className="w-3 h-3" />
              <span>Post Pin</span>
            </button>
          </form>
        </div>
      )}

      {/* Comment Thread List */}
      <div className="flex-1 overflow-y-auto divide-y divide-zinc-900 p-2 space-y-2">
        {comments.length === 0 && !pendingPin && (
          <div className="p-8 text-center text-zinc-400">
            <p className="text-xs">No feedback pins dropped yet.</p>
            <p className="text-[11px] text-zinc-400 mt-1">
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
                  ? "bg-zinc-900/90 border border-indigo-500/50"
                  : "bg-zinc-900/40 hover:bg-zinc-900/70 border border-transparent"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                      comment.isResolved ? "bg-emerald-600" : "bg-indigo-600"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="text-xs font-medium text-zinc-200">
                    {comment.authorName}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
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
                      ? "text-emerald-400 bg-emerald-950/60"
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed pl-7">
                {comment.content}
              </p>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
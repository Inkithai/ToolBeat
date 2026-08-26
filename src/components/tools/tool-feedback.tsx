"use client";
import { useState, useEffect } from "react";
import { Check, ThumbsDown, ThumbsUp, MessageSquare } from "lucide-react";

/**
 * Per-tool feedback stored in localStorage.
 * No backend — this is a local record of what the user found useful.
 * The aggregate counts are visible only to this user in this browser.
 */
const FEEDBACK_KEY = "convertlab:feedback";
const COMMENT_KEY = "convertlab:feedback-comment";

type FeedbackData = Record<string, "yes" | "no">;
type CommentData = Record<string, string>;

function loadFeedback(): FeedbackData {
  try { return JSON.parse(localStorage.getItem(FEEDBACK_KEY) || "{}"); } catch { return {}; }
}
function loadComments(): CommentData {
  try { return JSON.parse(localStorage.getItem(COMMENT_KEY) || "{}"); } catch { return {}; }
}

export default function ToolFeedback({ toolName }: { toolName: string }) {
  const [vote, setVote] = useState<"yes" | "no" | null>(null);
  const [comment, setComment] = useState("");
  const [showComment, setShowComment] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const data = loadFeedback();
    const existing = data[toolName];
    if (existing) setVote(existing);
    const comments = loadComments();
    const existingComment = comments[toolName];
    if (existingComment) setComment(existingComment);
  }, [toolName]);

  const handleVote = (value: "yes" | "no") => {
    const data = loadFeedback();
    data[toolName] = value;
    try { localStorage.setItem(FEEDBACK_KEY, JSON.stringify(data)); } catch { /* storage full */ }
    setVote(value);
    setSubmitted(true);
  };

  const handleComment = () => {
    if (!comment.trim()) return;
    const comments = loadComments();
    comments[toolName] = comment.trim();
    try { localStorage.setItem(COMMENT_KEY, JSON.stringify(comments)); } catch { /* storage full */ }
    setShowComment(false);
    setSubmitted(true);
  };

  if (submitted || vote) {
    return (
      <div className="mt-8 flex items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-300" role="status">
        <Check className="h-4 w-4" />
        Thanks for the feedback{vote ? ` (${vote === "yes" ? "👍" : "👎"})` : ""}.
      </div>
    );
  }

  return (
    <section className="mt-8 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-center" aria-label="Tool feedback">
      <p className="text-sm font-semibold text-ink-200">Was this tool useful?</p>
      <div className="mt-3 flex justify-center gap-2">
        <button type="button" onClick={() => handleVote("yes")} className="btn-secondary px-4 py-2 text-xs">
          <ThumbsUp className="h-3.5 w-3.5" /> Yes
        </button>
        <button type="button" onClick={() => handleVote("no")} className="btn-secondary px-4 py-2 text-xs">
          <ThumbsDown className="h-3.5 w-3.5" /> Not quite
        </button>
        <button type="button" onClick={() => setShowComment(!showComment)} className="btn-secondary px-4 py-2 text-xs">
          <MessageSquare className="h-3.5 w-3.5" /> Comment
        </button>
      </div>
      {showComment && (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={comment}
            onChange={e => setComment(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleComment()}
            placeholder="What could be improved?"
            className="field flex-1 text-sm"
            maxLength={280}
          />
          <button type="button" onClick={handleComment} className="btn-primary px-4 text-xs">
            Send
          </button>
        </div>
      )}
      <p className="meta mt-3 text-[10px] text-ink-600">Stored locally in your browser only — not sent anywhere.</p>
    </section>
  );
}

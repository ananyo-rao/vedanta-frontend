"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import {
  useStudentThread,
  useReplyToStudent,
  useNotifications,
  useMarkNotificationsRead,
} from "@/hooks/use-guide-students";

/**
 * A student's questions and the guide's answers. Opening this view marks that
 * student's notifications read — reading them is the act of reading them, so
 * there is no separate "mark as read" control to remember to press.
 */
export function StudentThread({ clerkId }: { clerkId: string }) {
  const { data: messages = [], isLoading } = useStudentThread(clerkId);
  const reply = useReplyToStudent(clerkId);
  const { data: notifications = [] } = useNotifications();
  const markRead = useMarkNotificationsRead();

  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const markedRef = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, reply.isPending]);

  useEffect(() => {
    if (markedRef.current) return;
    const ids = notifications
      .filter((n) => n.student_clerk_id === clerkId && !n.read_at)
      .map((n) => n.id);
    if (ids.length === 0) return;
    markedRef.current = true;
    markRead.mutate(ids);
    // markRead is a stable mutation object; re-running on it would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications, clerkId]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || reply.isPending) return;
    setError(null);
    setInput("");
    reply.mutate(text, {
      onError: (e) =>
        setError(e instanceof Error ? e.message : "Failed to send reply"),
    });
  };

  return (
    <div className="flex h-full min-h-[24rem] flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-outline-variant/10 bg-surface-container-low p-4">
        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        )}
        {!isLoading && messages.length === 0 && (
          <p className="py-8 text-center text-sm text-on-surface-variant">
            This student has not asked you anything yet.
          </p>
        )}
        {messages.map((m, i) => {
          const fromGuide = m.role === "guide";
          return (
            <div
              key={i}
              className={`flex ${fromGuide ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${
                  fromGuide
                    ? "rounded-br-sm bg-primary text-white"
                    : "rounded-bl-sm bg-surface-container-high text-on-surface"
                }`}
              >
                {fromGuide && m.author_name && (
                  <span className="mb-0.5 block text-[10px] font-medium uppercase tracking-wide text-white/80">
                    {m.author_name}
                  </span>
                )}
                {m.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      <div className="mt-3 flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Reply to your student…"
          rows={1}
          className="min-h-[44px] flex-1 resize-none rounded-lg border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface outline-none focus:border-primary/50"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || reply.isPending}
          aria-label="Send reply"
          className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

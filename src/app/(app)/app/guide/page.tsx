"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Compass, Loader2 } from "lucide-react";
import { useGuideHistory, useSendGuide } from "@/hooks/use-chat";

export default function GuidePage() {
  const { data: messages = [], isLoading } = useGuideHistory();
  const send = useSendGuide();

  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, send.isPending]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || send.isPending) return;
    setError(null);
    setInput("");
    send.mutate(text, {
      onError: (e) =>
        setError(e instanceof Error ? e.message : "Failed to send message"),
    });
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col">
      <div className="mb-4 flex items-center gap-2">
        <Compass className="h-5 w-5 text-primary" />
        <div>
          <h1 className="text-lg font-semibold text-on-surface">Guide Chat</h1>
          <p className="text-sm text-on-surface-variant">
            Message your guide. They&apos;ll reply here — no instant response.
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-outline-variant/10 bg-surface-container-low p-4">
        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        )}
        {!isLoading && messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center text-on-surface-variant">
            <Compass className="mb-2 h-8 w-8 opacity-40" />
            <p className="text-sm">Send your guide a message to begin.</p>
          </div>
        )}
        {messages.map((m, i) => {
          const mine = m.role === "user";
          return (
            <div key={i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${
                  mine
                    ? "rounded-br-sm bg-primary text-white"
                    : "rounded-bl-sm bg-surface-container-high text-on-surface"
                }`}
              >
                {!mine && (
                  <span className="mb-0.5 block text-[10px] font-medium uppercase tracking-wide text-primary">
                    Guide
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
          placeholder="Message your guide…"
          rows={1}
          className="min-h-[44px] flex-1 resize-none rounded-lg border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface outline-none focus:border-primary/50"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || send.isPending}
          aria-label="Send message"
          className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

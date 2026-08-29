"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Loader2, ChevronRight, ChevronDown, BookOpen, NotebookPen } from "lucide-react";
import { useChatHistory, useSendChat } from "@/hooks/use-chat";
import type { ChatMessage, ChatMetadata } from "@/lib/api/dharma-chat";

function TeachingCard({ teaching }: { teaching: NonNullable<ChatMetadata["teaching"]> }) {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-primary">
        <BookOpen className="h-3.5 w-3.5" />
        {teaching.source} {teaching.reference}
      </div>
      <p className="text-sm font-medium text-on-surface">{teaching.title}</p>
      {teaching.content && (
        <p className="mt-1 text-sm italic text-on-surface-variant">&ldquo;{teaching.content}&rdquo;</p>
      )}
      {teaching.application && (
        <p className="mt-1.5 text-sm text-on-surface-variant">{teaching.application}</p>
      )}
    </div>
  );
}

function JournalCard({ journal }: { journal: NonNullable<ChatMetadata["journal"]> }) {
  return (
    <div className="rounded-lg border border-outline-variant/20 bg-surface-container p-3">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-on-surface-variant">
        <NotebookPen className="h-3.5 w-3.5" />
        From Your Journal
      </div>
      {journal.entries_used?.map((e, i) => (
        <div key={i} className="mt-1.5 text-sm">
          <span className="font-medium text-on-surface">{e.date}:</span>{" "}
          <span className="text-on-surface-variant">{e.snippet}</span>
          {e.connection && (
            <p className="mt-0.5 text-xs text-on-surface-variant/70">&rarr; {e.connection}</p>
          )}
        </div>
      ))}
      {journal.reflection && (
        <p className="mt-2 text-xs text-on-surface-variant/70">{journal.reflection}</p>
      )}
    </div>
  );
}

function StepsAccordion({ steps, durationMs }: { steps: NonNullable<ChatMetadata["steps"]>; durationMs?: number }) {
  const [open, setOpen] = useState(false);
  const totalMs = durationMs ?? steps.reduce((s, t) => s + t.duration_ms, 0);

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs text-on-surface-variant/60 hover:text-on-surface-variant transition-colors"
      >
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        How I reached this conclusion ({steps.length} steps &middot; {(totalMs / 1000).toFixed(1)}s)
      </button>
      {open && (
        <ol className="mt-1.5 space-y-1 pl-4 text-xs text-on-surface-variant/70">
          {steps.map((s, i) => (
            <li key={i}>
              <span className="font-medium text-on-surface-variant">{s.node_name.replace(/^chat_/, "").replace(/_/g, " ")}</span>
              <span className="ml-1">({s.model}, {s.duration_ms}ms)</span>
              {s.summary && <span className="ml-1">&mdash; {s.summary}</span>}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function AssistantMessage({ m }: { m: ChatMessage }) {
  const meta = m.metadata;

  if (!meta || (!meta.teaching && !meta.journal && !meta.steps?.length)) {
    return <div className="whitespace-pre-wrap text-sm">{m.content}</div>;
  }

  return (
    <div className="space-y-2.5">
      {meta.teaching && <TeachingCard teaching={meta.teaching} />}
      {meta.journal && meta.journal.entries_used?.length > 0 && <JournalCard journal={meta.journal} />}
      <div className="whitespace-pre-wrap text-sm">{m.content}</div>
      {meta.steps && meta.steps.length > 0 && (
        <StepsAccordion steps={meta.steps} durationMs={meta.pipeline_duration_ms} />
      )}
    </div>
  );
}

export default function ChatPage() {
  const { data: messages = [], isLoading } = useChatHistory();
  const send = useSendChat();

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
        <Sparkles className="h-5 w-5 text-primary" />
        <div>
          <h1 className="text-lg font-semibold text-on-surface">AI Chat</h1>
          <p className="text-sm text-on-surface-variant">
            Ask a question and receive guidance from the teachings.
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-outline-variant/10 bg-surface-container-low p-4">
        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        )}
        {!isLoading && messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center text-on-surface-variant">
            <Sparkles className="mb-2 h-8 w-8 opacity-40" />
            <p className="text-sm">Start the conversation — ask anything.</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                m.role === "user"
                  ? "rounded-br-sm bg-primary text-white text-sm whitespace-pre-wrap"
                  : "rounded-bl-sm bg-surface-container-high text-on-surface"
              }`}
            >
              {m.role === "user" ? m.content : <AssistantMessage m={m} />}
            </div>
          </div>
        ))}
        {send.isPending && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm bg-surface-container-high px-4 py-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-on-surface-variant" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      {/* Composer */}
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
          placeholder="Type your message…"
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

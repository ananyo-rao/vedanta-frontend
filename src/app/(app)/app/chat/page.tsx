"use client";

import { useEffect, useRef, useState } from "react";
import {
  Send,
  Sparkles,
  Loader2,
  ChevronRight,
  ChevronDown,
  BookOpen,
  NotebookPen,
  Brain,
  Search,
  MessageSquare,
  Lightbulb,
} from "lucide-react";
import { useChatHistory, useSendChat } from "@/hooks/use-chat";
import type { ChatMessage, ChatMetadata } from "@/lib/api/dharma-chat";

// ---- Collapsible section ----

function Section({
  icon: Icon,
  title,
  subtitle,
  defaultOpen = false,
  children,
  className = "",
}: {
  icon: typeof BookOpen;
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`rounded-lg border ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-surface-container/50"
      >
        <Icon className="h-4 w-4 flex-shrink-0 text-primary/70" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-on-surface">{title}</span>
          {subtitle && (
            <span className="ml-1.5 text-xs text-on-surface-variant">{subtitle}</span>
          )}
        </div>
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 flex-shrink-0 text-on-surface-variant/50" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-on-surface-variant/50" />
        )}
      </button>
      {open && <div className="border-t border-inherit px-3 py-2.5">{children}</div>}
    </div>
  );
}

// ---- Step detail for chain of thought ----

const STEP_META: Record<string, { label: string; icon: typeof Brain; verb: string }> = {
  chat_context_analyzer: { label: "Understanding Your Question", icon: Brain, verb: "Interpreting your question" },
  chat_teaching_retriever: { label: "Searching Teachings", icon: Search, verb: "Finding relevant teachings" },
  chat_journal_selector: { label: "Reviewing Your Journal", icon: NotebookPen, verb: "Selecting relevant journal entries" },
  chat_response_composer: { label: "Composing Response", icon: MessageSquare, verb: "Composing the response" },
};

function StepDetail({ step }: { step: NonNullable<ChatMetadata["steps"]>[number] }) {
  const [open, setOpen] = useState(false);
  const meta = STEP_META[step.node_name];
  const Icon = meta?.icon ?? Lightbulb;
  const label = meta?.label ?? step.node_name.replace(/^chat_/, "").replace(/_/g, " ");
  const output = step.output;

  return (
    <div className="border-l-2 border-primary/15 pl-3 py-1">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 text-left"
      >
        <Icon className="h-3.5 w-3.5 flex-shrink-0 text-primary/50" />
        <span className="flex-1 text-xs font-medium text-on-surface-variant">{label}</span>
        <span className="text-[10px] text-on-surface-variant/40">{step.model} · {step.duration_ms}ms</span>
        {output && (
          open
            ? <ChevronDown className="h-3 w-3 text-on-surface-variant/30" />
            : <ChevronRight className="h-3 w-3 text-on-surface-variant/30" />
        )}
      </button>
      {step.summary && !open && (
        <p className="mt-0.5 ml-5.5 text-[11px] text-on-surface-variant/50">{step.summary}</p>
      )}
      {open && output && (
        <div className="mt-1.5 ml-5.5 space-y-1 text-xs text-on-surface-variant/60">
          {renderStepOutput(step.node_name, output)}
        </div>
      )}
    </div>
  );
}

function renderStepOutput(nodeName: string, output: Record<string, unknown>) {
  switch (nodeName) {
    case "chat_context_analyzer": {
      const intent = output.intent as string | undefined;
      const themes = output.themes as string[] | undefined;
      const query = output.search_query as string | undefined;
      return (
        <>
          {intent && <p><span className="font-medium text-on-surface-variant">Intent:</span> {intent}</p>}
          {themes?.length ? <p><span className="font-medium text-on-surface-variant">Themes:</span> {themes.join(", ")}</p> : null}
          {query && <p><span className="font-medium text-on-surface-variant">Search query:</span> &ldquo;{query}&rdquo;</p>}
        </>
      );
    }
    case "chat_teaching_retriever": {
      const teachings = output.teachings as { title?: string; source?: string; reference?: string }[] | undefined;
      if (!teachings?.length) return <p>No teachings retrieved.</p>;
      return (
        <ul className="space-y-0.5">
          {teachings.map((t, i) => (
            <li key={i}>
              <span className="font-medium text-on-surface-variant">{t.title || t.reference}</span>
              {t.source && <span className="text-on-surface-variant/40"> — {t.source}</span>}
            </li>
          ))}
        </ul>
      );
    }
    case "chat_journal_selector": {
      const entries = output.selected_entries as { date?: string; content?: string; relevance?: string }[] | undefined;
      if (!entries?.length) return <p>No journal entries selected.</p>;
      return (
        <ul className="space-y-1">
          {entries.map((e, i) => (
            <li key={i}>
              <span className="font-medium text-on-surface-variant">{e.date}:</span>{" "}
              {e.content?.slice(0, 120)}{(e.content?.length ?? 0) > 120 ? "…" : ""}
              {e.relevance && <p className="text-[10px] text-on-surface-variant/40">&rarr; {e.relevance}</p>}
            </li>
          ))}
        </ul>
      );
    }
    default: {
      const summary = output.summary as string | undefined;
      return summary ? <p>{summary}</p> : null;
    }
  }
}

// ---- Assistant message with 4 sections ----

function AssistantMessage({ m }: { m: ChatMessage }) {
  const meta = m.metadata;

  if (!meta || (!meta.teaching && !meta.journal && !meta.steps?.length)) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-surface-container-high px-4 py-3 text-on-surface">
          <div className="whitespace-pre-wrap text-sm">{m.content}</div>
        </div>
      </div>
    );
  }

  const totalMs = meta.pipeline_duration_ms ?? meta.steps?.reduce((s, t) => s + t.duration_ms, 0) ?? 0;

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] w-full space-y-2">
        {/* 1. Teaching verse — title visible, content collapsed */}
        {meta.teaching && (
          <Section
            icon={BookOpen}
            title={`${meta.teaching.source} ${meta.teaching.reference}`}
            subtitle={meta.teaching.title}
            defaultOpen={false}
            className="border-primary/20 bg-primary/5"
          >
            {(meta.teaching.content || meta.teaching.problem) && (
              <p className="text-sm italic text-on-surface-variant">
                &ldquo;{meta.teaching.content ?? meta.teaching.problem}&rdquo;
              </p>
            )}
            {(meta.teaching.application || meta.teaching.solution) && (
              <p className="mt-2 text-sm text-on-surface-variant whitespace-pre-wrap">
                {meta.teaching.application ?? meta.teaching.solution}
              </p>
            )}
          </Section>
        )}

        {/* 2. Journal entries — fully collapsed */}
        {meta.journal && meta.journal.entries_used?.length > 0 && (
          <Section
            icon={NotebookPen}
            title="Journal Entries Used"
            subtitle={`${meta.journal.entries_used.length} ${meta.journal.entries_used.length === 1 ? "entry" : "entries"}`}
            defaultOpen={false}
            className="border-outline-variant/15 bg-surface-container/30"
          >
            <div className="space-y-2">
              {meta.journal.entries_used.map((e, i) => (
                <div key={i} className="text-sm">
                  <span className="font-medium text-on-surface">{e.date}:</span>{" "}
                  <span className="text-on-surface-variant">{e.snippet}</span>
                  {e.connection && (
                    <p className="mt-0.5 text-xs text-on-surface-variant/60">&rarr; {e.connection}</p>
                  )}
                </div>
              ))}
              {meta.journal.reflection && (
                <p className="text-xs italic text-on-surface-variant/60 pt-1 border-t border-outline-variant/10">
                  {meta.journal.reflection}
                </p>
              )}
            </div>
          </Section>
        )}

        {/* 3. Chain of thought — fully collapsed */}
        {meta.steps && meta.steps.length > 0 && (
          <Section
            icon={Brain}
            title="Chain of Thought"
            subtitle={`${meta.steps.length} steps · ${(totalMs / 1000).toFixed(1)}s`}
            defaultOpen={false}
            className="border-outline-variant/10 bg-surface-container-lowest/30"
          >
            <div className="space-y-1">
              {meta.steps.map((s, i) => (
                <StepDetail key={i} step={s} />
              ))}
            </div>
          </Section>
        )}

        {/* 4. Final response — fully expanded */}
        <div className="rounded-2xl rounded-bl-sm bg-surface-container-high px-4 py-3 text-on-surface">
          <div className="whitespace-pre-wrap text-sm">{m.content}</div>
        </div>
      </div>
    </div>
  );
}

// ---- Page ----

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
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-white whitespace-pre-wrap">
                {m.content}
              </div>
            </div>
          ) : (
            <AssistantMessage key={i} m={m} />
          )
        )}
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

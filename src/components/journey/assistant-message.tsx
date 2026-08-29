"use client";

import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  BookOpen,
  NotebookPen,
  Brain,
  Search,
  MessageSquare,
  Lightbulb,
  Check,
  Loader2,
} from "lucide-react";
import type { ChatMetadata, StreamStepEvent } from "@/lib/api/dharma-chat";

// ---- Collapsible section ----

export function Section({
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

// ---- Step rendering ----

export const STEP_META: Record<string, { label: string; icon: typeof Brain; verb: string }> = {
  chat_context_analyzer: { label: "Understanding Your Question", icon: Brain, verb: "Interpreting your question" },
  chat_teaching_retriever: { label: "Searching Teachings", icon: Search, verb: "Finding relevant teachings" },
  chat_journal_selector: { label: "Reviewing Your Journal", icon: NotebookPen, verb: "Selecting relevant journal entries" },
  chat_response_composer: { label: "Composing Response", icon: MessageSquare, verb: "Composing the response" },
};

export const PIPELINE_ORDER = [
  "chat_context_analyzer",
  "chat_teaching_retriever",
  "chat_journal_selector",
  "chat_response_composer",
];

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

// ---- Live progress indicator ----

export function LiveProgress({ completedSteps }: { completedSteps: StreamStepEvent[] }) {
  const doneNames = new Set(completedSteps.map((s) => s.node_name));
  let activeIdx = PIPELINE_ORDER.findIndex((name) => !doneNames.has(name));
  if (activeIdx === -1) activeIdx = PIPELINE_ORDER.length;

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] w-full rounded-2xl rounded-bl-sm bg-surface-container-high px-4 py-3 space-y-1.5">
        {PIPELINE_ORDER.map((name, i) => {
          const meta = STEP_META[name];
          const Icon = meta?.icon ?? Lightbulb;
          const isDone = doneNames.has(name);
          const isActive = i === activeIdx;
          const completedStep = completedSteps.find((s) => s.node_name === name);

          return (
            <div key={name} className="flex items-center gap-2">
              {isDone ? (
                <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              ) : isActive ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary flex-shrink-0" />
              ) : (
                <div className="h-3.5 w-3.5 rounded-full border border-outline-variant/30 flex-shrink-0" />
              )}
              <Icon className={`h-3.5 w-3.5 flex-shrink-0 ${isDone ? "text-primary/70" : isActive ? "text-primary/70" : "text-on-surface-variant/30"}`} />
              <span className={`text-xs ${isDone ? "text-on-surface-variant" : isActive ? "text-on-surface font-medium" : "text-on-surface-variant/40"}`}>
                {isActive ? meta?.verb ?? meta?.label : meta?.label}
              </span>
              {isDone && completedStep && (
                <span className="text-[10px] text-on-surface-variant/40 ml-auto">
                  {(completedStep.duration_ms / 1000).toFixed(1)}s
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- Assistant message with structured sections ----

interface ChatMessageLike {
  role: string;
  content: string;
  metadata?: ChatMetadata | null;
}

export function AssistantMessage({ m }: { m: ChatMessageLike }) {
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

        <div className="rounded-2xl rounded-bl-sm bg-surface-container-high px-4 py-3 text-on-surface">
          <div className="whitespace-pre-wrap text-sm">{m.content}</div>
        </div>
      </div>
    </div>
  );
}

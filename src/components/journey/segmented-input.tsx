"use client";

import { useState } from "react";
import { Send, NotebookPen, Sparkles, UserRound } from "lucide-react";

export type InputMode = "journal" | "ai" | "guide";

const MODES: { key: InputMode; label: string; icon: typeof NotebookPen; hint: string; placeholder: string }[] = [
  { key: "journal", label: "Journaling", icon: NotebookPen, hint: "Saving as journal entry", placeholder: "Write a journal entry…" },
  { key: "ai", label: "AI", icon: Sparkles, hint: "Asking AI", placeholder: "Ask a question…" },
  { key: "guide", label: "Guide", icon: UserRound, hint: "Messaging your guide", placeholder: "Message your guide…" },
];

export function SegmentedInput({
  mode,
  onModeChange,
  onSend,
  disabled = false,
}: {
  mode: InputMode;
  onModeChange: (m: InputMode) => void;
  onSend: (text: string) => void;
  disabled?: boolean;
}) {
  const [input, setInput] = useState("");
  const current = MODES.find((m) => m.key === mode)!;

  const handleSend = () => {
    const text = input.trim();
    if (!text || disabled) return;
    onSend(text);
    setInput("");
  };

  return (
    <div className="mt-3 space-y-2">
      <div className="flex rounded-lg bg-surface-container p-0.5">
        {MODES.map(({ key, label, icon: Icon }) => {
          const active = mode === key;
          return (
            <button
              key={key}
              onClick={() => onModeChange(key)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          );
        })}
      </div>

      <p className="text-[11px] text-on-surface-variant/60">{current.hint}</p>

      <div className="flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={current.placeholder}
          rows={4}
          className="min-h-[100px] flex-1 resize-y rounded-lg border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface outline-none focus:border-primary/50"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          aria-label="Send"
          className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

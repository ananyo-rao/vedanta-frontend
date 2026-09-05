"use client";

import { useMemo, useState } from "react";
import { Check, Search, Loader2, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAssignmentRoster } from "@/hooks/use-guide-assignments";
import { cn } from "@/lib/utils";

interface Props {
  /** Clerk ids currently invited. */
  selected: string[];
  onChange: (clerkIds: string[]) => void;
}

/**
 * Picks which members are invited to a class, from the app_users directory that
 * mirrors Clerk. Selection is explicit — there is no "everyone" shortcut,
 * because a class roster is a deliberate list.
 */
export function MemberPicker({ selected, onChange }: Props) {
  const { data: members = [], isLoading, isError } = useAssignmentRoster("all");
  const [query, setQuery] = useState("");

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q)
    );
  }, [members, query]);

  const toggle = (clerkId: string) => {
    const next = new Set(selectedSet);
    if (next.has(clerkId)) next.delete(clerkId);
    else next.add(clerkId);
    onChange([...next]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading members…
      </div>
    );
  }

  if (isError) {
    return (
      <p className="py-6 text-sm text-destructive">
        Could not load the member directory.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email"
            className="pl-8"
            aria-label="Search members"
          />
        </div>
        <Badge variant="secondary" className="shrink-0 gap-1">
          <Users className="h-3 w-3" />
          {selected.length} invited
        </Badge>
      </div>

      <div
        role="listbox"
        aria-multiselectable
        aria-label="Members"
        className="max-h-72 overflow-y-auto rounded-md border"
      >
        {filtered.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            {members.length === 0
              ? "No members have signed up yet."
              : "No members match that search."}
          </p>
        ) : (
          filtered.map((m) => {
            const isSelected = selectedSet.has(m.clerk_id);
            return (
              <button
                key={m.clerk_id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => toggle(m.clerk_id)}
                className={cn(
                  "flex w-full items-center gap-3 border-b px-3 py-2 text-left last:border-b-0",
                  "hover:bg-accent focus-visible:bg-accent focus-visible:outline-none",
                  isSelected && "bg-accent/50"
                )}
              >
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input"
                  )}
                  aria-hidden
                >
                  {isSelected && <Check className="h-3 w-3" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {m.name || m.email || m.clerk_id}
                  </span>
                  {m.name && m.email && (
                    <span className="block truncate text-xs text-muted-foreground">
                      {m.email}
                    </span>
                  )}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

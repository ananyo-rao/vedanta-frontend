"use client";

import { format } from "date-fns";
import { MessageSquare } from "lucide-react";
import { useIntrospectionResponses } from "@/hooks/use-courses-admin";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface IntrospectionResponsesPanelProps {
  courseId: string;
}

export function IntrospectionResponsesPanel({
  courseId,
}: IntrospectionResponsesPanelProps) {
  const { data: responses, isLoading, error } = useIntrospectionResponses(courseId);

  if (isLoading) {
    return (
      <div className="py-16 text-center text-sm text-on-surface-variant">
        Loading responses…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-error-container p-6 text-center">
        <p className="text-sm font-medium text-on-error-container">
          {error instanceof Error ? error.message : "Failed to load responses"}
        </p>
      </div>
    );
  }

  if (!responses || responses.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <MessageSquare className="h-10 w-10 text-on-surface-variant/40" />
        <p className="text-sm font-medium text-on-surface">No responses yet</p>
        <p className="text-xs text-on-surface-variant">
          Student introspection responses will appear here once submitted.
        </p>
      </div>
    );
  }

  // Group responses by page title for easier reading
  const grouped = responses.reduce<Record<string, typeof responses>>(
    (acc, r) => {
      const key = r.page_title || "Unknown page";
      if (!acc[key]) acc[key] = [];
      acc[key].push(r);
      return acc;
    },
    {}
  );

  return (
    <ScrollArea className="h-[calc(100vh-280px)] pr-4">
      <div className="space-y-8">
        {Object.entries(grouped).map(([pageTitle, pageResponses]) => (
          <section key={pageTitle}>
            <div className="mb-4 flex items-center gap-2">
              <h3 className="font-serif text-base font-semibold text-on-surface">
                {pageTitle}
              </h3>
              <Badge variant="outline" className="text-xs">
                {pageResponses.length}{" "}
                {pageResponses.length === 1 ? "response" : "responses"}
              </Badge>
            </div>

            <div className="space-y-3">
              {pageResponses.map((response, idx) => (
                <div key={response.id}>
                  {idx > 0 && <Separator className="mb-3" />}
                  <ResponseCard response={response} />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </ScrollArea>
  );
}

function ResponseCard({
  response,
}: {
  response: NonNullable<ReturnType<typeof useIntrospectionResponses>["data"]>[number];
}) {
  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-on-surface">{response.user_name}</span>
        <span className="text-xs text-on-surface-variant">{response.user_email}</span>
        {response.is_draft && (
          <Badge variant="outline" className="text-xs text-amber-700 border-amber-200 bg-amber-50">
            Draft
          </Badge>
        )}
        <span className="ml-auto text-xs text-on-surface-variant">
          {format(new Date(response.updated_at), "MMM d, yyyy · h:mm a")}
        </span>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-on-surface">
        {response.response_text}
      </p>
    </div>
  );
}

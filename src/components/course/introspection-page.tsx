"use client";

import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { DevanagariVerse } from "@/components/course/devanagari-verse";
import { ReflectionTextarea } from "@/components/course/reflection-textarea";
import { CompleteAndContinue } from "@/components/course/complete-and-continue";
import type { CoursePage, IntrospectionContent, IntrospectionResponse, PageStatus } from "@/types/course";

interface IntrospectionPageProps {
  page: CoursePage & {
    introspection_response?: IntrospectionResponse | null;
  };
  courseId: string;
  nextPageId: string | null;
  isLastPage: boolean;
  pageStatus: PageStatus["status"];
}

export function IntrospectionPage({
  page,
  courseId,
  nextPageId,
  isLastPage,
  pageStatus,
}: IntrospectionPageProps) {
  const content = page.content as IntrospectionContent;
  const isCompleted = pageStatus === "completed";
  const existingResponse = page.introspection_response;
  const [hasSubmitted, setHasSubmitted] = useState(
    !!existingResponse && !existingResponse.is_draft
  );

  const canComplete = hasSubmitted || !page.is_strict;

  return (
    <div>
      <h1 className="mb-8 text-center font-serif text-2xl font-bold text-on-surface">
        {page.title}
      </h1>

      {/* Devanagari Verse */}
      <div className="mb-8">
        <DevanagariVerse verse={content.verse} />
      </div>

      {/* Explanation */}
      <div className="mb-8">
        <h2 className="mb-3 font-serif text-lg font-semibold text-on-surface">
          Explanation
        </h2>
        <p className="text-base leading-relaxed text-on-surface-variant" style={{ lineHeight: 1.8 }}>
          {content.explanation}
        </p>
      </div>

      <Separator className="my-8" />

      {/* Reflection */}
      <ReflectionTextarea
        courseId={courseId}
        pageId={page.id}
        initialText={existingResponse?.response_text || ""}
        isSubmitted={hasSubmitted}
        onSubmitted={() => setHasSubmitted(true)}
      />

      <CompleteAndContinue
        courseId={courseId}
        pageId={page.id}
        nextPageId={nextPageId}
        isStrict={page.is_strict}
        canComplete={canComplete}
        isAlreadyCompleted={isCompleted}
        isLastPage={isLastPage}
        progressHint={
          page.is_strict && !canComplete
            ? "Submit your reflection to continue"
            : undefined
        }
      />
    </div>
  );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSaveDraft, useSubmitIntrospection } from "@/hooks/use-courses";

interface ReflectionTextareaProps {
  courseId: string;
  pageId: string;
  initialText: string;
  isSubmitted: boolean;
  onSubmitted: () => void;
}

export function ReflectionTextarea({
  courseId,
  pageId,
  initialText,
  isSubmitted: initialIsSubmitted,
  onSubmitted,
}: ReflectionTextareaProps) {
  const [text, setText] = useState(initialText);
  const [isSubmitted, setIsSubmitted] = useState(initialIsSubmitted);
  const [isEditing, setIsEditing] = useState(!initialIsSubmitted);
  const [draftSaved, setDraftSaved] = useState(false);
  const lastSavedRef = useRef(initialText);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveDraft = useSaveDraft(courseId, pageId);
  const submitIntrospection = useSubmitIntrospection(courseId, pageId);

  // Auto-save debounced at 5s
  const debouncedSave = useCallback(
    (value: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        if (value.trim() && value !== lastSavedRef.current) {
          try {
            await saveDraft.mutateAsync(value);
            lastSavedRef.current = value;
            setDraftSaved(true);
            setTimeout(() => setDraftSaved(false), 3000);
          } catch {
            // Silent failure for auto-save
          }
        }
      }, 5000);
    },
    [saveDraft]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);
    if (!isSubmitted) {
      debouncedSave(value);
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) {
      toast.error("Please write a reflection before submitting");
      return;
    }
    try {
      await submitIntrospection.mutateAsync(text.trim());
      setIsSubmitted(true);
      setIsEditing(false);
      toast.success("Reflection submitted");
      onSubmitted();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not submit. Your draft is saved locally. Please try again."
      );
    }
  };

  const handleEditReflection = () => {
    setIsEditing(true);
    setIsSubmitted(false);
  };

  return (
    <div className="space-y-3">
      <h3 className="font-serif text-base font-semibold text-on-surface">
        Reflect on this teaching
      </h3>

      <Textarea
        value={text}
        onChange={handleChange}
        placeholder="Write your reflection here..."
        rows={6}
        disabled={isSubmitted && !isEditing}
        className="min-h-[150px] resize-y bg-surface-container-lowest p-4 text-base leading-relaxed sm:min-h-[200px]"
        aria-label="Reflection text"
      />

      <div className="flex flex-wrap items-center gap-3">
        {draftSaved && !isSubmitted && (
          <p className="flex items-center gap-1 text-xs text-on-surface-variant">
            <Check className="h-3 w-3" aria-hidden="true" />
            Draft saved
          </p>
        )}

        {isSubmitted && !isEditing ? (
          <div className="flex items-center gap-3">
            <Button variant="outline" disabled className="gap-2">
              <Check className="h-4 w-4" />
              Submitted
            </Button>
            <Button variant="ghost" size="sm" onClick={handleEditReflection}>
              Edit Reflection
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={handleSubmit}
            disabled={submitIntrospection.isPending || !text.trim()}
            aria-label="Submit reflection"
          >
            {submitIntrospection.isPending
              ? "Submitting..."
              : "Submit Reflection"}
          </Button>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { VideoUploader } from "@/components/admin/video-uploader";
import type {
  CoursePage,
  PageType,
  VideoContent,
  IntrospectionContent,
  MeditationContent,
  VideoSource,
} from "@/types/course";

interface AdminPageEditorProps {
  page?: CoursePage;
  pageType: PageType;
  onSave: (data: {
    title: string;
    page_type: PageType;
    is_strict: boolean;
    content: VideoContent | IntrospectionContent | MeditationContent;
  }) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}

export function AdminPageEditor({
  page,
  pageType,
  onSave,
  onCancel,
  saving,
}: AdminPageEditorProps) {
  const [title, setTitle] = useState(page?.title || "");
  const [isStrict, setIsStrict] = useState(page?.is_strict ?? true);

  // Video fields
  const videoContent = page?.page_type === "video" ? (page.content as VideoContent) : null;
  const [videoUrl, setVideoUrl] = useState(videoContent?.video_url || "");
  const [videoSource, setVideoSource] = useState<VideoSource>(
    videoContent?.video_source || "external"
  );
  const [summary, setSummary] = useState(videoContent?.summary || "");

  // Introspection fields
  const introContent =
    page?.page_type === "introspection" ? (page.content as IntrospectionContent) : null;
  const [verse, setVerse] = useState(introContent?.verse || "");
  const [explanation, setExplanation] = useState(introContent?.explanation || "");

  // Meditation fields
  const medContent =
    page?.page_type === "meditation" ? (page.content as MeditationContent) : null;
  const [medVideoUrl, setMedVideoUrl] = useState(medContent?.video_url || "");
  const [medVideoSource, setMedVideoSource] = useState<VideoSource>(
    medContent?.video_source || "external"
  );
  const [medDescription, setMedDescription] = useState(
    medContent?.description || ""
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    let content: VideoContent | IntrospectionContent | MeditationContent;

    if (pageType === "video") {
      if (!videoUrl.trim()) {
        toast.error("Video URL is required");
        return;
      }
      if (!summary.trim()) {
        toast.error("Summary is required");
        return;
      }
      content = {
        video_url: videoUrl.trim(),
        video_source: videoSource,
        summary: summary.trim(),
      };
    } else if (pageType === "introspection") {
      if (!verse.trim()) {
        toast.error("Devanagari verse is required");
        return;
      }
      if (!explanation.trim()) {
        toast.error("Explanation is required");
        return;
      }
      content = {
        verse: verse.trim(),
        explanation: explanation.trim(),
      };
    } else {
      if (!medVideoUrl.trim()) {
        toast.error("Video URL is required");
        return;
      }
      content = {
        video_url: medVideoUrl.trim(),
        video_source: medVideoSource,
        description: medDescription.trim() || undefined,
      };
    }

    await onSave({
      title: title.trim(),
      page_type: pageType,
      is_strict: isStrict,
      content,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-lg bg-surface-container-lowest p-4">
      <div className="space-y-2">
        <Label htmlFor="page-title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="page-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Page title..."
          maxLength={120}
          required
          aria-required="true"
        />
      </div>

      {pageType === "video" && (
        <>
          <VideoUploader
            value={videoUrl}
            source={videoSource}
            onChange={(url, source) => {
              setVideoUrl(url);
              setVideoSource(source);
            }}
            label="Video"
          />
          <div className="space-y-2">
            <Label htmlFor="video-summary">
              Summary <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="video-summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Key takeaways from this video..."
              maxLength={1000}
              rows={4}
              required
              aria-required="true"
            />
            <p className="text-xs text-on-surface-variant">
              {summary.length}/1000 characters
            </p>
          </div>
        </>
      )}

      {pageType === "introspection" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="devanagari-verse">
              Devanagari Verse <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="devanagari-verse"
              value={verse}
              onChange={(e) => setVerse(e.target.value)}
              placeholder="Enter the Devanagari verse..."
              rows={4}
              required
              aria-required="true"
              className="font-[system-ui] text-lg leading-loose"
              lang="sa"
            />
            <p className="text-xs text-on-surface-variant">
              Type or paste Devanagari text. Use your system&apos;s Devanagari input method.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="explanation">
              Explanation <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="explanation"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Translation, commentary, or explanation..."
              maxLength={2000}
              rows={6}
              required
              aria-required="true"
            />
            <p className="text-xs text-on-surface-variant">
              {explanation.length}/2000 characters
            </p>
          </div>
        </>
      )}

      {pageType === "meditation" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="med-description">Description (optional)</Label>
            <Textarea
              id="med-description"
              value={medDescription}
              onChange={(e) => setMedDescription(e.target.value)}
              placeholder="A brief description for this meditation..."
              maxLength={500}
              rows={3}
            />
            <p className="text-xs text-on-surface-variant">
              {medDescription.length}/500 characters
            </p>
          </div>
          <VideoUploader
            value={medVideoUrl}
            source={medVideoSource}
            onChange={(url, source) => {
              setMedVideoUrl(url);
              setMedVideoSource(source);
            }}
            label="Meditation Video"
          />
        </>
      )}

      <div className="flex items-center gap-3">
        <Switch
          id="is-strict"
          checked={isStrict}
          onCheckedChange={setIsStrict}
          aria-label="Mark page as strict (required for progression)"
        />
        <Label htmlFor="is-strict" className="cursor-pointer">
          {isStrict ? "Strict" : "Optional"} — {isStrict ? "Students must complete this page to proceed" : "Students can skip this page"}
        </Label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Page"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { VideoUploader } from "@/components/admin/video-uploader";
import { ImageUploader } from "@/components/admin/image-uploader";
import type { CourseWithPages, VideoSource } from "@/types/course";
import type { CreateCourseInput } from "@/types/course-schemas";

interface CourseIntroFormProps {
  course?: CourseWithPages | null;
  onSave: (data: CreateCourseInput) => Promise<void>;
  saving: boolean;
}

export function CourseIntroForm({ course, onSave, saving }: CourseIntroFormProps) {
  const [open, setOpen] = useState(!course);
  const [title, setTitle] = useState(course?.title || "");
  const [description, setDescription] = useState(course?.description || "");
  const [introVideoUrl, setIntroVideoUrl] = useState(
    course?.intro_video_url || ""
  );
  const [introVideoSource, setIntroVideoSource] = useState<VideoSource | null>(
    course?.intro_video_source || null
  );
  const [thumbnail, setThumbnail] = useState(course?.thumbnail_url || "");
  const [courseType, setCourseType] = useState(course?.course_type || "");
  const [teacherName, setTeacherName] = useState(course?.teacher_name || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!description.trim()) {
      toast.error("Description is required");
      return;
    }

    await onSave({
      title: title.trim(),
      description: description.trim(),
      intro_video_url: introVideoUrl || null,
      intro_video_source: introVideoSource,
      thumbnail_url: thumbnail || null,
      course_type: courseType || undefined,
      teacher_name: teacherName || null,
    });
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-lg px-1 py-3 text-left font-serif text-lg font-semibold text-on-surface hover:bg-surface-container-high/50"
          aria-label={open ? "Collapse course intro" : "Expand course intro"}
        >
          {open ? (
            <ChevronDown className="h-5 w-5 text-on-surface-variant" />
          ) : (
            <ChevronRight className="h-5 w-5 text-on-surface-variant" />
          )}
          Course Intro
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <form onSubmit={handleSubmit} className="space-y-5 pb-6 pt-2">
          <div className="space-y-2">
            <Label htmlFor="course-title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="course-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Introduction to Vedanta"
              maxLength={120}
              required
              aria-required="true"
            />
            <p className="text-xs text-on-surface-variant">
              {title.length}/120 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="course-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A comprehensive introduction to..."
              maxLength={500}
              rows={4}
              required
              aria-required="true"
            />
            <p className="text-xs text-on-surface-variant">
              {description.length}/500 characters
            </p>
          </div>

          <VideoUploader
            value={introVideoUrl}
            source={introVideoSource}
            onChange={(url, source) => {
              setIntroVideoUrl(url);
              setIntroVideoSource(source);
            }}
            label="Intro Video"
          />

          <ImageUploader
            value={thumbnail}
            onChange={(url) => setThumbnail(url)}
            label="Thumbnail (optional)"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="course-type">Course Type (optional)</Label>
              <Input
                id="course-type"
                value={courseType}
                onChange={(e) => setCourseType(e.target.value)}
                placeholder="e.g., Foundation, Advanced"
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-teacher">Teacher Name (optional)</Label>
              <Input
                id="course-teacher"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                placeholder="e.g., Swami Paramarthananda"
                maxLength={255}
              />
            </div>
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : course ? "Save Changes" : "Save Draft"}
          </Button>
        </form>
      </CollapsibleContent>
    </Collapsible>
  );
}

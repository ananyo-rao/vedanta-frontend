import { z } from "zod";

export const createCourseSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(120, "Title must be 120 characters or less"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must be 500 characters or less"),
  intro_video_url: z.string().url("Must be a valid URL").optional().nullable(),
  intro_video_source: z
    .enum(["gcs", "youtube", "vimeo", "external", "bunny"])
    .optional()
    .nullable(),
  thumbnail_url: z.string().url("Must be a valid URL").optional().nullable(),
  course_type: z.string().max(100).optional(),
  teacher_name: z.string().max(255).optional().nullable(),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;

export const updateCourseSchema = createCourseSchema.partial();
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;

export const videoContentSchema = z.object({
  video_url: z.string().min(1, "Video URL is required"),
  video_source: z.enum(["gcs", "youtube", "vimeo", "external", "bunny"]),
  summary: z
    .string()
    .min(1, "Summary is required")
    .max(1000, "Summary must be 1000 characters or less"),
});

export const introspectionContentSchema = z.object({
  verse: z.string().min(1, "Devanagari verse is required"),
  explanation: z
    .string()
    .min(1, "Explanation is required")
    .max(2000, "Explanation must be 2000 characters or less"),
});

export const meditationContentSchema = z.object({
  video_url: z.string().min(1, "Video URL is required"),
  video_source: z.enum(["gcs", "youtube", "vimeo", "external", "bunny"]),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .optional(),
});

export const createPageSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(120, "Title must be 120 characters or less"),
  page_type: z.enum(["video", "introspection", "meditation"]),
  is_strict: z.boolean().default(true),
  content: z.union([
    videoContentSchema,
    introspectionContentSchema,
    meditationContentSchema,
  ]),
});

export type CreatePageInput = z.infer<typeof createPageSchema>;

export const reorderPagesSchema = z.object({
  page_ids: z.array(z.string()),
});

export const introspectionResponseSchema = z.object({
  response_text: z
    .string()
    .min(1, "Please write a reflection before submitting")
    .max(10000, "Reflection must be 10,000 characters or less"),
});

export const videoProgressSchema = z.object({
  progress_percent: z.number().int().min(0).max(100),
  last_position: z.number().min(0),
});

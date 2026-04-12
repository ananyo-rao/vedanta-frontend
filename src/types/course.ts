export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  intro_video_url: string | null;
  intro_video_source: VideoSource | null;
  course_type: string;
  teacher_name: string | null;
  status: CourseStatus;
  display_order: number;
  end_date: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CourseWithPages extends Course {
  pages: CoursePage[];
}

export interface AdminCourseListItem {
  id: string;
  title: string;
  status: CourseStatus;
  page_count: number;
  enrollment_count: number;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export type CourseStatus = "draft" | "published";
export type VideoSource = "gcs" | "youtube" | "vimeo" | "external" | "bunny";
export type PageType = "video" | "introspection" | "meditation";

export interface CoursePage {
  id: string;
  course_id: string;
  title: string;
  page_type: PageType;
  sort_order: number;
  is_strict: boolean;
  content: VideoContent | IntrospectionContent | MeditationContent;
  created_at: string;
  updated_at: string;
}

export interface VideoContent {
  video_url: string;
  video_source: VideoSource;
  summary: string;
}

export interface IntrospectionContent {
  verse: string;
  explanation: string;
}

export interface MeditationContent {
  // New: MP3 audio URL for audio-based meditation (takes precedence over video_url)
  audio_url?: string;
  // Legacy: video-based meditation (used when audio_url is absent)
  video_url?: string;
  video_source?: VideoSource;
  description?: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  last_page_id: string | null;
  completed_at: string | null;
}

export interface CourseProgress {
  enrollment: Enrollment | null;
  total_pages: number;
  completed_pages: number;
  progress_percent: number;
  page_statuses: PageStatus[];
}

export interface PageStatus {
  page_id: string;
  title: string;
  page_type: PageType;
  is_strict: boolean;
  status: "completed" | "current" | "unlocked" | "locked";
}

export interface IntrospectionResponse {
  id: string;
  user_id: string;
  course_page_id: string;
  response_text: string;
  is_draft: boolean;
  created_at: string;
  updated_at: string;
}

// AdminIntrospectionResponse includes student info for admin views (from ResponseWithUser).
export interface AdminIntrospectionResponse extends IntrospectionResponse {
  user_name: string;
  user_email: string;
  page_title: string;
}


export interface CourseWithEnrollment extends Course {
  enrollment?: Enrollment | null;
  progress?: {
    completed_pages: number;
    total_pages: number;
    progress_percent: number;
  } | null;
}

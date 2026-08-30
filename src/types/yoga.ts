export interface HealthElement {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon_url: string | null;
  display_order: number;
  created_at: string;
}

export interface YogaProfile {
  id: string;
  user_id: string;
  phone_number: string | null;
  date_of_birth: string | null;
  gender: "male" | "female" | "prefer_not_to_say" | null;
  location: string | null;
  occupation: string | null;
  work_feeling: string | null;
  ideal_work: string | null;
  platform_motivation: string | null;
  yoga_motivation: string | null;
  has_practiced_before: boolean;
  years_of_practice: number;
  status: "complete" | "incomplete";
  created_at: string;
  updated_at: string;
  conditions: HealthElement[];
}

export interface CreateYogaProfileInput {
  phone_number?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "prefer_not_to_say";
  location?: string;
  occupation?: string;
  work_feeling?: string;
  ideal_work?: string;
  platform_motivation?: string;
  yoga_motivation?: string;
  has_practiced_before: boolean;
  years_of_practice: number;
  condition_slugs: string[];
}

export interface UpdateYogaProfileInput {
  phone_number?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "prefer_not_to_say";
  location?: string;
  occupation?: string;
  work_feeling?: string;
  ideal_work?: string;
  platform_motivation?: string;
  yoga_motivation?: string;
  has_practiced_before?: boolean;
  years_of_practice?: number;
  condition_slugs?: string[];
}

export type YogaVideoSource = "youtube" | "bunny" | "external";

export interface YogaCourse {
  id: string;
  title: string;
  description: string;
  element_tags: string[];
  difficulty_level: number;
  intro_video_url: string | null;
  intro_video_source: YogaVideoSource | null;
  thumbnail_url: string | null;
  teacher_name: string | null;
  status: "draft" | "published";
  total_weeks: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface YogaCourseVideo {
  id: string;
  course_id: string;
  title: string;
  description: string;
  video_url: string;
  video_source: YogaVideoSource;
  week_number: number;
  session_number: number;
  duration_seconds: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface YogaEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  current_week: number;
  week_started_at: string | null;
  enrolled_at: string;
  completed_at: string | null;
}

export interface FeedbackQuestion {
  id: string;
  course_id: string;
  question_text: string;
  question_type: "emoji_scale" | "yes_no" | "text" | "multiple_choice";
  options: string[] | null;
  is_required: boolean;
  sort_order: number;
  created_at: string;
}

export interface FeedbackResponse {
  id: string;
  enrollment_id: string;
  week_number: number;
  responses: FeedbackAnswer[];
  submitted_at: string;
}

export interface FeedbackAnswer {
  question_id: string;
  answer: string;
}

export interface YogaLiveSession {
  id: string;
  course_id: string;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  meeting_url: string;
  recording_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface YogaCourseDetail extends YogaCourse {
  videos: YogaCourseVideo[];
  feedback_questions: FeedbackQuestion[];
  live_sessions: YogaLiveSession[];
}

export interface WeekVideoStatus {
  video: YogaCourseVideo;
  completed: boolean;
  completed_at: string | null;
}

export interface YogaCourseProgress {
  enrollment_id: string;
  current_week: number;
  week_started_at: string | null;
  total_weeks: number;
  week_videos: WeekVideoStatus[];
  feedback_submitted: boolean;
  completed_at: string | null;
}

export interface VideoCompletionResult {
  completed: boolean;
  all_week_videos_completed: boolean;
  week_complete: boolean;
}

export interface CreateYogaCourseInput {
  title: string;
  description?: string;
  element_tags: string[];
  difficulty_level: number;
  intro_video_url?: string;
  intro_video_source?: YogaVideoSource;
  thumbnail_url?: string;
  teacher_name?: string;
  total_weeks?: number;
}

export interface UpdateYogaCourseInput {
  title?: string;
  description?: string;
  element_tags?: string[];
  difficulty_level?: number;
  intro_video_url?: string;
  intro_video_source?: YogaVideoSource;
  thumbnail_url?: string;
  teacher_name?: string;
  total_weeks?: number;
}

export interface CreateYogaVideoInput {
  title: string;
  description?: string;
  video_url: string;
  video_source: YogaVideoSource;
  week_number: number;
  session_number: number;
  duration_seconds?: number;
}

export interface UpdateYogaVideoInput {
  title?: string;
  description?: string;
  video_url?: string;
  video_source?: YogaVideoSource;
  week_number?: number;
  session_number?: number;
  duration_seconds?: number;
}

export interface CreateFeedbackQuestionInput {
  question_text: string;
  question_type: "emoji_scale" | "yes_no" | "text" | "multiple_choice";
  options?: string[];
  is_required?: boolean;
  sort_order?: number;
}

export interface CreateLiveSessionInput {
  title: string;
  scheduled_at: string;
  duration_minutes?: number;
  meeting_url: string;
}

import type {
  YogaProfile,
  CreateYogaProfileInput,
  UpdateYogaProfileInput,
  YogaCourse,
  YogaCourseDetail,
  YogaEnrollment,
  YogaCourseProgress,
  VideoCompletionResult,
  FeedbackQuestion,
  FeedbackResponse,
  FeedbackAnswer,
  YogaLiveSession,
} from "@/types/yoga";
import { fetchWithAuth, API_URL } from "@/lib/api/fetch";

export async function getYogaProfile(
  token: string
): Promise<{ data: YogaProfile }> {
  return fetchWithAuth(`${API_URL}/api/yoga/profile`, token);
}

export async function createYogaProfile(
  token: string,
  input: CreateYogaProfileInput
): Promise<{ data: YogaProfile }> {
  return fetchWithAuth(`${API_URL}/api/yoga/profile`, token, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateYogaProfile(
  token: string,
  input: UpdateYogaProfileInput
): Promise<{ data: YogaProfile }> {
  return fetchWithAuth(`${API_URL}/api/yoga/profile`, token, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function getRecommendedCourses(
  token: string
): Promise<{ data: YogaCourse[] }> {
  return fetchWithAuth(`${API_URL}/api/yoga/recommendations`, token);
}

export async function listYogaCourses(
  token: string,
  params?: {
    element_tag?: string;
    difficulty_min?: number;
    difficulty_max?: number;
    page?: number;
    per_page?: number;
  }
): Promise<{ data: YogaCourse[]; total: number }> {
  const searchParams = new URLSearchParams();
  if (params?.element_tag) searchParams.set("element_tag", params.element_tag);
  if (params?.difficulty_min != null)
    searchParams.set("difficulty_min", String(params.difficulty_min));
  if (params?.difficulty_max != null)
    searchParams.set("difficulty_max", String(params.difficulty_max));
  if (params?.page != null) searchParams.set("page", String(params.page));
  if (params?.per_page != null)
    searchParams.set("per_page", String(params.per_page));

  const qs = searchParams.toString();
  const url = `${API_URL}/api/yoga/courses${qs ? `?${qs}` : ""}`;
  return fetchWithAuth(url, token);
}

export async function getYogaCourseDetail(
  token: string,
  courseId: string
): Promise<{ data: YogaCourseDetail }> {
  return fetchWithAuth(`${API_URL}/api/yoga/courses/${courseId}`, token);
}

export async function enrollInYogaCourse(
  token: string,
  courseId: string
): Promise<{ data: YogaEnrollment }> {
  return fetchWithAuth(`${API_URL}/api/yoga/courses/${courseId}/enroll`, token, {
    method: "POST",
  });
}

export async function listYogaEnrollments(
  token: string
): Promise<{ data: YogaEnrollment[] }> {
  return fetchWithAuth(`${API_URL}/api/yoga/enrollments`, token);
}

export async function getYogaCourseProgress(
  token: string,
  courseId: string
): Promise<{ data: YogaCourseProgress }> {
  return fetchWithAuth(
    `${API_URL}/api/yoga/courses/${courseId}/progress`,
    token
  );
}

export async function completeYogaVideo(
  token: string,
  courseId: string,
  videoId: string
): Promise<{ data: VideoCompletionResult }> {
  return fetchWithAuth(
    `${API_URL}/api/yoga/courses/${courseId}/videos/${videoId}/complete`,
    token,
    { method: "POST" }
  );
}

export async function getYogaFeedbackForm(
  token: string,
  courseId: string,
  week: number
): Promise<{
  data: {
    questions: FeedbackQuestion[];
    existing_response: FeedbackResponse | null;
  };
}> {
  return fetchWithAuth(
    `${API_URL}/api/yoga/courses/${courseId}/feedback/${week}`,
    token
  );
}

export async function submitYogaFeedback(
  token: string,
  courseId: string,
  week: number,
  responses: FeedbackAnswer[]
): Promise<{ data: FeedbackResponse }> {
  return fetchWithAuth(
    `${API_URL}/api/yoga/courses/${courseId}/feedback/${week}`,
    token,
    {
      method: "POST",
      body: JSON.stringify({ responses }),
    }
  );
}

export async function listYogaLiveSessions(
  token: string,
  courseId: string
): Promise<{ data: YogaLiveSession[] }> {
  return fetchWithAuth(
    `${API_URL}/api/yoga/courses/${courseId}/live-sessions`,
    token
  );
}

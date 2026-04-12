import type {
  CourseWithEnrollment,
  CourseWithPages,
  CoursePage,
  CourseProgress,
  Enrollment,
  IntrospectionResponse,
  Course,
} from "@/types/course";
import { fetchWithAuth, API_URL } from "@/lib/api/fetch";

// --- Public (unauthenticated) ---

export async function listPublicCourses(): Promise<{ data: Course[]; total: number }> {
  const res = await fetch(`${API_URL}/public/courses`);
  if (!res.ok) {
    throw new Error("Failed to fetch courses");
  }
  return res.json();
}

// --- Courses ---

export async function listCourses(
  token: string
): Promise<{ data: CourseWithEnrollment[]; total: number }> {
  return fetchWithAuth(`${API_URL}/api/courses`, token);
}

export async function getCourseDetail(
  token: string,
  courseId: string
): Promise<{ data: CourseWithPages & { enrollment?: Enrollment | null } }> {
  return fetchWithAuth(`${API_URL}/api/courses/${courseId}`, token);
}

// --- Enrollment ---

export async function enrollInCourse(
  token: string,
  courseId: string
): Promise<{ data: Enrollment }> {
  return fetchWithAuth(`${API_URL}/api/courses/${courseId}/enroll`, token, {
    method: "POST",
  });
}

// --- Progress ---

export async function getCourseProgress(
  token: string,
  courseId: string
): Promise<{ data: CourseProgress }> {
  return fetchWithAuth(
    `${API_URL}/api/courses/${courseId}/progress`,
    token
  );
}

// --- Page Content ---

export interface PageContentResponse {
  page: CoursePage;
  completion: { id: string; completed_at: string } | null;
  video_progress: { progress_percent: number; last_position: number } | null;
  introspection_response: IntrospectionResponse | null;
}

export async function getPageContent(
  token: string,
  courseId: string,
  pageId: string
): Promise<{ data: PageContentResponse }> {
  return fetchWithAuth(
    `${API_URL}/api/courses/${courseId}/pages/${pageId}`,
    token
  );
}

// --- Completion ---

export async function completePage(
  token: string,
  courseId: string,
  pageId: string
): Promise<void> {
  await fetchWithAuth(
    `${API_URL}/api/courses/${courseId}/pages/${pageId}/complete`,
    token,
    { method: "POST" }
  );
}

// --- Introspection ---

export async function submitIntrospection(
  token: string,
  courseId: string,
  pageId: string,
  responseText: string
): Promise<{ data: IntrospectionResponse }> {
  return fetchWithAuth(
    `${API_URL}/api/courses/${courseId}/pages/${pageId}/introspection`,
    token,
    {
      method: "POST",
      body: JSON.stringify({ response_text: responseText }),
    }
  );
}

export async function saveDraftIntrospection(
  token: string,
  courseId: string,
  pageId: string,
  responseText: string
): Promise<void> {
  await fetchWithAuth(
    `${API_URL}/api/courses/${courseId}/pages/${pageId}/introspection/draft`,
    token,
    {
      method: "PUT",
      body: JSON.stringify({ response_text: responseText }),
    }
  );
}

// --- Video Progress ---

export async function updateVideoProgress(
  token: string,
  courseId: string,
  pageId: string,
  progressPercent: number,
  lastPosition: number
): Promise<void> {
  await fetchWithAuth(
    `${API_URL}/api/courses/${courseId}/pages/${pageId}/video-progress`,
    token,
    {
      method: "PUT",
      body: JSON.stringify({
        progress_percent: progressPercent,
        last_position: lastPosition,
      }),
    }
  );
}

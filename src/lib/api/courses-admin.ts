import type {
  AdminCourseListItem,
  CourseWithPages,
  Course,
  CoursePage,
  AdminIntrospectionResponse,
} from "@/types/course";
import type {
  CreateCourseInput,
  UpdateCourseInput,
  CreatePageInput,
} from "@/types/course-schemas";
import { fetchWithAuth, API_URL } from "@/lib/api/fetch";

// --- Course CRUD ---

export async function createCourse(
  token: string,
  data: CreateCourseInput
): Promise<{ data: Course }> {
  return fetchWithAuth(`${API_URL}/api/admin/courses`, token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function listAdminCourses(
  token: string
): Promise<{ data: AdminCourseListItem[]; total: number }> {
  return fetchWithAuth(`${API_URL}/api/admin/courses`, token);
}

export async function getAdminCourse(
  token: string,
  courseId: string
): Promise<{ data: CourseWithPages }> {
  return fetchWithAuth(`${API_URL}/api/admin/courses/${courseId}`, token);
}

export async function updateCourse(
  token: string,
  courseId: string,
  data: UpdateCourseInput
): Promise<{ data: Course }> {
  return fetchWithAuth(`${API_URL}/api/admin/courses/${courseId}`, token, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function publishCourse(
  token: string,
  courseId: string
): Promise<{ data: Course }> {
  return fetchWithAuth(
    `${API_URL}/api/admin/courses/${courseId}/publish`,
    token,
    { method: "PATCH" }
  );
}

export async function unpublishCourse(
  token: string,
  courseId: string
): Promise<{ data: Course }> {
  return fetchWithAuth(
    `${API_URL}/api/admin/courses/${courseId}/unpublish`,
    token,
    { method: "PATCH" }
  );
}

export async function setEndDate(
  token: string,
  courseId: string,
  endDate: string
): Promise<{ data: Course }> {
  return fetchWithAuth(
    `${API_URL}/api/admin/courses/${courseId}/end-date`,
    token,
    {
      method: "PATCH",
      body: JSON.stringify({ end_date: endDate }),
    }
  );
}

export async function removeEndDate(
  token: string,
  courseId: string
): Promise<{ data: Course }> {
  return fetchWithAuth(
    `${API_URL}/api/admin/courses/${courseId}/end-date`,
    token,
    {
      method: "PATCH",
      body: JSON.stringify({ end_date: null }),
    }
  );
}

// --- Page CRUD ---

export async function addPage(
  token: string,
  courseId: string,
  data: CreatePageInput
): Promise<{ data: CoursePage }> {
  return fetchWithAuth(
    `${API_URL}/api/admin/courses/${courseId}/pages`,
    token,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export async function updatePage(
  token: string,
  courseId: string,
  pageId: string,
  data: Partial<CreatePageInput>
): Promise<{ data: CoursePage }> {
  return fetchWithAuth(
    `${API_URL}/api/admin/courses/${courseId}/pages/${pageId}`,
    token,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

export async function deletePage(
  token: string,
  courseId: string,
  pageId: string
): Promise<void> {
  await fetchWithAuth(
    `${API_URL}/api/admin/courses/${courseId}/pages/${pageId}`,
    token,
    { method: "DELETE" }
  );
}

export async function reorderPages(
  token: string,
  courseId: string,
  pageIds: string[]
): Promise<void> {
  await fetchWithAuth(
    `${API_URL}/api/admin/courses/${courseId}/pages/reorder`,
    token,
    {
      method: "PUT",
      body: JSON.stringify({ page_ids: pageIds }),
    }
  );
}

// --- Responses ---

export async function getIntrospectionResponses(
  token: string,
  courseId: string
): Promise<{ data: AdminIntrospectionResponse[]; total: number }> {
  return fetchWithAuth(
    `${API_URL}/api/admin/courses/${courseId}/responses`,
    token
  );
}


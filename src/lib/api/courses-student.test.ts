import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  listCourses,
  getCourseDetail,
  enrollInCourse,
  getCourseProgress,
  getPageContent,
  completePage,
  submitIntrospection,
  saveDraftIntrospection,
  updateVideoProgress,
} from "./courses-student";

const MOCK_TOKEN = "test-token";

describe("courses-student API", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ data: {} }),
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("listCourses calls GET /api/courses", async () => {
    await listCourses(MOCK_TOKEN);

    const [url, opts] = fetchSpy.mock.calls[0];
    expect(url).toContain("/api/courses");
    expect(opts?.headers).toHaveProperty(
      "Authorization",
      `Bearer ${MOCK_TOKEN}`
    );
  });

  it("getCourseDetail calls GET /api/courses/:courseId", async () => {
    await getCourseDetail(MOCK_TOKEN, "c1");

    const [url] = fetchSpy.mock.calls[0];
    expect(url).toContain("/api/courses/c1");
  });

  it("enrollInCourse calls POST /api/courses/:courseId/enroll", async () => {
    await enrollInCourse(MOCK_TOKEN, "c1");

    const [url, opts] = fetchSpy.mock.calls[0];
    expect(url).toContain("/api/courses/c1/enroll");
    expect(opts?.method).toBe("POST");
  });

  it("getCourseProgress calls GET /api/courses/:courseId/progress", async () => {
    await getCourseProgress(MOCK_TOKEN, "c1");

    const [url] = fetchSpy.mock.calls[0];
    expect(url).toContain("/api/courses/c1/progress");
  });

  it("getPageContent calls GET /api/courses/:courseId/pages/:pageId", async () => {
    await getPageContent(MOCK_TOKEN, "c1", "p1");

    const [url] = fetchSpy.mock.calls[0];
    expect(url).toContain("/api/courses/c1/pages/p1");
  });

  it("completePage calls POST /api/courses/:courseId/pages/:pageId/complete", async () => {
    await completePage(MOCK_TOKEN, "c1", "p1");

    const [url, opts] = fetchSpy.mock.calls[0];
    expect(url).toContain("/api/courses/c1/pages/p1/complete");
    expect(opts?.method).toBe("POST");
  });

  it("submitIntrospection calls POST with response_text", async () => {
    await submitIntrospection(MOCK_TOKEN, "c1", "p1", "My reflection");

    const [url, opts] = fetchSpy.mock.calls[0];
    expect(url).toContain("/api/courses/c1/pages/p1/introspection");
    expect(opts?.method).toBe("POST");
    expect(JSON.parse(opts?.body as string)).toEqual({
      response_text: "My reflection",
    });
  });

  it("saveDraftIntrospection calls PUT /api/courses/:courseId/pages/:pageId/introspection/draft", async () => {
    await saveDraftIntrospection(MOCK_TOKEN, "c1", "p1", "Draft text");

    const [url, opts] = fetchSpy.mock.calls[0];
    expect(url).toContain(
      "/api/courses/c1/pages/p1/introspection/draft"
    );
    expect(opts?.method).toBe("PUT");
    expect(JSON.parse(opts?.body as string)).toEqual({
      response_text: "Draft text",
    });
  });

  it("updateVideoProgress calls PUT with progress data", async () => {
    await updateVideoProgress(MOCK_TOKEN, "c1", "p1", 75, 300);

    const [url, opts] = fetchSpy.mock.calls[0];
    expect(url).toContain(
      "/api/courses/c1/pages/p1/video-progress"
    );
    expect(opts?.method).toBe("PUT");
    expect(JSON.parse(opts?.body as string)).toEqual({
      progress_percent: 75,
      last_position: 300,
    });
  });

  it("all API calls include Authorization header", async () => {
    await listCourses(MOCK_TOKEN);
    await getCourseDetail(MOCK_TOKEN, "c1");

    for (const call of fetchSpy.mock.calls) {
      expect(call[1]?.headers).toHaveProperty(
        "Authorization",
        `Bearer ${MOCK_TOKEN}`
      );
    }
  });

  it("all API calls include Content-Type header", async () => {
    await listCourses(MOCK_TOKEN);

    const [, opts] = fetchSpy.mock.calls[0];
    expect(opts?.headers).toHaveProperty(
      "Content-Type",
      "application/json"
    );
  });

  it("throws error on non-OK response", async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ error: { message: "Forbidden" } }),
    } as Response);

    await expect(listCourses(MOCK_TOKEN)).rejects.toThrow("Forbidden");
  });

  it("throws generic error when no error message in body", async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => null,
    } as Response);

    await expect(listCourses(MOCK_TOKEN)).rejects.toThrow(
      "Something went wrong. Please try again later."
    );
  });

  it("parses JSON response correctly", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [{ id: "c1", title: "Course 1" }],
        total: 1,
      }),
    } as Response);

    const result = await listCourses(MOCK_TOKEN);
    expect(result).toEqual({
      data: [{ id: "c1", title: "Course 1" }],
      total: 1,
    });
  });
});

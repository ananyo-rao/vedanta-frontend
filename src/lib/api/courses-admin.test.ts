import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createCourse,
  listAdminCourses,
  getAdminCourse,
  updateCourse,
  publishCourse,
  unpublishCourse,
  setEndDate,
  removeEndDate,
  addPage,
  updatePage,
  deletePage,
  reorderPages,
  getIntrospectionResponses,
} from "./courses-admin";

const MOCK_TOKEN = "test-token";

describe("courses-admin API", () => {
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

  it("createCourse calls POST /api/admin/courses with body", async () => {
    const data = { title: "Test", description: "Desc" };
    await createCourse(MOCK_TOKEN, data);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, opts] = fetchSpy.mock.calls[0];
    expect(url).toContain("/api/admin/courses");
    expect(opts?.method).toBe("POST");
    expect(opts?.headers).toHaveProperty("Authorization", `Bearer ${MOCK_TOKEN}`);
    expect(JSON.parse(opts?.body as string)).toEqual(data);
  });

  it("listAdminCourses calls GET /api/admin/courses", async () => {
    await listAdminCourses(MOCK_TOKEN);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, opts] = fetchSpy.mock.calls[0];
    expect(url).toContain("/api/admin/courses");
    expect(opts?.method).toBeUndefined(); // GET by default
    expect(opts?.headers).toHaveProperty("Authorization", `Bearer ${MOCK_TOKEN}`);
  });

  it("getAdminCourse calls GET /api/admin/courses/:courseId", async () => {
    await getAdminCourse(MOCK_TOKEN, "c1");

    const [url] = fetchSpy.mock.calls[0];
    expect(url).toContain("/api/admin/courses/c1");
  });

  it("updateCourse calls PUT /api/admin/courses/:courseId", async () => {
    await updateCourse(MOCK_TOKEN, "c1", { title: "Updated" });

    const [url, opts] = fetchSpy.mock.calls[0];
    expect(url).toContain("/api/admin/courses/c1");
    expect(opts?.method).toBe("PUT");
    expect(JSON.parse(opts?.body as string)).toEqual({ title: "Updated" });
  });

  it("publishCourse calls PATCH /api/admin/courses/:courseId/publish", async () => {
    await publishCourse(MOCK_TOKEN, "c1");

    const [url, opts] = fetchSpy.mock.calls[0];
    expect(url).toContain("/api/admin/courses/c1/publish");
    expect(opts?.method).toBe("PATCH");
  });

  it("unpublishCourse calls PATCH /api/admin/courses/:courseId/unpublish", async () => {
    await unpublishCourse(MOCK_TOKEN, "c1");

    const [url, opts] = fetchSpy.mock.calls[0];
    expect(url).toContain("/api/admin/courses/c1/unpublish");
    expect(opts?.method).toBe("PATCH");
  });

  it("setEndDate calls PATCH /api/admin/courses/:courseId/end-date with end_date", async () => {
    await setEndDate(MOCK_TOKEN, "c1", "2026-12-31");

    const [url, opts] = fetchSpy.mock.calls[0];
    expect(url).toContain("/api/admin/courses/c1/end-date");
    expect(opts?.method).toBe("PATCH");
    expect(JSON.parse(opts?.body as string)).toEqual({
      end_date: "2026-12-31",
    });
  });

  it("removeEndDate calls PATCH /api/admin/courses/:courseId/end-date with null", async () => {
    await removeEndDate(MOCK_TOKEN, "c1");

    const [url, opts] = fetchSpy.mock.calls[0];
    expect(url).toContain("/api/admin/courses/c1/end-date");
    expect(JSON.parse(opts?.body as string)).toEqual({ end_date: null });
  });

  it("addPage calls POST /api/admin/courses/:courseId/pages", async () => {
    const pageData = {
      title: "Video 1",
      page_type: "video" as const,
      is_strict: true,
      content: {
        video_url: "https://example.com/v.mp4",
        video_source: "gcs" as const,
        summary: "summary",
      },
    };
    await addPage(MOCK_TOKEN, "c1", pageData);

    const [url, opts] = fetchSpy.mock.calls[0];
    expect(url).toContain("/api/admin/courses/c1/pages");
    expect(opts?.method).toBe("POST");
  });

  it("updatePage calls PUT /api/admin/courses/:courseId/pages/:pageId", async () => {
    await updatePage(MOCK_TOKEN, "c1", "p1", { title: "Updated Page" });

    const [url, opts] = fetchSpy.mock.calls[0];
    expect(url).toContain("/api/admin/courses/c1/pages/p1");
    expect(opts?.method).toBe("PUT");
  });

  it("deletePage calls DELETE /api/admin/courses/:courseId/pages/:pageId", async () => {
    await deletePage(MOCK_TOKEN, "c1", "p1");

    const [url, opts] = fetchSpy.mock.calls[0];
    expect(url).toContain("/api/admin/courses/c1/pages/p1");
    expect(opts?.method).toBe("DELETE");
  });

  it("reorderPages calls PUT /api/admin/courses/:courseId/pages/reorder", async () => {
    await reorderPages(MOCK_TOKEN, "c1", ["p2", "p1", "p3"]);

    const [url, opts] = fetchSpy.mock.calls[0];
    expect(url).toContain("/api/admin/courses/c1/pages/reorder");
    expect(opts?.method).toBe("PUT");
    expect(JSON.parse(opts?.body as string)).toEqual({
      page_ids: ["p2", "p1", "p3"],
    });
  });

  it("getIntrospectionResponses calls GET /api/admin/courses/:courseId/responses", async () => {
    await getIntrospectionResponses(MOCK_TOKEN, "c1");

    const [url] = fetchSpy.mock.calls[0];
    expect(url).toContain("/api/admin/courses/c1/responses");
  });

  it("throws error on non-OK response", async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { message: "Bad request" } }),
    } as Response);

    await expect(listAdminCourses(MOCK_TOKEN)).rejects.toThrow(
      "Bad request"
    );
  });

  it("throws generic error when error body has no message", async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as Response);

    await expect(listAdminCourses(MOCK_TOKEN)).rejects.toThrow(
      "Something went wrong. Please try again later."
    );
  });

  it("passes Content-Type: application/json header", async () => {
    await listAdminCourses(MOCK_TOKEN);

    const [, opts] = fetchSpy.mock.calls[0];
    expect(opts?.headers).toHaveProperty("Content-Type", "application/json");
  });
});

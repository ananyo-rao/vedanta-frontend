import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "@/test/test-utils";

// =============================================================================
// Regression Tests — Bug 2: React Query hooks didn't wait for Clerk auth
// =============================================================================
// Root cause: useToken() called getToken() before Clerk's isLoaded was true,
// causing null tokens and infinite retries ("Loading course..." stuck forever).

let mockIsLoaded = false;
let mockIsSignedIn: boolean | undefined = undefined;
const mockGetToken = vi.fn();

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({
    isLoaded: mockIsLoaded,
    isSignedIn: mockIsSignedIn,
    getToken: mockGetToken,
  }),
}));

const mockListCourses = vi.fn();
const mockGetCourseProgress = vi.fn();

vi.mock("@/lib/api/courses-student", () => ({
  listCourses: (...args: unknown[]) => mockListCourses(...args),
  getCourseDetail: vi.fn(),
  getCourseProgress: (...args: unknown[]) => mockGetCourseProgress(...args),
  getPageContent: vi.fn(),
  enrollInCourse: vi.fn(),
  completePage: vi.fn(),
  submitIntrospection: vi.fn(),
  saveDraftIntrospection: vi.fn(),
  updateVideoProgress: vi.fn(),
}));

// Import after mocks
import { useStudentCourses, useCourseProgress } from "./use-courses";

describe("Regression: Bug 2 — Hooks wait for Clerk auth to initialize", () => {
  beforeEach(() => {
    mockIsLoaded = false;
    mockIsSignedIn = undefined;
    mockGetToken.mockReset();
    mockListCourses.mockReset();
    mockGetCourseProgress.mockReset();
  });

  describe("useStudentCourses", () => {
    it("does NOT fetch when isLoaded is false", async () => {
      mockIsLoaded = false;
      mockIsSignedIn = undefined;

      const { result } = renderHook(() => useStudentCourses(), {
        wrapper: createWrapper(),
      });

      // Query should not be fetching — it's disabled
      expect(result.current.isFetching).toBe(false);
      expect(mockGetToken).not.toHaveBeenCalled();
      expect(mockListCourses).not.toHaveBeenCalled();
    });

    it("does NOT fetch when isLoaded is true but isSignedIn is false", async () => {
      mockIsLoaded = true;
      mockIsSignedIn = false;

      const { result } = renderHook(() => useStudentCourses(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isFetching).toBe(false);
      expect(mockGetToken).not.toHaveBeenCalled();
    });

    it("DOES fetch when isLoaded=true and isSignedIn=true", async () => {
      mockIsLoaded = true;
      mockIsSignedIn = true;
      mockGetToken.mockResolvedValue("test-token-123");
      mockListCourses.mockResolvedValue({ data: [], total: 0 });

      const { result } = renderHook(() => useStudentCourses(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockGetToken).toHaveBeenCalled();
      expect(mockListCourses).toHaveBeenCalledWith("test-token-123");
    });
  });

  describe("useCourseProgress", () => {
    it("does NOT fetch when auth is not ready", async () => {
      mockIsLoaded = false;
      mockIsSignedIn = undefined;

      const { result } = renderHook(() => useCourseProgress("course-1"), {
        wrapper: createWrapper(),
      });

      expect(result.current.isFetching).toBe(false);
      expect(mockGetToken).not.toHaveBeenCalled();
      expect(mockGetCourseProgress).not.toHaveBeenCalled();
    });

    it("DOES fetch when auth is ready", async () => {
      mockIsLoaded = true;
      mockIsSignedIn = true;
      mockGetToken.mockResolvedValue("test-token-456");
      mockGetCourseProgress.mockResolvedValue({
        data: {
          total_pages: 3,
          completed_pages: 1,
          progress_percent: 33,
          page_statuses: [],
        },
      });

      const { result } = renderHook(() => useCourseProgress("course-1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockGetToken).toHaveBeenCalled();
      expect(mockGetCourseProgress).toHaveBeenCalledWith(
        "test-token-456",
        "course-1"
      );
    });
  });
});

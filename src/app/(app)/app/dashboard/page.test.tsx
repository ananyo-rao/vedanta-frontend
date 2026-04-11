import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import DashboardPage from "./page";
import type { CourseWithEnrollment } from "@/types/course";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

/**
 * Mock the data-fetching hook entirely.
 * We test the page's rendering decisions (loading / error / empty / data),
 * not the hook's internals (those are tested in use-courses.test.ts).
 */
vi.mock("@/hooks/use-courses", () => ({
  useStudentCourses: vi.fn(),
}));

import { useStudentCourses } from "@/hooks/use-courses";
const mockUseStudentCourses = vi.mocked(useStudentCourses);

// ---------------------------------------------------------------------------
// Fixture factory
// ---------------------------------------------------------------------------

let idCounter = 0;
const makeCourse = (
  overrides: Partial<CourseWithEnrollment> = {}
): CourseWithEnrollment => ({
  id: `course-${++idCounter}`,
  title: `API Course ${idCounter}`,
  description: `Description ${idCounter}.`,
  course_type: "Foundation",
  thumbnail_url: null,
  intro_video_url: null,
  intro_video_source: null,
  teacher_name: null,
  status: "published",
  display_order: idCounter,
  end_date: null,
  created_by: "admin-1",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  ...overrides,
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type HookReturnShape = {
  data: CourseWithEnrollment[] | undefined;
  isLoading: boolean;
  error: Error | null;
};

function mockHook(shape: Partial<HookReturnShape>) {
  mockUseStudentCourses.mockReturnValue({
    data: undefined,
    isLoading: false,
    error: null,
    ...shape,
    // Cast to the full UseQueryResult shape — the page only destructures
    // data / isLoading / error so extra fields don't matter here.
  } as ReturnType<typeof useStudentCourses>);
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("DashboardPage", () => {
  // ── Page structure ─────────────────────────────────────────────────────────

  it("renders the 'Courses' page heading", () => {
    mockHook({ isLoading: true });
    render(<DashboardPage />);
    expect(
      screen.getByRole("heading", { name: /^courses$/i })
    ).toBeInTheDocument();
  });

  it("renders the subtitle text", () => {
    mockHook({ isLoading: true });
    render(<DashboardPage />);
    expect(
      screen.getByText(/browse your available courses/i)
    ).toBeInTheDocument();
  });

  // ── Loading state ──────────────────────────────────────────────────────────

  describe("loading state", () => {
    it("shows 'Loading courses...' while fetching", () => {
      mockHook({ isLoading: true });
      render(<DashboardPage />);
      expect(screen.getByText(/loading courses/i)).toBeInTheDocument();
    });

    it("does NOT show course cards while loading", () => {
      mockHook({ isLoading: true });
      render(<DashboardPage />);
      expect(screen.queryByRole("article")).not.toBeInTheDocument();
    });

    it("does NOT show the empty state while loading", () => {
      mockHook({ isLoading: true });
      render(<DashboardPage />);
      expect(
        screen.queryByText(/no courses available yet/i)
      ).not.toBeInTheDocument();
    });
  });

  // ── Error state ────────────────────────────────────────────────────────────

  describe("error state", () => {
    it("shows the error message from the thrown Error object", () => {
      mockHook({ error: new Error("Unauthorized — please log in again") });
      render(<DashboardPage />);
      expect(
        screen.getByText(/unauthorized — please log in again/i)
      ).toBeInTheDocument();
    });

    it("renders the error container even when the message is an empty string", () => {
      // DashboardPage renders `error.message` directly; when empty the container
      // is still shown (correct) but the paragraph is empty — not a UX bug we
      // need to guard against here.
      const emptyError = new Error();
      emptyError.message = "";
      mockHook({ error: emptyError });
      const { container } = render(<DashboardPage />);
      expect(
        container.querySelector(".bg-error-container")
      ).toBeInTheDocument();
    });

    it("does NOT show course cards on error", () => {
      mockHook({ error: new Error("Server error") });
      render(<DashboardPage />);
      expect(screen.queryByRole("article")).not.toBeInTheDocument();
    });

    it("does NOT show the empty state on error", () => {
      mockHook({ error: new Error("Server error") });
      render(<DashboardPage />);
      expect(
        screen.queryByText(/no courses available yet/i)
      ).not.toBeInTheDocument();
    });
  });

  // ── Empty state ────────────────────────────────────────────────────────────

  describe("empty state", () => {
    it("shows EmptyState when the API returns an empty array", () => {
      mockHook({ data: [] });
      render(<DashboardPage />);
      expect(
        screen.getByText(/no courses available yet/i)
      ).toBeInTheDocument();
    });

    it("does NOT show course cards when data is empty", () => {
      mockHook({ data: [] });
      render(<DashboardPage />);
      expect(screen.queryByRole("article")).not.toBeInTheDocument();
    });
  });

  // ── Happy path — courses from API ──────────────────────────────────────────

  describe("when courses are returned from the API", () => {
    it("renders course titles from the API response via CourseGrid", () => {
      mockHook({
        data: [
          makeCourse({ title: "Real Course Alpha" }),
          makeCourse({ title: "Real Course Beta" }),
        ],
      });
      render(<DashboardPage />);
      expect(screen.getByText("Real Course Alpha")).toBeInTheDocument();
      expect(screen.getByText("Real Course Beta")).toBeInTheDocument();
    });

    it("renders one article card per course", () => {
      mockHook({
        data: [makeCourse(), makeCourse(), makeCourse()],
      });
      render(<DashboardPage />);
      expect(screen.getAllByRole("article")).toHaveLength(3);
    });

    it("passes the full API payload to CourseGrid — no courses dropped", () => {
      const courses = [
        makeCourse({ title: "Injected Course X" }),
        makeCourse({ title: "Injected Course Y" }),
        makeCourse({ title: "Injected Course Z" }),
      ];
      mockHook({ data: courses });
      render(<DashboardPage />);
      expect(screen.getByText("Injected Course X")).toBeInTheDocument();
      expect(screen.getByText("Injected Course Y")).toBeInTheDocument();
      expect(screen.getByText("Injected Course Z")).toBeInTheDocument();
    });

    it("does NOT show the loading state when data is present", () => {
      mockHook({ data: [makeCourse()] });
      render(<DashboardPage />);
      expect(screen.queryByText(/loading courses/i)).not.toBeInTheDocument();
    });

    it("does NOT show the empty state when data is present", () => {
      mockHook({ data: [makeCourse()] });
      render(<DashboardPage />);
      expect(
        screen.queryByText(/no courses available yet/i)
      ).not.toBeInTheDocument();
    });
  });

  // ── Hardcoded content guard ────────────────────────────────────────────────

  /**
   * The dashboard page must never render hardcoded course CARDS.
   * All course content must flow from the useStudentCourses() API hook.
   *
   * We scope checks to course-card headings (h4 inside article elements)
   * so that incidental mentions in EmptyState copy don't false-positive.
   */
  describe("hardcoded course content guard", () => {
    /** Returns all h3 text inside article (CourseCard) elements. */
    function getCourseCardHeadings(container: HTMLElement) {
      return Array.from(container.querySelectorAll("article h3")).map(
        (el) => el.textContent?.toLowerCase() ?? ""
      );
    }

    it("no course card heading contains 'Bhagavad Gita' when hook returns empty", () => {
      mockHook({ data: [] });
      const { container } = render(<DashboardPage />);
      const headings = getCourseCardHeadings(container);
      expect(headings.some((h) => h.includes("bhagavad gita"))).toBe(false);
    });

    it("no course card heading contains 'Karma Yoga' when hook returns empty", () => {
      mockHook({ data: [] });
      const { container } = render(<DashboardPage />);
      const headings = getCourseCardHeadings(container);
      expect(headings.some((h) => h.includes("karma yoga"))).toBe(false);
    });

    it("no course card heading contains 'Introduction to Advaita' when hook returns empty", () => {
      mockHook({ data: [] });
      const { container } = render(<DashboardPage />);
      const headings = getCourseCardHeadings(container);
      expect(headings.some((h) => h.includes("introduction to advaita"))).toBe(
        false
      );
    });

    it("no course card heading contains 'Meditation & Upasana' when hook returns empty", () => {
      mockHook({ data: [] });
      const { container } = render(<DashboardPage />);
      const headings = getCourseCardHeadings(container);
      expect(headings.some((h) => h.includes("meditation & upasana"))).toBe(
        false
      );
    });

    it("no course card heading contains 'Upanishad Study Circle' when hook returns empty", () => {
      mockHook({ data: [] });
      const { container } = render(<DashboardPage />);
      const headings = getCourseCardHeadings(container);
      expect(headings.some((h) => h.includes("upanishad study circle"))).toBe(
        false
      );
    });

    it("course cards contain only the titles returned by the hook", () => {
      mockHook({
        data: [makeCourse({ title: "Hook-Supplied Course" })],
      });
      const { container } = render(<DashboardPage />);
      const headings = getCourseCardHeadings(container);
      expect(headings).toContain("hook-supplied course");
      expect(headings.some((h) => h.includes("bhagavad gita"))).toBe(false);
      expect(headings.some((h) => h.includes("karma yoga"))).toBe(false);
    });
  });
});

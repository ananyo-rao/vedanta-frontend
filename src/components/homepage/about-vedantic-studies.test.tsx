import { screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AboutVedanticStudies } from "./about-vedantic-studies";
import { renderWithProviders } from "@/test/test-utils";
import { listPublicCourses } from "@/lib/api/courses-student";
import type { Course } from "@/types/course";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock("@/hooks/use-auth-href", () => ({
  useAuthHref: vi.fn().mockReturnValue("/sign-in"),
}));

vi.mock("@/lib/api/courses-student", () => ({
  listPublicCourses: vi.fn(),
}));

const mockedListPublicCourses = vi.mocked(listPublicCourses);

// ---------------------------------------------------------------------------
// Test fixtures — titles are unique, NOT any previously-hardcoded course name
// ---------------------------------------------------------------------------

const makeApiCourse = (overrides: Partial<Course> = {}): Course => ({
  id: "test-id",
  title: "API Course Title",
  description: "API course description.",
  course_type: "Foundation",
  thumbnail_url: null,
  intro_video_url: null,
  intro_video_source: null,
  teacher_name: null,
  status: "published",
  display_order: 1,
  end_date: null,
  created_by: "admin-1",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  ...overrides,
});

const THREE_API_COURSES: Course[] = [
  makeApiCourse({ id: "c-1", title: "Vedanta Foundations", course_type: "Short Course" }),
  makeApiCourse({ id: "c-2", title: "Upanishad Study Group", course_type: "Advanced" }),
  makeApiCourse({ id: "c-3", title: "Bhakti & Surrender", course_type: "Retreat" }),
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Keeps the fetch promise pending — simulates in-flight request. */
function mockPending() {
  mockedListPublicCourses.mockImplementation(() => new Promise(() => {}));
}

afterEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("AboutVedanticStudies", () => {
  // ── Structural ─────────────────────────────────────────────────────────────

  it("always renders the 'Our Courses' section heading", () => {
    mockPending();
    renderWithProviders(<AboutVedanticStudies />);
    expect(
      screen.getByRole("heading", { name: /our courses/i })
    ).toBeInTheDocument();
  });

  it("always renders the #about-courses section anchor", () => {
    mockPending();
    const { container } = renderWithProviders(<AboutVedanticStudies />);
    expect(container.querySelector("#about-courses")).toBeInTheDocument();
  });

  // ── Loading state ───────────────────────────────────────────────────────────

  describe("loading state", () => {
    beforeEach(mockPending);

    it("renders animated skeleton placeholders while fetching", () => {
      const { container } = renderWithProviders(<AboutVedanticStudies />);
      const skeletons = container.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("does NOT render any course title headings during loading", () => {
      renderWithProviders(<AboutVedanticStudies />);
      // No h4 elements (course titles live in h4)
      expect(screen.queryAllByRole("heading", { level: 4 })).toHaveLength(0);
    });

    it("does NOT render 'View Course Details' link during loading", () => {
      renderWithProviders(<AboutVedanticStudies />);
      expect(
        screen.queryByRole("link", { name: /view course details/i })
      ).not.toBeInTheDocument();
    });

    it("does NOT render 'Enroll Now' links during loading", () => {
      renderWithProviders(<AboutVedanticStudies />);
      expect(
        screen.queryByRole("link", { name: /enroll now/i })
      ).not.toBeInTheDocument();
    });
  });

  // ── Error state ─────────────────────────────────────────────────────────────

  describe("error state", () => {
    beforeEach(() => {
      mockedListPublicCourses.mockRejectedValue(new Error("Network error"));
    });

    it("shows the error message when the API fails", async () => {
      renderWithProviders(<AboutVedanticStudies />);
      await waitFor(() => {
        expect(
          screen.getByText(/could not load courses/i)
        ).toBeInTheDocument();
      });
    });

    it("does NOT show 'View Course Details' after an API error", async () => {
      renderWithProviders(<AboutVedanticStudies />);
      await waitFor(() => {
        expect(
          screen.queryByRole("link", { name: /view course details/i })
        ).not.toBeInTheDocument();
      });
    });

    it("does NOT show 'Enroll Now' links after an API error", async () => {
      renderWithProviders(<AboutVedanticStudies />);
      await waitFor(() => {
        expect(
          screen.queryByRole("link", { name: /enroll now/i })
        ).not.toBeInTheDocument();
      });
    });
  });

  // ── Empty state ──────────────────────────────────────────────────────────────

  describe("empty state — API returns zero courses", () => {
    beforeEach(() => {
      mockedListPublicCourses.mockResolvedValue({ data: [], total: 0 });
    });

    it("shows the 'courses being prepared' message", async () => {
      renderWithProviders(<AboutVedanticStudies />);
      await waitFor(() => {
        expect(
          screen.getByText(/courses are being prepared/i)
        ).toBeInTheDocument();
      });
    });

    it("does NOT render any course cards or course titles", async () => {
      renderWithProviders(<AboutVedanticStudies />);
      await waitFor(() => {
        expect(
          screen.queryAllByRole("heading", { level: 4 })
        ).toHaveLength(0);
      });
    });

    it("shows a 'Sign In to Browse' link", async () => {
      renderWithProviders(<AboutVedanticStudies />);
      await waitFor(() => {
        expect(
          screen.getByRole("link", { name: /sign in to browse/i })
        ).toBeInTheDocument();
      });
    });
  });

  // ── Happy path — courses from API ───────────────────────────────────────────

  describe("when API returns courses", () => {
    beforeEach(() => {
      mockedListPublicCourses.mockResolvedValue({
        data: THREE_API_COURSES,
        total: THREE_API_COURSES.length,
      });
    });

    it("renders the featured (first) course title from the API", async () => {
      renderWithProviders(<AboutVedanticStudies />);
      await waitFor(() => {
        expect(screen.getByText("Vedanta Foundations")).toBeInTheDocument();
      });
    });

    it("renders secondary course titles from the API", async () => {
      renderWithProviders(<AboutVedanticStudies />);
      await waitFor(() => {
        expect(screen.getByText("Upanishad Study Group")).toBeInTheDocument();
      });
    });

    it("renders the 4th course in the bottom card slot", async () => {
      const fourCourses = [
        ...THREE_API_COURSES,
        makeApiCourse({ id: "c-4", title: "Neti Neti Practice" }),
      ];
      mockedListPublicCourses.mockResolvedValue({
        data: fourCourses,
        total: fourCourses.length,
      });

      renderWithProviders(<AboutVedanticStudies />);
      await waitFor(() => {
        expect(screen.getByText("Neti Neti Practice")).toBeInTheDocument();
      });
    });

    it("renders course_type badge from the API response", async () => {
      renderWithProviders(<AboutVedanticStudies />);
      await waitFor(() => {
        expect(screen.getByText("Short Course")).toBeInTheDocument();
      });
    });

    it("shows 'View Course Details' link once courses load", async () => {
      renderWithProviders(<AboutVedanticStudies />);
      await waitFor(() => {
        expect(
          screen.getByRole("link", { name: /view course details/i })
        ).toBeInTheDocument();
      });
    });

    it("shows 'Browse All Courses' link once courses load", async () => {
      renderWithProviders(<AboutVedanticStudies />);
      await waitFor(() => {
        expect(
          screen.getByRole("link", { name: /browse all courses/i })
        ).toBeInTheDocument();
      });
    });

    it("shows 'Enroll Now' links for secondary courses", async () => {
      renderWithProviders(<AboutVedanticStudies />);
      await waitFor(() => {
        const enrollLinks = screen.getAllByRole("link", {
          name: /enroll now/i,
        });
        expect(enrollLinks.length).toBeGreaterThanOrEqual(1);
      });
    });

    it("renders exactly the first course as the featured card", async () => {
      renderWithProviders(<AboutVedanticStudies />);
      await waitFor(() => {
        // First course is featured — its title appears as a large heading
        const headings = screen.getAllByRole("heading", { level: 4 });
        const titles = headings.map((h) => h.textContent);
        expect(titles).toContain("Vedanta Foundations");
      });
    });
  });

  // ── Auth-aware links ─────────────────────────────────────────────────────────

  describe("auth-aware navigation links", () => {
    it("uses the href returned by useAuthHref for all CTA links", async () => {
      const { useAuthHref } = await import("@/hooks/use-auth-href");
      vi.mocked(useAuthHref).mockReturnValue("/app/dashboard");

      mockedListPublicCourses.mockResolvedValue({
        data: THREE_API_COURSES,
        total: THREE_API_COURSES.length,
      });

      renderWithProviders(<AboutVedanticStudies />);
      await waitFor(() => {
        const detailLink = screen.getByRole("link", {
          name: /view course details/i,
        });
        expect(detailLink).toHaveAttribute("href", "/app/dashboard");
      });
    });
  });

  // ── Anti-regression: no hardcoded course content ────────────────────────────

  describe("hardcoded course content guard", () => {
    /**
     * These test names document the exact strings that used to be hardcoded
     * in the component. If any of them appear WITHOUT an API call returning
     * them, the component has regressed to using hardcoded data.
     */

    it("never renders 'Introduction to Advaita' unless the API returns it", async () => {
      mockedListPublicCourses.mockResolvedValue({ data: [], total: 0 });
      renderWithProviders(<AboutVedanticStudies />);
      await waitFor(() => {
        expect(
          screen.queryByText(/introduction to advaita/i)
        ).not.toBeInTheDocument();
      });
    });

    it("never renders 'Karma Yoga' unless the API returns it", async () => {
      mockedListPublicCourses.mockResolvedValue({ data: [], total: 0 });
      renderWithProviders(<AboutVedanticStudies />);
      await waitFor(() => {
        expect(screen.queryByText(/karma yoga/i)).not.toBeInTheDocument();
      });
    });

    it("never renders 'The Bhagavad Gita: Yoga of Action' unless the API returns it", async () => {
      mockedListPublicCourses.mockResolvedValue({ data: [], total: 0 });
      renderWithProviders(<AboutVedanticStudies />);
      await waitFor(() => {
        expect(
          screen.queryByText(/bhagavad gita/i)
        ).not.toBeInTheDocument();
      });
    });

    it("never renders 'Meditation & Upasana' unless the API returns it", async () => {
      mockedListPublicCourses.mockResolvedValue({ data: [], total: 0 });
      renderWithProviders(<AboutVedanticStudies />);
      await waitFor(() => {
        expect(
          screen.queryByText(/meditation & upasana/i)
        ).not.toBeInTheDocument();
      });
    });

    it("shows only API-returned titles, not the old hardcoded set", async () => {
      mockedListPublicCourses.mockResolvedValue({
        data: THREE_API_COURSES,
        total: THREE_API_COURSES.length,
      });

      renderWithProviders(<AboutVedanticStudies />);

      await waitFor(() => {
        // API titles ARE present
        expect(screen.getByText("Vedanta Foundations")).toBeInTheDocument();
        expect(screen.getByText("Upanishad Study Group")).toBeInTheDocument();
      });

      // Hardcoded titles are NOT present
      expect(
        screen.queryByText(/introduction to advaita/i)
      ).not.toBeInTheDocument();
      expect(screen.queryByText(/karma yoga/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/bhagavad gita/i)).not.toBeInTheDocument();
      expect(
        screen.queryByText(/meditation & upasana/i)
      ).not.toBeInTheDocument();
    });

    it("calls the API exactly once per mount — no duplicate fetches", async () => {
      mockedListPublicCourses.mockResolvedValue({
        data: THREE_API_COURSES,
        total: THREE_API_COURSES.length,
      });

      renderWithProviders(<AboutVedanticStudies />);

      await waitFor(() => {
        expect(screen.getByText("Vedanta Foundations")).toBeInTheDocument();
      });

      expect(mockedListPublicCourses).toHaveBeenCalledTimes(1);
    });
  });
});

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CourseCard } from "./course-card";
import { type CourseWithEnrollment } from "@/types/course";

const mockCourse: CourseWithEnrollment = {
  id: "course-1",
  title: "Introduction to Vedanta",
  description: "A foundational course covering the core principles of Advaita Vedanta.",
  thumbnail_url: null,
  intro_video_url: null,
  intro_video_source: null,
  course_type: "Short Course",
  teacher_name: "Swami Satchitananda",
  status: "published",
  display_order: 1,
  end_date: null,
  created_by: "admin-1",
  created_at: "2026-01-15T00:00:00Z",
  updated_at: "2026-01-15T00:00:00Z",
};

describe("CourseCard", () => {
  it("renders course title, description, and type badge", () => {
    render(<CourseCard course={mockCourse} />);

    expect(screen.getByText("Introduction to Vedanta")).toBeInTheDocument();
    expect(screen.getByText(/foundational course/)).toBeInTheDocument();
    expect(screen.getByText("Short Course")).toBeInTheDocument();
  });

  it("renders teacher name when provided", () => {
    render(<CourseCard course={mockCourse} />);
    expect(screen.getByText("Swami Satchitananda")).toBeInTheDocument();
  });

  it("does not render teacher name when null", () => {
    const courseWithoutTeacher = { ...mockCourse, teacher_name: null };
    render(<CourseCard course={courseWithoutTeacher} />);
    expect(screen.queryByText("Swami Satchitananda")).not.toBeInTheDocument();
  });

  it("renders Om placeholder when no thumbnail", () => {
    render(<CourseCard course={mockCourse} />);
    const placeholder = screen.getByText("\u0950");
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveAttribute("aria-hidden", "true");
  });

  it("has proper article landmark", () => {
    render(<CourseCard course={mockCourse} />);
    expect(screen.getByRole("article")).toBeInTheDocument();
  });

  it("links to intro page for unenrolled courses", () => {
    render(<CourseCard course={mockCourse} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/app/courses/course-1");
  });

  it("links to course player for enrolled courses with last page", () => {
    const enrolledCourse: CourseWithEnrollment = {
      ...mockCourse,
      enrollment: {
        id: "enr-1",
        user_id: "user-1",
        course_id: "course-1",
        enrolled_at: "2026-01-15T00:00:00Z",
        last_page_id: "page-3",
        completed_at: null,
      },
      progress: {
        completed_pages: 2,
        total_pages: 5,
        progress_percent: 40,
      },
    };
    render(<CourseCard course={enrolledCourse} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute(
      "href",
      "/app/courses/course-1/pages/page-3"
    );
  });

  it("shows progress bar with correct percentage for enrolled courses", () => {
    const enrolledCourse: CourseWithEnrollment = {
      ...mockCourse,
      enrollment: {
        id: "enr-1",
        user_id: "user-1",
        course_id: "course-1",
        enrolled_at: "2026-01-15T00:00:00Z",
        last_page_id: "page-3",
        completed_at: null,
      },
      progress: {
        completed_pages: 2,
        total_pages: 5,
        progress_percent: 40,
      },
    };
    render(<CourseCard course={enrolledCourse} />);
    expect(screen.getByText("40% complete")).toBeInTheDocument();
    expect(screen.getByLabelText("40% complete")).toBeInTheDocument();
  });

  it("shows 'Completed' badge when course is 100% complete", () => {
    const completedCourse: CourseWithEnrollment = {
      ...mockCourse,
      enrollment: {
        id: "enr-1",
        user_id: "user-1",
        course_id: "course-1",
        enrolled_at: "2026-01-15T00:00:00Z",
        last_page_id: "page-5",
        completed_at: "2026-02-15T00:00:00Z",
      },
      progress: {
        completed_pages: 5,
        total_pages: 5,
        progress_percent: 100,
      },
    };
    render(<CourseCard course={completedCourse} />);
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("does not show progress bar for completed courses", () => {
    const completedCourse: CourseWithEnrollment = {
      ...mockCourse,
      enrollment: {
        id: "enr-1",
        user_id: "user-1",
        course_id: "course-1",
        enrolled_at: "2026-01-15T00:00:00Z",
        last_page_id: "page-5",
        completed_at: "2026-02-15T00:00:00Z",
      },
      progress: {
        completed_pages: 5,
        total_pages: 5,
        progress_percent: 100,
      },
    };
    render(<CourseCard course={completedCourse} />);
    // Progress bar should NOT be shown for completed courses
    expect(screen.queryByText("100% complete")).not.toBeInTheDocument();
  });

  it("does not show progress bar for unenrolled courses", () => {
    render(<CourseCard course={mockCourse} />);
    expect(screen.queryByText(/% complete/)).not.toBeInTheDocument();
  });

  it("does not show 'Completed' badge for unenrolled courses", () => {
    render(<CourseCard course={mockCourse} />);
    expect(screen.queryByText("Completed")).not.toBeInTheDocument();
  });

  it("handles thumbnail_url being null gracefully", () => {
    render(<CourseCard course={mockCourse} />);
    // Should show Om placeholder instead of image
    expect(screen.getByText("\u0950")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  // ===========================================================================
  // Regression Tests — Bugs discovered during manual QA
  // ===========================================================================

  describe("Regression: Bug 4 — Course card link URL correctness", () => {
    it("unenrolled course (enrollment is undefined) links to intro page /app/courses/[id]", () => {
      const unenrolled: CourseWithEnrollment = { ...mockCourse };
      delete (unenrolled as unknown as Record<string, unknown>).enrollment;
      render(<CourseCard course={unenrolled} />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/app/courses/course-1");
    });

    it("unenrolled course (enrollment is null) links to intro page /app/courses/[id]", () => {
      const unenrolled: CourseWithEnrollment = { ...mockCourse, enrollment: null };
      render(<CourseCard course={unenrolled} />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/app/courses/course-1");
    });

    it("enrolled with last_page_id links to /pages/[pageId]", () => {
      const enrolled: CourseWithEnrollment = {
        ...mockCourse,
        enrollment: {
          id: "enr-1",
          user_id: "user-1",
          course_id: "course-1",
          enrolled_at: "2026-01-15T00:00:00Z",
          last_page_id: "page-42",
          completed_at: null,
        },
        progress: { completed_pages: 1, total_pages: 5, progress_percent: 20 },
      };
      render(<CourseCard course={enrolled} />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute(
        "href",
        "/app/courses/course-1/pages/page-42"
      );
    });

    it("enrolled WITHOUT last_page_id links to /pages (redirect), NOT /pages/", () => {
      const enrolled: CourseWithEnrollment = {
        ...mockCourse,
        enrollment: {
          id: "enr-1",
          user_id: "user-1",
          course_id: "course-1",
          enrolled_at: "2026-01-15T00:00:00Z",
          last_page_id: null,
          completed_at: null,
        },
        progress: { completed_pages: 0, total_pages: 5, progress_percent: 0 },
      };
      render(<CourseCard course={enrolled} />);
      const link = screen.getByRole("link");
      // Must be exactly /pages (the redirect page), NOT /pages/ with trailing slash
      expect(link).toHaveAttribute("href", "/app/courses/course-1/pages");
      // Verify no trailing slash or empty pageId segment
      expect(link.getAttribute("href")).not.toMatch(/\/pages\/$/);
      expect(link.getAttribute("href")).not.toMatch(/\/pages\/\s*$/);
    });
  });
});

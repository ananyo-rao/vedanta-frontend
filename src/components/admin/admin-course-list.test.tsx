import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "@/test/test-utils";
import type { AdminCourseListItem } from "@/types/course";

let mockCourses: AdminCourseListItem[] | undefined;
let mockIsLoading = false;
let mockError: Error | null = null;

vi.mock("@/hooks/use-courses-admin", () => ({
  useAdminCourses: () => ({
    data: mockCourses,
    isLoading: mockIsLoading,
    error: mockError,
  }),
}));

import { AdminCourseList } from "./admin-course-list";

describe("AdminCourseList", () => {
  beforeEach(() => {
    mockCourses = undefined;
    mockIsLoading = false;
    mockError = null;
  });

  it("renders loading state", () => {
    mockIsLoading = true;
    renderWithProviders(<AdminCourseList />);
    expect(screen.getByText("Loading courses...")).toBeInTheDocument();
  });

  it("renders error state", () => {
    mockError = new Error("Failed to load");
    renderWithProviders(<AdminCourseList />);
    expect(screen.getByText("Failed to load")).toBeInTheDocument();
  });

  it("renders empty state when no courses", () => {
    mockCourses = [];
    renderWithProviders(<AdminCourseList />);
    expect(screen.getByText("No courses yet")).toBeInTheDocument();
    expect(
      screen.getByText("Create your first course to begin teaching.")
    ).toBeInTheDocument();
  });

  it("renders 'Create Course' CTA in empty state", () => {
    mockCourses = [];
    renderWithProviders(<AdminCourseList />);
    expect(
      screen.getByLabelText("Create your first course")
    ).toBeInTheDocument();
  });

  it("renders header with 'Course Builder' title", () => {
    mockCourses = [];
    renderWithProviders(<AdminCourseList />);
    expect(screen.getByText("Course Builder")).toBeInTheDocument();
  });

  it("renders 'New Course' button linking to creation page", () => {
    mockCourses = [];
    renderWithProviders(<AdminCourseList />);
    expect(
      screen.getByLabelText("Create new course")
    ).toBeInTheDocument();
  });

  it("renders list of courses with titles", () => {
    mockCourses = [
      {
        id: "c1",
        title: "Vedanta Basics",
        status: "published",
        page_count: 5,
        enrollment_count: 12,
        end_date: null,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
      {
        id: "c2",
        title: "Advanced Brahma Sutras",
        status: "draft",
        page_count: 0,
        enrollment_count: 0,
        end_date: null,
        created_at: "2026-02-01T00:00:00Z",
        updated_at: "2026-02-01T00:00:00Z",
      },
    ];
    renderWithProviders(<AdminCourseList />);
    // Both mobile card and desktop table render titles
    const vedantaTitles = screen.getAllByText("Vedanta Basics");
    expect(vedantaTitles.length).toBeGreaterThanOrEqual(1);
    const brahmaTitles = screen.getAllByText("Advanced Brahma Sutras");
    expect(brahmaTitles.length).toBeGreaterThanOrEqual(1);
  });

  it("shows Published badge for published courses", () => {
    mockCourses = [
      {
        id: "c1",
        title: "Vedanta Basics",
        status: "published",
        page_count: 5,
        enrollment_count: 12,
        end_date: null,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
    ];
    renderWithProviders(<AdminCourseList />);
    // Both mobile and desktop views render badges
    const publishedBadges = screen.getAllByText("Published");
    expect(publishedBadges.length).toBeGreaterThanOrEqual(1);
  });

  it("shows Draft badge for draft courses", () => {
    mockCourses = [
      {
        id: "c2",
        title: "Draft Course",
        status: "draft",
        page_count: 0,
        enrollment_count: 0,
        end_date: null,
        created_at: "2026-02-01T00:00:00Z",
        updated_at: "2026-02-01T00:00:00Z",
      },
    ];
    renderWithProviders(<AdminCourseList />);
    const draftBadges = screen.getAllByText("Draft");
    expect(draftBadges.length).toBeGreaterThanOrEqual(1);
  });

  it("shows end date warning badge for courses with end_date", () => {
    mockCourses = [
      {
        id: "c1",
        title: "Ending Course",
        status: "published",
        page_count: 5,
        enrollment_count: 12,
        end_date: "2026-06-30T00:00:00Z",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
    ];
    renderWithProviders(<AdminCourseList />);
    const endingBadges = screen.getAllByText(/Ending/);
    expect(endingBadges.length).toBeGreaterThanOrEqual(1);
  });

  it("shows page count and enrollment count for published courses", () => {
    mockCourses = [
      {
        id: "c1",
        title: "Vedanta Basics",
        status: "published",
        page_count: 5,
        enrollment_count: 12,
        end_date: null,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
    ];
    renderWithProviders(<AdminCourseList />);
    // Mobile card view shows "5 pages · 12 enrolled"
    expect(screen.getByText(/5 pages/)).toBeInTheDocument();
  });

  it("shows '--' for enrollment count on draft courses", () => {
    mockCourses = [
      {
        id: "c2",
        title: "Draft Course",
        status: "draft",
        page_count: 0,
        enrollment_count: 0,
        end_date: null,
        created_at: "2026-02-01T00:00:00Z",
        updated_at: "2026-02-01T00:00:00Z",
      },
    ];
    renderWithProviders(<AdminCourseList />);
    // Both mobile card and desktop table show "--" for draft courses
    const dashes = screen.getAllByText("--");
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });

  it("course links point to the editor page", () => {
    mockCourses = [
      {
        id: "c1",
        title: "Vedanta Basics",
        status: "published",
        page_count: 5,
        enrollment_count: 12,
        end_date: null,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
    ];
    renderWithProviders(<AdminCourseList />);
    // Check that a link to the editor exists
    const links = screen.getAllByRole("link", { name: /Vedanta Basics/ });
    expect(links.length).toBeGreaterThanOrEqual(1);
    expect(links[0]).toHaveAttribute(
      "href",
      "/app/admin/course-builder/c1"
    );
  });

  it("'New Course' button links to /app/admin/course-builder/new", () => {
    mockCourses = [];
    renderWithProviders(<AdminCourseList />);
    const newCourseBtn = screen.getByLabelText("Create new course");
    expect(newCourseBtn.closest("a")).toHaveAttribute(
      "href",
      "/app/admin/course-builder/new"
    );
  });
});

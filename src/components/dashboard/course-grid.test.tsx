import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CourseGrid } from "./course-grid";
import type { CourseWithEnrollment } from "@/types/course";

// ---------------------------------------------------------------------------
// Fixture factory — all data is intentionally unique/arbitrary
// ---------------------------------------------------------------------------

let idCounter = 0;
const makeCourse = (
  overrides: Partial<CourseWithEnrollment> = {}
): CourseWithEnrollment => ({
  id: `course-${++idCounter}`,
  title: `API Course ${idCounter}`,
  description: `Description for course ${idCounter}.`,
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
// Tests
// ---------------------------------------------------------------------------

describe("CourseGrid", () => {
  // ── Rendering from props ───────────────────────────────────────────────────

  it("renders a card for each course in the props array", () => {
    const courses = [
      makeCourse({ title: "Course Alpha" }),
      makeCourse({ title: "Course Beta" }),
      makeCourse({ title: "Course Gamma" }),
    ];
    render(<CourseGrid courses={courses} />);

    expect(screen.getByText("Course Alpha")).toBeInTheDocument();
    expect(screen.getByText("Course Beta")).toBeInTheDocument();
    expect(screen.getByText("Course Gamma")).toBeInTheDocument();
  });

  it("renders exactly N article cards for N courses passed", () => {
    const courses = [makeCourse(), makeCourse(), makeCourse()];
    render(<CourseGrid courses={courses} />);
    expect(screen.getAllByRole("article")).toHaveLength(3);
  });

  it("renders a single card when one course is provided", () => {
    render(<CourseGrid courses={[makeCourse({ title: "Solo Course" })]} />);
    expect(screen.getByText("Solo Course")).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(1);
  });

  // ── Empty input ────────────────────────────────────────────────────────────

  it("renders no cards when given an empty array", () => {
    render(<CourseGrid courses={[]} />);
    expect(screen.queryAllByRole("article")).toHaveLength(0);
  });

  it("renders nothing that could be mistaken for a course when given empty array", () => {
    const { container } = render(<CourseGrid courses={[]} />);
    // The grid wrapper should be empty
    const grid = container.firstChild as HTMLElement;
    expect(grid?.children).toHaveLength(0);
  });

  // ── Key uniqueness / no duplicates ─────────────────────────────────────────

  it("each course title appears exactly once — no duplicate card rendering", () => {
    const courses = [
      makeCourse({ id: "uniq-1", title: "Unique Title One" }),
      makeCourse({ id: "uniq-2", title: "Unique Title Two" }),
    ];
    render(<CourseGrid courses={courses} />);
    expect(screen.getAllByText("Unique Title One")).toHaveLength(1);
    expect(screen.getAllByText("Unique Title Two")).toHaveLength(1);
  });

  // ── Hardcoded content guard ────────────────────────────────────────────────

  /**
   * The grid itself must never render hardcoded course names.
   * It is a pure pass-through — it renders ONLY what is in the props array.
   */
  it("does NOT render 'Bhagavad Gita' when not in the courses prop", () => {
    render(<CourseGrid courses={[]} />);
    expect(screen.queryByText(/bhagavad gita/i)).not.toBeInTheDocument();
  });

  it("does NOT render 'Karma Yoga' when not in the courses prop", () => {
    render(<CourseGrid courses={[]} />);
    expect(screen.queryByText(/karma yoga/i)).not.toBeInTheDocument();
  });

  it("does NOT render 'Introduction to Advaita' when not in the courses prop", () => {
    render(<CourseGrid courses={[]} />);
    expect(
      screen.queryByText(/introduction to advaita/i)
    ).not.toBeInTheDocument();
  });

  it("does NOT render 'Meditation & Upasana' when not in the courses prop", () => {
    render(<CourseGrid courses={[]} />);
    expect(
      screen.queryByText(/meditation & upasana/i)
    ).not.toBeInTheDocument();
  });

  it("does NOT render 'Upanishad Study Circle' when not in the courses prop", () => {
    render(<CourseGrid courses={[]} />);
    expect(
      screen.queryByText(/upanishad study circle/i)
    ).not.toBeInTheDocument();
  });

  it("renders only the titles present in the prop — no extras appear", () => {
    const courses = [makeCourse({ id: "x-1", title: "Injected Course X" })];
    render(<CourseGrid courses={courses} />);

    expect(screen.getByText("Injected Course X")).toBeInTheDocument();
    // Known-hardcoded titles must not sneak in alongside the prop-supplied title
    expect(screen.queryByText(/bhagavad gita/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/karma yoga/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/introduction to advaita/i)
    ).not.toBeInTheDocument();
  });
});

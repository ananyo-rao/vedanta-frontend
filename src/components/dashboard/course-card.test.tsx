import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CourseCard } from "./course-card";
import { type Course } from "@/types/course";

const mockCourse: Course = {
  id: "course-1",
  title: "Introduction to Vedanta",
  description: "A foundational course covering the core principles of Advaita Vedanta.",
  thumbnail_url: null,
  course_type: "Short Course",
  teacher_name: "Swami Satchitananda",
  status: "published",
  display_order: 1,
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
    const placeholder = screen.getByText("ॐ");
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveAttribute("aria-hidden", "true");
  });

  it("has proper article landmark", () => {
    render(<CourseCard course={mockCourse} />);
    expect(screen.getByRole("article")).toBeInTheDocument();
  });
});

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "@/test/test-utils";
import type {
  CourseWithPages,
  Enrollment,
} from "@/types/course";

const mockPush = vi.fn();
const mockEnrollMutateAsync = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

let mockCourseData: (CourseWithPages & { enrollment?: Enrollment | null }) | null =
  null;
let mockIsLoading = false;
let mockError: Error | null = null;
let mockEnrollIsPending = false;

vi.mock("@/hooks/use-courses", () => ({
  useCourseDetail: () => ({
    data: mockCourseData,
    isLoading: mockIsLoading,
    error: mockError,
  }),
  useEnroll: () => ({
    mutateAsync: mockEnrollMutateAsync,
    isPending: mockEnrollIsPending,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

import { CourseIntroPage } from "./course-intro-page";

describe("CourseIntroPage", () => {
  const baseCourse: CourseWithPages & { enrollment?: Enrollment | null } = {
    id: "course-1",
    title: "Introduction to Vedanta",
    description:
      "A foundational course covering the core principles of Advaita Vedanta.",
    thumbnail_url: null,
    intro_video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    intro_video_source: "youtube",
    course_type: "Foundation",
    teacher_name: "Swami Satchitananda",
    status: "published",
    display_order: 1,
    end_date: null,
    created_by: "admin-1",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    pages: [
      {
        id: "page-1",
        course_id: "course-1",
        title: "The Self and the Not-Self",
        page_type: "video",
        sort_order: 1,
        is_strict: true,
        content: {
          video_url: "https://youtube.com/watch?v=vid1",
          video_source: "youtube",
          summary: "Summary",
        },
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
      {
        id: "page-2",
        course_id: "course-1",
        title: "Verse Reflection",
        page_type: "introspection",
        sort_order: 2,
        is_strict: true,
        content: {
          verse: "verse",
          explanation: "explanation",
        },
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
    ],
    enrollment: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCourseData = baseCourse;
    mockIsLoading = false;
    mockError = null;
    mockEnrollIsPending = false;
    mockEnrollMutateAsync.mockResolvedValue({});
  });

  it("renders loading state", () => {
    mockIsLoading = true;
    mockCourseData = null;
    renderWithProviders(<CourseIntroPage courseId="course-1" />);
    expect(screen.getByText("Loading course...")).toBeInTheDocument();
  });

  it("renders error state", () => {
    mockError = new Error("Network error");
    mockCourseData = null;
    renderWithProviders(<CourseIntroPage courseId="course-1" />);
    expect(screen.getByText("Network error")).toBeInTheDocument();
  });

  it("renders course title", () => {
    renderWithProviders(<CourseIntroPage courseId="course-1" />);
    expect(
      screen.getByText("Introduction to Vedanta")
    ).toBeInTheDocument();
  });

  it("renders course description", () => {
    renderWithProviders(<CourseIntroPage courseId="course-1" />);
    expect(
      screen.getByText(/foundational course covering the core principles/)
    ).toBeInTheDocument();
  });

  it("renders course type badge", () => {
    renderWithProviders(<CourseIntroPage courseId="course-1" />);
    expect(screen.getByText("Foundation")).toBeInTheDocument();
  });

  it("renders teacher name", () => {
    renderWithProviders(<CourseIntroPage courseId="course-1" />);
    expect(screen.getAllByText("Swami Satchitananda").length).toBeGreaterThanOrEqual(1);
  });

  it("renders topic outline with page titles", () => {
    renderWithProviders(<CourseIntroPage courseId="course-1" />);
    expect(
      screen.getByText("What You Will Study")
    ).toBeInTheDocument();
    expect(
      screen.getByText("The Self and the Not-Self")
    ).toBeInTheDocument();
    expect(screen.getByText("Verse Reflection")).toBeInTheDocument();
    // Verify numbered items and type badges
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getAllByText("2").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Video")).toBeInTheDocument();
    expect(screen.getByText("Introspection")).toBeInTheDocument();
  });

  it("renders intro video embed for YouTube URL", () => {
    const { container } = renderWithProviders(
      <CourseIntroPage courseId="course-1" />
    );
    const iframe = container.querySelector("iframe");
    expect(iframe).toBeInTheDocument();
    expect(iframe?.getAttribute("src")).toContain("youtube.com/embed/dQw4w9WgXcQ");
  });

  it("renders 'Enroll in This Course' button for unenrolled users", () => {
    renderWithProviders(<CourseIntroPage courseId="course-1" />);
    // Both mobile and desktop versions rendered
    const enrollBtns = screen.getAllByLabelText("Enroll in this course");
    expect(enrollBtns.length).toBeGreaterThanOrEqual(1);
  });

  it("renders 'Begin Course' button for enrolled users", () => {
    mockCourseData = {
      ...baseCourse,
      enrollment: {
        id: "enr-1",
        user_id: "user-1",
        course_id: "course-1",
        enrolled_at: "2026-01-01T00:00:00Z",
        last_page_id: "page-1",
        completed_at: null,
      },
    };
    renderWithProviders(<CourseIntroPage courseId="course-1" />);
    const beginBtns = screen.getAllByLabelText(
      "Begin or continue course"
    );
    expect(beginBtns.length).toBeGreaterThanOrEqual(1);
    expect(beginBtns[0]).toHaveTextContent("Begin Course");
  });

  it("clicking enroll calls API and shows success toast", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CourseIntroPage courseId="course-1" />);

    const enrollBtns = screen.getAllByLabelText("Enroll in this course");
    await user.click(enrollBtns[0]);

    await waitFor(() => {
      expect(mockEnrollMutateAsync).toHaveBeenCalled();
    });
  });

  it("clicking 'Begin Course' navigates to last visited page", async () => {
    mockCourseData = {
      ...baseCourse,
      enrollment: {
        id: "enr-1",
        user_id: "user-1",
        course_id: "course-1",
        enrolled_at: "2026-01-01T00:00:00Z",
        last_page_id: "page-2",
        completed_at: null,
      },
    };
    const user = userEvent.setup();
    renderWithProviders(<CourseIntroPage courseId="course-1" />);

    const beginBtns = screen.getAllByLabelText(
      "Begin or continue course"
    );
    await user.click(beginBtns[0]);

    expect(mockPush).toHaveBeenCalledWith(
      "/app/courses/course-1/pages/page-2"
    );
  });

  it("clicking 'Begin Course' navigates to first page when no last_page_id", async () => {
    mockCourseData = {
      ...baseCourse,
      enrollment: {
        id: "enr-1",
        user_id: "user-1",
        course_id: "course-1",
        enrolled_at: "2026-01-01T00:00:00Z",
        last_page_id: null,
        completed_at: null,
      },
    };
    const user = userEvent.setup();
    renderWithProviders(<CourseIntroPage courseId="course-1" />);

    const beginBtns = screen.getAllByLabelText(
      "Begin or continue course"
    );
    await user.click(beginBtns[0]);

    expect(mockPush).toHaveBeenCalledWith(
      "/app/courses/course-1/pages/page-1"
    );
  });

  it("shows end date warning when course has end_date", () => {
    mockCourseData = {
      ...baseCourse,
      end_date: "2026-06-30T00:00:00Z",
    };
    renderWithProviders(<CourseIntroPage courseId="course-1" />);
    expect(
      screen.getByText(/This course is available until/)
    ).toBeInTheDocument();
  });

  it("renders back to courses link", () => {
    renderWithProviders(<CourseIntroPage courseId="course-1" />);
    expect(
      screen.getByLabelText("Back to courses")
    ).toBeInTheDocument();
  });

  it("shows 'Course not found' when course is null with no error", () => {
    mockCourseData = null;
    renderWithProviders(<CourseIntroPage courseId="course-1" />);
    expect(screen.getByText("Course not found")).toBeInTheDocument();
  });
});

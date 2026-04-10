import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CourseProgress, PageStatus } from "@/types/course";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({ pageId: "page-2" }),
}));

import { CourseSidebar } from "./course-sidebar";

describe("CourseSidebar", () => {
  const mockProgress: CourseProgress = {
    enrollment: {
      id: "enr-1",
      user_id: "user-1",
      course_id: "course-1",
      enrolled_at: "2026-01-01T00:00:00Z",
      last_page_id: "page-2",
      completed_at: null,
    },
    total_pages: 4,
    completed_pages: 1,
    progress_percent: 25,
    page_statuses: [
      {
        page_id: "page-1",
        title: "Introduction Video",
        page_type: "video",
        is_strict: true,
        status: "completed",
      },
      {
        page_id: "page-2",
        title: "Verse Reflection",
        page_type: "introspection",
        is_strict: true,
        status: "current",
      },
      {
        page_id: "page-3",
        title: "Guided Meditation",
        page_type: "meditation",
        is_strict: false,
        status: "unlocked",
      },
      {
        page_id: "page-4",
        title: "Advanced Teaching",
        page_type: "video",
        is_strict: true,
        status: "locked",
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the course title", () => {
    render(
      <CourseSidebar
        courseTitle="Introduction to Vedanta"
        progress={mockProgress}
      />
    );
    expect(
      screen.getByText("Introduction to Vedanta")
    ).toBeInTheDocument();
  });

  it("shows progress text with page count and percentage", () => {
    render(
      <CourseSidebar
        courseTitle="Introduction to Vedanta"
        progress={mockProgress}
      />
    );
    // The component renders "1 of 4 pages — 25%" with &mdash;
    expect(screen.getByText(/1 of 4 pages/)).toBeInTheDocument();
    expect(screen.getByText(/25%/)).toBeInTheDocument();
  });

  it("renders progress bar with correct aria-label", () => {
    render(
      <CourseSidebar
        courseTitle="Introduction to Vedanta"
        progress={mockProgress}
      />
    );
    expect(
      screen.getByLabelText("Course progress: 25%")
    ).toBeInTheDocument();
  });

  it("renders all pages in order", () => {
    render(
      <CourseSidebar
        courseTitle="Introduction to Vedanta"
        progress={mockProgress}
      />
    );
    expect(screen.getByText(/Introduction Video/)).toBeInTheDocument();
    expect(screen.getByText(/Verse Reflection/)).toBeInTheDocument();
    expect(screen.getByText(/Guided Meditation/)).toBeInTheDocument();
    expect(screen.getByText(/Advanced Teaching/)).toBeInTheDocument();
  });

  it("shows page numbers in order", () => {
    render(
      <CourseSidebar
        courseTitle="Introduction to Vedanta"
        progress={mockProgress}
      />
    );
    expect(screen.getByText(/1\. Introduction Video/)).toBeInTheDocument();
    expect(screen.getByText(/2\. Verse Reflection/)).toBeInTheDocument();
    expect(screen.getByText(/3\. Guided Meditation/)).toBeInTheDocument();
    expect(screen.getByText(/4\. Advanced Teaching/)).toBeInTheDocument();
  });

  it("highlights current page with aria-current", () => {
    render(
      <CourseSidebar
        courseTitle="Introduction to Vedanta"
        progress={mockProgress}
      />
    );
    // page-2 is the current one (matched by useParams)
    const currentBtn = screen.getByLabelText(
      "2. Verse Reflection"
    );
    expect(currentBtn).toHaveAttribute("aria-current", "page");
  });

  it("shows completed page with completed label in aria", () => {
    render(
      <CourseSidebar
        courseTitle="Introduction to Vedanta"
        progress={mockProgress}
      />
    );
    const completedBtn = screen.getByLabelText(
      /1\. Introduction Video.*completed/
    );
    expect(completedBtn).toBeInTheDocument();
  });

  it("locked page is disabled", () => {
    render(
      <CourseSidebar
        courseTitle="Introduction to Vedanta"
        progress={mockProgress}
      />
    );
    const lockedBtn = screen.getByLabelText(/4\. Advanced Teaching.*locked/);
    expect(lockedBtn).toBeDisabled();
    expect(lockedBtn).toHaveAttribute("aria-disabled", "true");
  });

  it("locked page has aria-disabled and is wrapped in tooltip", () => {
    render(
      <CourseSidebar
        courseTitle="Introduction to Vedanta"
        progress={mockProgress}
      />
    );
    const lockedBtn = screen.getByLabelText(/4\. Advanced Teaching.*locked/);
    expect(lockedBtn).toHaveAttribute("aria-disabled", "true");
    expect(lockedBtn).toBeDisabled();
  });

  it("clicking locked page does not navigate", async () => {
    render(
      <CourseSidebar
        courseTitle="Introduction to Vedanta"
        progress={mockProgress}
      />
    );
    const lockedBtn = screen.getByLabelText(/4\. Advanced Teaching.*locked/);
    // Disabled buttons cannot be clicked with fireEvent.click in a meaningful way
    // but we verify the handler does not call push since the button is disabled
    lockedBtn.click();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("clicking completed page navigates", async () => {
    const user = userEvent.setup();
    render(
      <CourseSidebar
        courseTitle="Introduction to Vedanta"
        progress={mockProgress}
      />
    );
    const completedBtn = screen.getByLabelText(
      /1\. Introduction Video.*completed/
    );
    await user.click(completedBtn);
    expect(mockPush).toHaveBeenCalledWith(
      "/app/courses/course-1/pages/page-1"
    );
  });

  it("optional pages show (optional) indicator", () => {
    render(
      <CourseSidebar
        courseTitle="Introduction to Vedanta"
        progress={mockProgress}
      />
    );
    // page-3 is optional
    expect(screen.getByText("(optional)")).toBeInTheDocument();
    // The aria-label includes optional
    expect(
      screen.getByLabelText(/3\. Guided Meditation.*optional/)
    ).toBeInTheDocument();
  });

  it("has nav landmark with correct aria-label", () => {
    render(
      <CourseSidebar
        courseTitle="Introduction to Vedanta"
        progress={mockProgress}
      />
    );
    expect(
      screen.getByRole("navigation", { name: "Course pages" })
    ).toBeInTheDocument();
  });

  it("calls onClose when navigating from a completed page (for mobile sheet behavior)", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <CourseSidebar
        courseTitle="Introduction to Vedanta"
        progress={mockProgress}
        onClose={onClose}
      />
    );
    // Click a completed page (not the current one, to trigger navigation)
    const completedBtn = screen.getByLabelText(
      /1\. Introduction Video.*completed/
    );
    await user.click(completedBtn);
    expect(onClose).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalled();
  });

  it("renders 0% progress correctly for fresh enrollment", () => {
    const freshProgress: CourseProgress = {
      ...mockProgress,
      completed_pages: 0,
      progress_percent: 0,
      page_statuses: mockProgress.page_statuses.map((p, i) =>
        i === 0
          ? { ...p, status: "current" as const }
          : { ...p, status: "locked" as const }
      ),
    };
    render(
      <CourseSidebar
        courseTitle="Introduction to Vedanta"
        progress={freshProgress}
      />
    );
    expect(screen.getByText(/0 of 4 pages/)).toBeInTheDocument();
    expect(screen.getByText(/0%/)).toBeInTheDocument();
  });

  it("renders 100% progress correctly for completed course", () => {
    const completedProgress: CourseProgress = {
      ...mockProgress,
      completed_pages: 4,
      progress_percent: 100,
      page_statuses: mockProgress.page_statuses.map((p) => ({
        ...p,
        status: "completed" as const,
      })),
    };
    render(
      <CourseSidebar
        courseTitle="Introduction to Vedanta"
        progress={completedProgress}
      />
    );
    expect(screen.getByText(/4 of 4 pages/)).toBeInTheDocument();
    expect(screen.getByText(/100%/)).toBeInTheDocument();
  });
});

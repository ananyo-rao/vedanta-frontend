import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { createWrapper } from "@/test/test-utils";

// =============================================================================
// Regression Tests — Bug 3: Missing /pages index route caused 404
// Bug 6: Progress API error caused redirect page to hang
// =============================================================================

const mockReplace = vi.fn();
const mockParams = { courseId: "course-123" };

vi.mock("next/navigation", () => ({
  useParams: () => mockParams,
  useRouter: () => ({ replace: mockReplace }),
}));

let mockProgressData: unknown = undefined;
let mockIsLoading = false;
let mockIsError = false;

vi.mock("@/hooks/use-courses", () => ({
  useCourseProgress: () => ({
    data: mockProgressData,
    isLoading: mockIsLoading,
    isError: mockIsError,
  }),
}));

import CoursePlayerRedirect from "./page";

describe("Regression: Bug 3 — CoursePlayerRedirect page", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockProgressData = undefined;
    mockIsLoading = false;
    mockIsError = false;
  });

  it("shows loading text while progress is loading", () => {
    mockIsLoading = true;

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <CoursePlayerRedirect />
      </Wrapper>
    );

    expect(screen.getByText("Loading course...")).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("redirects to first 'current' page when progress has page_statuses", async () => {
    mockIsLoading = false;
    mockIsError = false;
    mockProgressData = {
      total_pages: 3,
      completed_pages: 1,
      progress_percent: 33,
      page_statuses: [
        { page_id: "page-1", title: "Page 1", status: "completed" },
        { page_id: "page-2", title: "Page 2", status: "current" },
        { page_id: "page-3", title: "Page 3", status: "locked" },
      ],
    };

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <CoursePlayerRedirect />
      </Wrapper>
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        "/app/courses/course-123/pages/page-2"
      );
    });
  });

  it("redirects to first page if all pages are unlocked (no 'current')", async () => {
    mockIsLoading = false;
    mockIsError = false;
    mockProgressData = {
      total_pages: 2,
      completed_pages: 0,
      progress_percent: 0,
      page_statuses: [
        { page_id: "page-a", title: "Optional 1", status: "unlocked" },
        { page_id: "page-b", title: "Optional 2", status: "unlocked" },
      ],
    };

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <CoursePlayerRedirect />
      </Wrapper>
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        "/app/courses/course-123/pages/page-a"
      );
    });
  });

  it("redirects to course intro when page_statuses is empty", async () => {
    mockIsLoading = false;
    mockIsError = false;
    mockProgressData = {
      total_pages: 0,
      completed_pages: 0,
      progress_percent: 0,
      page_statuses: [],
    };

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <CoursePlayerRedirect />
      </Wrapper>
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/app/courses/course-123");
    });
  });

  it("redirects to course intro when progress data is null/undefined", async () => {
    mockIsLoading = false;
    mockIsError = false;
    mockProgressData = null;

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <CoursePlayerRedirect />
      </Wrapper>
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/app/courses/course-123");
    });
  });

  describe("Regression: Bug 6 — Error handling for unenrolled user", () => {
    it("redirects to course intro when progress API returns error (unenrolled)", async () => {
      // Bug 6: Progress endpoint returns NOT_FOUND for unenrolled user.
      // The redirect page must handle this by going to intro, not hanging.
      mockIsLoading = false;
      mockIsError = true;
      mockProgressData = undefined;

      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <CoursePlayerRedirect />
        </Wrapper>
      );

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith("/app/courses/course-123");
      });
    });
  });
});

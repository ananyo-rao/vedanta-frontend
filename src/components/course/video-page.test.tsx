import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "@/test/test-utils";
import type { CoursePage, VideoContent } from "@/types/course";

// Mock child components to isolate this component's logic
vi.mock("@/components/course/video-player", () => ({
  VideoPlayer: ({
    url,
    onProgressUpdate,
  }: {
    url: string;
    onProgressUpdate?: (p: number) => void;
  }) => (
    <div data-testid="video-player" data-url={url}>
      <button
        data-testid="simulate-progress"
        onClick={() => onProgressUpdate?.(95)}
      >
        Simulate 95%
      </button>
    </div>
  ),
}));

vi.mock("@/components/course/complete-and-continue", () => ({
  CompleteAndContinue: ({
    canComplete,
    isLastPage,
    progressHint,
  }: {
    canComplete: boolean;
    isLastPage: boolean;
    progressHint?: string;
  }) => (
    <div data-testid="complete-and-continue">
      <span data-testid="can-complete">{String(canComplete)}</span>
      <span data-testid="is-last-page">{String(isLastPage)}</span>
      {progressHint && <span data-testid="progress-hint">{progressHint}</span>}
    </div>
  ),
}));

import { VideoPage } from "./video-page";

describe("VideoPage", () => {
  const basePage: CoursePage & {
    video_progress?: { progress_percent: number; last_position: number } | null;
  } = {
    id: "page-1",
    course_id: "course-1",
    title: "The Nature of the Self",
    page_type: "video",
    sort_order: 1,
    is_strict: true,
    content: {
      video_url: "https://youtube.com/watch?v=abc123",
      video_source: "youtube",
      summary:
        "In this teaching, we explore the Upanishadic view of the Self.",
    } as VideoContent,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    video_progress: null,
  };

  it("renders the page title", () => {
    renderWithProviders(
      <VideoPage
        page={basePage}
        courseId="course-1"
        nextPageId="page-2"
        isLastPage={false}
        pageStatus="current"
      />
    );
    expect(screen.getByText("The Nature of the Self")).toBeInTheDocument();
  });

  it("renders the summary text", () => {
    renderWithProviders(
      <VideoPage
        page={basePage}
        courseId="course-1"
        nextPageId="page-2"
        isLastPage={false}
        pageStatus="current"
      />
    );
    expect(
      screen.getByText(
        "In this teaching, we explore the Upanishadic view of the Self."
      )
    ).toBeInTheDocument();
  });

  it("renders the video player component", () => {
    renderWithProviders(
      <VideoPage
        page={basePage}
        courseId="course-1"
        nextPageId="page-2"
        isLastPage={false}
        pageStatus="current"
      />
    );
    expect(screen.getByTestId("video-player")).toBeInTheDocument();
  });

  it("renders complete-and-continue component", () => {
    renderWithProviders(
      <VideoPage
        page={basePage}
        courseId="course-1"
        nextPageId="page-2"
        isLastPage={false}
        pageStatus="current"
      />
    );
    expect(screen.getByTestId("complete-and-continue")).toBeInTheDocument();
  });

  it("canComplete is false when watchPercent < 90 for strict page", () => {
    renderWithProviders(
      <VideoPage
        page={basePage}
        courseId="course-1"
        nextPageId="page-2"
        isLastPage={false}
        pageStatus="current"
      />
    );
    expect(screen.getByTestId("can-complete")).toHaveTextContent("false");
  });

  it("shows progress hint for strict page when not complete", () => {
    renderWithProviders(
      <VideoPage
        page={basePage}
        courseId="course-1"
        nextPageId="page-2"
        isLastPage={false}
        pageStatus="current"
      />
    );
    expect(screen.getByTestId("progress-hint")).toHaveTextContent(
      "Watch to continue (0%)"
    );
  });

  it("canComplete is true for optional (non-strict) pages regardless of watch percent", () => {
    const optionalPage = { ...basePage, is_strict: false };
    renderWithProviders(
      <VideoPage
        page={optionalPage}
        courseId="course-1"
        nextPageId="page-2"
        isLastPage={false}
        pageStatus="current"
      />
    );
    expect(screen.getByTestId("can-complete")).toHaveTextContent("true");
  });

  it("restores video progress from existing data", () => {
    const pageWithProgress = {
      ...basePage,
      video_progress: { progress_percent: 92, last_position: 300 },
    };
    renderWithProviders(
      <VideoPage
        page={pageWithProgress}
        courseId="course-1"
        nextPageId="page-2"
        isLastPage={false}
        pageStatus="current"
      />
    );
    // With 92% progress, canComplete should be true
    expect(screen.getByTestId("can-complete")).toHaveTextContent("true");
  });

  it("passes isLastPage correctly to CompleteAndContinue", () => {
    renderWithProviders(
      <VideoPage
        page={basePage}
        courseId="course-1"
        nextPageId={null}
        isLastPage={true}
        pageStatus="current"
      />
    );
    expect(screen.getByTestId("is-last-page")).toHaveTextContent("true");
  });

  it("renders title with serif font heading", () => {
    renderWithProviders(
      <VideoPage
        page={basePage}
        courseId="course-1"
        nextPageId="page-2"
        isLastPage={false}
        pageStatus="current"
      />
    );
    const heading = screen.getByText("The Nature of the Self");
    expect(heading.tagName).toBe("H1");
    expect(heading).toHaveClass("font-serif");
  });
});

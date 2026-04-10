import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "@/test/test-utils";
import type { CoursePage, MeditationContent } from "@/types/course";

vi.mock("@/components/course/video-player", () => ({
  VideoPlayer: ({ url }: { url: string }) => (
    <div data-testid="video-player" data-url={url} />
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

import { MeditationPage } from "./meditation-page";

describe("MeditationPage", () => {
  const basePage: CoursePage & {
    video_progress?: { progress_percent: number; last_position: number } | null;
  } = {
    id: "page-3",
    course_id: "course-1",
    title: "Guided Breath Meditation",
    page_type: "meditation",
    sort_order: 3,
    is_strict: true,
    content: {
      video_url: "https://youtube.com/watch?v=meditation123",
      video_source: "youtube",
      description: "A calming meditation to center the mind.",
    } as MeditationContent,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    video_progress: null,
  };

  it("renders the page title", () => {
    renderWithProviders(
      <MeditationPage
        page={basePage}
        courseId="course-1"
        nextPageId="page-4"
        isLastPage={false}
        pageStatus="current"
      />
    );
    expect(
      screen.getByText("Guided Breath Meditation")
    ).toBeInTheDocument();
  });

  it("renders optional description when present", () => {
    renderWithProviders(
      <MeditationPage
        page={basePage}
        courseId="course-1"
        nextPageId="page-4"
        isLastPage={false}
        pageStatus="current"
      />
    );
    expect(
      screen.getByText("A calming meditation to center the mind.")
    ).toBeInTheDocument();
  });

  it("renders without description when not provided", () => {
    const noDescPage = {
      ...basePage,
      content: {
        video_url: "https://youtube.com/watch?v=meditation123",
        video_source: "youtube" as const,
      } as MeditationContent,
    };
    renderWithProviders(
      <MeditationPage
        page={noDescPage}
        courseId="course-1"
        nextPageId="page-4"
        isLastPage={false}
        pageStatus="current"
      />
    );
    expect(
      screen.queryByText("A calming meditation to center the mind.")
    ).not.toBeInTheDocument();
  });

  it("renders the video player component", () => {
    renderWithProviders(
      <MeditationPage
        page={basePage}
        courseId="course-1"
        nextPageId="page-4"
        isLastPage={false}
        pageStatus="current"
      />
    );
    expect(screen.getByTestId("video-player")).toBeInTheDocument();
  });

  it("renders complete-and-continue component", () => {
    renderWithProviders(
      <MeditationPage
        page={basePage}
        courseId="course-1"
        nextPageId="page-4"
        isLastPage={false}
        pageStatus="current"
      />
    );
    expect(screen.getByTestId("complete-and-continue")).toBeInTheDocument();
  });

  it("has centered layout with max-w-2xl for contemplative atmosphere", () => {
    const { container } = renderWithProviders(
      <MeditationPage
        page={basePage}
        courseId="course-1"
        nextPageId="page-4"
        isLastPage={false}
        pageStatus="current"
      />
    );
    const wrapper = container.firstElementChild;
    expect(wrapper).toHaveClass("text-center", "max-w-2xl", "mx-auto");
  });

  it("canComplete is false for strict page with 0% watch", () => {
    renderWithProviders(
      <MeditationPage
        page={basePage}
        courseId="course-1"
        nextPageId="page-4"
        isLastPage={false}
        pageStatus="current"
      />
    );
    expect(screen.getByTestId("can-complete")).toHaveTextContent("false");
  });

  it("canComplete is true for optional pages regardless of watch", () => {
    const optionalPage = { ...basePage, is_strict: false };
    renderWithProviders(
      <MeditationPage
        page={optionalPage}
        courseId="course-1"
        nextPageId="page-4"
        isLastPage={false}
        pageStatus="current"
      />
    );
    expect(screen.getByTestId("can-complete")).toHaveTextContent("true");
  });

  it("shows progress hint for strict page when not complete", () => {
    renderWithProviders(
      <MeditationPage
        page={basePage}
        courseId="course-1"
        nextPageId="page-4"
        isLastPage={false}
        pageStatus="current"
      />
    );
    expect(screen.getByTestId("progress-hint")).toHaveTextContent(
      "Watch to continue (0%)"
    );
  });

  it("canComplete is true with 90%+ existing progress", () => {
    const pageWithProgress = {
      ...basePage,
      video_progress: { progress_percent: 91, last_position: 450 },
    };
    renderWithProviders(
      <MeditationPage
        page={pageWithProgress}
        courseId="course-1"
        nextPageId="page-4"
        isLastPage={false}
        pageStatus="current"
      />
    );
    expect(screen.getByTestId("can-complete")).toHaveTextContent("true");
  });

  it("title uses serif font and is larger on desktop", () => {
    renderWithProviders(
      <MeditationPage
        page={basePage}
        courseId="course-1"
        nextPageId="page-4"
        isLastPage={false}
        pageStatus="current"
      />
    );
    const heading = screen.getByText("Guided Breath Meditation");
    expect(heading.tagName).toBe("H1");
    expect(heading).toHaveClass("font-serif");
  });
});

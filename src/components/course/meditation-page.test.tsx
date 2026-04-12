import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderWithProviders } from "@/test/test-utils";
import type { CoursePage, MeditationContent } from "@/types/course";

vi.mock("@/components/course/video-player", () => ({
  VideoPlayer: ({
    url,
    onProgressUpdate,
  }: {
    url: string;
    courseId: string;
    pageId: string;
    onProgressUpdate?: (pct: number) => void;
  }) => (
    <div data-testid="video-player" data-url={url}>
      <button
        data-testid="set-watch-100"
        onClick={() => onProgressUpdate?.(100)}
      >
        Simulate 100%
      </button>
    </div>
  ),
}));

vi.mock("@/components/course/complete-and-continue", () => ({
  CompleteAndContinue: ({
    canComplete,
    isLastPage,
    progressHint,
    isAlreadyCompleted,
    isStrict,
  }: {
    canComplete: boolean;
    isLastPage: boolean;
    progressHint?: string;
    isAlreadyCompleted?: boolean;
    isStrict?: boolean;
    courseId: string;
    pageId: string;
    nextPageId: string | null;
  }) => (
    <div data-testid="complete-and-continue">
      <span data-testid="can-complete">{String(canComplete)}</span>
      <span data-testid="is-last-page">{String(isLastPage)}</span>
      <span data-testid="is-strict">{String(isStrict ?? true)}</span>
      <span data-testid="already-completed">{String(isAlreadyCompleted ?? false)}</span>
      {progressHint && <span data-testid="progress-hint">{progressHint}</span>}
    </div>
  ),
}));

// next/image is not available in jsdom
vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} data-testid="next-image" />
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

// ─── AudioMeditationPage (new path) ──────────────────────────────────────────

/**
 * Helper to fire audio element events from registered listeners.
 * The MeditationPage component attaches listeners via audio.addEventListener(),
 * but jsdom's HTMLAudioElement doesn't fire real events from play/pause/timeupdate.
 * We collect listeners via the prototype spy and dispatch them manually.
 */
function buildAudioEventHelper() {
  const listenerMap: Record<string, EventListener[]> = {};

  const originalAdd = window.HTMLMediaElement.prototype.addEventListener;
  const originalRemove = window.HTMLMediaElement.prototype.removeEventListener;

  // Spy on addEventListener to capture all registered handlers
  const addSpy = vi.spyOn(window.HTMLMediaElement.prototype, "addEventListener").mockImplementation(
    function (this: HTMLMediaElement, event: string, handler: EventListenerOrEventListenerObject) {
      if (!listenerMap[event]) listenerMap[event] = [];
      const fn = typeof handler === "function" ? handler : handler.handleEvent.bind(handler);
      listenerMap[event].push(fn);
      return originalAdd.call(this, event, handler);
    }
  );

  // Stub play() and pause() which throw in jsdom
  const playSpy = vi.spyOn(window.HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
  const pauseSpy = vi.spyOn(window.HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);

  function fireEvent(name: string) {
    act(() => {
      (listenerMap[name] || []).forEach((fn) => fn(new Event(name)));
    });
  }

  function restore() {
    addSpy.mockRestore();
    playSpy.mockRestore();
    pauseSpy.mockRestore();
    // Clear listener map
    Object.keys(listenerMap).forEach((k) => { delete listenerMap[k]; });
  }

  return { fireEvent, playSpy, pauseSpy, restore };
}

describe("MeditationPage — AudioMeditationPage (audio_url path)", () => {
  type AudioHelper = ReturnType<typeof buildAudioEventHelper>;
  let helper: AudioHelper;

  const audioPage: CoursePage & {
    video_progress?: { progress_percent: number; last_position: number } | null;
  } = {
    id: "page-audio-001",
    course_id: "course-1",
    title: "Morning Meditation",
    page_type: "meditation",
    sort_order: 1,
    is_strict: true,
    content: {
      audio_url: "https://cdn.example.com/audio/morning.mp3",
      description: "Start your day with calm",
    } as MeditationContent,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    video_progress: null,
  };

  const optionalAudioPage = { ...audioPage, is_strict: false };

  const defaultProps = {
    courseId: "course-1",
    nextPageId: "page-2",
    isLastPage: false,
    pageStatus: "not_started" as const,
  };

  beforeEach(() => {
    helper = buildAudioEventHelper();
  });

  afterEach(() => {
    helper.restore();
    vi.clearAllMocks();
  });

  // ─── Route selection ───────────────────────────────────────────────────

  it("renders audio element (not VideoPlayer) when content has audio_url", () => {
    renderWithProviders(<MeditationPage page={audioPage} {...defaultProps} />);

    expect(document.querySelector("audio")).not.toBeNull();
    expect(document.querySelector("audio")?.src).toContain("morning.mp3");
    expect(screen.queryByTestId("video-player")).not.toBeInTheDocument();
  });

  // ─── Render ─────────────────────────────────────────────────────────────

  it("renders page title for audio meditation", () => {
    renderWithProviders(<MeditationPage page={audioPage} {...defaultProps} />);
    expect(screen.getByText("Morning Meditation")).toBeInTheDocument();
  });

  it("renders description for audio meditation when provided", () => {
    renderWithProviders(<MeditationPage page={audioPage} {...defaultProps} />);
    expect(screen.getByText("Start your day with calm")).toBeInTheDocument();
  });

  it("renders play button initially", () => {
    renderWithProviders(<MeditationPage page={audioPage} {...defaultProps} />);
    expect(screen.getByRole("button", { name: /^play$/i })).toBeInTheDocument();
  });

  it("renders restart button", () => {
    renderWithProviders(<MeditationPage page={audioPage} {...defaultProps} />);
    expect(screen.getByRole("button", { name: /restart from beginning/i })).toBeInTheDocument();
  });

  it("renders seek slider", () => {
    renderWithProviders(<MeditationPage page={audioPage} {...defaultProps} />);
    expect(screen.getByRole("slider", { name: /audio seek/i })).toBeInTheDocument();
  });

  it("renders CompleteAndContinue", () => {
    renderWithProviders(<MeditationPage page={audioPage} {...defaultProps} />);
    expect(screen.getByTestId("complete-and-continue")).toBeInTheDocument();
  });

  // ─── Play / pause ────────────────────────────────────────────────────────

  it("clicking Play calls audio.play()", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MeditationPage page={audioPage} {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /^play$/i }));

    expect(helper.playSpy).toHaveBeenCalled();
  });

  it("shows Pause button after 'play' event fires", async () => {
    renderWithProviders(<MeditationPage page={audioPage} {...defaultProps} />);
    helper.fireEvent("play");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /pause/i })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /^play$/i })).not.toBeInTheDocument();
    });
  });

  it("clicking Pause calls audio.pause()", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MeditationPage page={audioPage} {...defaultProps} />);

    helper.fireEvent("play");
    await waitFor(() => expect(screen.getByRole("button", { name: /pause/i })).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: /pause/i }));
    expect(helper.pauseSpy).toHaveBeenCalled();
  });

  it("shows Play button again after 'pause' event fires", async () => {
    renderWithProviders(<MeditationPage page={audioPage} {...defaultProps} />);

    helper.fireEvent("play");
    await waitFor(() => expect(screen.getByRole("button", { name: /pause/i })).toBeInTheDocument());

    helper.fireEvent("pause");
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^play$/i })).toBeInTheDocument();
    });
  });

  // ─── Progress tracking ───────────────────────────────────────────────────

  it("canComplete starts false on strict page before any listening", () => {
    renderWithProviders(<MeditationPage page={audioPage} {...defaultProps} />);
    expect(screen.getByTestId("can-complete")).toHaveTextContent("false");
  });

  it("shows 'Listen to continue (0%)' hint on strict page initially", () => {
    renderWithProviders(<MeditationPage page={audioPage} {...defaultProps} />);
    expect(screen.getByTestId("progress-hint")).toHaveTextContent("Listen to continue (0%)");
  });

  it("updates listenPercent via timeupdate event", async () => {
    renderWithProviders(<MeditationPage page={audioPage} {...defaultProps} />);

    const audioEl = document.querySelector("audio") as HTMLAudioElement;
    // Simulate playback at 50% (100s of 200s)
    Object.defineProperty(audioEl, "currentTime", { value: 100, configurable: true });
    Object.defineProperty(audioEl, "duration", { value: 200, configurable: true });
    helper.fireEvent("timeupdate");

    await waitFor(() => {
      expect(screen.getByTestId("progress-hint")).toHaveTextContent("Listen to continue (50%)");
    });
  });

  it("canComplete becomes true when listenPercent reaches 90% via timeupdate", async () => {
    renderWithProviders(<MeditationPage page={audioPage} {...defaultProps} />);

    const audioEl = document.querySelector("audio") as HTMLAudioElement;
    Object.defineProperty(audioEl, "currentTime", { value: 180, configurable: true }); // 90%
    Object.defineProperty(audioEl, "duration", { value: 200, configurable: true });
    helper.fireEvent("timeupdate");

    await waitFor(() => {
      expect(screen.getByTestId("can-complete")).toHaveTextContent("true");
    });
  });

  it("89% does NOT enable canComplete on strict page", async () => {
    renderWithProviders(<MeditationPage page={audioPage} {...defaultProps} />);

    const audioEl = document.querySelector("audio") as HTMLAudioElement;
    Object.defineProperty(audioEl, "currentTime", { value: 178, configurable: true }); // 89%
    Object.defineProperty(audioEl, "duration", { value: 200, configurable: true });
    helper.fireEvent("timeupdate");

    await waitFor(() => {
      expect(screen.getByTestId("progress-hint")).toHaveTextContent("89%");
    });
    expect(screen.getByTestId("can-complete")).toHaveTextContent("false");
  });

  it("sets listenPercent to 100 when 'ended' event fires", async () => {
    renderWithProviders(<MeditationPage page={audioPage} {...defaultProps} />);

    helper.fireEvent("ended");

    await waitFor(() => {
      expect(screen.getByTestId("can-complete")).toHaveTextContent("true");
    });
  });

  it("listenPercent never decreases — seeking back does not lower it", async () => {
    renderWithProviders(<MeditationPage page={audioPage} {...defaultProps} />);

    const audioEl = document.querySelector("audio") as HTMLAudioElement;

    // Advance to 80%
    Object.defineProperty(audioEl, "currentTime", { value: 160, configurable: true });
    Object.defineProperty(audioEl, "duration", { value: 200, configurable: true });
    helper.fireEvent("timeupdate");
    await waitFor(() => {
      expect(screen.getByTestId("progress-hint")).toHaveTextContent("80%");
    });

    // Seek back to 10%
    Object.defineProperty(audioEl, "currentTime", { value: 20, configurable: true });
    helper.fireEvent("timeupdate");

    // Progress hint should still say 80%, not regress to 10%
    await waitFor(() => {
      expect(screen.getByTestId("progress-hint")).toHaveTextContent("80%");
      expect(screen.getByTestId("progress-hint")).not.toHaveTextContent("10%");
    });
  });

  // ─── Optional page ───────────────────────────────────────────────────────

  it("canComplete is true immediately on optional (non-strict) page", () => {
    renderWithProviders(<MeditationPage page={optionalAudioPage} {...defaultProps} />);
    expect(screen.getByTestId("can-complete")).toHaveTextContent("true");
  });

  it("no progress hint on optional page", () => {
    renderWithProviders(<MeditationPage page={optionalAudioPage} {...defaultProps} />);
    expect(screen.queryByTestId("progress-hint")).not.toBeInTheDocument();
  });

  // ─── Already-completed ───────────────────────────────────────────────────

  it("shows already-completed state correctly", () => {
    renderWithProviders(
      <MeditationPage page={audioPage} {...defaultProps} pageStatus="completed" />
    );
    expect(screen.getByTestId("already-completed")).toHaveTextContent("true");
  });

  // ─── Duration display ─────────────────────────────────────────────────────

  it("renders 0:00 for duration before loadedmetadata", () => {
    renderWithProviders(<MeditationPage page={audioPage} {...defaultProps} />);
    const zeroTimes = screen.getAllByText("0:00");
    expect(zeroTimes.length).toBeGreaterThanOrEqual(2);
  });

  it("shows formatted duration after loadedmetadata fires", async () => {
    renderWithProviders(<MeditationPage page={audioPage} {...defaultProps} />);

    const audioEl = document.querySelector("audio") as HTMLAudioElement;
    Object.defineProperty(audioEl, "duration", { value: 200, configurable: true }); // 3:20
    helper.fireEvent("loadedmetadata");

    await waitFor(() => {
      expect(screen.getByText("3:20")).toBeInTheDocument();
    });
  });
});

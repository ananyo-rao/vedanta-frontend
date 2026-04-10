import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the hook before importing the component
vi.mock("@/hooks/use-courses", () => ({
  useUpdateVideoProgress: () => ({ mutate: vi.fn() }),
}));

import { VideoPlayer } from "./video-player";

describe("VideoPlayer", () => {
  const defaultProps = {
    url: "https://storage.googleapis.com/bucket/video.mp4",
    courseId: "course-1",
    pageId: "page-1",
    initialPosition: 0,
    onProgressUpdate: vi.fn(),
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("renders native <video> element for direct URLs", () => {
    const { container } = render(<VideoPlayer {...defaultProps} />);
    const videoEl = container.querySelector("video");
    expect(videoEl).toBeInTheDocument();
    expect(videoEl).toHaveAttribute("src", defaultProps.url);
    expect(videoEl).toHaveAttribute("controls");
  });

  it("renders iframe for YouTube URLs", () => {
    const { container } = render(
      <VideoPlayer
        {...defaultProps}
        url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      />
    );
    const iframe = container.querySelector("iframe");
    expect(iframe).toBeInTheDocument();
    expect(iframe?.getAttribute("src")).toContain(
      "youtube.com/embed/dQw4w9WgXcQ"
    );
  });

  it("renders iframe for YouTube short URLs", () => {
    const { container } = render(
      <VideoPlayer {...defaultProps} url="https://youtu.be/dQw4w9WgXcQ" />
    );
    const iframe = container.querySelector("iframe");
    expect(iframe).toBeInTheDocument();
    expect(iframe?.getAttribute("src")).toContain(
      "youtube.com/embed/dQw4w9WgXcQ"
    );
  });

  it("renders iframe for Vimeo URLs", () => {
    const { container } = render(
      <VideoPlayer {...defaultProps} url="https://vimeo.com/123456789" />
    );
    const iframe = container.querySelector("iframe");
    expect(iframe).toBeInTheDocument();
    expect(iframe?.getAttribute("src")).toContain(
      "player.vimeo.com/video/123456789"
    );
  });

  it("auto-reports 100% progress for embedded YouTube videos (can't track iframe progress)", () => {
    const onProgress = vi.fn();
    render(
      <VideoPlayer
        {...defaultProps}
        url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        onProgressUpdate={onProgress}
      />
    );

    // Embedded videos immediately report 100% since cross-origin iframes
    // don't expose playback progress to the parent page
    expect(onProgress).toHaveBeenCalledWith(100);
  });

  it("auto-reports 100% progress for embedded Vimeo videos", () => {
    const onProgress = vi.fn();
    render(
      <VideoPlayer
        {...defaultProps}
        url="https://vimeo.com/123456789"
        onProgressUpdate={onProgress}
      />
    );

    expect(onProgress).toHaveBeenCalledWith(100);
  });

  it("does not auto-report 100% for native video URLs", () => {
    const onProgress = vi.fn();
    render(<VideoPlayer {...defaultProps} onProgressUpdate={onProgress} />);

    // Native video tracks real progress — should NOT auto-report 100%
    expect(onProgress).not.toHaveBeenCalledWith(100);
  });

  it("renders with aspect-video container for native player", () => {
    const { container } = render(<VideoPlayer {...defaultProps} />);
    const wrapper = container.querySelector(".aspect-video");
    expect(wrapper).toBeInTheDocument();
  });

  it("renders with aspect-video container for embedded player", () => {
    const { container } = render(
      <VideoPlayer
        {...defaultProps}
        url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      />
    );
    const wrapper = container.querySelector(".aspect-video");
    expect(wrapper).toBeInTheDocument();
  });

  it("iframe has allowFullScreen and title attributes", () => {
    const { container } = render(
      <VideoPlayer
        {...defaultProps}
        url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      />
    );
    const iframe = container.querySelector("iframe");
    expect(iframe).toHaveAttribute("title", "Video");
    expect(iframe).toHaveAttribute("allowfullscreen");
  });
});

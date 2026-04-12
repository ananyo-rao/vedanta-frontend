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

  // --- Phase 2: Bunny embed URL ---

  it("renders iframe for Bunny embed URL (iframe.mediadelivery.net)", () => {
    const bunnyEmbedUrl = "https://iframe.mediadelivery.net/embed/634749/abc-123";
    const { container } = render(
      <VideoPlayer {...defaultProps} url={bunnyEmbedUrl} />
    );
    const iframe = container.querySelector("iframe");
    expect(iframe).toBeInTheDocument();
    // Bunny embed uses the URL as-is (not transformed)
    expect(iframe?.getAttribute("src")).toBe(bunnyEmbedUrl);
  });

  it("auto-reports 100% progress for Bunny embed videos", () => {
    const onProgress = vi.fn();
    render(
      <VideoPlayer
        {...defaultProps}
        url="https://iframe.mediadelivery.net/embed/634749/abc-123"
        onProgressUpdate={onProgress}
      />
    );
    // EmbedPlayer calls onProgressUpdate(100) on mount — cross-origin iframe
    expect(onProgress).toHaveBeenCalledWith(100);
  });

  it("Bunny embed iframe has allowFullScreen and sandbox attributes", () => {
    const { container } = render(
      <VideoPlayer
        {...defaultProps}
        url="https://iframe.mediadelivery.net/embed/634749/abc-123"
      />
    );
    const iframe = container.querySelector("iframe");
    expect(iframe).toHaveAttribute("allowfullscreen");
    expect(iframe).toHaveAttribute("sandbox");
  });

  // --- Phase 2: HLS URL (.m3u8) ---

  it("renders native <video> element for HLS (.m3u8) URLs", () => {
    const hlsUrl = "https://vz-04040b01-3a7.b-cdn.net/abc-123/playlist.m3u8";
    const { container } = render(
      <VideoPlayer {...defaultProps} url={hlsUrl} />
    );
    const videoEl = container.querySelector("video");
    expect(videoEl).toBeInTheDocument();
    // HLS.js attaches via effect — src is not set as a JSX prop
    expect(videoEl).not.toHaveAttribute("src");
  });

  it("does NOT render iframe for HLS (.m3u8) URL", () => {
    const hlsUrl = "https://vz-04040b01-3a7.b-cdn.net/abc-123/playlist.m3u8";
    const { container } = render(
      <VideoPlayer {...defaultProps} url={hlsUrl} />
    );
    const iframe = container.querySelector("iframe");
    expect(iframe).not.toBeInTheDocument();
  });

  it("does NOT auto-report 100% progress for HLS URLs (native player tracks real progress)", () => {
    const onProgress = vi.fn();
    render(
      <VideoPlayer
        {...defaultProps}
        url="https://vz-04040b01-3a7.b-cdn.net/abc-123/playlist.m3u8"
        onProgressUpdate={onProgress}
      />
    );
    // NativePlayer does not auto-call 100% on mount
    expect(onProgress).not.toHaveBeenCalledWith(100);
  });

  // --- EmbedPlayer onProgressUpdate(100) on mount ---

  it("EmbedPlayer calls onProgressUpdate(100) exactly once on mount", () => {
    const onProgress = vi.fn();
    render(
      <VideoPlayer
        {...defaultProps}
        url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        onProgressUpdate={onProgress}
      />
    );
    expect(onProgress).toHaveBeenCalledTimes(1);
    expect(onProgress).toHaveBeenCalledWith(100);
  });

  it("EmbedPlayer does not call onProgressUpdate when prop is undefined", () => {
    // Should not throw even when onProgressUpdate is omitted
    expect(() =>
      render(
        <VideoPlayer
          {...defaultProps}
          url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          onProgressUpdate={undefined}
        />
      )
    ).not.toThrow();
  });
});

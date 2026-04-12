import { render, screen, fireEvent, waitFor, act, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock Clerk auth
vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ getToken: vi.fn().mockResolvedValue("test-token") }),
}));

// Mock the API_URL
vi.mock("@/lib/api/fetch", () => ({
  API_URL: "http://localhost:8080/app",
}));

import { VideoUploader } from "./video-uploader";

const defaultProps = {
  value: "",
  source: null as null,
  onChange: vi.fn(),
};

describe("VideoUploader — URL tab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders URL and Upload tabs", () => {
    render(<VideoUploader {...defaultProps} />);
    expect(screen.getByRole("tab", { name: /url/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /upload file/i })).toBeInTheDocument();
  });

  it("calls onChange with detected youtube source", () => {
    const onChange = vi.fn();
    render(<VideoUploader {...defaultProps} onChange={onChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, {
      target: { value: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    });

    expect(onChange).toHaveBeenCalledWith(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "youtube"
    );
  });

  it("calls onChange with detected vimeo source", () => {
    const onChange = vi.fn();
    render(<VideoUploader {...defaultProps} onChange={onChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, {
      target: { value: "https://vimeo.com/123456789" },
    });

    expect(onChange).toHaveBeenCalledWith("https://vimeo.com/123456789", "vimeo");
  });

  it("calls onChange with bunny source for mediadelivery URLs", () => {
    const onChange = vi.fn();
    render(<VideoUploader {...defaultProps} onChange={onChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, {
      target: { value: "https://iframe.mediadelivery.net/embed/634749/abc123" },
    });

    expect(onChange).toHaveBeenCalledWith(
      "https://iframe.mediadelivery.net/embed/634749/abc123",
      "bunny"
    );
  });

  it("calls onChange with bunny source for b-cdn.net URLs", () => {
    const onChange = vi.fn();
    render(<VideoUploader {...defaultProps} onChange={onChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, {
      target: { value: "https://vz-abc.b-cdn.net/video/playlist.m3u8" },
    });

    expect(onChange).toHaveBeenCalledWith(
      "https://vz-abc.b-cdn.net/video/playlist.m3u8",
      "bunny"
    );
  });

  it("calls onChange with external source for unknown URLs", () => {
    const onChange = vi.fn();
    render(<VideoUploader {...defaultProps} onChange={onChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, {
      target: { value: "https://example.com/video.mp4" },
    });

    expect(onChange).toHaveBeenCalledWith("https://example.com/video.mp4", "external");
  });
});

// Helper: switch to Upload tab and wait for the drop zone to be visible.
// Uses userEvent (pointer events) because Radix UI Tabs requires a full click sequence.
// Returns the hidden file input once the tab content is mounted.
async function switchToUploadTab(): Promise<HTMLInputElement> {
  const user = userEvent.setup();
  await user.click(screen.getByRole("tab", { name: /upload file/i }));
  // Query with { hidden: true } because the file input is aria-hidden
  const panel = screen.getByRole("tabpanel");
  await waitFor(() => {
    expect(within(panel).getByRole("button", { name: /upload video file/i })).toBeInTheDocument();
  });
  return panel.querySelector('input[type="file"]') as HTMLInputElement;
}

describe("VideoUploader — Upload tab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("shows drop zone when idle", async () => {
    render(<VideoUploader {...defaultProps} />);
    await switchToUploadTab();
    expect(screen.getByText(/drop a video file here/i)).toBeInTheDocument();
  });

  it("shows error when file exceeds 500 MB", async () => {
    render(<VideoUploader {...defaultProps} />);
    const input = await switchToUploadTab();

    const oversizedFile = new File(["x"], "big.mp4", { type: "video/mp4" });
    Object.defineProperty(oversizedFile, "size", { value: 501 * 1024 * 1024 });
    fireEvent.change(input, { target: { files: [oversizedFile] } });

    expect(screen.getByText(/exceeds 500 mb limit/i)).toBeInTheDocument();
  });

  it("does NOT call onChange when file exceeds 500 MB", async () => {
    const onChange = vi.fn();
    render(<VideoUploader {...defaultProps} onChange={onChange} />);
    const input = await switchToUploadTab();

    const oversizedFile = new File(["x"], "big.mp4", { type: "video/mp4" });
    Object.defineProperty(oversizedFile, "size", { value: 501 * 1024 * 1024 });
    fireEvent.change(input, { target: { files: [oversizedFile] } });

    expect(onChange).not.toHaveBeenCalled();
  });

  it("shows 'Try again' button after size-limit error", async () => {
    render(<VideoUploader {...defaultProps} />);
    const input = await switchToUploadTab();

    const oversizedFile = new File(["x"], "big.mp4", { type: "video/mp4" });
    Object.defineProperty(oversizedFile, "size", { value: 501 * 1024 * 1024 });
    fireEvent.change(input, { target: { files: [oversizedFile] } });

    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("cancel button aborts the XHR upload", async () => {
    const abortMock = vi.fn();
    // Use a proper class constructor so `new XMLHttpRequest()` works in JSDOM
    class MockXHR {
      open = vi.fn();
      send = vi.fn();
      abort = abortMock;
      setRequestHeader = vi.fn();
      status = 0;
      responseText = "";
      upload = { addEventListener: vi.fn() };
      addEventListener = vi.fn();
    }
    vi.stubGlobal("XMLHttpRequest", MockXHR);

    render(<VideoUploader {...defaultProps} />);
    const input = await switchToUploadTab();

    const user = userEvent.setup();
    const smallFile = new File(["data"], "lecture.mp4", { type: "video/mp4" });
    Object.defineProperty(smallFile, "size", { value: 10 * 1024 * 1024 });
    fireEvent.change(input, { target: { files: [smallFile] } });

    await waitFor(() => screen.getByRole("button", { name: /cancel upload/i }), { timeout: 3000 });
    await user.click(screen.getByRole("button", { name: /cancel upload/i }));
    expect(abortMock).toHaveBeenCalledTimes(1);
  });

  it("calls onChange with cdn_url and 'bunny' source after successful upload", async () => {
    const onChange = vi.fn();
    const cdnUrl = "https://iframe.mediadelivery.net/embed/634749/vid-success";
    const eventHandlers: Record<string, ((e?: unknown) => void)> = {};

    class MockXHR {
      open = vi.fn();
      send = vi.fn();
      abort = vi.fn();
      setRequestHeader = vi.fn();
      status = 200;
      responseText = JSON.stringify({ data: { cdn_url: cdnUrl } });
      upload = { addEventListener: vi.fn() };
      addEventListener = vi.fn((event: string, handler: (e?: unknown) => void) => {
        eventHandlers[event] = handler;
      });
    }
    vi.stubGlobal("XMLHttpRequest", MockXHR);

    render(<VideoUploader {...defaultProps} onChange={onChange} />);
    const input = await switchToUploadTab();

    const file = new File(["data"], "class.mp4", { type: "video/mp4" });
    Object.defineProperty(file, "size", { value: 10 * 1024 * 1024 });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(eventHandlers["load"]).toBeDefined(), { timeout: 3000 });
    await act(async () => { eventHandlers["load"]?.(); });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(cdnUrl, "bunny");
    });
  });

  it("shows transcoding message in done state", async () => {
    const cdnUrl = "https://iframe.mediadelivery.net/embed/634749/vid-done";
    const eventHandlers: Record<string, ((e?: unknown) => void)> = {};

    class MockXHR {
      open = vi.fn();
      send = vi.fn();
      abort = vi.fn();
      setRequestHeader = vi.fn();
      status = 200;
      responseText = JSON.stringify({ data: { cdn_url: cdnUrl } });
      upload = { addEventListener: vi.fn() };
      addEventListener = vi.fn((event: string, handler: (e?: unknown) => void) => {
        eventHandlers[event] = handler;
      });
    }
    vi.stubGlobal("XMLHttpRequest", MockXHR);

    render(<VideoUploader {...defaultProps} />);
    const input = await switchToUploadTab();

    const file = new File(["data"], "class.mp4", { type: "video/mp4" });
    Object.defineProperty(file, "size", { value: 8 * 1024 * 1024 });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(eventHandlers["load"]).toBeDefined(), { timeout: 3000 });
    await act(async () => { eventHandlers["load"]?.(); });

    await waitFor(() => {
      expect(screen.getByText(/transcoding to HLS/i)).toBeInTheDocument();
    });
  });

  it("shows network error message on XHR error event", async () => {
    const eventHandlers: Record<string, ((e?: unknown) => void)> = {};

    class MockXHR {
      open = vi.fn();
      send = vi.fn();
      abort = vi.fn();
      setRequestHeader = vi.fn();
      status = 0;
      responseText = "";
      upload = { addEventListener: vi.fn() };
      addEventListener = vi.fn((event: string, handler: (e?: unknown) => void) => {
        eventHandlers[event] = handler;
      });
    }
    vi.stubGlobal("XMLHttpRequest", MockXHR);

    render(<VideoUploader {...defaultProps} />);
    const input = await switchToUploadTab();

    const file = new File(["data"], "class.mp4", { type: "video/mp4" });
    Object.defineProperty(file, "size", { value: 5 * 1024 * 1024 });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(eventHandlers["error"]).toBeDefined(), { timeout: 3000 });
    await act(async () => { eventHandlers["error"]?.(); });

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it("upload drop zone is keyboard-accessible (tabIndex=0)", async () => {
    render(<VideoUploader {...defaultProps} />);
    await switchToUploadTab();
    const dropZone = screen.getByRole("button", { name: /upload video file/i });
    expect(dropZone).toHaveAttribute("tabindex", "0");
  });

  it("URL input has aria-label matching the label prop", () => {
    render(<VideoUploader {...defaultProps} label="Lecture Video" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-label", "Lecture Video");
  });
});

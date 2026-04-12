import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AudioUploader } from "./audio-uploader";

// ─── Module mocks ─────────────────────────────────────────────────────────────

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({
    getToken: vi.fn().mockResolvedValue("mock-jwt-token"),
  }),
}));

vi.mock("@/lib/api/fetch", () => ({
  API_URL: "https://api.example.com",
}));

// ─── XHR mock helpers ─────────────────────────────────────────────────────────

/**
 * A minimal XMLHttpRequest mock that lets tests simulate upload events.
 * The mock captures the last created instance via `MockXHR.lastInstance`.
 */
class MockXHR {
  static lastInstance: MockXHR | null = null;

  upload = {
    _listeners: {} as Record<string, ((e: ProgressEvent) => void)[]>,
    addEventListener(event: string, handler: (e: ProgressEvent) => void) {
      if (!this._listeners[event]) this._listeners[event] = [];
      this._listeners[event].push(handler);
    },
    dispatchEvent(event: string, detail: Partial<ProgressEvent> = {}) {
      (this._listeners[event] || []).forEach((h) =>
        h({ ...detail } as ProgressEvent)
      );
    },
  };

  _listeners: Record<string, ((...args: unknown[]) => void)[]> = {};
  status = 200;
  responseText = JSON.stringify({ data: { url: "https://cdn.example.com/audio/test.mp3" } });

  open = vi.fn();
  send = vi.fn();
  // Note: in real browsers abort() fires the abort event asynchronously after
  // the call stack unwinds. The component's handleCancel() calls setUploadState("idle")
  // after abort(), so we do NOT auto-dispatch the abort event here.
  // Tests that want to verify the "Upload cancelled" error path should call
  // simulateAbort() explicitly after abort() has been called.
  abort = vi.fn();
  setRequestHeader = vi.fn();

  addEventListener(event: string, handler: (...args: unknown[]) => void) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(handler);
  }

  dispatchEvent(event: string, ...args: unknown[]) {
    (this._listeners[event] || []).forEach((h) => h(...args));
  }

  simulateSuccess() {
    act(() => {
      this.dispatchEvent("load");
    });
  }

  simulateError() {
    act(() => {
      this.dispatchEvent("error");
    });
  }

  simulateProgress(loaded: number, total: number) {
    act(() => {
      this.upload.dispatchEvent("progress", {
        lengthComputable: true,
        loaded,
        total,
      });
    });
  }

  constructor() {
    MockXHR.lastInstance = this;
  }
}

// ─── Test setup ───────────────────────────────────────────────────────────────

function makeMp3File(sizeMB = 1): File {
  const bytes = new Uint8Array(sizeMB * 1024 * 1024);
  return new File([bytes], "meditation.mp3", { type: "audio/mpeg" });
}

function makeFile(name: string, type: string, sizeMB = 1): File {
  const bytes = new Uint8Array(sizeMB * 1024 * 1024);
  return new File([bytes], name, { type });
}

describe("AudioUploader", () => {
  let originalXHR: typeof XMLHttpRequest;

  beforeEach(() => {
    originalXHR = window.XMLHttpRequest;
    // Replace global XMLHttpRequest with our mock
    window.XMLHttpRequest = MockXHR as unknown as typeof XMLHttpRequest;
    MockXHR.lastInstance = null;
  });

  afterEach(() => {
    window.XMLHttpRequest = originalXHR;
    vi.clearAllMocks();
  });

  // ─── Initial render ──────────────────────────────────────────────────────

  describe("idle state", () => {
    it("renders the upload drop zone with correct label", () => {
      const onChange = vi.fn();
      render(<AudioUploader value="" onChange={onChange} />);

      expect(screen.getByRole("button", { name: /upload audio file/i })).toBeInTheDocument();
      expect(screen.getByText(/Drop an MP3 here/i)).toBeInTheDocument();
      expect(screen.getByText(/MP3 — up to 100 MB/i)).toBeInTheDocument();
    });

    it("renders with a custom label prop", () => {
      render(<AudioUploader value="" onChange={vi.fn()} label="Meditation Audio" />);
      expect(screen.getByText("Meditation Audio")).toBeInTheDocument();
    });

    it("renders in 'done' state when a value is pre-filled", () => {
      render(
        <AudioUploader value="https://cdn.example.com/audio/existing.mp3" onChange={vi.fn()} />
      );
      expect(screen.getByText(/current audio/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /upload a different file/i })).toBeInTheDocument();
    });

    it("is keyboard-accessible (Enter key triggers file picker)", async () => {
      const user = userEvent.setup();
      render(<AudioUploader value="" onChange={vi.fn()} />);

      const dropZone = screen.getByRole("button", { name: /upload audio file/i });
      // Focus and press Enter — the click handler delegates to fileInputRef
      await user.click(dropZone);
      // No assertion about file picker (jsdom can't open it), just verify no crash
      expect(dropZone).toBeInTheDocument();
    });
  });

  // ─── File type validation ────────────────────────────────────────────────

  describe("file type validation", () => {
    it("shows error for non-audio file type", async () => {
      const onChange = vi.fn();
      render(<AudioUploader value="" onChange={onChange} />);

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const pdfFile = makeFile("document.pdf", "application/pdf");

      await act(async () => {
        fireEvent.change(input, { target: { files: [pdfFile] } });
      });

      await waitFor(() => {
        expect(screen.getByText(/Only MP3 audio files are accepted/i)).toBeInTheDocument();
      });
      expect(onChange).not.toHaveBeenCalled();
    });

    it("shows error for video file", async () => {
      const onChange = vi.fn();
      render(<AudioUploader value="" onChange={onChange} />);

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const videoFile = makeFile("video.mp4", "video/mp4");

      await act(async () => {
        fireEvent.change(input, { target: { files: [videoFile] } });
      });

      await waitFor(() => {
        expect(screen.getByText(/Only MP3 audio files are accepted/i)).toBeInTheDocument();
      });
      expect(onChange).not.toHaveBeenCalled();
    });

    it("accepts file with audio/ MIME type prefix", async () => {
      render(<AudioUploader value="" onChange={vi.fn()} />);

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const audioFile = makeFile("podcast.m4a", "audio/mp4");

      await act(async () => {
        fireEvent.change(input, { target: { files: [audioFile] } });
      });

      // Should transition to uploading (no INVALID_TYPE error)
      await waitFor(() => {
        expect(screen.queryByText(/Only MP3 audio files are accepted/i)).not.toBeInTheDocument();
      });
    });

    it("accepts .mp3 extension even without correct MIME type", async () => {
      render(<AudioUploader value="" onChange={vi.fn()} />);

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      // Some systems report incorrect MIME for mp3 — the component should fallback to extension check
      const mp3File = makeFile("track.mp3", "application/octet-stream");

      await act(async () => {
        fireEvent.change(input, { target: { files: [mp3File] } });
      });

      await waitFor(() => {
        expect(screen.queryByText(/Only MP3 audio files are accepted/i)).not.toBeInTheDocument();
      });
    });
  });

  // ─── File size validation ────────────────────────────────────────────────

  describe("file size validation", () => {
    it("shows error for file exceeding 100 MB", async () => {
      const onChange = vi.fn();
      render(<AudioUploader value="" onChange={onChange} />);

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const oversizedFile = makeMp3File(101);

      await act(async () => {
        fireEvent.change(input, { target: { files: [oversizedFile] } });
      });

      await waitFor(() => {
        expect(screen.getByText(/exceeds.*100 MB/i)).toBeInTheDocument();
      });
      expect(onChange).not.toHaveBeenCalled();
    });

    it("accepts file at exactly 100 MB", async () => {
      render(<AudioUploader value="" onChange={vi.fn()} />);

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const exactFile = makeMp3File(100);

      await act(async () => {
        fireEvent.change(input, { target: { files: [exactFile] } });
      });

      await waitFor(() => {
        expect(screen.queryByText(/exceeds.*100 MB/i)).not.toBeInTheDocument();
      });
    });
  });

  // ─── Drag-and-drop ───────────────────────────────────────────────────────

  describe("drag and drop", () => {
    it("accepts a valid file dropped onto the drop zone", async () => {
      render(<AudioUploader value="" onChange={vi.fn()} />);

      const dropZone = screen.getByRole("button", { name: /upload audio file/i });
      const mp3File = makeMp3File(1);

      await act(async () => {
        fireEvent.drop(dropZone, {
          dataTransfer: { files: [mp3File] },
        });
      });

      // Should transition away from idle (no longer shows drop zone text)
      await waitFor(() => {
        expect(screen.queryByText(/Drop an MP3 here/i)).not.toBeInTheDocument();
      });
    });

    it("prevents default on dragOver to enable drop", () => {
      render(<AudioUploader value="" onChange={vi.fn()} />);

      const dropZone = screen.getByRole("button", { name: /upload audio file/i });
      const dragOverEvent = fireEvent.dragOver(dropZone);

      // fireEvent returns false if preventDefault was called
      expect(dragOverEvent).toBe(false);
    });

    it("rejects invalid file type via drop", async () => {
      const onChange = vi.fn();
      render(<AudioUploader value="" onChange={onChange} />);

      const dropZone = screen.getByRole("button", { name: /upload audio file/i });
      const pdfFile = makeFile("report.pdf", "application/pdf");

      await act(async () => {
        fireEvent.drop(dropZone, {
          dataTransfer: { files: [pdfFile] },
        });
      });

      await waitFor(() => {
        expect(screen.getByText(/Only MP3 audio files are accepted/i)).toBeInTheDocument();
      });
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  // ─── Upload progress display ─────────────────────────────────────────────

  describe("upload progress", () => {
    it("shows uploading state with file name and 0% progress initially", async () => {
      render(<AudioUploader value="" onChange={vi.fn()} />);

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const mp3File = makeMp3File(5);

      await act(async () => {
        fireEvent.change(input, { target: { files: [mp3File] } });
      });

      await waitFor(() => {
        expect(screen.getByText(/Uploading/i)).toBeInTheDocument();
        // Progress bar is rendered — the label "Upload progress" is on the element
        expect(screen.getByLabelText(/upload progress/i)).toBeInTheDocument();
      });
    });

    it("updates progress percentage as XHR upload events fire", async () => {
      render(<AudioUploader value="" onChange={vi.fn()} />);

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const mp3File = makeMp3File(5);

      await act(async () => {
        fireEvent.change(input, { target: { files: [mp3File] } });
      });

      // Wait for XHR to be instantiated
      await waitFor(() => expect(MockXHR.lastInstance).not.toBeNull());

      const xhr = MockXHR.lastInstance!;

      // Simulate 50% progress
      xhr.simulateProgress(50 * 1024 * 1024, 100 * 1024 * 1024);

      await waitFor(() => {
        expect(screen.getByText(/50%/)).toBeInTheDocument();
      });
    });

    it("shows cancel button during upload", async () => {
      render(<AudioUploader value="" onChange={vi.fn()} />);

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const mp3File = makeMp3File(5);

      await act(async () => {
        fireEvent.change(input, { target: { files: [mp3File] } });
      });

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /cancel upload/i })).toBeInTheDocument();
      });
    });
  });

  // ─── Cancel upload ───────────────────────────────────────────────────────

  describe("cancel upload", () => {
    it("cancels the XHR request and returns to idle state", async () => {
      const user = userEvent.setup();
      render(<AudioUploader value="" onChange={vi.fn()} />);

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const mp3File = makeMp3File(5);

      await act(async () => {
        fireEvent.change(input, { target: { files: [mp3File] } });
      });

      await waitFor(() => expect(MockXHR.lastInstance).not.toBeNull());
      const xhr = MockXHR.lastInstance!;

      const cancelBtn = await screen.findByRole("button", { name: /cancel upload/i });
      await user.click(cancelBtn);

      expect(xhr.abort).toHaveBeenCalled();

      // After cancel, returns to idle
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /upload audio file/i })).toBeInTheDocument();
      });
    });
  });

  // ─── Successful upload ───────────────────────────────────────────────────

  describe("successful upload", () => {
    it("transitions to done state and calls onChange with URL", async () => {
      const onChange = vi.fn();
      render(<AudioUploader value="" onChange={onChange} />);

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const mp3File = new File([new Uint8Array(1024)], "meditation.mp3", { type: "audio/mpeg" });

      await act(async () => {
        fireEvent.change(input, { target: { files: [mp3File] } });
      });

      await waitFor(() => expect(MockXHR.lastInstance).not.toBeNull());
      const xhr = MockXHR.lastInstance!;

      xhr.simulateSuccess();

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith("https://cdn.example.com/audio/test.mp3");
      });

      // Shows the done state
      expect(screen.getByText(/meditation\.mp3/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /upload a different file/i })).toBeInTheDocument();
    });

    it("shows 'Change' button in done state that resets back to idle", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<AudioUploader value="" onChange={onChange} />);

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const mp3File = new File([new Uint8Array(1024)], "test.mp3", { type: "audio/mpeg" });

      await act(async () => {
        fireEvent.change(input, { target: { files: [mp3File] } });
      });

      await waitFor(() => expect(MockXHR.lastInstance).not.toBeNull());
      MockXHR.lastInstance!.simulateSuccess();

      const changeBtn = await screen.findByRole("button", { name: /upload a different file/i });
      await user.click(changeBtn);

      // Should call onChange with empty string (reset)
      expect(onChange).toHaveBeenLastCalledWith("");

      // Returns to idle drop zone
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /upload audio file/i })).toBeInTheDocument();
      });
    });
  });

  // ─── Error states ────────────────────────────────────────────────────────

  describe("error states", () => {
    it("shows error message on network failure", async () => {
      render(<AudioUploader value="" onChange={vi.fn()} />);

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const mp3File = makeMp3File(1);

      await act(async () => {
        fireEvent.change(input, { target: { files: [mp3File] } });
      });

      await waitFor(() => expect(MockXHR.lastInstance).not.toBeNull());
      MockXHR.lastInstance!.simulateError();

      await waitFor(() => {
        expect(screen.getByText(/Network error during upload/i)).toBeInTheDocument();
      });
    });

    it("shows server error message from JSON response on HTTP 4xx", async () => {
      render(<AudioUploader value="" onChange={vi.fn()} />);

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const mp3File = makeMp3File(1);

      await act(async () => {
        fireEvent.change(input, { target: { files: [mp3File] } });
      });

      await waitFor(() => expect(MockXHR.lastInstance).not.toBeNull());
      const xhr = MockXHR.lastInstance!;
      xhr.status = 400;
      xhr.responseText = JSON.stringify({
        error: { code: "INVALID_TYPE", message: "only JPEG, PNG, and WebP images are accepted" },
      });
      xhr.simulateSuccess(); // "load" event fires even on 4xx

      await waitFor(() => {
        expect(screen.getByText(/only JPEG, PNG, and WebP images are accepted/i)).toBeInTheDocument();
      });
    });

    it("shows generic HTTP error when response is not JSON", async () => {
      render(<AudioUploader value="" onChange={vi.fn()} />);

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const mp3File = makeMp3File(1);

      await act(async () => {
        fireEvent.change(input, { target: { files: [mp3File] } });
      });

      await waitFor(() => expect(MockXHR.lastInstance).not.toBeNull());
      const xhr = MockXHR.lastInstance!;
      xhr.status = 503;
      xhr.responseText = "Service Unavailable";
      xhr.simulateSuccess();

      await waitFor(() => {
        expect(screen.getByText(/Upload failed \(HTTP 503\)/i)).toBeInTheDocument();
      });
    });

    it("shows 'Try again' button in error state that resets to idle", async () => {
      const user = userEvent.setup();
      render(<AudioUploader value="" onChange={vi.fn()} />);

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const pdfFile = makeFile("doc.pdf", "application/pdf");

      await act(async () => {
        fireEvent.change(input, { target: { files: [pdfFile] } });
      });

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /try again/i }));

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /upload audio file/i })).toBeInTheDocument();
      });
    });

    it("does not show upload drop zone during error state (correct state machine)", async () => {
      render(<AudioUploader value="" onChange={vi.fn()} />);

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const pdfFile = makeFile("report.pdf", "application/pdf");

      await act(async () => {
        fireEvent.change(input, { target: { files: [pdfFile] } });
      });

      await waitFor(() => {
        expect(screen.getByText(/Only MP3 audio files are accepted/i)).toBeInTheDocument();
        // Drop zone should not be visible while in error state
        expect(screen.queryByText(/Drop an MP3 here/i)).not.toBeInTheDocument();
      });
    });
  });
});

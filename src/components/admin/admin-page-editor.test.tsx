import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "@/test/test-utils";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock VideoUploader
vi.mock("@/components/admin/video-uploader", () => ({
  VideoUploader: ({
    value,
    onChange,
    label,
  }: {
    value: string;
    source: string | null;
    onChange: (url: string, source: string) => void;
    label?: string;
  }) => (
    <div data-testid="video-uploader">
      <label htmlFor="mock-video-url">{label || "Video URL"}</label>
      <input
        id="mock-video-url"
        data-testid="video-url-input"
        value={value}
        onChange={(e) => onChange(e.target.value, "external")}
      />
    </div>
  ),
}));

// Mock AudioUploader
vi.mock("@/components/admin/audio-uploader", () => ({
  AudioUploader: ({
    value,
    onChange,
    label,
  }: {
    value: string;
    onChange: (url: string) => void;
    label?: string;
  }) => (
    <div data-testid="audio-uploader">
      <label htmlFor="mock-audio-url">{label || "Audio File"}</label>
      <input
        id="mock-audio-url"
        data-testid="audio-url-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  ),
}));

import { AdminPageEditor } from "./admin-page-editor";

describe("AdminPageEditor", () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSave.mockResolvedValue(undefined);
  });

  describe("common fields", () => {
    it("renders title input", () => {
      renderWithProviders(
        <AdminPageEditor
          pageType="video"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          saving={false}
        />
      );
      expect(screen.getByLabelText(/Title/)).toBeInTheDocument();
    });

    it("renders strict/optional toggle defaulting to strict", () => {
      renderWithProviders(
        <AdminPageEditor
          pageType="video"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          saving={false}
        />
      );
      expect(
        screen.getByLabelText(
          "Mark page as strict (required for progression)"
        )
      ).toBeInTheDocument();
      expect(screen.getByText(/Strict/)).toBeInTheDocument();
    });

    it("renders save and cancel buttons", () => {
      renderWithProviders(
        <AdminPageEditor
          pageType="video"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          saving={false}
        />
      );
      expect(screen.getByText("Save Page")).toBeInTheDocument();
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });

    it("save button shows 'Saving...' when saving", () => {
      renderWithProviders(
        <AdminPageEditor
          pageType="video"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          saving={true}
        />
      );
      expect(screen.getByText("Saving...")).toBeInTheDocument();
    });

    it("clicking cancel calls onCancel", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <AdminPageEditor
          pageType="video"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          saving={false}
        />
      );
      await user.click(screen.getByText("Cancel"));
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe("video page type", () => {
    it("renders video-specific fields: video uploader and summary", () => {
      renderWithProviders(
        <AdminPageEditor
          pageType="video"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          saving={false}
        />
      );
      expect(screen.getByTestId("video-uploader")).toBeInTheDocument();
      expect(screen.getByLabelText(/Summary/)).toBeInTheDocument();
    });

    it("validates title is required on submit", async () => {
      const { toast } = await import("sonner");
      renderWithProviders(
        <AdminPageEditor
          pageType="video"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          saving={false}
        />
      );

      // Submit by dispatching the form submit event directly
      // (bypasses HTML5 required constraint which jsdom doesn't fully enforce)
      const form = screen.getByText("Save Page").closest("form")!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Title is required");
      });
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it("validates video URL is required on submit", async () => {
      const { toast } = await import("sonner");
      const user = userEvent.setup();
      renderWithProviders(
        <AdminPageEditor
          pageType="video"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          saving={false}
        />
      );

      await user.type(screen.getByLabelText(/Title/), "My Video Page");

      const form = screen.getByText("Save Page").closest("form")!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Video URL is required");
      });
    });

    it("validates summary is required on submit", async () => {
      const { toast } = await import("sonner");
      const user = userEvent.setup();
      renderWithProviders(
        <AdminPageEditor
          pageType="video"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          saving={false}
        />
      );

      await user.type(screen.getByLabelText(/Title/), "My Video Page");
      await user.type(
        screen.getByTestId("video-url-input"),
        "https://youtube.com/watch?v=abc"
      );

      const form = screen.getByText("Save Page").closest("form")!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Summary is required");
      });
    });

    it("calls onSave with correct payload for video page", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <AdminPageEditor
          pageType="video"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          saving={false}
        />
      );

      await user.type(screen.getByLabelText(/Title/), "Teaching Video");
      await user.type(
        screen.getByTestId("video-url-input"),
        "https://youtube.com/watch?v=abc"
      );
      await user.type(screen.getByLabelText(/Summary/), "Key points");
      await user.click(screen.getByText("Save Page"));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          title: "Teaching Video",
          page_type: "video",
          is_strict: true,
          content: {
            video_url: "https://youtube.com/watch?v=abc",
            video_source: "external",
            summary: "Key points",
          },
        });
      });
    });
  });

  describe("introspection page type", () => {
    it("renders introspection-specific fields: verse and explanation", () => {
      renderWithProviders(
        <AdminPageEditor
          pageType="introspection"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          saving={false}
        />
      );
      expect(
        screen.getByLabelText(/Devanagari Verse/)
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/Explanation/)).toBeInTheDocument();
    });

    it("does not render video uploader for introspection", () => {
      renderWithProviders(
        <AdminPageEditor
          pageType="introspection"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          saving={false}
        />
      );
      expect(
        screen.queryByTestId("video-uploader")
      ).not.toBeInTheDocument();
    });

    it("validates verse is required", async () => {
      const { toast } = await import("sonner");
      const user = userEvent.setup();
      renderWithProviders(
        <AdminPageEditor
          pageType="introspection"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          saving={false}
        />
      );

      await user.type(
        screen.getByLabelText(/Title/),
        "Reflection Page"
      );

      const form = screen.getByText("Save Page").closest("form")!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          "Devanagari verse is required"
        );
      });
    });

    it("validates explanation is required", async () => {
      const { toast } = await import("sonner");
      const user = userEvent.setup();
      renderWithProviders(
        <AdminPageEditor
          pageType="introspection"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          saving={false}
        />
      );

      await user.type(
        screen.getByLabelText(/Title/),
        "Reflection Page"
      );
      await user.type(
        screen.getByLabelText(/Devanagari Verse/),
        "verse text"
      );

      const form = screen.getByText("Save Page").closest("form")!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          "Explanation is required"
        );
      });
    });

    it("calls onSave with correct payload for introspection page", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <AdminPageEditor
          pageType="introspection"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          saving={false}
        />
      );

      await user.type(
        screen.getByLabelText(/Title/),
        "Verse Reflection"
      );
      await user.type(
        screen.getByLabelText(/Devanagari Verse/),
        "verse text"
      );
      await user.type(
        screen.getByLabelText(/Explanation/),
        "Explanation text"
      );
      await user.click(screen.getByText("Save Page"));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          title: "Verse Reflection",
          page_type: "introspection",
          is_strict: true,
          content: {
            verse: "verse text",
            explanation: "Explanation text",
          },
        });
      });
    });

    it("verse textarea has lang='sa' for Devanagari input", () => {
      renderWithProviders(
        <AdminPageEditor
          pageType="introspection"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          saving={false}
        />
      );
      const verseTextarea = screen.getByLabelText(/Devanagari Verse/);
      expect(verseTextarea).toHaveAttribute("lang", "sa");
    });
  });

  describe("meditation page type", () => {
    it("renders meditation-specific fields: description (optional) and audio uploader", () => {
      renderWithProviders(
        <AdminPageEditor
          pageType="meditation"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          saving={false}
        />
      );
      expect(
        screen.getByLabelText(/Description \(optional\)/)
      ).toBeInTheDocument();
      expect(screen.getByTestId("audio-uploader")).toBeInTheDocument();
    });

    it("validates audio file is required for meditation", async () => {
      const { toast } = await import("sonner");
      const user = userEvent.setup();
      renderWithProviders(
        <AdminPageEditor
          pageType="meditation"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          saving={false}
        />
      );

      await user.type(screen.getByLabelText(/Title/), "Meditation");

      const form = screen.getByText("Save Page").closest("form")!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Audio file is required");
      });
    });

    it("calls onSave with correct payload for meditation page (no description)", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <AdminPageEditor
          pageType="meditation"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          saving={false}
        />
      );

      await user.type(screen.getByLabelText(/Title/), "Evening Meditation");
      await user.type(
        screen.getByTestId("audio-url-input"),
        "https://cdn.example.com/audio/meditation.mp3"
      );
      await user.click(screen.getByText("Save Page"));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          title: "Evening Meditation",
          page_type: "meditation",
          is_strict: true,
          content: {
            audio_url: "https://cdn.example.com/audio/meditation.mp3",
            description: undefined,
          },
        });
      });
    });
  });

  describe("strict/optional toggle", () => {
    it("toggling switch changes label from Strict to Optional", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <AdminPageEditor
          pageType="video"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          saving={false}
        />
      );

      expect(
        screen.getByText(/Strict.*Students must complete/)
      ).toBeInTheDocument();

      const toggle = screen.getByLabelText(
        "Mark page as strict (required for progression)"
      );
      await user.click(toggle);

      expect(
        screen.getByText(/Optional.*Students can skip/)
      ).toBeInTheDocument();
    });
  });
});

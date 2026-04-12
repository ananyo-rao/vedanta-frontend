import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "@/test/test-utils";

const mockPush = vi.fn();
const mockCreateMutateAsync = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/hooks/use-courses-admin", () => ({
  useCreateCourse: () => ({
    mutateAsync: mockCreateMutateAsync,
    isPending: false,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock the CourseIntroForm to simplify testing
vi.mock("@/components/admin/course-intro-form", () => ({
  CourseIntroForm: ({
    onSave,
    saving,
  }: {
    onSave: (data: Record<string, unknown>) => Promise<void>;
    saving: boolean;
  }) => (
    <form
      data-testid="course-intro-form"
      onSubmit={async (e) => {
        e.preventDefault();
        await onSave({
          title: "Test Course",
          description: "Test Description",
        });
      }}
    >
      <button type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save Draft"}
      </button>
    </form>
  ),
}));

import { NewCourseForm } from "./new-course-form";

describe("NewCourseForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateMutateAsync.mockResolvedValue({ id: "new-course-1" });
  });

  it("renders the 'New Course' heading", () => {
    renderWithProviders(<NewCourseForm />);
    expect(screen.getByText("New Course")).toBeInTheDocument();
  });

  it("renders 'Back' link to course list", () => {
    renderWithProviders(<NewCourseForm />);
    expect(
      screen.getByLabelText("Back to course list")
    ).toBeInTheDocument();
  });

  it("renders the course intro form", () => {
    renderWithProviders(<NewCourseForm />);
    expect(screen.getByTestId("course-intro-form")).toBeInTheDocument();
  });

  it("submitting form creates course and navigates to editor", async () => {
    const user = userEvent.setup();
    renderWithProviders(<NewCourseForm />);

    await user.click(screen.getByText("Save Draft"));

    await waitFor(() => {
      expect(mockCreateMutateAsync).toHaveBeenCalledWith({
        title: "Test Course",
        description: "Test Description",
      });
      expect(mockPush).toHaveBeenCalledWith(
        "/app/admin/course-builder/new-course-1"
      );
    });
  });

  it("shows error toast on creation failure", async () => {
    const { toast } = await import("sonner");
    mockCreateMutateAsync.mockRejectedValue(
      new Error("Server error")
    );
    const user = userEvent.setup();
    renderWithProviders(<NewCourseForm />);

    await user.click(screen.getByText("Save Draft"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Server error");
    });
  });

  it("'Back' link points to /app/admin/course-builder", () => {
    renderWithProviders(<NewCourseForm />);
    const backLink = screen.getByLabelText("Back to course list");
    expect(backLink.closest("a")).toHaveAttribute(
      "href",
      "/app/admin/course-builder"
    );
  });
});

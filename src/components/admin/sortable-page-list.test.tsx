import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "@/test/test-utils";
import type { CoursePage } from "@/types/course";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock AdminPageEditor
vi.mock("@/components/admin/admin-page-editor", () => ({
  AdminPageEditor: ({
    onCancel,
  }: {
    onCancel: () => void;
  }) => (
    <div data-testid="page-editor">
      <button onClick={onCancel}>Cancel Edit</button>
    </div>
  ),
}));

// Mock ConfirmDialog
vi.mock("@/components/admin/confirm-dialog", () => ({
  ConfirmDialog: ({
    open,
    onOpenChange,
    onConfirm,
  }: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
  }) =>
    open ? (
      <div data-testid="confirm-dialog">
        <button onClick={onConfirm}>Confirm Delete</button>
        <button onClick={() => onOpenChange(false)}>Cancel Delete</button>
      </div>
    ) : null,
}));

import { SortablePageList } from "./sortable-page-list";

describe("SortablePageList", () => {
  const mockPages: CoursePage[] = [
    {
      id: "p1",
      course_id: "c1",
      title: "Introduction Video",
      page_type: "video",
      sort_order: 1,
      is_strict: true,
      content: {
        video_url: "https://youtube.com/watch?v=abc",
        video_source: "youtube",
        summary: "Summary",
      },
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    },
    {
      id: "p2",
      course_id: "c1",
      title: "Verse Reflection",
      page_type: "introspection",
      sort_order: 2,
      is_strict: true,
      content: {
        verse: "verse",
        explanation: "explanation",
      },
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    },
    {
      id: "p3",
      course_id: "c1",
      title: "Guided Meditation",
      page_type: "meditation",
      sort_order: 3,
      is_strict: false,
      content: {
        video_url: "https://vimeo.com/123",
        video_source: "vimeo",
      },
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    },
  ];

  const defaultProps = {
    pages: mockPages,
    onReorder: vi.fn().mockResolvedValue(undefined),
    onUpdatePage: vi.fn().mockResolvedValue(undefined),
    onDeletePage: vi.fn().mockResolvedValue(undefined),
    savingPageId: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state when no pages", () => {
    renderWithProviders(
      <SortablePageList {...defaultProps} pages={[]} />
    );
    expect(
      screen.getByText(
        "No pages added yet. Click + Add Page to begin building your course."
      )
    ).toBeInTheDocument();
  });

  it("renders all pages in order", () => {
    renderWithProviders(<SortablePageList {...defaultProps} />);
    expect(screen.getByText("Introduction Video")).toBeInTheDocument();
    expect(screen.getByText("Verse Reflection")).toBeInTheDocument();
    expect(screen.getByText("Guided Meditation")).toBeInTheDocument();
  });

  it("shows page numbers", () => {
    renderWithProviders(<SortablePageList {...defaultProps} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("shows strict/optional badges", () => {
    renderWithProviders(<SortablePageList {...defaultProps} />);
    const strictBadges = screen.getAllByText("Strict");
    expect(strictBadges.length).toBe(2);
    expect(screen.getByText("Optional")).toBeInTheDocument();
  });

  it("shows page type icon labels", () => {
    renderWithProviders(<SortablePageList {...defaultProps} />);
    expect(screen.getByLabelText("Video page")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Introspection page")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Meditation page")).toBeInTheDocument();
  });

  it("renders drag handle for each page", () => {
    renderWithProviders(<SortablePageList {...defaultProps} />);
    const handles = screen.getAllByLabelText("Drag to reorder");
    expect(handles.length).toBe(3);
  });

  it("renders edit button for each page", () => {
    renderWithProviders(<SortablePageList {...defaultProps} />);
    expect(
      screen.getByLabelText("Edit page: Introduction Video")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Edit page: Verse Reflection")
    ).toBeInTheDocument();
  });

  it("renders overflow menu for each page", () => {
    renderWithProviders(<SortablePageList {...defaultProps} />);
    const menuBtns = screen.getAllByLabelText(/Actions for/);
    expect(menuBtns.length).toBe(3);
  });

  it("clicking page title opens editor", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SortablePageList {...defaultProps} />);

    await user.click(
      screen.getByLabelText("Edit page: Introduction Video")
    );

    expect(screen.getByTestId("page-editor")).toBeInTheDocument();
  });

  it("clicking Delete in overflow menu shows confirm dialog", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SortablePageList {...defaultProps} />);

    // Open overflow menu for first page
    await user.click(
      screen.getByLabelText("Actions for Introduction Video")
    );

    // Click Delete
    await user.click(screen.getByText("Delete"));

    expect(screen.getByTestId("confirm-dialog")).toBeInTheDocument();
  });

  it("confirming delete calls onDeletePage", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SortablePageList {...defaultProps} />);

    // Open overflow menu
    await user.click(
      screen.getByLabelText("Actions for Introduction Video")
    );
    await user.click(screen.getByText("Delete"));

    // Confirm
    await user.click(screen.getByText("Confirm Delete"));

    await waitFor(() => {
      expect(defaultProps.onDeletePage).toHaveBeenCalledWith("p1");
    });
  });

  it("first page does not show 'Move Up' in overflow menu", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SortablePageList {...defaultProps} />);

    await user.click(
      screen.getByLabelText("Actions for Introduction Video")
    );

    expect(screen.queryByText("Move Up")).not.toBeInTheDocument();
    expect(screen.getByText("Move Down")).toBeInTheDocument();
  });

  it("last page does not show 'Move Down' in overflow menu", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SortablePageList {...defaultProps} />);

    await user.click(
      screen.getByLabelText("Actions for Guided Meditation")
    );

    expect(screen.getByText("Move Up")).toBeInTheDocument();
    expect(screen.queryByText("Move Down")).not.toBeInTheDocument();
  });

  it("clicking 'Move Down' calls onReorder with swapped IDs", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SortablePageList {...defaultProps} />);

    await user.click(
      screen.getByLabelText("Actions for Introduction Video")
    );
    await user.click(screen.getByText("Move Down"));

    await waitFor(() => {
      expect(defaultProps.onReorder).toHaveBeenCalledWith([
        "p2",
        "p1",
        "p3",
      ]);
    });
  });
});

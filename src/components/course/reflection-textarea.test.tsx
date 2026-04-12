import { render, screen, waitFor, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderWithProviders } from "@/test/test-utils";

const mockSaveDraftMutateAsync = vi.fn();
const mockSubmitMutateAsync = vi.fn();

vi.mock("@/hooks/use-courses", () => ({
  useSaveDraft: () => ({
    mutateAsync: mockSaveDraftMutateAsync,
    isPending: false,
  }),
  useSubmitIntrospection: () => ({
    mutateAsync: mockSubmitMutateAsync,
    isPending: false,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

import { ReflectionTextarea } from "./reflection-textarea";

describe("ReflectionTextarea", () => {
  const defaultProps = {
    courseId: "course-1",
    pageId: "page-1",
    initialText: "",
    isSubmitted: false,
    onSubmitted: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSaveDraftMutateAsync.mockResolvedValue(undefined);
    mockSubmitMutateAsync.mockResolvedValue(undefined);
  });

  it("renders textarea with placeholder", () => {
    renderWithProviders(<ReflectionTextarea {...defaultProps} />);
    expect(
      screen.getByPlaceholderText("Write your reflection here...")
    ).toBeInTheDocument();
  });

  it("renders section heading", () => {
    renderWithProviders(<ReflectionTextarea {...defaultProps} />);
    expect(
      screen.getByText("Reflect on this teaching")
    ).toBeInTheDocument();
  });

  it("renders submit button", () => {
    renderWithProviders(<ReflectionTextarea {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: "Submit reflection" })
    ).toBeInTheDocument();
  });

  it("submit button is disabled when textarea is empty", () => {
    renderWithProviders(<ReflectionTextarea {...defaultProps} />);
    const submitBtn = screen.getByRole("button", { name: "Submit reflection" });
    expect(submitBtn).toBeDisabled();
  });

  it("submit button is enabled after typing text", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReflectionTextarea {...defaultProps} />);

    const textarea = screen.getByLabelText("Reflection text");
    await user.type(textarea, "My reflection");

    const submitBtn = screen.getByRole("button", { name: "Submit reflection" });
    expect(submitBtn).not.toBeDisabled();
  });

  it("calls submit API and onSubmitted on successful submit", async () => {
    const user = userEvent.setup();
    const onSubmitted = vi.fn();
    renderWithProviders(
      <ReflectionTextarea {...defaultProps} onSubmitted={onSubmitted} />
    );

    const textarea = screen.getByLabelText("Reflection text");
    await user.type(textarea, "My reflection on the verse");
    await user.click(
      screen.getByRole("button", { name: "Submit reflection" })
    );

    await waitFor(() => {
      expect(mockSubmitMutateAsync).toHaveBeenCalledWith(
        "My reflection on the verse"
      );
      expect(onSubmitted).toHaveBeenCalled();
    });
  });

  it("shows 'Submitted' button after submission", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReflectionTextarea {...defaultProps} />);

    const textarea = screen.getByLabelText("Reflection text");
    await user.type(textarea, "My reflection");
    await user.click(
      screen.getByRole("button", { name: "Submit reflection" })
    );

    await waitFor(() => {
      expect(screen.getByText("Submitted")).toBeInTheDocument();
    });
  });

  it("shows 'Edit Reflection' button after submission", () => {
    renderWithProviders(
      <ReflectionTextarea
        {...defaultProps}
        initialText="Previous reflection"
        isSubmitted={true}
      />
    );

    expect(screen.getByText("Edit Reflection")).toBeInTheDocument();
    expect(screen.getByText("Submitted")).toBeInTheDocument();
  });

  it("clicking 'Edit Reflection' re-enables the textarea", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ReflectionTextarea
        {...defaultProps}
        initialText="Previous reflection"
        isSubmitted={true}
      />
    );

    const textarea = screen.getByLabelText("Reflection text");
    expect(textarea).toBeDisabled();

    await user.click(screen.getByText("Edit Reflection"));

    expect(textarea).not.toBeDisabled();
  });

  it("populates initial text from existing response", () => {
    renderWithProviders(
      <ReflectionTextarea
        {...defaultProps}
        initialText="My previous reflection"
      />
    );
    const textarea = screen.getByLabelText("Reflection text");
    expect(textarea).toHaveValue("My previous reflection");
  });

  it("textarea is disabled when submitted and not editing", () => {
    renderWithProviders(
      <ReflectionTextarea
        {...defaultProps}
        initialText="My reflection"
        isSubmitted={true}
      />
    );
    const textarea = screen.getByLabelText("Reflection text");
    expect(textarea).toBeDisabled();
  });

  it("textarea has proper accessibility label", () => {
    renderWithProviders(<ReflectionTextarea {...defaultProps} />);
    expect(screen.getByLabelText("Reflection text")).toBeInTheDocument();
  });

  it("submit button text shows 'Submit Reflection'", () => {
    renderWithProviders(<ReflectionTextarea {...defaultProps} />);
    expect(screen.getByText("Submit Reflection")).toBeInTheDocument();
  });
});

describe("ReflectionTextarea auto-save (fake timers)", () => {
  const defaultProps = {
    courseId: "course-1",
    pageId: "page-1",
    initialText: "",
    isSubmitted: false,
    onSubmitted: vi.fn(),
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mockSaveDraftMutateAsync.mockResolvedValue(undefined);
    mockSubmitMutateAsync.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("auto-save fires after 5 second debounce", async () => {
    renderWithProviders(<ReflectionTextarea {...defaultProps} />);

    const textarea = screen.getByLabelText("Reflection text");

    // Use fireEvent.change to trigger React's onChange handler
    await act(async () => {
      fireEvent.change(textarea, { target: { value: "Draft text" } });
    });

    // Advance past the 5s debounce and flush microtasks
    await act(async () => {
      vi.advanceTimersByTime(5100);
      // Allow promises to resolve
      await Promise.resolve();
    });

    expect(mockSaveDraftMutateAsync).toHaveBeenCalledWith("Draft text");
  });

  it("shows 'Draft saved' indicator after auto-save", async () => {
    renderWithProviders(<ReflectionTextarea {...defaultProps} />);

    const textarea = screen.getByLabelText("Reflection text");

    await act(async () => {
      fireEvent.change(textarea, { target: { value: "Some text" } });
    });

    await act(async () => {
      vi.advanceTimersByTime(5100);
      await Promise.resolve();
    });

    // Allow state update
    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText("Draft saved")).toBeInTheDocument();
  });
});

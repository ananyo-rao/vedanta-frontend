import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "@/test/test-utils";

const mockPush = vi.fn();
const mockMutateAsync = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/hooks/use-courses", () => ({
  useCompletePage: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

import { CompleteAndContinue } from "./complete-and-continue";

describe("CompleteAndContinue", () => {
  const defaultProps = {
    courseId: "course-1",
    pageId: "page-1",
    nextPageId: "page-2",
    isStrict: true,
    canComplete: false,
    isAlreadyCompleted: false,
    isLastPage: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockMutateAsync.mockResolvedValue(undefined);
  });

  it("renders disabled button when strict page criteria not met", () => {
    renderWithProviders(
      <CompleteAndContinue {...defaultProps} canComplete={false} />
    );
    const button = screen.getByRole("button", {
      name: "Complete and Continue",
    });
    expect(button).toBeDisabled();
  });

  it("renders enabled button when completion criteria met", () => {
    renderWithProviders(
      <CompleteAndContinue {...defaultProps} canComplete={true} />
    );
    const button = screen.getByRole("button", {
      name: "Complete and Continue",
    });
    expect(button).not.toBeDisabled();
  });

  it("shows progress hint when disabled", () => {
    renderWithProviders(
      <CompleteAndContinue
        {...defaultProps}
        canComplete={false}
        progressHint="Watch to continue (45%)"
      />
    );
    expect(screen.getByText("Watch to continue (45%)")).toBeInTheDocument();
  });

  it("does not show progress hint when enabled", () => {
    renderWithProviders(
      <CompleteAndContinue
        {...defaultProps}
        canComplete={true}
        progressHint="Watch to continue (45%)"
      />
    );
    expect(
      screen.queryByText("Watch to continue (45%)")
    ).not.toBeInTheDocument();
  });

  it('shows "Complete Course" text on last page', () => {
    renderWithProviders(
      <CompleteAndContinue
        {...defaultProps}
        canComplete={true}
        isLastPage={true}
        nextPageId={null}
      />
    );
    expect(
      screen.getByRole("button", { name: "Complete Course" })
    ).toBeInTheDocument();
  });

  it('shows "Continue" for optional (non-strict) pages', () => {
    renderWithProviders(
      <CompleteAndContinue
        {...defaultProps}
        isStrict={false}
        canComplete={true}
      />
    );
    expect(
      screen.getByRole("button", { name: "Continue" })
    ).toBeInTheDocument();
  });

  it('shows "Continue" for already completed pages', () => {
    renderWithProviders(
      <CompleteAndContinue
        {...defaultProps}
        isAlreadyCompleted={true}
        canComplete={true}
      />
    );
    expect(
      screen.getByRole("button", { name: "Continue" })
    ).toBeInTheDocument();
  });

  it('shows "Return to Courses" for already completed last page with no next', () => {
    renderWithProviders(
      <CompleteAndContinue
        {...defaultProps}
        isAlreadyCompleted={true}
        canComplete={true}
        isLastPage={true}
        nextPageId={null}
      />
    );
    expect(
      screen.getByRole("button", { name: "Return to Courses" })
    ).toBeInTheDocument();
  });

  it("calls completePage and navigates to next page on click", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <CompleteAndContinue {...defaultProps} canComplete={true} />
    );

    await user.click(
      screen.getByRole("button", { name: "Complete and Continue" })
    );

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith("page-1");
      expect(mockPush).toHaveBeenCalledWith(
        "/app/courses/course-1/pages/page-2"
      );
    });
  });

  it("navigates to completion page on last page", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <CompleteAndContinue
        {...defaultProps}
        canComplete={true}
        isLastPage={true}
        nextPageId={null}
      />
    );

    await user.click(
      screen.getByRole("button", { name: "Complete Course" })
    );

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith("page-1");
      expect(mockPush).toHaveBeenCalledWith(
        "/app/courses/course-1/complete"
      );
    });
  });

  it("does not call completePage for already completed pages", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <CompleteAndContinue
        {...defaultProps}
        isAlreadyCompleted={true}
        canComplete={true}
      />
    );

    await user.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => {
      expect(mockMutateAsync).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith(
        "/app/courses/course-1/pages/page-2"
      );
    });
  });

  it("navigates to dashboard if no next page and already completed", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <CompleteAndContinue
        {...defaultProps}
        isAlreadyCompleted={true}
        canComplete={true}
        nextPageId={null}
      />
    );

    await user.click(
      screen.getByRole("button", { name: "Return to Courses" })
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/app/dashboard");
    });
  });

  it("button is always enabled for already completed pages", () => {
    renderWithProviders(
      <CompleteAndContinue
        {...defaultProps}
        isStrict={true}
        canComplete={false}
        isAlreadyCompleted={true}
      />
    );
    const button = screen.getByRole("button", { name: "Continue" });
    expect(button).not.toBeDisabled();
  });
});

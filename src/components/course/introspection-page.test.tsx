import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "@/test/test-utils";
import type { CoursePage, IntrospectionContent, IntrospectionResponse } from "@/types/course";

// Mock child components to isolate
vi.mock("@/components/course/devanagari-verse", () => ({
  DevanagariVerse: ({ verse }: { verse: string }) => (
    <div data-testid="devanagari-verse">{verse}</div>
  ),
}));

vi.mock("@/components/course/reflection-textarea", () => ({
  ReflectionTextarea: ({
    isSubmitted,
    initialText,
    onSubmitted,
  }: {
    isSubmitted: boolean;
    initialText: string;
    onSubmitted: () => void;
  }) => (
    <div data-testid="reflection-textarea">
      <span data-testid="is-submitted">{String(isSubmitted)}</span>
      <span data-testid="initial-text">{initialText}</span>
      <button data-testid="simulate-submit" onClick={onSubmitted}>
        Simulate Submit
      </button>
    </div>
  ),
}));

vi.mock("@/components/course/complete-and-continue", () => ({
  CompleteAndContinue: ({
    canComplete,
    isLastPage,
    progressHint,
  }: {
    canComplete: boolean;
    isLastPage: boolean;
    progressHint?: string;
  }) => (
    <div data-testid="complete-and-continue">
      <span data-testid="can-complete">{String(canComplete)}</span>
      <span data-testid="is-last-page">{String(isLastPage)}</span>
      {progressHint && <span data-testid="progress-hint">{progressHint}</span>}
    </div>
  ),
}));

vi.mock("@/components/ui/separator", () => ({
  Separator: () => <hr data-testid="separator" />,
}));

import { IntrospectionPage } from "./introspection-page";

describe("IntrospectionPage", () => {
  const basePage: CoursePage & {
    introspection_response?: IntrospectionResponse | null;
  } = {
    id: "page-2",
    course_id: "course-1",
    title: "Verse on Self-Knowledge",
    page_type: "introspection",
    sort_order: 2,
    is_strict: true,
    content: {
      verse: "\u0924\u0924\u094D\u0924\u094D\u0935\u092E\u0938\u093F",
      explanation:
        "This verse from the Chandogya Upanishad declares the identity of the individual self with Brahman.",
    } as IntrospectionContent,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    introspection_response: null,
  };

  it("renders the page title", () => {
    renderWithProviders(
      <IntrospectionPage
        page={basePage}
        courseId="course-1"
        nextPageId="page-3"
        isLastPage={false}
        pageStatus="current"
      />
    );
    expect(screen.getByText("Verse on Self-Knowledge")).toBeInTheDocument();
  });

  it("renders the Devanagari verse component", () => {
    renderWithProviders(
      <IntrospectionPage
        page={basePage}
        courseId="course-1"
        nextPageId="page-3"
        isLastPage={false}
        pageStatus="current"
      />
    );
    expect(screen.getByTestId("devanagari-verse")).toBeInTheDocument();
    expect(screen.getByTestId("devanagari-verse")).toHaveTextContent(
      "\u0924\u0924\u094D\u0924\u094D\u0935\u092E\u0938\u093F"
    );
  });

  it("renders the explanation text", () => {
    renderWithProviders(
      <IntrospectionPage
        page={basePage}
        courseId="course-1"
        nextPageId="page-3"
        isLastPage={false}
        pageStatus="current"
      />
    );
    expect(
      screen.getByText(/This verse from the Chandogya Upanishad/)
    ).toBeInTheDocument();
  });

  it("renders 'Explanation' heading", () => {
    renderWithProviders(
      <IntrospectionPage
        page={basePage}
        courseId="course-1"
        nextPageId="page-3"
        isLastPage={false}
        pageStatus="current"
      />
    );
    expect(screen.getByText("Explanation")).toBeInTheDocument();
  });

  it("renders reflection textarea component", () => {
    renderWithProviders(
      <IntrospectionPage
        page={basePage}
        courseId="course-1"
        nextPageId="page-3"
        isLastPage={false}
        pageStatus="current"
      />
    );
    expect(screen.getByTestId("reflection-textarea")).toBeInTheDocument();
  });

  it("renders complete-and-continue component", () => {
    renderWithProviders(
      <IntrospectionPage
        page={basePage}
        courseId="course-1"
        nextPageId="page-3"
        isLastPage={false}
        pageStatus="current"
      />
    );
    expect(screen.getByTestId("complete-and-continue")).toBeInTheDocument();
  });

  it("canComplete is false when not submitted for strict page", () => {
    renderWithProviders(
      <IntrospectionPage
        page={basePage}
        courseId="course-1"
        nextPageId="page-3"
        isLastPage={false}
        pageStatus="current"
      />
    );
    expect(screen.getByTestId("can-complete")).toHaveTextContent("false");
  });

  it("shows progress hint for strict page when not submitted", () => {
    renderWithProviders(
      <IntrospectionPage
        page={basePage}
        courseId="course-1"
        nextPageId="page-3"
        isLastPage={false}
        pageStatus="current"
      />
    );
    expect(screen.getByTestId("progress-hint")).toHaveTextContent(
      "Submit your reflection to continue"
    );
  });

  it("canComplete is true for optional pages even without submission", () => {
    const optionalPage = { ...basePage, is_strict: false };
    renderWithProviders(
      <IntrospectionPage
        page={optionalPage}
        courseId="course-1"
        nextPageId="page-3"
        isLastPage={false}
        pageStatus="current"
      />
    );
    expect(screen.getByTestId("can-complete")).toHaveTextContent("true");
  });

  it("canComplete becomes true after simulating submission", async () => {
    const { getByTestId } = renderWithProviders(
      <IntrospectionPage
        page={basePage}
        courseId="course-1"
        nextPageId="page-3"
        isLastPage={false}
        pageStatus="current"
      />
    );

    // Initially false
    expect(getByTestId("can-complete")).toHaveTextContent("false");

    // Simulate the onSubmitted callback
    const { default: userEventModule } = await import(
      "@testing-library/user-event"
    );
    const user = userEventModule.setup();
    await user.click(getByTestId("simulate-submit"));

    expect(getByTestId("can-complete")).toHaveTextContent("true");
  });

  it("initializes as submitted when existing non-draft response exists", () => {
    const pageWithResponse: typeof basePage = {
      ...basePage,
      introspection_response: {
        id: "resp-1",
        user_id: "user-1",
        course_page_id: "page-2",
        response_text: "My reflection on the verse",
        is_draft: false,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
    };

    renderWithProviders(
      <IntrospectionPage
        page={pageWithResponse}
        courseId="course-1"
        nextPageId="page-3"
        isLastPage={false}
        pageStatus="current"
      />
    );

    expect(screen.getByTestId("is-submitted")).toHaveTextContent("true");
    expect(screen.getByTestId("can-complete")).toHaveTextContent("true");
  });

  it("initializes as NOT submitted when existing response is a draft", () => {
    const pageWithDraft: typeof basePage = {
      ...basePage,
      introspection_response: {
        id: "resp-1",
        user_id: "user-1",
        course_page_id: "page-2",
        response_text: "Draft reflection",
        is_draft: true,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
    };

    renderWithProviders(
      <IntrospectionPage
        page={pageWithDraft}
        courseId="course-1"
        nextPageId="page-3"
        isLastPage={false}
        pageStatus="current"
      />
    );

    expect(screen.getByTestId("is-submitted")).toHaveTextContent("false");
    expect(screen.getByTestId("initial-text")).toHaveTextContent(
      "Draft reflection"
    );
  });

  it("title has centered serif heading", () => {
    renderWithProviders(
      <IntrospectionPage
        page={basePage}
        courseId="course-1"
        nextPageId="page-3"
        isLastPage={false}
        pageStatus="current"
      />
    );
    const heading = screen.getByText("Verse on Self-Knowledge");
    expect(heading.tagName).toBe("H1");
    expect(heading).toHaveClass("text-center", "font-serif");
  });

  it("renders separator between explanation and reflection", () => {
    renderWithProviders(
      <IntrospectionPage
        page={basePage}
        courseId="course-1"
        nextPageId="page-3"
        isLastPage={false}
        pageStatus="current"
      />
    );
    expect(screen.getByTestId("separator")).toBeInTheDocument();
  });
});

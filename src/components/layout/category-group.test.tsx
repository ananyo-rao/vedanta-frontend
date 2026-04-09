import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CategoryGroup } from "./category-group";

describe("CategoryGroup", () => {
  it("renders the category label", () => {
    render(
      <CategoryGroup label="LEARN">
        <div>Child content</div>
      </CategoryGroup>
    );

    expect(screen.getByText("LEARN")).toBeInTheDocument();
  });

  it("renders children", () => {
    render(
      <CategoryGroup label="TEST">
        <div data-testid="child">Item 1</div>
      </CategoryGroup>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("has correct ARIA role and labelledby", () => {
    const { container } = render(
      <CategoryGroup label="LEARN">
        <div>Content</div>
      </CategoryGroup>
    );

    const group = container.querySelector('[role="group"]');
    expect(group).toBeInTheDocument();
    expect(group).toHaveAttribute("aria-labelledby", "category-learn");
  });

  it("label id matches aria-labelledby", () => {
    render(
      <CategoryGroup label="PRACTICE">
        <div>Content</div>
      </CategoryGroup>
    );

    const label = screen.getByText("PRACTICE");
    expect(label).toHaveAttribute("id", "category-practice");
  });
});

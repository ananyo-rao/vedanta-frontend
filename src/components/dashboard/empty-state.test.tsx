import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("renders no courses message", () => {
    render(<EmptyState />);
    expect(screen.getByText("No courses available yet")).toBeInTheDocument();
  });

  it("renders description text", () => {
    render(<EmptyState />);
    expect(screen.getByText(/New courses are being prepared/)).toBeInTheDocument();
  });

  it("has a heading element", () => {
    render(<EmptyState />);
    expect(screen.getByRole("heading", { name: /No courses available yet/ })).toBeInTheDocument();
  });
});

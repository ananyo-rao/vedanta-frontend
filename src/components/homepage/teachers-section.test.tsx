import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TeachersSection } from "./teachers-section";

describe("TeachersSection", () => {
  it("renders Swami Satchitananda as the teacher", () => {
    render(<TeachersSection />);

    const headings = screen.getAllByRole("heading", {
      name: "Swami Satchitananda",
    });
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });

  it("does not render Maitreyi", () => {
    render(<TeachersSection />);

    expect(screen.queryByText(/Maitreyi/i)).not.toBeInTheDocument();
  });

  it("has correct section id for anchor navigation", () => {
    const { container } = render(<TeachersSection />);

    const section = container.querySelector("#teachers");
    expect(section).toBeInTheDocument();
  });

  it("has scroll-mt-20 class for sticky navbar offset", () => {
    const { container } = render(<TeachersSection />);

    const section = container.querySelector("#teachers");
    expect(section?.className).toContain("scroll-mt-20");
  });

  it("renders the teacher subtitle", () => {
    render(<TeachersSection />);

    expect(screen.getByText("Your Teacher")).toBeInTheDocument();
  });
});

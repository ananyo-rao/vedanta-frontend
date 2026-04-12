import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TeachersSection } from "./teachers-section";

describe("TeachersSection", () => {
  it("renders Swami Sachidananda as the teacher", () => {
    render(<TeachersSection />);

    const headings = screen.getAllByRole("heading", {
      name: /swami sachid/i,
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

  it("renders the Acharya eyebrow label", () => {
    render(<TeachersSection />);

    const matches = screen.getAllByText(/āchārya/i);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });
});

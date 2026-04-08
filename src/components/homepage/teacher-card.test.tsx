import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TeacherCard } from "./teacher-card";

describe("TeacherCard", () => {
  const defaultProps = {
    name: "Swami Satchitananda",
    title: "Senior Acharya",
    quote:
      "The purpose of Vedanta is not to give you something new, but to reveal that which you already possess.",
    accentColor: "primary" as const,
    rotateDirection: "positive" as const,
  };

  it("renders teacher name, title, and quote", () => {
    render(<TeacherCard {...defaultProps} />);

    expect(screen.getByText("Swami Satchitananda")).toBeInTheDocument();
    expect(screen.getByText("Senior Acharya")).toBeInTheDocument();
    expect(
      screen.getByText(/The purpose of Vedanta/),
    ).toBeInTheDocument();
  });

  it("renders with secondary accent color", () => {
    const { container } = render(
      <TeacherCard {...defaultProps} accentColor="secondary" />,
    );

    const accentDiv = container.querySelector(".bg-secondary-container");
    expect(accentDiv).toBeInTheDocument();
  });

  it("renders with primary accent color", () => {
    const { container } = render(
      <TeacherCard {...defaultProps} accentColor="primary" />,
    );

    const accentDiv = container.querySelector(".bg-primary-container");
    expect(accentDiv).toBeInTheDocument();
  });

  it("applies correct rotation direction", () => {
    const { container } = render(
      <TeacherCard {...defaultProps} rotateDirection="negative" />,
    );

    const accentDiv = container.querySelector(".-rotate-6");
    expect(accentDiv).toBeInTheDocument();
  });
});

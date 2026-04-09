import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Footer } from "./footer";

const mockUseAuthHref = vi.fn();

vi.mock("@/hooks/use-auth-href", () => ({
  useAuthHref: () => mockUseAuthHref(),
}));

describe("Footer", () => {
  beforeEach(() => {
    mockUseAuthHref.mockReset();
  });

  describe("when signed in", () => {
    beforeEach(() => {
      mockUseAuthHref.mockReturnValue("/app/dashboard");
    });

    it("links all quick links to /app/dashboard", () => {
      render(<Footer />);

      const links = [
        screen.getByRole("link", { name: "Online Library" }),
        screen.getByRole("link", { name: "Course Enrollment" }),
        screen.getByRole("link", { name: "Student Login" }),
      ];

      links.forEach((link) => {
        expect(link).toHaveAttribute("href", "/app/dashboard");
      });
    });
  });

  describe("when signed out", () => {
    beforeEach(() => {
      mockUseAuthHref.mockReturnValue("/sign-in");
    });

    it("links all quick links to /sign-in", () => {
      render(<Footer />);

      const links = [
        screen.getByRole("link", { name: "Online Library" }),
        screen.getByRole("link", { name: "Course Enrollment" }),
        screen.getByRole("link", { name: "Student Login" }),
      ];

      links.forEach((link) => {
        expect(link).toHaveAttribute("href", "/sign-in");
      });
    });
  });

  it("renders the Quick Links heading", () => {
    mockUseAuthHref.mockReturnValue("/sign-in");
    render(<Footer />);

    expect(screen.getByText("Quick Links")).toBeInTheDocument();
  });

  it("renders the Vedanta Academy logo and name", () => {
    mockUseAuthHref.mockReturnValue("/sign-in");
    render(<Footer />);

    expect(screen.getByAltText("Vedanta Academy")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Vedanta Academy" })).toBeInTheDocument();
  });

  it("renders copyright notice with current year", () => {
    mockUseAuthHref.mockReturnValue("/sign-in");
    render(<Footer />);

    const year = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`${year}`))).toBeInTheDocument();
  });

  it("renders 3 quick links", () => {
    mockUseAuthHref.mockReturnValue("/sign-in");
    render(<Footer />);

    const list = screen.getByRole("list");
    const items = list.querySelectorAll("li");
    expect(items).toHaveLength(3);
  });
});

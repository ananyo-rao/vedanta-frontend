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

    it("links 'Courses' to /app/dashboard", () => {
      render(<Footer />);
      expect(screen.getByRole("link", { name: "Courses" })).toHaveAttribute(
        "href",
        "/app/dashboard"
      );
    });
  });

  describe("when signed out", () => {
    beforeEach(() => {
      mockUseAuthHref.mockReturnValue("/sign-in");
    });

    it("links 'Courses' to /sign-in", () => {
      render(<Footer />);
      expect(screen.getByRole("link", { name: "Courses" })).toHaveAttribute(
        "href",
        "/sign-in"
      );
    });
  });

  it("renders static nav links", () => {
    mockUseAuthHref.mockReturnValue("/sign-in");
    render(<Footer />);

    expect(screen.getByRole("link", { name: "Teachers" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "About" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact Us" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Terms" })).toBeInTheDocument();
  });

  it("renders the site name", () => {
    mockUseAuthHref.mockReturnValue("/sign-in");
    render(<Footer />);

    expect(screen.getByText("Vedanta Vidyalaya")).toBeInTheDocument();
  });

  it("renders copyright notice with current year", () => {
    mockUseAuthHref.mockReturnValue("/sign-in");
    render(<Footer />);

    const year = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`${year}`))).toBeInTheDocument();
  });
});

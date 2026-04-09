import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { HeroSection } from "./hero-section";

const mockUseAuthHref = vi.fn();

vi.mock("@/hooks/use-auth-href", () => ({
  useAuthHref: () => mockUseAuthHref(),
}));

describe("HeroSection", () => {
  beforeEach(() => {
    mockUseAuthHref.mockReset();
  });

  it("links 'Explore Courses' to /app/dashboard when signed in", () => {
    mockUseAuthHref.mockReturnValue("/app/dashboard");
    render(<HeroSection />);

    const link = screen.getByRole("link", { name: /explore courses/i });
    expect(link).toHaveAttribute("href", "/app/dashboard");
  });

  it("links 'Explore Courses' to /sign-in when signed out", () => {
    mockUseAuthHref.mockReturnValue("/sign-in");
    render(<HeroSection />);

    const link = screen.getByRole("link", { name: /explore courses/i });
    expect(link).toHaveAttribute("href", "/sign-in");
  });

  it("links 'Meet Our Teachers' to #teachers anchor", () => {
    mockUseAuthHref.mockReturnValue("/sign-in");
    render(<HeroSection />);

    const link = screen.getByRole("link", { name: /meet our teachers/i });
    expect(link).toHaveAttribute("href", "#teachers");
  });

  it("renders the hero heading", () => {
    mockUseAuthHref.mockReturnValue("/sign-in");
    render(<HeroSection />);

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      /vedanta, a journey/i
    );
  });

  it("has correct section id for anchor navigation", () => {
    mockUseAuthHref.mockReturnValue("/sign-in");
    const { container } = render(<HeroSection />);

    expect(container.querySelector("#home")).toBeInTheDocument();
  });
});

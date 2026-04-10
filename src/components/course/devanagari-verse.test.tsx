import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DevanagariVerse } from "./devanagari-verse";

describe("DevanagariVerse", () => {
  const sampleVerse = "\u0924\u0924\u094D\u0924\u094D\u0935\u092E\u0938\u093F";

  it("renders the verse text", () => {
    render(<DevanagariVerse verse={sampleVerse} />);
    expect(screen.getByText(sampleVerse)).toBeInTheDocument();
  });

  it('has lang="sa" attribute for accessibility', () => {
    render(<DevanagariVerse verse={sampleVerse} />);
    const container = screen.getByLabelText("Sanskrit verse");
    expect(container).toHaveAttribute("lang", "sa");
  });

  it("renders with Devanagari font class", () => {
    render(<DevanagariVerse verse={sampleVerse} />);
    const textElement = screen.getByText(sampleVerse);
    expect(textElement).toHaveClass("font-devanagari");
  });

  it("renders in a styled container with rounded corners and padding", () => {
    render(<DevanagariVerse verse={sampleVerse} />);
    const container = screen.getByLabelText("Sanskrit verse");
    expect(container).toHaveClass("rounded-xl", "p-6");
  });

  it("renders text centered", () => {
    render(<DevanagariVerse verse={sampleVerse} />);
    const container = screen.getByLabelText("Sanskrit verse");
    expect(container).toHaveClass("text-center");
  });

  it("renders long verse text without truncation", () => {
    const longVerse =
      "\u0924\u0924\u094D\u0924\u094D\u0935\u092E\u0938\u093F \u0924\u0924\u094D\u0924\u094D\u0935\u092E\u0938\u093F \u0924\u0924\u094D\u0924\u094D\u0935\u092E\u0938\u093F";
    render(<DevanagariVerse verse={longVerse} />);
    expect(screen.getByText(longVerse)).toBeInTheDocument();
  });
});

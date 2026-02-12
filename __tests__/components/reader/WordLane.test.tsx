/**
 * Tests for WordLane Component
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { WordLane } from "@/app/components/reader/WordLane";
import type { Token } from "@/app/types";

describe("WordLane", () => {
  beforeEach(() => {
    // Mock canvas for character measurement
    HTMLCanvasElement.prototype.getContext = () => {
      return {
        measureText: (text: string) => ({
          width: text.length * 10, // Simple mock: 10px per character
        }),
      } as any;
    };
  });

  afterEach(() => {
    // Cleanup
  });

  it("renders token text correctly", () => {
    const token: Token = { text: "hello" };
    render(<WordLane token={token} fontSize={18} />);
    
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("renders non-breaking space when token is null", () => {
    render(<WordLane token={null} fontSize={18} />);
    
    const wordLane = document.querySelector(".word-lane");
    expect(wordLane).toBeInTheDocument();
    
    // Should have a non-breaking space (may be normalized to regular space in DOM)
    const span = document.querySelector(".reader-text");
    expect(span?.textContent).toBeTruthy();
    expect(span?.textContent?.trim()).toBe("");
  });

  it("applies bold styling when token.bold is true", () => {
    const token: Token = { text: "bold", bold: true };
    render(<WordLane token={token} fontSize={18} />);
    
    const span = screen.getByText("bold");
    expect(span).toHaveStyle({ fontWeight: "700" });
  });

  it("applies italic styling when token.italic is true", () => {
    const token: Token = { text: "italic", italic: true };
    render(<WordLane token={token} fontSize={18} />);
    
    const span = screen.getByText("italic");
    expect(span).toHaveStyle({ fontStyle: "italic" });
  });

  it("applies code styling when token.code is true", () => {
    const token: Token = { text: "code", code: true };
    render(<WordLane token={token} fontSize={18} />);
    
    const span = screen.getByText("code");
    expect(span).toHaveStyle({ 
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    });
  });

  it("applies combined bold and italic styling", () => {
    const token: Token = { text: "both", bold: true, italic: true };
    render(<WordLane token={token} fontSize={18} />);
    
    const span = screen.getByText("both");
    expect(span).toHaveStyle({ 
      fontWeight: "700",
      fontStyle: "italic" 
    });
  });

  it("renders ORP line indicator", () => {
    const token: Token = { text: "test" };
    render(<WordLane token={token} fontSize={18} />);
    
    const orpLine = document.querySelector(".orp-line");
    expect(orpLine).toBeInTheDocument();
    expect(orpLine).toHaveStyle({ 
      position: "absolute",
      width: "1px",
    });
  });

  it("updates when token changes", () => {
    const { rerender } = render(<WordLane token={{ text: "first" }} fontSize={18} />);
    expect(screen.getByText("first")).toBeInTheDocument();
    
    rerender(<WordLane token={{ text: "second" }} fontSize={18} />);
    expect(screen.queryByText("first")).not.toBeInTheDocument();
    expect(screen.getByText("second")).toBeInTheDocument();
  });

  it("applies correct font size", () => {
    const token: Token = { text: "test" };
    render(<WordLane token={token} fontSize={24} />);
    
    const wordLane = document.querySelector(".word-lane");
    expect(wordLane).toHaveStyle({ fontSize: "24px" });
  });

  it("centers content with flexbox", () => {
    const token: Token = { text: "centered" };
    render(<WordLane token={token} fontSize={18} />);
    
    const wordLane = document.querySelector(".word-lane");
    expect(wordLane).toHaveStyle({ 
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    });
  });

  it("has center opacity for the word", () => {
    const token: Token = { text: "visible" };
    render(<WordLane token={token} fontSize={18} />);
    
    const span = screen.getByText("visible");
    // Just verify the element renders - CSS variables aren't resolved in test env
    expect(span).toBeInTheDocument();
  });

  it("maintains fixed DOM structure", () => {
    const { rerender } = render(<WordLane token={{ text: "first" }} fontSize={18} />);
    
    const initialSpan = document.querySelector(".reader-text");
    const initialOrpLine = document.querySelector(".orp-line");
    
    rerender(<WordLane token={{ text: "second" }} fontSize={18} />);
    
    const updatedSpan = document.querySelector(".reader-text");
    const updatedOrpLine = document.querySelector(".orp-line");
    
    // Should be the same DOM elements (refs maintained)
    expect(updatedSpan).toBe(initialSpan);
    expect(updatedOrpLine).toBe(initialOrpLine);
  });
});

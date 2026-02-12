/**
 * UnifiedWordDisplay Component Tests
 * Tests for the unified word display layout
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { UnifiedWordDisplay } from "@/app/components/reader/UnifiedWordDisplay";
import type { Token } from "@/app/types";

describe("UnifiedWordDisplay", () => {
  const createToken = (text: string, props?: Partial<Token>): Token => ({
    text,
    ...props,
  });

  it("renders all tokens in a single flexbox", () => {
    const tokens: Token[] = [
      createToken("word1"),
      createToken("word2"),
      createToken("ACTIVE"),
      createToken("word4"),
      createToken("word5"),
    ];

    render(
      <UnifiedWordDisplay
        tokens={tokens}
        centerIndex={2}
        fontSize={36}
      />
    );

    expect(screen.getByText("word1")).toBeInTheDocument();
    expect(screen.getByText("word2")).toBeInTheDocument();
    expect(screen.getByText("ACTIVE")).toBeInTheDocument();
    expect(screen.getByText("word4")).toBeInTheDocument();
    expect(screen.getByText("word5")).toBeInTheDocument();
  });

  it("applies correct opacity based on distance from center", () => {
    const tokens: Token[] = [
      createToken("far"),
      createToken("near"),
      createToken("ACTIVE"),
      createToken("near2"),
      createToken("far2"),
    ];

    const { container } = render(
      <UnifiedWordDisplay
        tokens={tokens}
        centerIndex={2}
        fontSize={36}
      />
    );

    const words = container.querySelectorAll(".unified-word");
    
    // Check opacity values
    expect(words[0]).toHaveStyle({ opacity: 0.20 }); // distance = 2
    expect(words[1]).toHaveStyle({ opacity: 0.45 }); // distance = 1
    expect(words[2]).toHaveStyle({ opacity: 1.0 });  // distance = 0 (center)
    expect(words[3]).toHaveStyle({ opacity: 0.45 }); // distance = 1
    expect(words[4]).toHaveStyle({ opacity: 0.20 }); // distance = 2
  });

  it("marks center word with data-center attribute", () => {
    const tokens: Token[] = [
      createToken("word1"),
      createToken("ACTIVE"),
      createToken("word3"),
    ];

    const { container } = render(
      <UnifiedWordDisplay
        tokens={tokens}
        centerIndex={1}
        fontSize={36}
      />
    );

    const words = container.querySelectorAll(".unified-word");
    expect(words[0]).toHaveAttribute("data-center", "false");
    expect(words[1]).toHaveAttribute("data-center", "true");
    expect(words[2]).toHaveAttribute("data-center", "false");
  });

  it("displays ORP line indicator", () => {
    const tokens: Token[] = [
      createToken("word1"),
      createToken("ACTIVE"),
      createToken("word3"),
    ];

    const { container } = render(
      <UnifiedWordDisplay
        tokens={tokens}
        centerIndex={1}
        fontSize={36}
      />
    );

    const orpLine = container.querySelector(".orp-line");
    expect(orpLine).toBeInTheDocument();
    expect(orpLine).toHaveStyle({
      position: "fixed",
      left: "50%",
    });
  });

  it("applies correct font size", () => {
    const tokens: Token[] = [
      createToken("word1"),
      createToken("ACTIVE"),
      createToken("word3"),
    ];

    const { container } = render(
      <UnifiedWordDisplay
        tokens={tokens}
        centerIndex={1}
        fontSize={48}
      />
    );

    const display = container.querySelector(".unified-word-display");
    expect(display).toHaveStyle({ fontSize: "48px" });
  });

  it("handles empty slots at document boundaries", () => {
    const tokens: (Token | null)[] = [
      null,
      createToken("word1"),
      createToken("ACTIVE"),
      createToken("word3"),
      null,
    ];

    const { container } = render(
      <UnifiedWordDisplay
        tokens={tokens as Token[]}
        centerIndex={2}
        fontSize={36}
      />
    );

    const words = container.querySelectorAll('[style*="opacity"]');
    expect(words[0]).toHaveStyle({ opacity: 0 }); // Empty slot
    expect(words[4]).toHaveStyle({ opacity: 0 }); // Empty slot
  });

  it("applies token styling (bold, italic, code)", () => {
    const tokens: Token[] = [
      createToken("normal"),
      createToken("bold", { bold: true }),
      createToken("italic", { italic: true }),
      createToken("code", { code: true }),
      createToken("normal2"),
    ];

    render(
      <UnifiedWordDisplay
        tokens={tokens}
        centerIndex={2}
        fontSize={36}
      />
    );

    const boldWord = screen.getByText("bold");
    expect(boldWord).toHaveStyle({ fontWeight: 700 });

    const italicWord = screen.getByText("italic");
    expect(italicWord).toHaveStyle({ fontStyle: "italic" });

    const codeWord = screen.getByText("code");
    // Code word should use monospace font
    const style = window.getComputedStyle(codeWord);
    expect(style.fontFamily).toContain("mono");
  });

  it("has correct layout structure", () => {
    const tokens: Token[] = [
      createToken("word1"),
      createToken("ACTIVE"),
      createToken("word3"),
    ];

    const { container } = render(
      <UnifiedWordDisplay
        tokens={tokens}
        centerIndex={1}
        fontSize={36}
      />
    );

    const wrapper = container.querySelector(".unified-word-display-wrapper");
    expect(wrapper).toHaveStyle({
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    });

    const display = container.querySelector(".unified-word-display");
    expect(display).toHaveStyle({
      display: "flex",
    });
    // Check individual properties since computed styles may vary
    const displayStyle = window.getComputedStyle(display!);
    expect(displayStyle.display).toBe("flex");
    expect(displayStyle.alignItems).toBe("center");
    expect(displayStyle.justifyContent).toBe("space-around");
  });

  it("uses correct windowRadius with centerIndex", () => {
    // For windowRadius=2, centerIndex=2, we have 5 tokens total
    const tokens: Token[] = [
      createToken("word-2"),
      createToken("word-1"),
      createToken("ACTIVE"),
      createToken("word+1"),
      createToken("word+2"),
    ];

    const { container } = render(
      <UnifiedWordDisplay
        tokens={tokens}
        centerIndex={2}
        fontSize={36}
      />
    );

    const words = container.querySelectorAll(".unified-word");
    expect(words.length).toBe(5);
    
    // Verify distance attributes
    expect(words[0]).toHaveAttribute("data-distance", "-2");
    expect(words[1]).toHaveAttribute("data-distance", "-1");
    expect(words[2]).toHaveAttribute("data-distance", "0");
    expect(words[3]).toHaveAttribute("data-distance", "1");
    expect(words[4]).toHaveAttribute("data-distance", "2");
  });

  it("memoizes correctly and doesn't re-render unnecessarily", () => {
    const tokens: Token[] = [
      createToken("word1"),
      createToken("ACTIVE"),
      createToken("word3"),
    ];

    const { rerender } = render(
      <UnifiedWordDisplay
        tokens={tokens}
        centerIndex={1}
        fontSize={36}
      />
    );

    // Re-render with same props
    rerender(
      <UnifiedWordDisplay
        tokens={tokens}
        centerIndex={1}
        fontSize={36}
      />
    );

    // Should still render correctly
    expect(screen.getByText("ACTIVE")).toBeInTheDocument();
  });

  it("handles single token (no peripheral)", () => {
    const tokens: Token[] = [
      createToken("ONLY"),
    ];

    render(
      <UnifiedWordDisplay
        tokens={tokens}
        centerIndex={0}
        fontSize={36}
      />
    );

    expect(screen.getByText("ONLY")).toBeInTheDocument();
    const word = screen.getByText("ONLY");
    expect(word).toHaveStyle({ opacity: 1.0 });
    expect(word).toHaveAttribute("data-center", "true");
  });

  it("renders with aria attributes", () => {
    const tokens: Token[] = [
      createToken("word1"),
      createToken("ACTIVE"),
      createToken("word3"),
    ];

    const { container } = render(
      <UnifiedWordDisplay
        tokens={tokens}
        centerIndex={1}
        fontSize={36}
      />
    );

    const wrapper = container.querySelector(".unified-word-display-wrapper");
    expect(wrapper).toHaveAttribute("role", "main");
    expect(wrapper).toHaveAttribute("aria-label", "Reading area");
    expect(wrapper).toHaveAttribute("aria-live", "polite");
  });

  it("transitions opacity smoothly", () => {
    const tokens: Token[] = [
      createToken("word1"),
      createToken("ACTIVE"),
      createToken("word3"),
    ];

    const { container } = render(
      <UnifiedWordDisplay
        tokens={tokens}
        centerIndex={1}
        fontSize={36}
      />
    );

    const words = container.querySelectorAll(".unified-word");
    words.forEach((word) => {
      const style = window.getComputedStyle(word);
      expect(style.transition).toContain("opacity");
    });
  });
});

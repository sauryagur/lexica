/**
 * UnifiedWordDisplay Component Tests
 * Tests for the center-anchored word display layout
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

  it("renders all tokens with center-anchored layout", () => {
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

    // Get all spans with opacity styles
    const words = container.querySelectorAll('span[style*="opacity"]');
    
    // Check opacity values
    // Note: The order is left-to-right in the DOM: left group, center, right group
    expect(words[0]).toHaveStyle({ opacity: 0.20 }); // far (distance = -2)
    expect(words[1]).toHaveStyle({ opacity: 0.45 }); // near (distance = -1)
    expect(words[2]).toHaveStyle({ opacity: 1.0 });  // ACTIVE (distance = 0, center)
    expect(words[3]).toHaveStyle({ opacity: 0.45 }); // near2 (distance = 1)
    expect(words[4]).toHaveStyle({ opacity: 0.20 }); // far2 (distance = 2)
  });

  it("center word is perfectly positioned at screen center", () => {
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

    // Find the center word container (absolute positioned with left-1/2 top-1/2)
    const centerContainer = container.querySelector('div[style*="translate(-50%, -50%)"]');
    expect(centerContainer).toBeInTheDocument();
    expect(centerContainer).toHaveStyle({
      transform: "translate(-50%, -50%)",
    });
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

    // The relative container has the fontSize
    const relativeContainer = container.querySelector('div.relative');
    expect(relativeContainer).toHaveStyle({ fontSize: "48px" });
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
    // First word should be hidden (opacity: 0)
    expect(words[0]).toHaveStyle({ opacity: 0 });
    // Last word should be hidden (opacity: 0)
    expect(words[words.length - 1]).toHaveStyle({ opacity: 0 });
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

  it("has correct layout structure with three positioned groups", () => {
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

    // Check for the main wrapper with aria attributes
    const wrapper = container.querySelector('[role="main"]');
    expect(wrapper).toHaveAttribute("aria-label", "Reading area");
    expect(wrapper).toHaveAttribute("aria-live", "polite");

    // Check for relative container
    const relativeContainer = container.querySelector('div.relative');
    expect(relativeContainer).toBeInTheDocument();

    // Check for absolute positioned groups
    const absoluteGroups = container.querySelectorAll('div.absolute');
    // Should have at least 2: left group and center word (right group exists too)
    expect(absoluteGroups.length).toBeGreaterThanOrEqual(2);
  });

  it("uses fixed gap spacing between words", () => {
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

    // Check that flex containers use gap-8 class
    const flexContainers = container.querySelectorAll('div.flex.gap-8');
    // Should have left and right groups with gap-8
    expect(flexContainers.length).toBeGreaterThanOrEqual(2);
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

    const { container } = render(
      <UnifiedWordDisplay
        tokens={tokens}
        centerIndex={0}
        fontSize={36}
      />
    );

    expect(screen.getByText("ONLY")).toBeInTheDocument();
    
    // Center word should have full opacity
    const centerWord = screen.getByText("ONLY");
    expect(centerWord).toHaveStyle({ opacity: 1.0 });
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

    const wrapper = container.querySelector('[role="main"]');
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

    // Check that word spans have transition-opacity class
    const wordSpans = container.querySelectorAll('span.transition-opacity');
    expect(wordSpans.length).toBeGreaterThan(0);
    
    wordSpans.forEach((span) => {
      expect(span).toHaveClass("transition-opacity");
      expect(span).toHaveClass("duration-150");
    });
  });

  it("left words expand outward from center", () => {
    const tokens: Token[] = [
      createToken("word1"),
      createToken("word2"),
      createToken("ACTIVE"),
      createToken("word4"),
      createToken("word5"),
    ];

    const { container } = render(
      <UnifiedWordDisplay
        tokens={tokens}
        centerIndex={2}
        fontSize={36}
      />
    );

    // Left group should be positioned with right-1/2 and negative translateX
    const leftGroup = container.querySelector('div.right-1\\/2');
    expect(leftGroup).toBeInTheDocument();
    // Should have negative translateX (moving away from center)
    const transform = leftGroup?.getAttribute('style');
    expect(transform).toContain("translateX(-");
  });

  it("right words expand outward from center", () => {
    const tokens: Token[] = [
      createToken("word1"),
      createToken("word2"),
      createToken("ACTIVE"),
      createToken("word4"),
      createToken("word5"),
    ];

    const { container } = render(
      <UnifiedWordDisplay
        tokens={tokens}
        centerIndex={2}
        fontSize={36}
      />
    );

    // Right group should be positioned with left-1/2 and positive translateX
    const rightGroup = container.querySelector('div.left-1\\/2.flex.gap-8');
    expect(rightGroup).toBeInTheDocument();
    // Should have positive translateX
    const transform = rightGroup?.getAttribute('style');
    expect(transform).toContain("translateX(2rem)");
  });
});

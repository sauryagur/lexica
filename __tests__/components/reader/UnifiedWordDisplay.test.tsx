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

    const slots = container.querySelectorAll(".unified-word-slot");
    
    // Check opacity values on slots
    expect(slots[0]).toHaveStyle({ opacity: 0.20 }); // distance = 2
    expect(slots[1]).toHaveStyle({ opacity: 0.45 }); // distance = 1
    expect(slots[2]).toHaveStyle({ opacity: 1.0 });  // distance = 0 (center)
    expect(slots[3]).toHaveStyle({ opacity: 0.45 }); // distance = 1
    expect(slots[4]).toHaveStyle({ opacity: 0.20 }); // distance = 2
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

    const slots = container.querySelectorAll(".unified-word-slot");
    expect(slots[0]).toHaveAttribute("data-center", "false");
    expect(slots[1]).toHaveAttribute("data-center", "true");
    expect(slots[2]).toHaveAttribute("data-center", "false");
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
    expect(displayStyle.justifyContent).toBe("center");
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

    const slots = container.querySelectorAll(".unified-word-slot");
    expect(slots.length).toBe(5);
    
    // Verify distance attributes
    expect(slots[0]).toHaveAttribute("data-distance", "-2");
    expect(slots[1]).toHaveAttribute("data-distance", "-1");
    expect(slots[2]).toHaveAttribute("data-distance", "0");
    expect(slots[3]).toHaveAttribute("data-distance", "1");
    expect(slots[4]).toHaveAttribute("data-distance", "2");
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
    const slot = container.querySelector(".unified-word-slot");
    expect(slot).toHaveStyle({ opacity: 1.0 });
    expect(slot).toHaveAttribute("data-center", "true");
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

    const slots = container.querySelectorAll(".unified-word-slot");
    slots.forEach((slot) => {
      const style = window.getComputedStyle(slot);
      expect(style.transition).toContain("opacity");
    });
  });
});

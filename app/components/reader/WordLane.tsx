/**
 * WordLane Component
 * Center-pinned word display with ORP (Optimal Recognition Point) indicator
 * Performance: Memoized to prevent unnecessary re-renders
 */

"use client";

import { useMemo, useRef, useEffect, memo } from "react";
import type { Token } from "@/app/types";

export interface WordLaneProps {
  token: Token | null;
  fontSize: number;
}

/**
 * Calculate ORP (Optimal Recognition Point) index for a word
 * Uses heuristic: floor(word.length * 0.35)
 */
function calculateORP(word: string): number {
  return Math.floor(word.length * 0.35);
}

/**
 * WordLane - Center-pinned word display with ORP line
 * 
 * Features:
 * - Center-pinned display with ORP character aligned to screen center
 * - Vertical ORP line indicator
 * - Token styling (bold, italic, code)
 * - Fixed DOM structure for performance
 * - Smooth updates without flicker
 * - Memoized to prevent re-renders when token hasn't changed
 */
function WordLaneComponent({ token, fontSize }: WordLaneProps) {
  const wordRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate ORP and transform offset
  const { orp, transform, text, styling } = useMemo(() => {
    if (!token) {
      return { orp: 0, transform: "translateX(0)", text: "", styling: {} };
    }

    const orpIndex = token.orp ?? calculateORP(token.text);
    
    // We'll calculate the actual pixel offset in useEffect
    // For now, just return the data
    return {
      orp: orpIndex,
      transform: "translateX(0)", // Will be updated in useEffect
      text: token.text,
      styling: {
        fontWeight: token.bold ? 700 : 400,
        fontStyle: token.italic ? "italic" : "normal",
        fontFamily: token.code 
          ? "var(--font-geist-mono, 'Courier New', monospace)" 
          : "var(--font-reader)",
        backgroundColor: token.code ? "rgba(255, 255, 255, 0.1)" : "transparent",
        padding: token.code ? "0.125rem 0.25rem" : "0",
        borderRadius: token.code ? "0.25rem" : "0",
      },
    };
  }, [token]);

  // Calculate and apply transform to align ORP to screen center
  useEffect(() => {
    if (!wordRef.current || !containerRef.current || !token) {
      return;
    }

    // Create a temporary canvas to measure character widths precisely
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set font to match the word element
    const computedStyle = window.getComputedStyle(wordRef.current);
    ctx.font = `${computedStyle.fontStyle} ${computedStyle.fontWeight} ${computedStyle.fontSize} ${computedStyle.fontFamily}`;

    // Measure width up to ORP character
    const textBeforeORP = text.slice(0, orp);
    const widthBeforeORP = ctx.measureText(textBeforeORP).width;
    
    // Measure width of ORP character itself (to get its center)
    const orpChar = text[orp] || "";
    const orpCharWidth = ctx.measureText(orpChar).width;
    
    // Calculate offset: distance from word start to ORP character center
    const orpOffset = widthBeforeORP + (orpCharWidth / 2);

    // Apply transform to shift word so ORP aligns with container center
    wordRef.current.style.transform = `translateX(-${orpOffset}px)`;
  }, [token, text, orp, fontSize]);

  return (
    <div
      ref={containerRef}
      className="word-lane"
      role="main"
      aria-label="Reading area"
      aria-live="polite"
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        fontSize: `${fontSize}px`,
        lineHeight: "var(--reader-line-height)",
      }}
    >
      {/* ORP vertical line indicator */}
      <div
        className="orp-line"
        style={{
          position: "absolute",
          left: "50%",
          top: "0",
          bottom: "0",
          width: "1px",
          backgroundColor: "rgba(255, 255, 255, 0.3)",
          pointerEvents: "none",
          zIndex: 1,
        }}
        aria-hidden="true"
      />

      {/* Word display */}
      <span
        ref={wordRef}
        className="reader-text"
        style={{
          position: "relative",
          display: "inline-block",
          whiteSpace: "nowrap",
          color: "var(--foreground)",
          opacity: "var(--opacity-center)",
          transformOrigin: "center",
          transition: "opacity 0.1s ease-out",
          zIndex: 2,
          ...styling,
        }}
      >
        {text || "\u00A0"} {/* Non-breaking space when empty */}
      </span>
    </div>
  );
}

// Export memoized component to prevent unnecessary re-renders
export const WordLane = memo(WordLaneComponent, (prevProps, nextProps) => {
  // Only re-render if token text/styling changes or fontSize changes
  return (
    prevProps.fontSize === nextProps.fontSize &&
    prevProps.token?.text === nextProps.token?.text &&
    prevProps.token?.bold === nextProps.token?.bold &&
    prevProps.token?.italic === nextProps.token?.italic &&
    prevProps.token?.code === nextProps.token?.code
  );
});

WordLane.displayName = "WordLane";

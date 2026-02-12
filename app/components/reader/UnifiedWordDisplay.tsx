/**
 * UnifiedWordDisplay Component
 * Simple, static container that never moves - only text content updates
 * Eliminates all jitter and movement by using a fixed-position container
 */

"use client";

import { memo } from "react";
import type { Token } from "@/app/types";

export interface UnifiedWordDisplayProps {
  /** All tokens in the window (e.g., 5 tokens for windowRadius=2) */
  tokens: Token[];
  /** Index of the active/center word in the tokens array */
  centerIndex: number;
  /** Font size in pixels */
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
 * Calculate opacity for a token based on its distance from center
 * Center: 100%, ±1: 45%, ±2: 20%
 */
function calculateOpacity(distanceFromCenter: number): number {
  const absDistance = Math.abs(distanceFromCenter);
  
  if (absDistance === 0) return 1.0;
  if (absDistance === 1) return 0.45;
  if (absDistance === 2) return 0.20;
  
  // For larger distances, continue fading
  return Math.max(0.05, 0.20 / absDistance);
}

/**
 * UnifiedWordDisplay - Static fixed container approach
 * 
 * Key principles:
 * 1. Container is FIXED - position: fixed, never moves
 * 2. Container size is CONSTANT - w-[90vw], doesn't change
 * 3. Only TEXT CONTENT changes - not DOM structure, not layout
 * 4. Use justify-around - works because container width is fixed
 * 5. No calculations, no slots, no transforms - just simple static layout
 * 
 * Why this works:
 * - Container is fixed in viewport → never moves
 * - Container width is constant → spacing calculations don't change
 * - Only textContent updates → no layout recalculation needed
 * - Simple flexbox → browser handles spacing efficiently
 */
function UnifiedWordDisplayComponent({
  tokens,
  centerIndex,
  fontSize,
}: UnifiedWordDisplayProps) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center pointer-events-none z-10"
      role="main"
      aria-label="Reading area"
      aria-live="polite"
    >
      {/* ORP vertical line indicator - fixed at screen center */}
      <div
        className="absolute left-1/2 top-0 bottom-0 w-px bg-white/30"
        aria-hidden="true"
      />

      {/* Static container with fixed width - never moves */}
      <div
        className="flex items-center justify-between"
        style={{
          width: "90vw",
          fontSize: `${fontSize}px`,
          lineHeight: "var(--reader-line-height)",
          whiteSpace: "nowrap",
        }}
      >
        {tokens.map((token, index) => {
          const distanceFromCenter = index - centerIndex;
          const opacity = calculateOpacity(distanceFromCenter);
          const isCenter = index === centerIndex;

          if (!token) {
            // Empty slot at document boundaries
            return (
              <span
                key={index}
                style={{ opacity: 0 }}
                aria-hidden="true"
              >
                {"\u00A0"}
              </span>
            );
          }

          const orpIndex = token.orp ?? calculateORP(token.text);
          const textBeforeORP = token.text.slice(0, orpIndex);
          const orpChar = token.text[orpIndex] || "";
          const textAfterORP = token.text.slice(orpIndex + 1);

          const styling = {
            fontWeight: token.bold ? 700 : 400,
            fontStyle: token.italic ? "italic" as const : "normal" as const,
            fontFamily: token.code 
              ? "var(--font-geist-mono, 'Courier New', monospace)" 
              : "var(--font-reader)",
            backgroundColor: token.code ? "rgba(255, 255, 255, 0.1)" : "transparent",
            padding: token.code ? "0.125rem 0.25rem" : "0",
            borderRadius: token.code ? "0.25rem" : "0",
          };

          return (
            <span
              key={index}
              className="relative inline-block transition-opacity duration-150"
              style={{
                opacity,
                color: "var(--foreground)",
                ...styling,
              }}
            >
              {isCenter ? (
                // Center word: highlight ORP character
                <>
                  {textBeforeORP}
                  <span className="relative">
                    {orpChar}
                  </span>
                  {textAfterORP}
                </>
              ) : (
                // Peripheral words: just show text
                token.text
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// Export memoized component to prevent unnecessary re-renders
// Simplified comparison - only re-render when props actually change
export const UnifiedWordDisplay = memo(UnifiedWordDisplayComponent, (prevProps, nextProps) => {
  if (
    prevProps.fontSize !== nextProps.fontSize ||
    prevProps.centerIndex !== nextProps.centerIndex ||
    prevProps.tokens.length !== nextProps.tokens.length
  ) {
    return false;
  }
  
  // Check if actual token content changed
  for (let i = 0; i < prevProps.tokens.length; i++) {
    const prev = prevProps.tokens[i];
    const next = nextProps.tokens[i];
    if (
      prev?.text !== next?.text ||
      prev?.bold !== next?.bold ||
      prev?.italic !== next?.italic ||
      prev?.code !== next?.code
    ) {
      return false;
    }
  }
  
  return true;
});

UnifiedWordDisplay.displayName = "UnifiedWordDisplay";

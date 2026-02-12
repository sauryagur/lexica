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
 * UnifiedWordDisplay - Center-anchored positioning approach
 * 
 * Key principles:
 * 1. Center word is ABSOLUTELY positioned at screen center (left: 50%, translateX: -50%)
 * 2. Left/right words expand OUTWARD from center anchor
 * 3. FIXED gap spacing between words (gap-8 = 2rem)
 * 4. NO container width constraints - sizes to content
 * 5. NO justify-between/space-distribution - explicit gaps only
 * 
 * Why this works:
 * - Center word never moves → perfect stability
 * - Left/right groups positioned relative to center → predictable layout
 * - Fixed gaps → consistent spacing regardless of word lengths
 * - Only text content changes → no layout recalculation
 * - Absolute positioning → no flex space distribution
 */
function UnifiedWordDisplayComponent({
  tokens,
  centerIndex,
  fontSize,
}: UnifiedWordDisplayProps) {
  // Split tokens into three groups
  const leftTokens = tokens.slice(0, centerIndex);
  const centerToken = tokens[centerIndex];
  const rightTokens = tokens.slice(centerIndex + 1);

  // Gap between words in rem (gap-8 = 2rem)
  const gapRem = 2;

  // Render a single token with styling
  const renderToken = (token: Token | null | undefined, distanceFromCenter: number) => {
    if (!token) {
      return (
        <span style={{ opacity: 0 }} aria-hidden="true">
          {"\u00A0"}
        </span>
      );
    }

    const opacity = calculateOpacity(distanceFromCenter);
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
        className="inline-block transition-opacity duration-150"
        style={{
          opacity,
          color: "var(--foreground)",
          ...styling,
        }}
      >
        {token.text}
      </span>
    );
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center pointer-events-none z-10"
      role="main"
      aria-label="Reading area"
      aria-live="polite"
    >
      {/* ORP vertical line indicator - fixed at center */}
      <div
        className="orp-line"
        style={{
          position: "fixed",
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

      {/* Container for all positioned groups */}
      <div
        className="relative"
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: "var(--reader-line-height)",
          whiteSpace: "nowrap",
        }}
      >
        {/* Left words - positioned to the left of center */}
        {leftTokens.length > 0 && (
          <div
            className="absolute right-1/2 flex gap-8 items-center"
            style={{
              top: "50%",
              transform: `translateX(-${gapRem}rem) translateY(-50%)`,
            }}
          >
            {leftTokens.map((token, idx) => (
              <div key={idx}>
                {renderToken(token, idx - centerIndex)}
              </div>
            ))}
          </div>
        )}

        {/* Center word - absolutely positioned at screen center */}
        {centerToken && (
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              transform: "translate(-50%, -50%)",
            }}
          >
            {renderToken(centerToken, 0)}
          </div>
        )}

        {/* Right words - positioned to the right of center */}
        {rightTokens.length > 0 && (
          <div
            className="absolute left-1/2 flex gap-8 items-center"
            style={{
              transform: `translateX(${gapRem}rem) translateY(-50%)`,
              top: "50%",
            }}
          >
            {rightTokens.map((token, idx) => (
              <div key={idx}>
                {renderToken(token, idx + 1)}
              </div>
            ))}
          </div>
        )}
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

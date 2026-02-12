/**
 * UnifiedWordDisplay Component
 * Single unified layout showing all words (peripheral + active) in one flexbox
 * Replaces separate WordLane and PeripheralContext components
 */

"use client";

import { useMemo, useRef, useEffect, memo } from "react";
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
 * UnifiedWordDisplay - Single flexbox layout with all words
 * 
 * Features:
 * - Single flexbox container spanning 90vw
 * - Fixed-width slots for each word position (eliminates bouncing)
 * - All words (peripheral + active) in one layout
 * - Opacity gradient based on distance from center
 * - ORP line indicator on active word only
 * - Much larger text for comfortable reading
 * - No interference between components
 * - Text centered within each slot, slots never move
 */
function UnifiedWordDisplayComponent({
  tokens,
  centerIndex,
  fontSize,
}: UnifiedWordDisplayProps) {
  const wordRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate word data with opacity and ORP
  const wordData = useMemo(() => {
    return tokens.map((token, index) => {
      const distanceFromCenter = index - centerIndex;
      const opacity = calculateOpacity(distanceFromCenter);
      const isCenter = index === centerIndex;
      const orpIndex = token?.orp ?? (token ? calculateORP(token.text) : 0);

      return {
        token,
        opacity,
        isCenter,
        orpIndex,
        distanceFromCenter,
      };
    });
  }, [tokens, centerIndex]);

  // Calculate and apply transform to align center word's ORP to screen center
  useEffect(() => {
    if (!containerRef.current) return;

    const centerWordRef = wordRefs.current[centerIndex];
    if (!centerWordRef) return;

    const centerToken = tokens[centerIndex];
    if (!centerToken) return;

    // Create a temporary canvas to measure character widths precisely
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set font to match the word element
    const computedStyle = window.getComputedStyle(centerWordRef);
    ctx.font = `${computedStyle.fontStyle} ${computedStyle.fontWeight} ${computedStyle.fontSize} ${computedStyle.fontFamily}`;

    // Measure width up to ORP character
    const orpIndex = centerToken.orp ?? calculateORP(centerToken.text);
    const textBeforeORP = centerToken.text.slice(0, orpIndex);
    const widthBeforeORP = ctx.measureText(textBeforeORP).width;
    
    // Measure width of ORP character itself (to get its center)
    const orpChar = centerToken.text[orpIndex] || "";
    const orpCharWidth = ctx.measureText(orpChar).width;
    
    // Calculate offset: distance from word start to ORP character center
    const orpOffset = widthBeforeORP + (orpCharWidth / 2);

    // Get the center word's position relative to container
    const containerRect = containerRef.current.getBoundingClientRect();
    const wordRect = centerWordRef.getBoundingClientRect();
    const wordLeftRelativeToContainer = wordRect.left - containerRect.left;

    // Calculate how much to shift the entire container
    // We want: wordLeftRelativeToContainer + orpOffset = containerWidth / 2
    const containerCenter = containerRect.width / 2;
    const screenCenter = window.innerWidth / 2;
    
    // Calculate the shift needed
    const shiftNeeded = screenCenter - (wordRect.left + orpOffset);
    
    // Apply transform to container
    containerRef.current.style.transform = `translateX(${shiftNeeded}px)`;
  }, [tokens, centerIndex, fontSize]);

  // Calculate fixed slot width based on number of tokens
  const slotWidth = tokens.length > 0 ? `${90 / tokens.length}vw` : "18vw";

  return (
    <div
      className="unified-word-display-wrapper"
      role="main"
      aria-label="Reading area"
      aria-live="polite"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* ORP vertical line indicator - fixed at screen center */}
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
          zIndex: 10,
        }}
        aria-hidden="true"
      />

      {/* Unified word container */}
      <div
        ref={containerRef}
        className="unified-word-display"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: `${fontSize}px`,
          lineHeight: "var(--reader-line-height)",
          whiteSpace: "nowrap",
          width: "90vw",
          transition: "transform 0.15s ease-out",
        }}
      >
        {wordData.map((data, index) => {
          const { token, opacity, isCenter } = data;
          
          if (!token) {
            // Empty slot at document boundaries - fixed width slot
            return (
              <div
                key={index}
                ref={(el) => {
                  wordRefs.current[index] = el;
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: slotWidth,
                  minWidth: "150px",
                  opacity: 0,
                }}
              >
                {"\u00A0"}
              </div>
            );
          }

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
            <div
              key={index}
              ref={(el) => {
                wordRefs.current[index] = el;
              }}
              className="reader-text unified-word-slot"
              data-center={isCenter}
              data-distance={data.distanceFromCenter}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: slotWidth,
                minWidth: "150px",
                opacity,
                transition: "opacity 0.15s ease-out",
                zIndex: isCenter ? 5 : 1,
              }}
            >
              <span
                className="unified-word-content"
                style={{
                  display: "inline-block",
                  color: "var(--foreground)",
                  ...styling,
                }}
              >
                {token.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Export memoized component to prevent unnecessary re-renders
export const UnifiedWordDisplay = memo(UnifiedWordDisplayComponent, (prevProps, nextProps) => {
  // Only re-render if tokens array content changes or fontSize/centerIndex changes
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

/**
 * PeripheralContext Component
 * Displays tokens around the center word with gradient opacity
 * Performance: Memoized to prevent unnecessary re-renders
 */

"use client";

import { useMemo, useRef, useEffect, memo } from "react";
import type { Token } from "@/app/types";

export interface PeripheralContextProps {
  tokens: Token[];
  centerIndex: number;
  fontSize: number;
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
 * PeripheralContext - Displays context tokens around center word
 * 
 * Features:
 * - Fixed DOM structure with slots for each position
 * - Gradient opacity based on distance from center
 * - Only updates textContent, not DOM nodes
 * - Handles empty slots at document boundaries
 * - Matches WordLane typography
 * - Memoized for performance
 */
function PeripheralContextComponent({
  tokens,
  centerIndex,
  fontSize,
}: PeripheralContextProps) {
  const slotsRef = useRef<(HTMLSpanElement | null)[]>([]);
  
  // Calculate window radius from centerIndex
  const windowRadius = useMemo(() => {
    return centerIndex;
  }, [centerIndex]);

  // Create fixed slot structure based on radius
  // For radius=2: [-2, -1, CENTER, +1, +2] = 5 slots
  const totalSlots = (windowRadius * 2) + 1;

  // Update slot contents efficiently (only textContent, not DOM)
  useEffect(() => {
    slotsRef.current.forEach((slot, slotIndex) => {
      if (!slot) return;

      const token = tokens[slotIndex];
      
      if (token) {
        slot.textContent = token.text;
        
        // Apply styling based on token properties
        slot.style.fontWeight = token.bold ? "700" : "400";
        slot.style.fontStyle = token.italic ? "italic" : "normal";
        
        if (token.code) {
          slot.style.fontFamily = "var(--font-geist-mono, 'Courier New', monospace)";
          slot.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
          slot.style.padding = "0.125rem 0.25rem";
          slot.style.borderRadius = "0.25rem";
        } else {
          slot.style.fontFamily = "var(--font-reader)";
          slot.style.backgroundColor = "transparent";
          slot.style.padding = "0";
          slot.style.borderRadius = "0";
        }
      } else {
        // Empty slot
        slot.textContent = "\u00A0"; // Non-breaking space
        slot.style.fontWeight = "400";
        slot.style.fontStyle = "normal";
        slot.style.fontFamily = "var(--font-reader)";
        slot.style.backgroundColor = "transparent";
        slot.style.padding = "0";
        slot.style.borderRadius = "0";
      }
    });
  }, [tokens]);

  // Generate slots array
  const slots = useMemo(() => {
    return Array.from({ length: totalSlots }, (_, index) => {
      const distanceFromCenter = index - centerIndex;
      const opacity = calculateOpacity(distanceFromCenter);
      const isCenter = index === centerIndex;
      
      return {
        key: index,
        distanceFromCenter,
        opacity,
        isCenter,
      };
    });
  }, [totalSlots, centerIndex]);

  return (
    <div
      className="peripheral-context"
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5em",
        fontSize: `${fontSize}px`,
        lineHeight: "var(--reader-line-height)",
        pointerEvents: "none",
        whiteSpace: "nowrap",
        width: "90vw",
        maxWidth: "1200px",
      }}
    >
      {slots.map((slot, index) => (
        <span
          key={slot.key}
          ref={(el) => {
            slotsRef.current[index] = el;
          }}
          className="reader-text peripheral-token"
          data-distance={slot.distanceFromCenter}
          data-center={slot.isCenter}
          style={{
            display: "inline-block",
            opacity: slot.opacity,
            color: "var(--foreground)",
            fontFamily: "var(--font-reader)",
            fontWeight: 400,
            fontStyle: "normal",
            transition: "opacity 0.1s ease-out",
            visibility: slot.isCenter ? "hidden" : "visible", // Hide center slot (WordLane shows it)
          }}
        >
          {"\u00A0"}
        </span>
      ))}
    </div>
  );
}

// Export memoized component to prevent unnecessary re-renders
export const PeripheralContext = memo(PeripheralContextComponent, (prevProps, nextProps) => {
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

PeripheralContext.displayName = "PeripheralContext";

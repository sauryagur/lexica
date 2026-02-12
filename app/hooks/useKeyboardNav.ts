/**
 * useKeyboardNav Hook
 * Handles keyboard navigation for the reader
 * Includes performance monitoring for <2ms target
 */

"use client";

import { useEffect } from "react";

export interface UseKeyboardNavOptions {
  onAdvance: () => void;
  onRetreat: () => void;
  onToggleUI: () => void;
  enabled?: boolean;
}

/**
 * useKeyboardNav - Global keyboard navigation hook
 * 
 * Features:
 * - Spacebar → advance
 * - ArrowRight → advance
 * - ArrowLeft → retreat
 * - Escape → toggle UI
 * - Prevents default browser actions
 * - Only listens when enabled
 * - Cleanup on unmount
 * 
 * @param options - Configuration object with callback handlers
 */
export function useKeyboardNav({
  onAdvance,
  onRetreat,
  onToggleUI,
  enabled = true,
}: UseKeyboardNavOptions): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      switch (event.key) {
        case " ": // Spacebar
          event.preventDefault();
          // Performance monitoring
          performance.mark("nav-start");
          onAdvance();
          performance.mark("nav-end");
          performance.measure("navigation", "nav-start", "nav-end");
          
          // Check performance and warn if >2ms
          const measure = performance.getEntriesByName("navigation")[0] as PerformanceMeasure;
          if (measure && measure.duration > 2) {
            console.warn(`⚠️ Navigation latency: ${measure.duration.toFixed(2)}ms (target: <2ms)`);
          }
          
          // Cleanup marks and measures
          performance.clearMarks("nav-start");
          performance.clearMarks("nav-end");
          performance.clearMeasures("navigation");
          break;

        case "ArrowRight":
          event.preventDefault();
          // Performance monitoring
          performance.mark("nav-start");
          onAdvance();
          performance.mark("nav-end");
          performance.measure("navigation", "nav-start", "nav-end");
          
          const measureRight = performance.getEntriesByName("navigation")[0] as PerformanceMeasure;
          if (measureRight && measureRight.duration > 2) {
            console.warn(`⚠️ Navigation latency: ${measureRight.duration.toFixed(2)}ms (target: <2ms)`);
          }
          
          performance.clearMarks("nav-start");
          performance.clearMarks("nav-end");
          performance.clearMeasures("navigation");
          break;

        case "ArrowLeft":
          event.preventDefault();
          onRetreat();
          break;

        case "Escape":
          event.preventDefault();
          onToggleUI();
          break;

        default:
          // No action for other keys
          break;
      }
    };

    // Add event listener
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup on unmount or when dependencies change
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, onAdvance, onRetreat, onToggleUI]);
}

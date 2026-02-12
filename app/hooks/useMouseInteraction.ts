/**
 * Mouse Interaction Hook
 * Detects mouse movement and manages UI chrome visibility with idle timeout
 */

"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseMouseInteractionOptions {
  onInteraction: () => void; // Show UI
  onIdle?: () => void; // Hide UI after timeout (optional)
  idleTimeout?: number; // Hide after N ms (default: 3000)
  enabled?: boolean; // Enable/disable tracking (default: true)
}

/**
 * useMouseInteraction - Hook for detecting mouse movement and managing UI visibility
 * 
 * Features:
 * - Detects mouse movement (debounced)
 * - Calls onInteraction() to show UI chrome
 * - Starts idle timer
 * - Hides UI after timeout of no movement
 * - Resets timer on any mouse move
 * - Cleanup on unmount
 * - Only tracks when enabled
 * 
 * Usage:
 * ```tsx
 * useMouseInteraction({
 *   onInteraction: () => setUIVisible(true),
 *   onIdle: () => setUIVisible(false),
 *   idleTimeout: 3000,
 *   enabled: true
 * });
 * ```
 */
export function useMouseInteraction({
  onInteraction,
  onIdle,
  idleTimeout = 3000,
  enabled = true,
}: UseMouseInteractionOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInteractingRef = useRef(false);

  // Clear existing timeout
  const clearIdleTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Start idle timeout
  const startIdleTimeout = useCallback(() => {
    clearIdleTimeout();
    
    if (onIdle) {
      timeoutRef.current = setTimeout(() => {
        isInteractingRef.current = false;
        onIdle();
      }, idleTimeout);
    }
  }, [idleTimeout, onIdle, clearIdleTimeout]);

  // Handle mouse move event
  const handleMouseMove = useCallback(() => {
    // Only trigger onInteraction if we weren't already interacting
    if (!isInteractingRef.current) {
      isInteractingRef.current = true;
      onInteraction();
    }

    // Reset idle timer
    startIdleTimeout();
  }, [onInteraction, startIdleTimeout]);

  // Set up mouse move listener
  useEffect(() => {
    if (!enabled) {
      clearIdleTimeout();
      return;
    }

    // Add event listener
    window.addEventListener("mousemove", handleMouseMove);

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearIdleTimeout();
    };
  }, [enabled, handleMouseMove, clearIdleTimeout]);

  // Return cleanup function for manual use if needed
  return {
    reset: () => {
      isInteractingRef.current = false;
      clearIdleTimeout();
    },
  };
}

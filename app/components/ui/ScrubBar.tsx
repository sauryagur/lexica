/**
 * ScrubBar Component
 * Horizontal progress bar at bottom with scrubbing functionality
 */

"use client";

import { useState, useRef, type MouseEvent } from "react";

interface ScrubBarProps {
  progress: number; // 0-100
  visible: boolean;
  onSeek: (percentage: number) => void;
}

/**
 * ScrubBar - Interactive progress bar for document navigation
 * 
 * Features:
 * - Position: bottom of screen (horizontal bar)
 * - Thin bar (2-3px) when not hovering
 * - Expand on hover (8-10px)
 * - Draggable slider
 * - Click to jump
 * - Current position indicator (dot/thumb)
 * - Calls onSeek() when user interacts
 * - Snap to paragraph (handled by parent via jumpToPercentage)
 * - Fade out when visible=false
 * - Smooth transitions
 */
export function ScrubBar({ progress, visible, onSeek }: ScrubBarProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  // Calculate percentage from mouse position
  const getPercentageFromEvent = (event: MouseEvent | globalThis.MouseEvent): number => {
    if (!barRef.current) return progress;
    
    const rect = barRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    
    // Clamp to 0-100
    return Math.max(0, Math.min(100, percentage));
  };

  // Handle click on bar
  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    const percentage = getPercentageFromEvent(event);
    onSeek(percentage);
  };

  // Handle mouse down to start dragging
  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
    
    const percentage = getPercentageFromEvent(event);
    onSeek(percentage);
  };

  // Handle mouse move during drag (use global listener)
  const handleMouseMove = (event: globalThis.MouseEvent) => {
    if (!isDragging) return;
    
    const percentage = getPercentageFromEvent(event);
    onSeek(percentage);
  };

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Set up and clean up global mouse listeners for dragging
  if (typeof window !== "undefined") {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
  }

  // Calculate bar height based on hover/drag state
  const barHeight = isHovering || isDragging ? "10px" : "3px";

  return (
    <div
      ref={barRef}
      className="scrub-bar"
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: barHeight,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        cursor: "pointer",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.3s ease-in-out, height 0.2s ease-in-out",
        zIndex: 90,
      }}
    >
      {/* Progress fill */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          width: `${progress}%`,
          backgroundColor: "var(--foreground)",
          opacity: 0.3,
          transition: isDragging ? "none" : "width 0.1s ease-out",
        }}
      />

      {/* Current position indicator (thumb) */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: `${progress}%`,
          width: isHovering || isDragging ? "12px" : "8px",
          height: isHovering || isDragging ? "12px" : "8px",
          borderRadius: "50%",
          backgroundColor: "var(--foreground)",
          transform: "translate(-50%, -50%)",
          transition: isDragging ? "none" : "width 0.2s ease-in-out, height 0.2s ease-in-out, left 0.1s ease-out",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

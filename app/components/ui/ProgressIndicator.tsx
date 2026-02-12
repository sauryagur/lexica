/**
 * ProgressIndicator Component
 * Displays reading progress as diamond icon + percentage
 * Positioned at bottom-right, fades out when hidden
 */

"use client";

interface ProgressIndicatorProps {
  progress: number; // 0-100
  visible: boolean;
}

/**
 * ProgressIndicator - Shows current reading progress
 * 
 * Features:
 * - Position: bottom-right (absolute)
 * - Display: diamond icon + percentage
 * - Format: "◆ 21%" (no decimals)
 * - Low opacity when not interacting
 * - Fade out when visible=false
 * - Small, minimal design
 * - Subtle transition on show/hide
 */
export function ProgressIndicator({ progress, visible }: ProgressIndicatorProps) {
  // Format progress with no decimals
  const formattedProgress = Math.round(progress);

  return (
    <div
      className="progress-indicator"
      style={{
        position: "absolute",
        bottom: "1rem",
        right: "1rem",
        fontSize: "0.875rem",
        color: "var(--foreground)",
        opacity: visible ? 0.5 : 0,
        transition: "opacity 0.3s ease-in-out",
        pointerEvents: "none",
        fontFamily: "var(--font-ui)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        gap: "0.375rem",
      }}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          opacity: 0.8,
        }}
      >
        <path
          d="M6 1L9.5 6L6 11L2.5 6L6 1Z"
          fill="currentColor"
        />
      </svg>
      <span>{formattedProgress}%</span>
    </div>
  );
}

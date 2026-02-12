/**
 * Breadcrumb Component
 * Displays hierarchical document position (e.g., "Chapter › Section › Subsection")
 * Positioned at top-left with low opacity, fades out when hidden
 */

"use client";

interface BreadcrumbProps {
  path: string[]; // e.g., ["Chapter 3", "Neural Plasticity", "Long-Term Potentiation"]
  visible: boolean;
}

/**
 * Breadcrumb - Shows current position in document hierarchy
 * 
 * Features:
 * - Position: top-left (absolute)
 * - Format: "Chapter › Section › Subsection"
 * - Low opacity (~40-50%)
 * - Small font size (0.875rem / 14px)
 * - Fade out when visible=false
 * - Truncates to max 3 levels
 * - Subtle transition on show/hide
 */
export function Breadcrumb({ path, visible }: BreadcrumbProps) {
  // Don't render if path is empty
  if (path.length === 0) {
    return null;
  }

  // Truncate to max 3 levels (show last 3 items)
  const displayPath = path.length > 3 ? path.slice(-3) : path;

  return (
    <div
      className="breadcrumb"
      style={{
        position: "absolute",
        top: "1rem",
        left: "1rem",
        fontSize: "0.875rem",
        color: "var(--foreground)",
        opacity: visible ? 0.5 : 0,
        transition: "opacity 0.3s ease-in-out",
        pointerEvents: "none",
        fontFamily: "var(--font-ui)",
        zIndex: 50,
      }}
    >
      {displayPath.join(" › ")}
    </div>
  );
}

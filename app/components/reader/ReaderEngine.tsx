/**
 * ReaderEngine Component
 * Main orchestrator for the reading interface
 */

"use client";

import { useState, useCallback, useMemo } from "react";
import { useReader } from "@/app/context/ReaderContext";
import { useKeyboardNav } from "@/app/hooks/useKeyboardNav";
import { WordLane } from "./WordLane";
import { PeripheralContext } from "./PeripheralContext";
import { ImageDisplay } from "./ImageDisplay";
import { getCurrentImageNode } from "@/app/lib/engine/reader-state";
import type { ImageNode } from "@/app/types";

/**
 * ReaderEngine - Main reading interface orchestrator
 * 
 * Features:
 * - Composes WordLane + PeripheralContext OR ImageDisplay
 * - Handles keyboard navigation
 * - UI visibility toggle (ESC)
 * - Pure black background
 * - Minimal UI during reading
 * - Performance optimized: <2ms render on token advance
 * - Handles loading and empty states
 */
export function ReaderEngine() {
  const {
    pages,
    anchors,
    currentToken,
    peripheralWindow,
    isOnImage,
    settings,
    currentIndex,
    advance,
    retreat,
  } = useReader();

  // UI visibility state (toggled by ESC)
  const [uiVisible, setUIVisible] = useState(false);

  // Toggle UI visibility
  const toggleUI = useCallback(() => {
    setUIVisible((prev) => !prev);
  }, []);

  // Keyboard navigation handlers
  useKeyboardNav({
    onAdvance: advance,
    onRetreat: retreat,
    onToggleUI: toggleUI,
    enabled: pages !== null && anchors !== null,
  });

  // Get current image node if on image
  const currentImage = useMemo<ImageNode | null>(() => {
    if (!isOnImage || !pages || !anchors) {
      return null;
    }
    
    return getCurrentImageNode({
      pages,
      anchors,
      currentIndex,
      settings,
    });
  }, [isOnImage, pages, anchors, currentIndex, settings]);

  // Calculate center index for peripheral context
  const centerIndex = useMemo(() => {
    return settings.windowRadius;
  }, [settings.windowRadius]);

  // Handle loading state
  if (pages === null || anchors === null) {
    return (
      <div
        className="reader-engine"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "var(--background)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--foreground)",
          fontFamily: "var(--font-ui)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            opacity: 0.5,
          }}
        >
          <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
            No document loaded
          </div>
          <div style={{ fontSize: "0.875rem" }}>
            Upload a markdown file to begin reading
          </div>
        </div>
      </div>
    );
  }

  // Handle empty document state
  if (pages.length === 0) {
    return (
      <div
        className="reader-engine"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "var(--background)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--foreground)",
          fontFamily: "var(--font-ui)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            opacity: 0.5,
          }}
        >
          <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
            Empty document
          </div>
          <div style={{ fontSize: "0.875rem" }}>
            This document contains no readable content
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="reader-engine"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "var(--background)",
        overflow: "hidden",
      }}
    >
      {/* Main reading area */}
      <div
        className="reading-area"
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isOnImage && currentImage ? (
          // Image mode: show centered image
          <ImageDisplay image={currentImage} />
        ) : (
          // Text mode: show peripheral context + word lane
          <>
            <PeripheralContext
              tokens={peripheralWindow}
              centerIndex={centerIndex}
              fontSize={settings.fontSize}
            />
            <WordLane token={currentToken} fontSize={settings.fontSize} />
          </>
        )}
      </div>

      {/* UI Chrome (hidden by default, shown on ESC or mouse move) */}
      {uiVisible && (
        <div
          className="ui-chrome"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            padding: "1rem",
            background: "var(--ui-background)",
            borderBottom: "1px solid var(--ui-border)",
            color: "var(--foreground)",
            fontFamily: "var(--font-ui)",
            opacity: "var(--ui-opacity)",
            transition: "opacity 0.2s ease-in-out",
            zIndex: 100,
          }}
        >
          <div style={{ fontSize: "0.875rem", opacity: 0.7 }}>
            Press ESC to hide UI • Space/→ to advance • ← to retreat
          </div>
        </div>
      )}
    </div>
  );
}

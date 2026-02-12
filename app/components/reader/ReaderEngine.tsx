/**
 * ReaderEngine Component
 * Main orchestrator for the reading interface
 */

"use client";

import { useState, useCallback, useMemo } from "react";
import { useReader } from "@/app/context/ReaderContext";
import { useKeyboardNav } from "@/app/hooks/useKeyboardNav";
import { useMouseInteraction } from "@/app/hooks/useMouseInteraction";
import { WordLane } from "./WordLane";
import { PeripheralContext } from "./PeripheralContext";
import { ImageDisplay } from "./ImageDisplay";
import { Breadcrumb } from "../ui/Breadcrumb";
import { ProgressIndicator } from "../ui/ProgressIndicator";
import { SettingsPanel } from "../ui/SettingsPanel";
import { ScrubBar } from "../ui/ScrubBar";
import { getCurrentImageNode } from "@/app/lib/engine/reader-state";
import type { ImageNode } from "@/app/types";

/**
 * ReaderEngine - Main reading interface orchestrator
 * 
 * Features:
 * - Composes WordLane + PeripheralContext OR ImageDisplay
 * - Handles keyboard navigation
 * - UI visibility toggle (ESC + mouse movement)
 * - Chrome UI: Breadcrumb, Progress, Settings, ScrubBar
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
    progress,
    breadcrumb,
    advance,
    retreat,
    jumpToPercentage,
  } = useReader();

  // UI visibility state
  const [chromeVisible, setChromeVisible] = useState(false);
  const [settingsPanelVisible, setSettingsPanelVisible] = useState(false);

  // Show chrome UI (triggered by mouse or ESC)
  const showChrome = useCallback(() => {
    setChromeVisible(true);
  }, []);

  // Hide chrome UI (triggered by idle timeout)
  const hideChrome = useCallback(() => {
    setChromeVisible(false);
  }, []);

  // Toggle settings panel (ESC key)
  const toggleSettingsPanel = useCallback(() => {
    setSettingsPanelVisible((prev) => !prev);
    
    // Also show chrome when toggling settings
    if (!settingsPanelVisible) {
      showChrome();
    }
  }, [settingsPanelVisible, showChrome]);

  // Hide settings panel when reading resumes (spacebar/arrows)
  const handleAdvance = useCallback(() => {
    setSettingsPanelVisible(false);
    advance();
  }, [advance]);

  const handleRetreat = useCallback(() => {
    setSettingsPanelVisible(false);
    retreat();
  }, [retreat]);

  // Handle scrub bar seek
  const handleSeek = useCallback(
    (percentage: number) => {
      jumpToPercentage(percentage);
    },
    [jumpToPercentage]
  );

  // Mouse interaction hook - show chrome on movement, hide after idle
  useMouseInteraction({
    onInteraction: showChrome,
    onIdle: hideChrome,
    idleTimeout: 3000,
    enabled: pages !== null && anchors !== null,
  });

  // Keyboard navigation handlers
  useKeyboardNav({
    onAdvance: handleAdvance,
    onRetreat: handleRetreat,
    onToggleUI: toggleSettingsPanel,
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

      {/* Chrome UI Components */}
      <Breadcrumb path={breadcrumb} visible={chromeVisible} />
      <ProgressIndicator progress={progress} visible={chromeVisible} />
      <SettingsPanel
        visible={settingsPanelVisible}
        onClose={() => setSettingsPanelVisible(false)}
      />
      <ScrubBar progress={progress} visible={chromeVisible} onSeek={handleSeek} />
    </div>
  );
}

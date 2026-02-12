/**
 * SettingsPanel Component
 * Bottom-left settings panel with theme, font size, window radius, and file upload
 */

"use client";

import { useReader } from "@/app/context/ReaderContext";
import { FileUpload } from "./FileUpload";
import type { ChangeEvent } from "react";

interface SettingsPanelProps {
  visible: boolean;
  onClose?: () => void;
}

/**
 * SettingsPanel - Configuration panel for reader settings
 * 
 * Features:
 * - Position: bottom-left (absolute)
 * - Semi-transparent dark panel with rounded corners
 * - Theme toggle (Light/Dark radio buttons)
 * - Font size slider (12-32px)
 * - Window radius slider (1-3 words)
 * - File upload button
 * - Backdrop blur effect
 * - Smooth transitions
 * - Compact, clean design
 */
export function SettingsPanel({ visible, onClose }: SettingsPanelProps) {
  const { settings, updateSettings, loadDocument } = useReader();

  // Handle theme change
  const handleThemeChange = (theme: "light" | "dark") => {
    updateSettings({ theme });
    
    // Update document theme attribute
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
    }
  };

  // Handle font size change
  const handleFontSizeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const fontSize = parseInt(event.target.value, 10);
    updateSettings({ fontSize });
  };

  // Handle window radius change
  const handleWindowRadiusChange = (event: ChangeEvent<HTMLInputElement>) => {
    const windowRadius = parseInt(event.target.value, 10);
    updateSettings({ windowRadius });
  };

  // Handle file upload
  const handleFileLoad = (content: string, fileName: string) => {
    // Extract document ID from filename (remove extension)
    const docId = fileName.replace(/\.(md|txt|markdown)$/i, "");
    loadDocument(content, docId, fileName);
    
    // Optionally close settings panel after loading
    // onClose?.();
  };

  return (
    <div
      className="settings-panel"
      style={{
        position: "absolute",
        bottom: "1rem",
        left: "1rem",
        backgroundColor: "var(--ui-background)",
        border: "1px solid var(--ui-border)",
        borderRadius: "0.5rem",
        padding: "1rem",
        minWidth: "16rem",
        fontFamily: "var(--font-ui)",
        fontSize: "0.875rem",
        color: "var(--foreground)",
        backdropFilter: "blur(8px)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 0.3s ease-in-out",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      {/* Theme Toggle */}
      <div className="setting-group">
        <label
          style={{
            display: "block",
            marginBottom: "0.5rem",
            fontWeight: 500,
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            opacity: 0.7,
          }}
        >
          Theme
        </label>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="theme"
              value="dark"
              checked={settings.theme === "dark"}
              onChange={() => handleThemeChange("dark")}
              style={{ cursor: "pointer" }}
            />
            <span>Dark</span>
          </label>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="theme"
              value="light"
              checked={settings.theme === "light"}
              onChange={() => handleThemeChange("light")}
              style={{ cursor: "pointer" }}
            />
            <span>Light</span>
          </label>
        </div>
      </div>

      {/* Font Size Slider */}
      <div className="setting-group">
        <label
          htmlFor="font-size-slider"
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "0.5rem",
            fontWeight: 500,
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            opacity: 0.7,
          }}
        >
          <span>Font Size</span>
          <span>{settings.fontSize}px</span>
        </label>
        <input
          id="font-size-slider"
          type="range"
          min="12"
          max="32"
          step="1"
          value={settings.fontSize}
          onChange={handleFontSizeChange}
          style={{
            width: "100%",
            cursor: "pointer",
          }}
        />
      </div>

      {/* Window Radius Slider */}
      <div className="setting-group">
        <label
          htmlFor="window-radius-slider"
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "0.5rem",
            fontWeight: 500,
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            opacity: 0.7,
          }}
        >
          <span>Window Radius</span>
          <span>{settings.windowRadius} words</span>
        </label>
        <input
          id="window-radius-slider"
          type="range"
          min="1"
          max="3"
          step="1"
          value={settings.windowRadius}
          onChange={handleWindowRadiusChange}
          style={{
            width: "100%",
            cursor: "pointer",
          }}
        />
      </div>

      {/* File Upload */}
      <div
        className="setting-group"
        style={{
          paddingTop: "0.5rem",
          borderTop: "1px solid var(--ui-border)",
        }}
      >
        <FileUpload onFileLoad={handleFileLoad} />
      </div>
    </div>
  );
}

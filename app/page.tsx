/**
 * Main Application Page
 * Entry point for Lexica reading interface
 */

"use client";

import { ReaderProvider, useReader } from "./context/ReaderContext";
import { ReaderEngine } from "./components/reader/ReaderEngine";
import { FileUpload } from "./components/ui/FileUpload";
import { useReaderPersistence } from "./hooks/useReaderPersistence";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useState } from "react";
import { Toast } from "./components/ui/Toast";

/**
 * Upload Prompt Component
 * Shown when no document is loaded
 */
function UploadPrompt() {
  const { loadDocument } = useReader();
  const [error, setError] = useState<string | null>(null);

  const handleFileLoad = (content: string, fileName: string) => {
    try {
      // Validate content
      if (!content || content.trim().length === 0) {
        setError("File is empty");
        return;
      }

      // Generate a simple doc ID from filename
      const docId = fileName.replace(/\.[^/.]+$/, "");
      loadDocument(content, docId, fileName);
      setError(null);
    } catch (err) {
      console.error("Failed to load document:", err);
      setError("Failed to load document. Please try again.");
    }
  };

  const loadSampleDocument = async () => {
    try {
      const response = await fetch("/sample.md");
      if (!response.ok) {
        throw new Error("Failed to load sample document");
      }
      const content = await response.text();
      loadDocument(content, "sample", "Sample Document");
      setError(null);
    } catch (err) {
      console.error("Failed to load sample document:", err);
      setError("Failed to load sample document");
    }
  };

  return (
    <div
      className="upload-prompt"
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
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: "32rem",
          padding: "2rem",
        }}
      >
        {/* Title */}
        <h1
          style={{
            fontSize: "3rem",
            fontFamily: "var(--font-reading)",
            fontWeight: 400,
            color: "var(--foreground)",
            marginBottom: "0.5rem",
            letterSpacing: "-0.02em",
          }}
        >
          Lexica
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "1rem",
            fontFamily: "var(--font-ui)",
            color: "var(--foreground)",
            opacity: 0.6,
            marginBottom: "3rem",
          }}
        >
          Focus-scaffolding reading interface
        </p>

        {/* Upload button */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <FileUpload onFileLoad={handleFileLoad} />

          {/* Sample document link */}
          <button
            onClick={loadSampleDocument}
            style={{
              background: "none",
              border: "none",
              color: "var(--foreground)",
              opacity: 0.5,
              fontSize: "0.875rem",
              fontFamily: "var(--font-ui)",
              cursor: "pointer",
              textDecoration: "underline",
              padding: "0.5rem",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.8";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "0.5";
            }}
          >
            or try a sample document
          </button>
        </div>

        {/* Error toast */}
        {error && (
          <Toast
            message={error}
            type="error"
            duration={5000}
            onDismiss={() => setError(null)}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Main App Component (inside ReaderProvider)
 */
function MainApp() {
  const { pages, anchors } = useReader();

  // Enable persistence
  useReaderPersistence({
    enabled: true,
    autoSaveInterval: 100,
    debounceMs: 300,
  });

  // Show upload prompt if no document loaded
  if (!pages || !anchors) {
    return <UploadPrompt />;
  }

  // Show reader interface when document loaded
  return <ReaderEngine />;
}

/**
 * Root Page Component
 * Wraps app in ReaderProvider
 */
export default function Home() {
  return (
    <ErrorBoundary>
      <ReaderProvider>
        <MainApp />
      </ReaderProvider>
    </ErrorBoundary>
  );
}

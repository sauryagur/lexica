/**
 * Error Boundary Component
 * Catches React errors and displays user-friendly error UI
 */

"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";
import { getUserFriendlyMessage, isRecoverableError } from "../lib/errors/error-types";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary - Catches and handles React errors
 * 
 * Features:
 * - Catches errors in child components
 * - Shows user-friendly error messages
 * - Provides recovery options
 * - Logs errors to console
 * - Prevents app crashes
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught error:", error, errorInfo);
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      // Default error UI
      const message = getUserFriendlyMessage(this.state.error);
      const recoverable = isRecoverableError(this.state.error);

      return (
        <div
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
            padding: "2rem",
          }}
        >
          <div
            style={{
              maxWidth: "32rem",
              textAlign: "center",
              color: "var(--foreground)",
              fontFamily: "var(--font-ui)",
            }}
          >
            {/* Error icon */}
            <div
              style={{
                fontSize: "3rem",
                marginBottom: "1rem",
                opacity: 0.5,
              }}
            >
              ⚠️
            </div>

            {/* Error title */}
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: 600,
                marginBottom: "1rem",
              }}
            >
              Something went wrong
            </h1>

            {/* Error message */}
            <p
              style={{
                fontSize: "1rem",
                opacity: 0.8,
                marginBottom: "2rem",
                lineHeight: 1.6,
              }}
            >
              {message}
            </p>

            {/* Recovery actions */}
            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              {recoverable && (
                <button
                  onClick={this.resetError}
                  style={{
                    padding: "0.75rem 1.5rem",
                    fontSize: "0.875rem",
                    fontFamily: "var(--font-ui)",
                    color: "var(--background)",
                    backgroundColor: "var(--foreground)",
                    border: "none",
                    borderRadius: "0.375rem",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  Try Again
                </button>
              )}

              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                style={{
                  padding: "0.75rem 1.5rem",
                  fontSize: "0.875rem",
                  fontFamily: "var(--font-ui)",
                  color: "var(--foreground)",
                  backgroundColor: "transparent",
                  border: "1px solid var(--ui-border)",
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                }}
              >
                Reset App
              </button>
            </div>

            {/* Technical details (for debugging) */}
            {process.env.NODE_ENV === "development" && (
              <details
                style={{
                  marginTop: "2rem",
                  textAlign: "left",
                  fontSize: "0.75rem",
                  opacity: 0.5,
                }}
              >
                <summary style={{ cursor: "pointer", marginBottom: "0.5rem" }}>
                  Technical Details
                </summary>
                <pre
                  style={{
                    padding: "1rem",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    borderRadius: "0.25rem",
                    overflow: "auto",
                    maxHeight: "200px",
                  }}
                >
                  {this.state.error.stack || this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

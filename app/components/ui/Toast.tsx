/**
 * Toast Notification Component
 * Shows brief error/success messages
 */

"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type?: "error" | "success" | "info";
  duration?: number;
  onDismiss?: () => void;
}

/**
 * Toast - Non-intrusive notification component
 * 
 * Features:
 * - Auto-dismiss after duration
 * - Click to dismiss
 * - Different types (error, success, info)
 * - Smooth animations
 * - Non-blocking
 */
export function Toast({ message, type = "info", duration = 5000, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        onDismiss?.();
      }, 300); // Wait for fade-out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  const handleClick = () => {
    setVisible(false);
    setTimeout(() => {
      onDismiss?.();
    }, 300);
  };

  const backgroundColor =
    type === "error"
      ? "#ef4444"
      : type === "success"
      ? "#22c55e"
      : "#3b82f6";

  return (
    <div
      onClick={handleClick}
      style={{
        position: "fixed",
        bottom: visible ? "2rem" : "-5rem",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor,
        color: "white",
        padding: "1rem 1.5rem",
        borderRadius: "0.5rem",
        fontSize: "0.875rem",
        fontFamily: "var(--font-ui)",
        cursor: "pointer",
        zIndex: 10000,
        maxWidth: "90%",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        transition: "bottom 0.3s ease-out, opacity 0.3s ease-out",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {message}
    </div>
  );
}

/**
 * ToastContainer - Manages multiple toasts
 */
interface ToastMessage {
  id: string;
  message: string;
  type?: "error" | "success" | "info";
  duration?: number;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onDismiss={() => onRemove(toast.id)}
        />
      ))}
    </>
  );
}

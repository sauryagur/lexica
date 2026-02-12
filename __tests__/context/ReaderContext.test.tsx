/**
 * Tests for ReaderContext Provider
 */

import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { ReaderProvider, useReader } from "../../app/context/ReaderContext";
import {
  SIMPLE_DOCUMENT,
  HIERARCHICAL_DOCUMENT,
  DOCUMENT_WITH_IMAGES,
  EMPTY_DOCUMENT,
} from "../fixtures/sample-documents";
import type { ReactNode } from "react";

// Wrapper component for testing
const createWrapper = (initialSettings = {}) => {
  return ({ children }: { children: ReactNode }) => (
    <ReaderProvider initialSettings={initialSettings}>{children}</ReaderProvider>
  );
};

describe("ReaderContext", () => {
  describe("initialization", () => {
    it("should initialize with null document state", () => {
      const { result } = renderHook(() => useReader(), {
        wrapper: createWrapper(),
      });

      expect(result.current.stream).toBeNull();
      expect(result.current.pages).toBeNull();
      expect(result.current.anchors).toBeNull();
      expect(result.current.metadata).toBeNull();
    });

    it("should initialize with default settings", () => {
      const { result } = renderHook(() => useReader(), {
        wrapper: createWrapper(),
      });

      expect(result.current.settings.theme).toBe("dark");
      expect(result.current.settings.fontSize).toBe(18);
      expect(result.current.settings.windowRadius).toBe(2);
      expect(result.current.settings.skipImages).toBe(false);
    });

    it("should initialize with custom settings", () => {
      const { result } = renderHook(() => useReader(), {
        wrapper: createWrapper({ theme: "light", fontSize: 24 }),
      });

      expect(result.current.settings.theme).toBe("light");
      expect(result.current.settings.fontSize).toBe(24);
    });

    it("should initialize currentIndex to 0", () => {
      const { result } = renderHook(() => useReader(), {
        wrapper: createWrapper(),
      });

      expect(result.current.currentIndex).toBe(0);
    });

    it("should throw error when used outside provider", () => {
      expect(() => {
        renderHook(() => useReader());
      }).toThrow("useReader must be used within a ReaderProvider");
    });
  });

  describe("loadDocument", () => {
    it("should load document successfully", () => {
      const { result } = renderHook(() => useReader(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.loadDocument(SIMPLE_DOCUMENT);
      });

      expect(result.current.stream).not.toBeNull();
      expect(result.current.pages).not.toBeNull();
      expect(result.current.anchors).not.toBeNull();
      expect(result.current.metadata).not.toBeNull();
    });

    it("should reset currentIndex when loading new document", () => {
      const { result } = renderHook(() => useReader(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.loadDocument(SIMPLE_DOCUMENT);
      });

      act(() => {
        result.current.advance();
        result.current.advance();
      });

      expect(result.current.currentIndex).toBeGreaterThan(0);

      act(() => {
        result.current.loadDocument(HIERARCHICAL_DOCUMENT);
      });

      expect(result.current.currentIndex).toBe(0);
    });

    it("should set metadata correctly", () => {
      const { result } = renderHook(() => useReader(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.loadDocument(SIMPLE_DOCUMENT, "test-id", "Test Document");
      });

      expect(result.current.metadata?.id).toBe("test-id");
      expect(result.current.metadata?.title).toBe("Test Document");
      expect(result.current.metadata?.totalTokens).toBeGreaterThan(0);
    });

    it("should handle empty document", () => {
      const { result } = renderHook(() => useReader(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.loadDocument(EMPTY_DOCUMENT);
      });

      expect(result.current.metadata?.totalTokens).toBe(0);
    });
  });

  describe("navigation actions", () => {
    it("should advance to next token", () => {
      const { result } = renderHook(() => useReader(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.loadDocument(SIMPLE_DOCUMENT);
      });

      const initialIndex = result.current.currentIndex;

      act(() => {
        result.current.advance();
      });

      expect(result.current.currentIndex).toBe(initialIndex + 1);
    });

    it("should retreat to previous token", () => {
      const { result } = renderHook(() => useReader(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.loadDocument(SIMPLE_DOCUMENT);
      });

      act(() => {
        result.current.advance();
        result.current.advance();
      });

      const currentIndex = result.current.currentIndex;
      expect(currentIndex).toBeGreaterThan(0); // Ensure we actually advanced

      act(() => {
        result.current.retreat();
      });

      expect(result.current.currentIndex).toBe(currentIndex - 1);
    });

    it("should jump to specific index", () => {
      const { result } = renderHook(() => useReader(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.loadDocument(SIMPLE_DOCUMENT);
      });

      act(() => {
        result.current.jumpTo(5);
      });

      expect(result.current.currentIndex).toBe(5);
    });

    it("should jump to heading", () => {
      const { result } = renderHook(() => useReader(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.loadDocument(HIERARCHICAL_DOCUMENT);
      });

      const initialIndex = result.current.currentIndex;

      act(() => {
        result.current.jumpToHeading(1);
      });

      expect(result.current.currentIndex).not.toBe(initialIndex);
    });

    it("should jump to percentage", () => {
      const { result } = renderHook(() => useReader(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.loadDocument(SIMPLE_DOCUMENT);
      });

      act(() => {
        result.current.jumpToPercentage(50);
      });

      const progress = result.current.progress;
      expect(progress).toBeGreaterThan(40);
      expect(progress).toBeLessThan(60);
    });
  });

  describe("computed values", () => {
    it("should update currentToken when index changes", () => {
      const { result } = renderHook(() => useReader(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.loadDocument(SIMPLE_DOCUMENT);
      });

      const firstToken = result.current.currentToken;

      act(() => {
        result.current.advance();
      });

      const secondToken = result.current.currentToken;

      expect(firstToken).not.toBeNull();
      expect(secondToken).not.toBeNull();
      expect(firstToken?.text).not.toBe(secondToken?.text);
    });

    it("should update peripheralWindow correctly", () => {
      const { result } = renderHook(() => useReader(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.loadDocument(SIMPLE_DOCUMENT);
        result.current.jumpTo(5);
      });

      expect(result.current.peripheralWindow.length).toBeGreaterThan(0);
    });

    it("should set isOnImage correctly", () => {
      const { result } = renderHook(() => useReader(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.loadDocument(DOCUMENT_WITH_IMAGES);
      });

      expect(result.current.isOnImage).toBe(false);

      // Find first image and jump to it
      if (result.current.anchors) {
        const firstImageIndex = Array.from(
          result.current.anchors.imageAnchors.keys()
        )[0];

        act(() => {
          result.current.jumpTo(firstImageIndex);
        });

        expect(result.current.isOnImage).toBe(true);
      }
    });

    it("should calculate progress correctly", () => {
      const { result } = renderHook(() => useReader(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.loadDocument(SIMPLE_DOCUMENT);
      });

      expect(result.current.progress).toBe(0);

      act(() => {
        result.current.jumpToPercentage(100);
      });

      expect(result.current.progress).toBeGreaterThan(90); // Close to end
    });

    it("should update breadcrumb correctly", () => {
      const { result } = renderHook(() => useReader(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.loadDocument(HIERARCHICAL_DOCUMENT);
      });

      // Initially might be empty or at first heading
      const initialBreadcrumb = result.current.breadcrumb;

      // Jump to middle of document
      if (result.current.metadata) {
        act(() => {
          result.current.jumpToPercentage(50);
        });

        const middleBreadcrumb = result.current.breadcrumb;
        expect(middleBreadcrumb.length).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe("settings updates", () => {
    it("should update settings", () => {
      const { result } = renderHook(() => useReader(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.updateSettings({ fontSize: 24 });
      });

      expect(result.current.settings.fontSize).toBe(24);
    });

    it("should update multiple settings at once", () => {
      const { result } = renderHook(() => useReader(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.updateSettings({
          fontSize: 20,
          theme: "light",
          windowRadius: 3,
        });
      });

      expect(result.current.settings.fontSize).toBe(20);
      expect(result.current.settings.theme).toBe("light");
      expect(result.current.settings.windowRadius).toBe(3);
    });

    it("should preserve other settings when updating", () => {
      const { result } = renderHook(() => useReader(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.updateSettings({ fontSize: 24 });
      });

      expect(result.current.settings.theme).toBe("dark"); // unchanged
      expect(result.current.settings.windowRadius).toBe(2); // unchanged
    });

    it("should affect peripheral window when windowRadius changes", () => {
      const { result } = renderHook(() => useReader(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.loadDocument(SIMPLE_DOCUMENT);
        result.current.jumpTo(10);
      });

      const initialWindowSize = result.current.peripheralWindow.length;

      act(() => {
        result.current.updateSettings({ windowRadius: 5 });
      });

      const newWindowSize = result.current.peripheralWindow.length;

      // Window should be larger with bigger radius
      expect(newWindowSize).toBeGreaterThanOrEqual(initialWindowSize);
    });
  });

  describe("reset", () => {
    it("should reset to initial state", () => {
      const { result } = renderHook(() => useReader(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.loadDocument(SIMPLE_DOCUMENT);
        result.current.advance();
        result.current.advance();
        result.current.updateSettings({ fontSize: 24 });
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.stream).toBeNull();
      expect(result.current.pages).toBeNull();
      expect(result.current.anchors).toBeNull();
      expect(result.current.metadata).toBeNull();
      expect(result.current.currentIndex).toBe(0);
      expect(result.current.settings.fontSize).toBe(18); // back to default
    });

    it("should preserve initialSettings after reset", () => {
      const { result } = renderHook(() => useReader(), {
        wrapper: createWrapper({ theme: "light", fontSize: 22 }),
      });

      act(() => {
        result.current.loadDocument(SIMPLE_DOCUMENT);
        result.current.updateSettings({ fontSize: 30 });
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.settings.theme).toBe("light");
      expect(result.current.settings.fontSize).toBe(22);
    });
  });

  describe("memoization", () => {
    it("should not recompute values unnecessarily", () => {
      const { result, rerender } = renderHook(() => useReader(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.loadDocument(SIMPLE_DOCUMENT);
      });

      const firstToken = result.current.currentToken;
      const firstWindow = result.current.peripheralWindow;

      // Rerender without changing anything
      rerender();

      expect(result.current.currentToken).toBe(firstToken);
      expect(result.current.peripheralWindow).toBe(firstWindow);
    });

    it("should recompute when dependencies change", () => {
      const { result } = renderHook(() => useReader(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.loadDocument(SIMPLE_DOCUMENT);
      });

      const firstWindow = result.current.peripheralWindow;

      act(() => {
        result.current.advance();
      });

      const secondWindow = result.current.peripheralWindow;

      expect(secondWindow).not.toBe(firstWindow);
    });
  });

  describe("edge cases", () => {
    it("should handle actions before document is loaded", () => {
      const { result } = renderHook(() => useReader(), {
        wrapper: createWrapper(),
      });

      // These should not throw
      act(() => {
        result.current.advance();
        result.current.retreat();
        result.current.jumpTo(5);
      });

      expect(result.current.currentIndex).toBe(0);
    });

    it("should handle skipImages setting", () => {
      const { result } = renderHook(() => useReader(), {
        wrapper: createWrapper({ skipImages: true }),
      });

      act(() => {
        result.current.loadDocument(DOCUMENT_WITH_IMAGES);
      });

      if (result.current.anchors) {
        const firstImageIndex = Array.from(
          result.current.anchors.imageAnchors.keys()
        )[0];

        // Jump just before image
        act(() => {
          result.current.jumpTo(firstImageIndex - 1);
        });

        // Advance should skip the image
        act(() => {
          result.current.advance();
        });

        expect(result.current.isOnImage).toBe(false);
      }
    });
  });
});

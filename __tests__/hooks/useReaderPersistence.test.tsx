/**
 * Tests for useReaderPersistence Hook
 * Tests automatic persistence functionality with mocked dependencies
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";
import { useReaderPersistence } from "../../app/hooks/useReaderPersistence";
import * as ReaderContext from "../../app/context/ReaderContext";
import * as IdbStore from "../../app/lib/storage/idb-store";
import type { ReaderContextValue } from "../../app/context/ReaderContext";

// Mock the ReaderContext module
vi.mock("../../app/context/ReaderContext", () => ({
  useReader: vi.fn(),
}));

// Create a mock reader context value
function createMockReader(
  overrides: Partial<ReaderContextValue> = {}
): ReaderContextValue {
  return {
    stream: null,
    pages: [{ pageIndex: 0, tokens: [{ text: "test" }] }],
    anchors: {
      headingAnchors: new Map(),
      imageAnchors: new Map(),
      paragraphAnchors: new Set(),
    },
    metadata: {
      id: "test-doc",
      title: "Test Document",
      uploadedAt: Date.now(),
      lastReadAt: Date.now(),
      totalTokens: 1000,
      fileHash: "test-hash-123",
    },
    currentIndex: 0,
    settings: {
      theme: "dark",
      fontSize: 18,
      windowRadius: 2,
      skipImages: false,
    },
    currentToken: { text: "test" },
    peripheralWindow: [],
    isOnImage: false,
    progress: 0,
    breadcrumb: [],
    loadDocument: vi.fn(),
    advance: vi.fn(),
    retreat: vi.fn(),
    jumpTo: vi.fn(),
    jumpToHeading: vi.fn(),
    jumpToPercentage: vi.fn(),
    updateSettings: vi.fn(),
    reset: vi.fn(),
    ...overrides,
  };
}

describe("useReaderPersistence", () => {
  beforeEach(() => {
    // Reset IndexedDB
    global.indexedDB = new IDBFactory();

    // Reset all mocks
    vi.clearAllMocks();

    // Setup default mock
    const mockReader = createMockReader();
    vi.mocked(ReaderContext.useReader).mockReturnValue(mockReader);
  });

  afterEach(async () => {
    // Clean up IndexedDB
    await IdbStore.clearAllDocuments();
  });

  describe("initialization", () => {
    it("should load saved state on mount", async () => {
      // Pre-save a state
      const fileHash = "test-hash-123";
      await IdbStore.saveReaderState(fileHash, {
        fileName: "Test.md",
        currentIndex: 500,
        windowRadius: 3,
        theme: "light",
        fontSize: 20,
        skipImages: true,
      });

      const mockJumpTo = vi.fn();
      const mockUpdateSettings = vi.fn();
      const mockReader = createMockReader({
        jumpTo: mockJumpTo,
        updateSettings: mockUpdateSettings,
      });

      vi.mocked(ReaderContext.useReader).mockReturnValue(mockReader);

      renderHook(() => useReaderPersistence());

      // Wait for async load
      await waitFor(
        () => {
          expect(mockJumpTo).toHaveBeenCalledWith(500);
        },
        { timeout: 3000 }
      );

      expect(mockUpdateSettings).toHaveBeenCalledWith({
        windowRadius: 3,
        theme: "light",
        fontSize: 20,
        skipImages: true,
      });
    });

    it("should not load if no saved state exists", async () => {
      const mockJumpTo = vi.fn();
      const mockReader = createMockReader({ jumpTo: mockJumpTo });
      vi.mocked(ReaderContext.useReader).mockReturnValue(mockReader);

      renderHook(() => useReaderPersistence());

      // Wait a bit to ensure no load happens
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockJumpTo).not.toHaveBeenCalled();
    });

    it("should not load when disabled", async () => {
      // Pre-save a state
      const fileHash = "test-hash-123";
      await IdbStore.saveReaderState(fileHash, {
        fileName: "Test.md",
        currentIndex: 500,
        windowRadius: 2,
        theme: "dark",
        fontSize: 18,
        skipImages: false,
      });

      const mockJumpTo = vi.fn();
      const mockReader = createMockReader({ jumpTo: mockJumpTo });
      vi.mocked(ReaderContext.useReader).mockReturnValue(mockReader);

      renderHook(() => useReaderPersistence({ enabled: false }));

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockJumpTo).not.toHaveBeenCalled();
    });
  });

  describe("auto-save functionality", () => {
    it("should have autoSave configured with default interval", () => {
      const mockReader = createMockReader({ currentIndex: 0 });
      vi.mocked(ReaderContext.useReader).mockReturnValue(mockReader);

      const { result } = renderHook(() => useReaderPersistence());

      // Hook renders without errors
      expect(result).toBeDefined();
    });

    it("should accept custom autoSaveInterval option", () => {
      const mockReader = createMockReader({ currentIndex: 0 });
      vi.mocked(ReaderContext.useReader).mockReturnValue(mockReader);

      const { result } = renderHook(() =>
        useReaderPersistence({ autoSaveInterval: 50 })
      );

      // Hook renders without errors
      expect(result).toBeDefined();
    });
  });

  describe("settings persistence", () => {
    it("should accept settings from context", () => {
      const mockReader = createMockReader({
        settings: {
          theme: "dark",
          fontSize: 18,
          windowRadius: 2,
          skipImages: false,
        },
      });
      vi.mocked(ReaderContext.useReader).mockReturnValue(mockReader);

      const { result } = renderHook(() => useReaderPersistence());

      // Hook renders without errors
      expect(result).toBeDefined();
    });
  });

  describe("beforeunload event", () => {
    it("should save on beforeunload", async () => {
      const mockReader = createMockReader({ currentIndex: 250 });
      vi.mocked(ReaderContext.useReader).mockReturnValue(mockReader);

      renderHook(() => useReaderPersistence());

      // Wait for initial mount
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Trigger beforeunload
      const event = new Event("beforeunload");
      window.dispatchEvent(event);

      // Wait for save
      await waitFor(
        async () => {
          const saved = await IdbStore.loadReaderState("test-hash-123");
          expect(saved?.currentIndex).toBe(250);
        },
        { timeout: 3000 }
      );
    });
  });

  describe("disabled state", () => {
    it("should not save when disabled", async () => {
      const saveSpy = vi.spyOn(IdbStore, "saveReaderState");

      const mockReader = createMockReader({ currentIndex: 0 });
      vi.mocked(ReaderContext.useReader).mockReturnValue(mockReader);

      const { rerender } = renderHook(() =>
        useReaderPersistence({ enabled: false })
      );

      // Change index
      mockReader.currentIndex = 100;
      rerender();

      await new Promise((resolve) => setTimeout(resolve, 500));

      expect(saveSpy).not.toHaveBeenCalled();

      saveSpy.mockRestore();
    });
  });

  describe("no document loaded", () => {
    it("should not save if no document is loaded", async () => {
      const saveSpy = vi.spyOn(IdbStore, "saveReaderState");

      const mockReader = createMockReader({
        metadata: null,
        pages: null,
      });
      vi.mocked(ReaderContext.useReader).mockReturnValue(mockReader);

      renderHook(() => useReaderPersistence());

      await new Promise((resolve) => setTimeout(resolve, 500));

      expect(saveSpy).not.toHaveBeenCalled();

      saveSpy.mockRestore();
    });
  });

  describe("cleanup", () => {
    it("should cleanup on unmount", () => {
      const mockReader = createMockReader();
      vi.mocked(ReaderContext.useReader).mockReturnValue(mockReader);

      const { unmount } = renderHook(() => useReaderPersistence());

      // Unmount should not throw
      expect(() => unmount()).not.toThrow();
    });
  });

  describe("error handling", () => {
    it("should handle storage errors gracefully", async () => {
      const mockReader = createMockReader({ currentIndex: 100 });
      vi.mocked(ReaderContext.useReader).mockReturnValue(mockReader);

      // Mock saveReaderState to throw
      const saveSpy = vi
        .spyOn(IdbStore, "saveReaderState")
        .mockRejectedValue(new Error("Storage error"));

      const { rerender } = renderHook(() => useReaderPersistence());

      // Should not throw even if save fails
      expect(() => rerender()).not.toThrow();

      saveSpy.mockRestore();
    });

    it("should handle load errors gracefully", async () => {
      const mockReader = createMockReader();
      vi.mocked(ReaderContext.useReader).mockReturnValue(mockReader);

      // Mock loadReaderState to throw
      const loadSpy = vi
        .spyOn(IdbStore, "loadReaderState")
        .mockRejectedValue(new Error("Load error"));

      // Should not throw even if load fails
      expect(() => renderHook(() => useReaderPersistence())).not.toThrow();

      loadSpy.mockRestore();
    });
  });
});

/**
 * Tests for Reader State Manager
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  createReaderState,
  advance,
  retreat,
  jumpTo,
  jumpToHeading,
  jumpToPercentage,
  getCurrentToken,
  getPeripheralWindow,
  isAtImageNode,
  getProgress,
  updateSettings,
  getSettings,
  type ReaderState,
} from "../../../app/lib/engine/reader-state";
import { buildContentStream } from "../../../app/lib/engine/content-stream";
import {
  SIMPLE_DOCUMENT,
  DOCUMENT_WITH_IMAGES,
  EMPTY_DOCUMENT,
  HIERARCHICAL_DOCUMENT,
  SINGLE_WORD_DOCUMENT,
} from "../../fixtures/sample-documents";

describe("Reader State Manager", () => {
  describe("createReaderState", () => {
    it("should create initial reader state with default settings", () => {
      const { pages, anchors } = buildContentStream(SIMPLE_DOCUMENT);
      const state = createReaderState(pages, anchors);

      expect(state.currentIndex).toBe(0);
      expect(state.settings.theme).toBe("dark");
      expect(state.settings.fontSize).toBe(18);
      expect(state.settings.windowRadius).toBe(2);
      expect(state.settings.skipImages).toBe(false);
    });

    it("should create reader state with custom settings", () => {
      const { pages, anchors } = buildContentStream(SIMPLE_DOCUMENT);
      const state = createReaderState(pages, anchors, {
        theme: "light",
        fontSize: 24,
      });

      expect(state.settings.theme).toBe("light");
      expect(state.settings.fontSize).toBe(24);
      expect(state.settings.windowRadius).toBe(2); // default
    });
  });

  describe("getCurrentToken", () => {
    it("should get token at current index", () => {
      const { pages, anchors } = buildContentStream(SIMPLE_DOCUMENT);
      const state = createReaderState(pages, anchors);

      const token = getCurrentToken(state);
      expect(token).not.toBeNull();
      expect(token?.text).toBeTruthy();
    });

    it("should return null for empty document", () => {
      const { pages, anchors } = buildContentStream(EMPTY_DOCUMENT);
      const state = createReaderState(pages, anchors);

      const token = getCurrentToken(state);
      expect(token).toBeNull();
    });
  });

  describe("advance", () => {
    it("should advance to next token", () => {
      const { pages, anchors } = buildContentStream(SIMPLE_DOCUMENT);
      let state = createReaderState(pages, anchors);
      const initialIndex = state.currentIndex;

      state = advance(state);
      expect(state.currentIndex).toBe(initialIndex + 1);
    });

    it("should not advance beyond last token", () => {
      const { pages, anchors, metadata } = buildContentStream(SIMPLE_DOCUMENT);
      let state = createReaderState(pages, anchors);
      
      // Advance to end
      state = jumpTo(state, metadata.totalTokens - 1);
      const lastIndex = state.currentIndex;

      // Try to advance past end
      state = advance(state);
      expect(state.currentIndex).toBe(lastIndex);
    });

    it("should skip images when skipImages is true", () => {
      const { pages, anchors } = buildContentStream(DOCUMENT_WITH_IMAGES);
      let state = createReaderState(pages, anchors, { skipImages: true });

      // Find first image position
      const firstImageIndex = Array.from(anchors.imageAnchors.keys())[0];
      
      // Jump just before image
      state = jumpTo(state, firstImageIndex - 1);
      
      // Advance should skip image
      state = advance(state);
      expect(state.currentIndex).toBeGreaterThan(firstImageIndex);
      expect(isAtImageNode(state)).toBe(false);
    });

    it("should handle empty document gracefully", () => {
      const { pages, anchors } = buildContentStream(EMPTY_DOCUMENT);
      let state = createReaderState(pages, anchors);

      state = advance(state);
      expect(state.currentIndex).toBe(0);
    });
  });

  describe("retreat", () => {
    it("should retreat to previous token", () => {
      const { pages, anchors } = buildContentStream(SIMPLE_DOCUMENT);
      let state = createReaderState(pages, anchors);
      
      // Advance first
      state = advance(state);
      const currentIndex = state.currentIndex;

      // Then retreat
      state = retreat(state);
      expect(state.currentIndex).toBe(currentIndex - 1);
    });

    it("should not retreat below zero", () => {
      const { pages, anchors } = buildContentStream(SIMPLE_DOCUMENT);
      let state = createReaderState(pages, anchors);

      state = retreat(state);
      expect(state.currentIndex).toBe(0);
    });

    it("should handle empty document gracefully", () => {
      const { pages, anchors } = buildContentStream(EMPTY_DOCUMENT);
      let state = createReaderState(pages, anchors);

      state = retreat(state);
      expect(state.currentIndex).toBe(0);
    });
  });

  describe("jumpTo", () => {
    it("should jump to valid index", () => {
      const { pages, anchors } = buildContentStream(SIMPLE_DOCUMENT);
      let state = createReaderState(pages, anchors);

      state = jumpTo(state, 5);
      expect(state.currentIndex).toBe(5);
    });

    it("should clamp negative index to 0", () => {
      const { pages, anchors } = buildContentStream(SIMPLE_DOCUMENT);
      let state = createReaderState(pages, anchors);

      state = jumpTo(state, -10);
      expect(state.currentIndex).toBe(0);
    });

    it("should clamp index beyond document to last token", () => {
      const { pages, anchors, metadata } = buildContentStream(SIMPLE_DOCUMENT);
      let state = createReaderState(pages, anchors);

      state = jumpTo(state, metadata.totalTokens + 100);
      expect(state.currentIndex).toBe(metadata.totalTokens - 1);
    });

    it("should handle empty document gracefully", () => {
      const { pages, anchors } = buildContentStream(EMPTY_DOCUMENT);
      let state = createReaderState(pages, anchors);

      state = jumpTo(state, 10);
      expect(state.currentIndex).toBe(0);
    });
  });

  describe("jumpToHeading", () => {
    it("should jump to specific heading", () => {
      const { pages, anchors } = buildContentStream(HIERARCHICAL_DOCUMENT);
      let state = createReaderState(pages, anchors);

      // Jump to second heading (index 1)
      state = jumpToHeading(state, 1);
      
      const headingIndices = Array.from(anchors.headingAnchors.keys()).sort((a, b) => a - b);
      expect(state.currentIndex).toBe(headingIndices[1]);
    });

    it("should not jump with invalid heading index", () => {
      const { pages, anchors } = buildContentStream(HIERARCHICAL_DOCUMENT);
      let state = createReaderState(pages, anchors);
      const initialIndex = state.currentIndex;

      state = jumpToHeading(state, 999);
      expect(state.currentIndex).toBe(initialIndex);
    });

    it("should handle negative heading index", () => {
      const { pages, anchors } = buildContentStream(HIERARCHICAL_DOCUMENT);
      let state = createReaderState(pages, anchors);
      const initialIndex = state.currentIndex;

      state = jumpToHeading(state, -1);
      expect(state.currentIndex).toBe(initialIndex);
    });
  });

  describe("jumpToPercentage", () => {
    it("should jump to percentage position", () => {
      const { pages, anchors, metadata } = buildContentStream(SIMPLE_DOCUMENT);
      let state = createReaderState(pages, anchors);

      state = jumpToPercentage(state, 50);
      const expectedIndex = Math.floor((50 / 100) * metadata.totalTokens);
      expect(state.currentIndex).toBe(expectedIndex);
    });

    it("should clamp percentage to 0-100 range", () => {
      const { pages, anchors } = buildContentStream(SIMPLE_DOCUMENT);
      let state = createReaderState(pages, anchors);

      state = jumpToPercentage(state, 150);
      expect(state.currentIndex).toBeGreaterThanOrEqual(0);

      state = jumpToPercentage(state, -50);
      expect(state.currentIndex).toBe(0);
    });

    it("should handle 0% and 100%", () => {
      const { pages, anchors, metadata } = buildContentStream(SIMPLE_DOCUMENT);
      let state = createReaderState(pages, anchors);

      state = jumpToPercentage(state, 0);
      expect(state.currentIndex).toBe(0);

      state = jumpToPercentage(state, 100);
      expect(state.currentIndex).toBe(metadata.totalTokens - 1);
    });

    it("should handle empty document gracefully", () => {
      const { pages, anchors } = buildContentStream(EMPTY_DOCUMENT);
      let state = createReaderState(pages, anchors);

      state = jumpToPercentage(state, 50);
      expect(state.currentIndex).toBe(0);
    });
  });

  describe("getPeripheralWindow", () => {
    it("should return tokens around current position", () => {
      const { pages, anchors } = buildContentStream(SIMPLE_DOCUMENT);
      let state = createReaderState(pages, anchors);
      
      // Jump to middle of document
      state = jumpTo(state, 5);
      const radius = 2;

      const window = getPeripheralWindow(state, radius);
      
      // Should have center + radius on each side (if available)
      expect(window.length).toBeGreaterThan(0);
      expect(window.length).toBeLessThanOrEqual(radius * 2 + 1);
    });

    it("should return empty array when on image", () => {
      const { pages, anchors } = buildContentStream(DOCUMENT_WITH_IMAGES);
      let state = createReaderState(pages, anchors);

      // Jump to first image
      const firstImageIndex = Array.from(anchors.imageAnchors.keys())[0];
      state = jumpTo(state, firstImageIndex);

      const window = getPeripheralWindow(state);
      expect(window).toEqual([]);
    });

    it("should handle document boundaries", () => {
      const { pages, anchors } = buildContentStream(SIMPLE_DOCUMENT);
      let state = createReaderState(pages, anchors);

      // At start
      state = jumpTo(state, 0);
      const windowAtStart = getPeripheralWindow(state, 2);
      expect(windowAtStart.length).toBeGreaterThan(0);

      // At end
      const lastIndex = pages.reduce((sum, page) => sum + page.tokens.length, 0) - 1;
      state = jumpTo(state, lastIndex);
      const windowAtEnd = getPeripheralWindow(state, 2);
      expect(windowAtEnd.length).toBeGreaterThan(0);
    });

    it("should use settings windowRadius if no radius provided", () => {
      const { pages, anchors } = buildContentStream(SIMPLE_DOCUMENT);
      let state = createReaderState(pages, anchors, { windowRadius: 3 });
      state = jumpTo(state, 10);

      const window = getPeripheralWindow(state);
      expect(window.length).toBeGreaterThan(0);
    });
  });

  describe("isAtImageNode", () => {
    it("should return true when at image position", () => {
      const { pages, anchors } = buildContentStream(DOCUMENT_WITH_IMAGES);
      let state = createReaderState(pages, anchors);

      const firstImageIndex = Array.from(anchors.imageAnchors.keys())[0];
      state = jumpTo(state, firstImageIndex);

      expect(isAtImageNode(state)).toBe(true);
    });

    it("should return false when not at image position", () => {
      const { pages, anchors } = buildContentStream(DOCUMENT_WITH_IMAGES);
      let state = createReaderState(pages, anchors);

      expect(isAtImageNode(state)).toBe(false);
    });
  });

  describe("getProgress", () => {
    it("should return 0 at start of document", () => {
      const { pages, anchors } = buildContentStream(SIMPLE_DOCUMENT);
      const state = createReaderState(pages, anchors);

      expect(getProgress(state)).toBe(0);
    });

    it("should return progress percentage", () => {
      const { pages, anchors, metadata } = buildContentStream(SIMPLE_DOCUMENT);
      let state = createReaderState(pages, anchors);

      const midpoint = Math.floor(metadata.totalTokens / 2);
      state = jumpTo(state, midpoint);

      const progress = getProgress(state);
      expect(progress).toBeGreaterThan(0);
      expect(progress).toBeLessThanOrEqual(100);
    });

    it("should handle empty document", () => {
      const { pages, anchors } = buildContentStream(EMPTY_DOCUMENT);
      const state = createReaderState(pages, anchors);

      expect(getProgress(state)).toBe(0);
    });
  });

  describe("updateSettings and getSettings", () => {
    it("should update settings partially", () => {
      const { pages, anchors } = buildContentStream(SIMPLE_DOCUMENT);
      let state = createReaderState(pages, anchors);

      state = updateSettings(state, { fontSize: 24 });
      expect(state.settings.fontSize).toBe(24);
      expect(state.settings.theme).toBe("dark"); // unchanged
    });

    it("should update multiple settings at once", () => {
      const { pages, anchors } = buildContentStream(SIMPLE_DOCUMENT);
      let state = createReaderState(pages, anchors);

      state = updateSettings(state, {
        fontSize: 20,
        theme: "light",
        skipImages: true,
      });

      expect(state.settings.fontSize).toBe(20);
      expect(state.settings.theme).toBe("light");
      expect(state.settings.skipImages).toBe(true);
    });

    it("should get settings copy", () => {
      const { pages, anchors } = buildContentStream(SIMPLE_DOCUMENT);
      const state = createReaderState(pages, anchors);

      const settings = getSettings(state);
      expect(settings).toEqual(state.settings);
      expect(settings).not.toBe(state.settings); // different object
    });
  });
});

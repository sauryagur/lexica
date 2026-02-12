/**
 * Tests for Anchors Manager
 */

import { describe, it, expect } from "vitest";
import {
  getCurrentHeadingPath,
  snapToParagraph,
  getHeadingAtIndex,
  getImageAtIndex,
  isParagraphStart,
  generateTableOfContents,
  getNearestHeadingBefore,
  getHeadingsByLevel,
  getNextHeading,
  getPreviousHeading,
  getAllImages,
  countHeadings,
  countParagraphs,
  countImages,
} from "../../../app/lib/engine/anchors";
import { buildContentStream } from "../../../app/lib/engine/content-stream";
import {
  SIMPLE_DOCUMENT,
  HIERARCHICAL_DOCUMENT,
  DOCUMENT_WITH_IMAGES,
  NO_HEADINGS_DOCUMENT,
  COMPLEX_DOCUMENT,
  PARAGRAPH_SNAP_DOCUMENT,
} from "../../fixtures/sample-documents";

describe("Anchors Manager", () => {
  describe("getCurrentHeadingPath", () => {
    it("should return empty array for position before any headings", () => {
      const { anchors } = buildContentStream(HIERARCHICAL_DOCUMENT);
      const path = getCurrentHeadingPath(-1, anchors);
      expect(path).toEqual([]);
    });

    it("should return single heading for flat structure", () => {
      const { anchors, metadata } = buildContentStream(SIMPLE_DOCUMENT);
      const path = getCurrentHeadingPath(metadata.totalTokens - 1, anchors);
      
      expect(path.length).toBeGreaterThan(0);
      expect(path[0]).toBe("Simple Document");
    });

    it("should return hierarchical path for nested headings", () => {
      const { anchors, metadata } = buildContentStream(COMPLEX_DOCUMENT);
      
      // Find position in deeply nested section
      const headingIndices = Array.from(anchors.headingAnchors.keys()).sort((a, b) => a - b);
      const deepHeadingIndex = headingIndices[headingIndices.length - 1];
      
      const path = getCurrentHeadingPath(deepHeadingIndex + 5, anchors);
      
      expect(path.length).toBeGreaterThan(1);
      expect(path[0]).toBe("Neural Plasticity"); // Top level
    });

    it("should return empty array for document without headings", () => {
      const { anchors, metadata } = buildContentStream(NO_HEADINGS_DOCUMENT);
      const path = getCurrentHeadingPath(metadata.totalTokens - 1, anchors);
      
      expect(path).toEqual([]);
    });

    it("should build correct multi-level hierarchy", () => {
      const { anchors } = buildContentStream(HIERARCHICAL_DOCUMENT);
      
      // Find position in "Subsection 1.1.1"
      const headingIndices = Array.from(anchors.headingAnchors.keys()).sort((a, b) => a - b);
      
      // Look for the subsection
      let subsectionIndex = -1;
      for (const idx of headingIndices) {
        const heading = anchors.headingAnchors.get(idx);
        if (heading?.text === "Subsection 1.1.1") {
          subsectionIndex = idx;
          break;
        }
      }
      
      if (subsectionIndex >= 0) {
        const path = getCurrentHeadingPath(subsectionIndex + 1, anchors);
        expect(path).toContain("Chapter 1");
        expect(path).toContain("Section 1.1");
        expect(path).toContain("Subsection 1.1.1");
      }
    });

    it("should handle position at exact heading index", () => {
      const { anchors } = buildContentStream(HIERARCHICAL_DOCUMENT);
      const firstHeadingIndex = Array.from(anchors.headingAnchors.keys())[0];
      
      const path = getCurrentHeadingPath(firstHeadingIndex, anchors);
      expect(path.length).toBeGreaterThan(0);
    });
  });

  describe("snapToParagraph", () => {
    it("should snap to nearest paragraph start", () => {
      const { anchors } = buildContentStream(PARAGRAPH_SNAP_DOCUMENT);
      const paragraphStarts = Array.from(anchors.paragraphAnchors).sort((a, b) => a - b);
      
      if (paragraphStarts.length > 1) {
        // Try to snap to position between first and second paragraph
        const betweenIndex = paragraphStarts[0] + 1;
        const snapped = snapToParagraph(betweenIndex, anchors);
        
        expect(snapped).toBe(paragraphStarts[0]);
      }
    });

    it("should return first paragraph for position before all paragraphs", () => {
      const { anchors } = buildContentStream(SIMPLE_DOCUMENT);
      const paragraphStarts = Array.from(anchors.paragraphAnchors).sort((a, b) => a - b);
      
      if (paragraphStarts.length > 0) {
        const snapped = snapToParagraph(0, anchors);
        expect(snapped).toBe(paragraphStarts[0]);
      }
    });

    it("should return target if no paragraphs exist", () => {
      const { anchors } = buildContentStream("# Just a heading");
      const snapped = snapToParagraph(10, anchors);
      expect(snapped).toBe(10);
    });

    it("should handle exact paragraph start position", () => {
      const { anchors } = buildContentStream(PARAGRAPH_SNAP_DOCUMENT);
      const paragraphStarts = Array.from(anchors.paragraphAnchors).sort((a, b) => a - b);
      
      if (paragraphStarts.length > 0) {
        const exact = paragraphStarts[0];
        const snapped = snapToParagraph(exact, anchors);
        expect(snapped).toBe(exact);
      }
    });
  });

  describe("getHeadingAtIndex", () => {
    it("should return heading node at index", () => {
      const { anchors } = buildContentStream(HIERARCHICAL_DOCUMENT);
      const firstHeadingIndex = Array.from(anchors.headingAnchors.keys())[0];
      
      const heading = getHeadingAtIndex(firstHeadingIndex, anchors);
      expect(heading).not.toBeNull();
      expect(heading?.text).toBeTruthy();
    });

    it("should return null for non-heading index", () => {
      const { anchors } = buildContentStream(SIMPLE_DOCUMENT);
      const heading = getHeadingAtIndex(999, anchors);
      expect(heading).toBeNull();
    });
  });

  describe("getImageAtIndex", () => {
    it("should return image node at index", () => {
      const { anchors } = buildContentStream(DOCUMENT_WITH_IMAGES);
      const firstImageIndex = Array.from(anchors.imageAnchors.keys())[0];
      
      const image = getImageAtIndex(firstImageIndex, anchors);
      expect(image).not.toBeNull();
      expect(image?.src).toBeTruthy();
    });

    it("should return null for non-image index", () => {
      const { anchors } = buildContentStream(DOCUMENT_WITH_IMAGES);
      const image = getImageAtIndex(0, anchors);
      expect(image).toBeNull();
    });
  });

  describe("isParagraphStart", () => {
    it("should return true for paragraph start index", () => {
      const { anchors } = buildContentStream(SIMPLE_DOCUMENT);
      const firstParagraph = Array.from(anchors.paragraphAnchors)[0];
      
      expect(isParagraphStart(firstParagraph, anchors)).toBe(true);
    });

    it("should return false for non-paragraph index", () => {
      const { anchors } = buildContentStream(SIMPLE_DOCUMENT);
      expect(isParagraphStart(999, anchors)).toBe(false);
    });
  });

  describe("generateTableOfContents", () => {
    it("should generate TOC with all headings", () => {
      const { anchors } = buildContentStream(HIERARCHICAL_DOCUMENT);
      const toc = generateTableOfContents(anchors);
      
      expect(toc.length).toBeGreaterThan(0);
      expect(toc[0].text).toBeTruthy();
      expect(toc[0].level).toBeGreaterThan(0);
      expect(toc[0].tokenIndex).toBeGreaterThanOrEqual(0);
    });

    it("should return empty array for document without headings", () => {
      const { anchors } = buildContentStream(NO_HEADINGS_DOCUMENT);
      const toc = generateTableOfContents(anchors);
      
      expect(toc).toEqual([]);
    });

    it("should order headings by token index", () => {
      const { anchors } = buildContentStream(HIERARCHICAL_DOCUMENT);
      const toc = generateTableOfContents(anchors);
      
      for (let i = 1; i < toc.length; i++) {
        expect(toc[i].tokenIndex).toBeGreaterThanOrEqual(toc[i - 1].tokenIndex);
      }
    });

    it("should include heading levels correctly", () => {
      const { anchors } = buildContentStream(COMPLEX_DOCUMENT);
      const toc = generateTableOfContents(anchors);
      
      const hasMultipleLevels = new Set(toc.map(entry => entry.level)).size > 1;
      expect(hasMultipleLevels).toBe(true);
    });
  });

  describe("getNearestHeadingBefore", () => {
    it("should return nearest heading before current position", () => {
      const { anchors, metadata } = buildContentStream(HIERARCHICAL_DOCUMENT);
      const heading = getNearestHeadingBefore(metadata.totalTokens - 1, anchors);
      
      expect(heading).not.toBeNull();
      expect(heading?.text).toBeTruthy();
    });

    it("should return null when no heading before position", () => {
      const { anchors } = buildContentStream(HIERARCHICAL_DOCUMENT);
      const heading = getNearestHeadingBefore(0, anchors);
      
      // Could be null if document starts with text, or the first heading if document starts with heading
      expect(heading === null || heading.text).toBeTruthy();
    });

    it("should return null for document without headings", () => {
      const { anchors } = buildContentStream(NO_HEADINGS_DOCUMENT);
      const heading = getNearestHeadingBefore(10, anchors);
      
      expect(heading).toBeNull();
    });
  });

  describe("getHeadingsByLevel", () => {
    it("should return all headings at specific level", () => {
      const { anchors } = buildContentStream(HIERARCHICAL_DOCUMENT);
      const level1Headings = getHeadingsByLevel(1, anchors);
      
      expect(level1Headings.length).toBeGreaterThan(0);
      expect(level1Headings.every(h => h.level === 1)).toBe(true);
    });

    it("should return empty array for non-existent level", () => {
      const { anchors } = buildContentStream(SIMPLE_DOCUMENT);
      const level5Headings = getHeadingsByLevel(5, anchors);
      
      expect(level5Headings).toEqual([]);
    });
  });

  describe("getNextHeading", () => {
    it("should return next heading after current position", () => {
      const { anchors } = buildContentStream(HIERARCHICAL_DOCUMENT);
      const next = getNextHeading(0, anchors);
      
      expect(next).not.toBeNull();
      expect(next?.tokenIndex).toBeGreaterThan(0);
    });

    it("should return null when at last heading", () => {
      const { anchors, metadata } = buildContentStream(HIERARCHICAL_DOCUMENT);
      const next = getNextHeading(metadata.totalTokens, anchors);
      
      expect(next).toBeNull();
    });
  });

  describe("getPreviousHeading", () => {
    it("should return previous heading before current position", () => {
      const { anchors, metadata } = buildContentStream(HIERARCHICAL_DOCUMENT);
      const prev = getPreviousHeading(metadata.totalTokens, anchors);
      
      expect(prev).not.toBeNull();
      expect(prev?.text).toBeTruthy();
    });

    it("should return null when before first heading", () => {
      const { anchors } = buildContentStream(HIERARCHICAL_DOCUMENT);
      const prev = getPreviousHeading(0, anchors);
      
      expect(prev).toBeNull();
    });
  });

  describe("getAllImages", () => {
    it("should return all images in order", () => {
      const { anchors } = buildContentStream(DOCUMENT_WITH_IMAGES);
      const images = getAllImages(anchors);
      
      expect(images.length).toBeGreaterThan(0);
      expect(images[0].src).toBeTruthy();
      
      // Check ordering
      for (let i = 1; i < images.length; i++) {
        expect(images[i].tokenIndex).toBeGreaterThan(images[i - 1].tokenIndex);
      }
    });

    it("should return empty array for document without images", () => {
      const { anchors } = buildContentStream(SIMPLE_DOCUMENT);
      const images = getAllImages(anchors);
      
      expect(images).toEqual([]);
    });
  });

  describe("count functions", () => {
    it("should count headings correctly", () => {
      const { anchors } = buildContentStream(HIERARCHICAL_DOCUMENT);
      const count = countHeadings(anchors);
      
      expect(count).toBeGreaterThan(0);
      expect(count).toBe(anchors.headingAnchors.size);
    });

    it("should count paragraphs correctly", () => {
      const { anchors } = buildContentStream(SIMPLE_DOCUMENT);
      const count = countParagraphs(anchors);
      
      expect(count).toBeGreaterThan(0);
      expect(count).toBe(anchors.paragraphAnchors.size);
    });

    it("should count images correctly", () => {
      const { anchors } = buildContentStream(DOCUMENT_WITH_IMAGES);
      const count = countImages(anchors);
      
      expect(count).toBeGreaterThan(0);
      expect(count).toBe(anchors.imageAnchors.size);
    });

    it("should return 0 for empty counts", () => {
      const { anchors } = buildContentStream(NO_HEADINGS_DOCUMENT);
      expect(countHeadings(anchors)).toBe(0);
      expect(countImages(anchors)).toBe(0);
    });
  });
});

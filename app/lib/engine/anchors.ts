/**
 * Anchors Manager
 * Navigation helpers for heading hierarchy, paragraph snapping, and TOC generation
 */

import type { Anchors, HeadingNode, ImageNode } from "../../types";

/**
 * Get the current heading path (breadcrumb) at a given position
 * Returns array of heading texts from highest to lowest level
 * Example: ["Chapter 3", "Neural Plasticity", "Long-Term Potentiation"]
 */
export function getCurrentHeadingPath(
  currentIndex: number,
  anchors: Anchors
): string[] {
  // Get all heading indices before current position
  const headingIndices = Array.from(anchors.headingAnchors.keys())
    .filter((idx) => idx <= currentIndex)
    .sort((a, b) => a - b);

  if (headingIndices.length === 0) {
    return [];
  }

  // Find the nearest heading before current index
  const nearestHeadingIndex = headingIndices[headingIndices.length - 1];
  const nearestHeading = anchors.headingAnchors.get(nearestHeadingIndex);

  if (!nearestHeading) {
    return [];
  }

  // Build the heading path by walking up the hierarchy
  const path: string[] = [nearestHeading.text];
  let currentLevel = nearestHeading.level;

  // Walk backwards through headings to find parent levels
  for (let i = headingIndices.length - 2; i >= 0; i--) {
    const headingIndex = headingIndices[i];
    const heading = anchors.headingAnchors.get(headingIndex);

    if (!heading) continue;

    // If this heading is a higher level (smaller number), add it to path
    if (heading.level < currentLevel) {
      path.unshift(heading.text);
      currentLevel = heading.level;
    }

    // Stop when we reach level 1 (top level)
    if (currentLevel === 1) {
      break;
    }
  }

  return path;
}

/**
 * Snap to nearest paragraph start
 * Used by scrub bar to avoid landing mid-paragraph
 */
export function snapToParagraph(targetIndex: number, anchors: Anchors): number {
  // Get all paragraph start indices
  const paragraphIndices = Array.from(anchors.paragraphAnchors).sort((a, b) => a - b);

  if (paragraphIndices.length === 0) {
    return targetIndex;
  }

  // Find the nearest paragraph start at or before target
  let nearestIndex = paragraphIndices[0];
  
  for (const paraIndex of paragraphIndices) {
    if (paraIndex <= targetIndex) {
      nearestIndex = paraIndex;
    } else {
      break;
    }
  }

  return nearestIndex;
}

/**
 * Get heading node at specific index
 */
export function getHeadingAtIndex(
  index: number,
  anchors: Anchors
): HeadingNode | null {
  return anchors.headingAnchors.get(index) || null;
}

/**
 * Get image node at specific index
 */
export function getImageAtIndex(index: number, anchors: Anchors): ImageNode | null {
  return anchors.imageAnchors.get(index) || null;
}

/**
 * Check if index is a paragraph start
 */
export function isParagraphStart(index: number, anchors: Anchors): boolean {
  return anchors.paragraphAnchors.has(index);
}

/**
 * Table of Contents entry
 */
export type TocEntry = {
  level: number;
  text: string;
  tokenIndex: number;
};

/**
 * Generate table of contents from anchors
 * Returns flat list of headings with their positions
 */
export function generateTableOfContents(anchors: Anchors): TocEntry[] {
  // Get all heading indices in order
  const headingIndices = Array.from(anchors.headingAnchors.keys()).sort(
    (a, b) => a - b
  );

  return headingIndices.map((index) => {
    const heading = anchors.headingAnchors.get(index)!;
    return {
      level: heading.level,
      text: heading.text,
      tokenIndex: heading.tokenIndex,
    };
  });
}

/**
 * Get the nearest heading before a given index
 */
export function getNearestHeadingBefore(
  currentIndex: number,
  anchors: Anchors
): HeadingNode | null {
  const headingIndices = Array.from(anchors.headingAnchors.keys())
    .filter((idx) => idx <= currentIndex)
    .sort((a, b) => b - a); // Sort descending to get nearest first

  if (headingIndices.length === 0) {
    return null;
  }

  return anchors.headingAnchors.get(headingIndices[0]) || null;
}

/**
 * Get all headings at a specific level
 */
export function getHeadingsByLevel(level: number, anchors: Anchors): TocEntry[] {
  const allHeadings = generateTableOfContents(anchors);
  return allHeadings.filter((entry) => entry.level === level);
}

/**
 * Find the next heading after current index
 */
export function getNextHeading(
  currentIndex: number,
  anchors: Anchors
): HeadingNode | null {
  const headingIndices = Array.from(anchors.headingAnchors.keys())
    .filter((idx) => idx > currentIndex)
    .sort((a, b) => a - b); // Sort ascending to get nearest first

  if (headingIndices.length === 0) {
    return null;
  }

  return anchors.headingAnchors.get(headingIndices[0]) || null;
}

/**
 * Find the previous heading before current index
 */
export function getPreviousHeading(
  currentIndex: number,
  anchors: Anchors
): HeadingNode | null {
  const headingIndices = Array.from(anchors.headingAnchors.keys())
    .filter((idx) => idx < currentIndex)
    .sort((a, b) => b - a); // Sort descending to get nearest first

  if (headingIndices.length === 0) {
    return null;
  }

  return anchors.headingAnchors.get(headingIndices[0]) || null;
}

/**
 * Get all images in the document
 */
export function getAllImages(anchors: Anchors): ImageNode[] {
  const imageIndices = Array.from(anchors.imageAnchors.keys()).sort((a, b) => a - b);
  return imageIndices.map((index) => anchors.imageAnchors.get(index)!);
}

/**
 * Count total number of headings
 */
export function countHeadings(anchors: Anchors): number {
  return anchors.headingAnchors.size;
}

/**
 * Count total number of paragraphs
 */
export function countParagraphs(anchors: Anchors): number {
  return anchors.paragraphAnchors.size;
}

/**
 * Count total number of images
 */
export function countImages(anchors: Anchors): number {
  return anchors.imageAnchors.size;
}

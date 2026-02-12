/**
 * Reader State Manager
 * Manages navigation, state, and settings for the reading experience
 */

import type { Token, TokenPage, Anchors, ImageNode } from "../../types";
import { getToken, getTotalTokens, getTokenRange } from "./token-pages";

/**
 * Reader settings that can be updated
 */
export type ReaderSettings = {
  theme: "light" | "dark";
  fontSize: number;
  windowRadius: number;
  skipImages: boolean;
};

/**
 * Complete reader state
 */
export type ReaderState = {
  pages: TokenPage[];
  anchors: Anchors;
  currentIndex: number;
  settings: ReaderSettings;
};

/**
 * Default settings
 */
export const DEFAULT_SETTINGS: ReaderSettings = {
  theme: "dark",
  fontSize: 18,
  windowRadius: 2,
  skipImages: false,
};

/**
 * Create initial reader state
 */
export function createReaderState(
  pages: TokenPage[],
  anchors: Anchors,
  settings: Partial<ReaderSettings> = {}
): ReaderState {
  return {
    pages,
    anchors,
    currentIndex: 0,
    settings: { ...DEFAULT_SETTINGS, ...settings },
  };
}

/**
 * Get the current token at currentIndex
 */
export function getCurrentToken(state: ReaderState): Token | null {
  const token = getToken(state.pages, state.currentIndex);
  return token || null;
}

/**
 * Get peripheral window around current token
 * Returns tokens at ±radius from current position
 * If on image, returns empty array (image replaces all)
 */
export function getPeripheralWindow(state: ReaderState, radius?: number): Token[] {
  const effectiveRadius = radius ?? state.settings.windowRadius;
  
  // If on image, peripheral window is empty
  if (isAtImageNode(state)) {
    return [];
  }

  const totalTokens = getTotalTokens(state.pages);
  const startIndex = Math.max(0, state.currentIndex - effectiveRadius);
  const endIndex = Math.min(totalTokens, state.currentIndex + effectiveRadius + 1);

  return getTokenRange(state.pages, startIndex, endIndex);
}

/**
 * Check if current position is on an image node
 */
export function isAtImageNode(state: ReaderState): boolean {
  return state.anchors.imageAnchors.has(state.currentIndex);
}

/**
 * Get reading progress as percentage (0-100)
 */
export function getProgress(state: ReaderState): number {
  const totalTokens = getTotalTokens(state.pages);
  if (totalTokens === 0) {
    return 0;
  }
  return (state.currentIndex / totalTokens) * 100;
}

/**
 * Advance to next token
 * - Handles end-of-document boundary
 * - Skips images if skipImages setting is enabled
 */
export function advance(state: ReaderState): ReaderState {
  const totalTokens = getTotalTokens(state.pages);
  
  // Handle empty document
  if (totalTokens === 0) {
    return state;
  }

  let nextIndex = state.currentIndex + 1;

  // Don't go beyond last token
  if (nextIndex >= totalTokens) {
    return state;
  }

  // Skip consecutive images if skipImages is true
  if (state.settings.skipImages) {
    while (nextIndex < totalTokens && state.anchors.imageAnchors.has(nextIndex)) {
      nextIndex++;
    }

    // If we've reached the end while skipping images, stay at last valid position
    if (nextIndex >= totalTokens) {
      return state;
    }
  }

  return {
    ...state,
    currentIndex: nextIndex,
  };
}

/**
 * Retreat to previous token
 * - Handles start-of-document boundary
 */
export function retreat(state: ReaderState): ReaderState {
  const totalTokens = getTotalTokens(state.pages);
  
  // Handle empty document
  if (totalTokens === 0) {
    return state;
  }

  let prevIndex = state.currentIndex - 1;

  // Don't go below zero
  if (prevIndex < 0) {
    return state;
  }

  return {
    ...state,
    currentIndex: prevIndex,
  };
}

/**
 * Jump to specific token index with bounds checking
 */
export function jumpTo(state: ReaderState, index: number): ReaderState {
  const totalTokens = getTotalTokens(state.pages);
  
  // Handle empty document
  if (totalTokens === 0) {
    return state;
  }

  // Clamp index to valid range
  const clampedIndex = Math.max(0, Math.min(index, totalTokens - 1));

  return {
    ...state,
    currentIndex: clampedIndex,
  };
}

/**
 * Jump to a specific heading by index in the heading anchors
 */
export function jumpToHeading(state: ReaderState, headingIndex: number): ReaderState {
  // Get all heading indices in order
  const headingIndices = Array.from(state.anchors.headingAnchors.keys()).sort(
    (a, b) => a - b
  );

  // Check if headingIndex is valid
  if (headingIndex < 0 || headingIndex >= headingIndices.length) {
    return state;
  }

  const targetTokenIndex = headingIndices[headingIndex];
  return jumpTo(state, targetTokenIndex);
}

/**
 * Jump to document position by percentage (0-100)
 */
export function jumpToPercentage(state: ReaderState, percent: number): ReaderState {
  const totalTokens = getTotalTokens(state.pages);
  
  // Handle empty document
  if (totalTokens === 0) {
    return state;
  }

  // Clamp percentage to valid range
  const clampedPercent = Math.max(0, Math.min(100, percent));
  
  // Calculate target index
  const targetIndex = Math.floor((clampedPercent / 100) * totalTokens);

  return jumpTo(state, targetIndex);
}

/**
 * Update reader settings (partial update)
 */
export function updateSettings(
  state: ReaderState,
  partialSettings: Partial<ReaderSettings>
): ReaderState {
  return {
    ...state,
    settings: {
      ...state.settings,
      ...partialSettings,
    },
  };
}

/**
 * Get current settings
 */
export function getSettings(state: ReaderState): ReaderSettings {
  return { ...state.settings };
}

/**
 * Get image node at current position (if any)
 */
export function getCurrentImageNode(state: ReaderState): ImageNode | null {
  return state.anchors.imageAnchors.get(state.currentIndex) || null;
}

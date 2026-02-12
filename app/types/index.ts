/**
 * Core TypeScript types for Lexica
 * Based on README.md sections 9.1-9.5
 */

/**
 * Token represents a single word with optional semantic flags
 */
export type Token = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  orp?: number; // Optimal Recognition Point index (calculated at render)
};

/**
 * Stream Node represents content blocks in the reading stream
 */
export type StreamNode =
  | { type: "text"; startToken: number; endToken: number }
  | { type: "image"; src: string; alt?: string }
  | { type: "heading"; level: number; text: string; tokenIndex: number };

/**
 * Heading node for hierarchy tracking
 */
export type HeadingNode = {
  level: number;
  text: string;
  tokenIndex: number;
};

/**
 * Image node for visual content
 */
export type ImageNode = {
  src: string;
  alt?: string;
  tokenIndex: number;
};

/**
 * Token Page for paged storage (prevents monolithic arrays)
 */
export type TokenPage = {
  pageIndex: number;
  tokens: Token[];
};

/**
 * Anchors map for navigation and structure awareness
 */
export type Anchors = {
  headingAnchors: Map<number, HeadingNode>;
  imageAnchors: Map<number, ImageNode>;
  paragraphAnchors: Set<number>;
};

/**
 * Reader State for the rendering engine
 */
export type ReaderState = {
  currentIndex: number;
  windowRadius: number;
  skipImages: boolean;
  theme: "light" | "dark";
  fontSize: number;
};

/**
 * Reader Settings for persistence
 */
export type ReaderSettings = {
  fileHash: string;
  currentIndex: number;
  windowRadius: number;
  theme: "light" | "dark";
  fontSize: number;
  skipImages: boolean;
};

/**
 * Document metadata
 */
export type DocumentMetadata = {
  id: string;
  title: string;
  uploadedAt: number;
  lastReadAt: number;
  totalTokens: number;
  fileHash: string;
};

/**
 * Page size constant for paged storage
 * Global token index = pageIndex * PAGE_SIZE + offset
 */
export const PAGE_SIZE = 4096;

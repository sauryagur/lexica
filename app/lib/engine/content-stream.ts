/**
 * Content Stream Builder
 * Main pipeline: Markdown → AST → Sanitized Tokens → Token Pages → Content Stream with anchors
 */

import type {
  StreamNode,
  TokenPage,
  Anchors,
  DocumentMetadata,
  HeadingNode,
  ImageNode,
} from "../../types";
import { parseMarkdown, extractInlineText } from "../parser/markdown-parser";
import { sanitizeInlineNodes } from "../parser/sanitizer";
import { tokenize } from "../parser/tokenizer";
import {
  createTokenPages,
  addTokens,
  getTotalTokens,
} from "./token-pages";
import type { Root, Content, Heading, Paragraph, ListItem, Image, Blockquote, PhrasingContent } from "mdast";

/**
 * Content stream build result
 */
export type ContentStreamResult = {
  stream: StreamNode[];
  pages: TokenPage[];
  anchors: Anchors;
  metadata: DocumentMetadata;
};

/**
 * Build complete content stream from markdown
 * This is the main entry point for the parsing pipeline
 *
 * Process flow:
 * 1. Parse markdown → AST
 * 2. Walk AST nodes
 * 3. For each block:
 *    - Headings: Create HeadingNode, add to anchors
 *    - Paragraphs/Lists: Sanitize → tokenize → add to pages → create StreamNode
 *    - Images: Create ImageNode, add to anchors
 *    - Mark paragraph starts in anchors
 * 4. Build StreamNode array with token ranges
 * 5. Generate DocumentMetadata
 *
 * @param markdown - Raw markdown string
 * @param docId - Document ID for metadata
 * @param title - Document title for metadata
 * @returns Complete content stream with pages, anchors, and metadata
 */
export function buildContentStream(
  markdown: string,
  docId: string = "untitled",
  title: string = "Untitled Document"
): ContentStreamResult {
  // Initialize structures
  const stream: StreamNode[] = [];
  const pages = createTokenPages();
  const anchors: Anchors = {
    headingAnchors: new Map(),
    imageAnchors: new Map(),
    paragraphAnchors: new Set(),
  };

  // Parse markdown to AST
  const ast = parseMarkdown(markdown);

  // Track current token index
  let currentTokenIndex = 0;

  // Walk AST and process nodes
  processNodes(ast.children, stream, pages, anchors, () => currentTokenIndex, (newIndex) => {
    currentTokenIndex = newIndex;
  });

  // Generate metadata
  const totalTokens = getTotalTokens(pages);
  const wordCount = totalTokens; // In our model, tokens = words
  const metadata: DocumentMetadata = {
    id: docId,
    title,
    uploadedAt: Date.now(),
    lastReadAt: Date.now(),
    totalTokens,
    fileHash: generateSimpleHash(markdown),
  };

  return {
    stream,
    pages,
    anchors,
    metadata,
  };
}

/**
 * Process AST nodes recursively
 */
function processNodes(
  nodes: Content[],
  stream: StreamNode[],
  pages: TokenPage[],
  anchors: Anchors,
  getCurrentIndex: () => number,
  setCurrentIndex: (index: number) => void
): void {
  for (const node of nodes) {
    if (node.type === "heading") {
      processHeading(node, stream, pages, anchors, getCurrentIndex, setCurrentIndex);
    } else if (node.type === "paragraph") {
      processParagraph(node, stream, pages, anchors, getCurrentIndex, setCurrentIndex);
    } else if (node.type === "list") {
      // Process list items
      for (const item of node.children) {
        if (item.type === "listItem") {
          processListItem(item, stream, pages, anchors, getCurrentIndex, setCurrentIndex);
        }
      }
    } else if (node.type === "blockquote") {
      // Process blockquote contents
      processNodes(node.children, stream, pages, anchors, getCurrentIndex, setCurrentIndex);
    } else if (node.type === "image") {
      processImage(node, stream, anchors, getCurrentIndex, setCurrentIndex);
    }
  }
}

/**
 * Process a heading node
 */
function processHeading(
  node: Heading,
  stream: StreamNode[],
  pages: TokenPage[],
  anchors: Anchors,
  getCurrentIndex: () => number,
  setCurrentIndex: (index: number) => void
): void {
  const currentIndex = getCurrentIndex();

  // Extract heading text
  const text = extractInlineText(node.children as PhrasingContent[]);

  // Create heading node
  const headingNode: HeadingNode = {
    level: node.depth,
    text,
    tokenIndex: currentIndex,
  };

  // Add to anchors
  anchors.headingAnchors.set(currentIndex, headingNode);

  // Add to stream
  stream.push({
    type: "heading",
    level: node.depth,
    text,
    tokenIndex: currentIndex,
  });

  // Tokenize heading text and add to pages
  const sanitized = sanitizeInlineNodes(node.children as PhrasingContent[]);
  const tokens = tokenize(sanitized);
  addTokens(pages, tokens);

  // Update current index
  setCurrentIndex(currentIndex + tokens.length);
}

/**
 * Process a paragraph node
 */
function processParagraph(
  node: Paragraph,
  stream: StreamNode[],
  pages: TokenPage[],
  anchors: Anchors,
  getCurrentIndex: () => number,
  setCurrentIndex: (index: number) => void
): void {
  const startIndex = getCurrentIndex();

  // Check if paragraph contains only an image
  if (node.children.length === 1 && node.children[0].type === "image") {
    const imageNode = node.children[0] as Image;
    processImage(imageNode, stream, anchors, getCurrentIndex, setCurrentIndex);
    return;
  }

  // Check if paragraph contains inline images mixed with text
  let hasImages = false;
  for (const child of node.children) {
    if (child.type === "image") {
      hasImages = true;
      const imageNode = child as Image;
      processImage(imageNode, stream, anchors, getCurrentIndex, setCurrentIndex);
    }
  }

  // If paragraph had images, filter them out for text processing
  const textChildren = hasImages
    ? node.children.filter((child) => child.type !== "image")
    : node.children;

  // If no text children left, return
  if (textChildren.length === 0) {
    return;
  }

  // Mark paragraph start (only if we have text)
  const currentIndex = getCurrentIndex();
  anchors.paragraphAnchors.add(currentIndex);

  // Sanitize and tokenize
  const sanitized = sanitizeInlineNodes(textChildren as PhrasingContent[]);
  const tokens = tokenize(sanitized);

  // Handle empty paragraphs
  if (tokens.length === 0) {
    return;
  }

  // Add tokens to pages
  addTokens(pages, tokens);

  // Create text stream node
  const endIndex = currentIndex + tokens.length;
  stream.push({
    type: "text",
    startToken: currentIndex,
    endToken: endIndex,
  });

  // Update current index
  setCurrentIndex(endIndex);
}

/**
 * Process a list item node
 */
function processListItem(
  node: ListItem,
  stream: StreamNode[],
  pages: TokenPage[],
  anchors: Anchors,
  getCurrentIndex: () => number,
  setCurrentIndex: (index: number) => void
): void {
  // Process each child of the list item (usually paragraphs)
  for (const child of node.children) {
    if (child.type === "paragraph") {
      processParagraph(child, stream, pages, anchors, getCurrentIndex, setCurrentIndex);
    } else {
      // Recursively process other nodes
      processNodes([child], stream, pages, anchors, getCurrentIndex, setCurrentIndex);
    }
  }
}

/**
 * Process an image node
 */
function processImage(
  node: Image,
  stream: StreamNode[],
  anchors: Anchors,
  getCurrentIndex: () => number,
  setCurrentIndex: (index: number) => void
): void {
  const currentIndex = getCurrentIndex();

  // Create image node
  const imageNode: ImageNode = {
    src: node.url,
    alt: node.alt || undefined,
    tokenIndex: currentIndex,
  };

  // Add to anchors
  anchors.imageAnchors.set(currentIndex, imageNode);

  // Add to stream
  stream.push({
    type: "image",
    src: node.url,
    alt: node.alt || undefined,
  });

  // Images don't add tokens, but they should advance the index by 1
  // to ensure each image has a unique position
  setCurrentIndex(currentIndex + 1);
}

/**
 * Generate a simple hash for a string
 * Used for fileHash in metadata
 */
function generateSimpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Handle edge cases
 */

/**
 * Handle empty documents
 */
export function isEmptyDocument(result: ContentStreamResult): boolean {
  return result.stream.length === 0 && getTotalTokens(result.pages) === 0;
}

/**
 * Handle images-only documents
 */
export function isImagesOnlyDocument(result: ContentStreamResult): boolean {
  return (
    result.stream.length > 0 &&
    result.stream.every((node) => node.type === "image") &&
    getTotalTokens(result.pages) === 0
  );
}

/**
 * Sanitizer
 * Strips markdown syntax and extracts semantic flags from AST nodes
 */

import type { PhrasingContent, Text, Link, Strong, Emphasis, InlineCode } from "mdast";

/**
 * Sanitized text with semantic flags
 */
export type SanitizedText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
};

/**
 * Unicode quote normalization map
 */
const QUOTE_NORMALIZATION: Record<string, string> = {
  "\u2018": "'",  // left single quote
  "\u2019": "'",  // right single quote
  "\u201C": '"',  // left double quote
  "\u201D": '"',  // right double quote
  "\u201A": "'",  // single low-9 quote
  "\u201E": '"',  // double low-9 quote
  "\u2039": "'",  // single left angle quote
  "\u203A": "'",  // single right angle quote
  "\u00AB": '"',  // double left angle quote
  "\u00BB": '"',  // double right angle quote
};

/**
 * Normalize Unicode quotes to ASCII equivalents
 */
export function normalizeQuotes(text: string): string {
  return text.replace(/[\u2018\u2019\u201A\u2039\u203A\u201C\u201D\u201E\u00AB\u00BB]/g, (match) => QUOTE_NORMALIZATION[match] || match);
}

/**
 * Sanitize a single inline node, preserving semantic flags
 * @param node - AST inline node
 * @param inheritedFlags - Flags inherited from parent nodes
 * @returns Array of sanitized text segments
 */
export function sanitizeInlineNode(
  node: PhrasingContent,
  inheritedFlags: { bold?: boolean; italic?: boolean; code?: boolean } = {}
): SanitizedText[] {
  const results: SanitizedText[] = [];

  if (node.type === "text") {
    // Plain text node
    const text = normalizeQuotes(node.value);
    if (text) {
      results.push({
        text,
        ...inheritedFlags,
      });
    }
  } else if (node.type === "strong" && "children" in node && node.children) {
    // Bold text: **bold** or __bold__
    for (const child of node.children) {
      results.push(...sanitizeInlineNode(child as PhrasingContent, { ...inheritedFlags, bold: true }));
    }
  } else if (node.type === "emphasis" && "children" in node && node.children) {
    // Italic text: *italic* or _italic_
    for (const child of node.children) {
      results.push(...sanitizeInlineNode(child as PhrasingContent, { ...inheritedFlags, italic: true }));
    }
  } else if (node.type === "inlineCode") {
    // Code: `code`
    const text = normalizeQuotes(node.value);
    if (text) {
      results.push({
        text,
        ...inheritedFlags,
        code: true,
      });
    }
  } else if (node.type === "link" && node.children) {
    // Link: [text](url) → just "text" (ignore URL in MVP)
    for (const child of node.children) {
      results.push(...sanitizeInlineNode(child as PhrasingContent, inheritedFlags));
    }
  } else if (node.type === "break") {
    // Line break - treat as space
    results.push({
      text: " ",
      ...inheritedFlags,
    });
  }

  return results;
}

/**
 * Sanitize an array of inline nodes
 * @param nodes - Array of AST inline nodes
 * @returns Array of sanitized text segments
 */
export function sanitizeInlineNodes(nodes: PhrasingContent[]): SanitizedText[] {
  const results: SanitizedText[] = [];

  for (const node of nodes) {
    results.push(...sanitizeInlineNode(node));
  }

  return results;
}

/**
 * Handle nested formatting (e.g., ***bold italic***)
 * This is already handled by the recursive nature of sanitizeInlineNode
 */
export function sanitizeNode(node: PhrasingContent): SanitizedText[] {
  return sanitizeInlineNode(node);
}

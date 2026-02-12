/**
 * Markdown Parser
 * Converts markdown text into AST using unified + remark-parse + remark-gfm
 */

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import type { Root, Content, Heading, Paragraph, List, ListItem, Image, Blockquote, Text, Link, Strong, Emphasis, InlineCode, PhrasingContent } from "mdast";

/**
 * Supported AST node types for Lexica
 */
export type MarkdownASTNode =
  | Heading
  | Paragraph
  | List
  | ListItem
  | Image
  | Blockquote
  | Text
  | Link
  | Strong
  | Emphasis
  | InlineCode;

/**
 * Parse markdown content into AST
 * @param content - Raw markdown string
 * @returns AST root node
 */
export function parseMarkdown(content: string): Root {
  try {
    const processor = unified()
      .use(remarkParse)
      .use(remarkGfm);

    const ast = processor.parse(content);
    return ast as Root;
  } catch (error) {
    // Handle malformed markdown gracefully - return empty document
    console.warn("Markdown parsing failed, returning empty document:", error);
    return {
      type: "root",
      children: [],
    };
  }
}

/**
 * Extract specific node types from AST
 * Filters for: headings, paragraphs, list items, blockquotes, images
 * Ignores: HTML blocks, tables (MVP deferred)
 */
export function extractNodes(ast: Root): Content[] {
  const supportedTypes = new Set([
    "heading",
    "paragraph",
    "list",
    "listItem",
    "blockquote",
    "image",
  ]);

  function filterNode(node: Content): boolean {
    // Skip HTML and tables
    if (node.type === "html" || node.type === "table") {
      return false;
    }
    return supportedTypes.has(node.type);
  }

  function traverse(nodes: Content[]): Content[] {
    const result: Content[] = [];

    for (const node of nodes) {
      if (filterNode(node)) {
        result.push(node);
      }

      // Recursively process children for lists and blockquotes
      if (node.type === "list" && node.children) {
        for (const child of node.children) {
          if (child.type === "listItem") {
            result.push(child);
          }
        }
      } else if (node.type === "blockquote" && node.children) {
        result.push(...traverse(node.children));
      }
    }

    return result;
  }

  return traverse(ast.children);
}

/**
 * Check if a node is a text-bearing node (heading, paragraph, list item)
 */
export function isTextNode(node: Content): boolean {
  return (
    node.type === "heading" ||
    node.type === "paragraph" ||
    node.type === "listItem"
  );
}

/**
 * Check if a node is an image node
 */
export function isImageNode(node: Content): node is Image {
  return node.type === "image";
}

/**
 * Extract text content from inline nodes (for headings and paragraphs)
 */
export function extractInlineText(nodes: PhrasingContent[]): string {
  let text = "";

  for (const node of nodes) {
    if (node.type === "text") {
      text += node.value;
    } else if (node.type === "link" && node.children) {
      // Recursively extract text from link children
      text += extractInlineText(node.children);
    } else if (
      (node.type === "strong" || node.type === "emphasis" || node.type === "inlineCode") &&
      "children" in node &&
      node.children
    ) {
      text += extractInlineText(node.children as PhrasingContent[]);
    }
  }

  return text;
}

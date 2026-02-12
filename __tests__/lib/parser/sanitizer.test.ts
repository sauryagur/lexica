/**
 * Tests for sanitizer.ts
 */

import { describe, it, expect } from "vitest";
import {
  normalizeQuotes,
  sanitizeInlineNode,
  sanitizeInlineNodes,
  sanitizeNode,
} from "../../../app/lib/parser/sanitizer";
import { parseMarkdown } from "../../../app/lib/parser/markdown-parser";
import type { PhrasingContent } from "mdast";

describe("Sanitizer", () => {
  describe("normalizeQuotes", () => {
    it("should normalize left single quote", () => {
      const text = "\u2018hello\u2019";
      expect(normalizeQuotes(text)).toBe("'hello'");
    });

    it("should normalize double quotes", () => {
      const text = "\u201Chello\u201D";
      expect(normalizeQuotes(text)).toBe('"hello"');
    });

    it("should handle mixed quotes", () => {
      const text = "It\u2019s \u201Cgreat\u201D";
      expect(normalizeQuotes(text)).toBe('It\'s "great"');
    });

    it("should leave regular quotes unchanged", () => {
      const text = "It's \"great\"";
      expect(normalizeQuotes(text)).toBe("It's \"great\"");
    });
  });

  describe("sanitizeInlineNode", () => {
    it("should extract plain text", () => {
      const markdown = "Hello world";
      const ast = parseMarkdown(markdown);
      const paragraph = ast.children[0];

      if (paragraph.type === "paragraph") {
        const result = sanitizeInlineNode(paragraph.children[0] as PhrasingContent);
        expect(result).toHaveLength(1);
        expect(result[0].text).toBe("Hello world");
        expect(result[0].bold).toBeUndefined();
        expect(result[0].italic).toBeUndefined();
      }
    });

    it("should strip bold markers and set flag", () => {
      const markdown = "**bold text**";
      const ast = parseMarkdown(markdown);
      const paragraph = ast.children[0];

      if (paragraph.type === "paragraph") {
        const result = sanitizeInlineNode(paragraph.children[0] as PhrasingContent);
        expect(result).toHaveLength(1);
        expect(result[0].text).toBe("bold text");
        expect(result[0].bold).toBe(true);
      }
    });

    it("should strip italic markers and set flag", () => {
      const markdown = "*italic text*";
      const ast = parseMarkdown(markdown);
      const paragraph = ast.children[0];

      if (paragraph.type === "paragraph") {
        const result = sanitizeInlineNode(paragraph.children[0] as PhrasingContent);
        expect(result).toHaveLength(1);
        expect(result[0].text).toBe("italic text");
        expect(result[0].italic).toBe(true);
      }
    });

    it("should strip code markers and set flag", () => {
      const markdown = "`code text`";
      const ast = parseMarkdown(markdown);
      const paragraph = ast.children[0];

      if (paragraph.type === "paragraph") {
        const result = sanitizeInlineNode(paragraph.children[0] as PhrasingContent);
        expect(result).toHaveLength(1);
        expect(result[0].text).toBe("code text");
        expect(result[0].code).toBe(true);
      }
    });

    it("should handle nested formatting", () => {
      const markdown = "***bold and italic***";
      const ast = parseMarkdown(markdown);
      const paragraph = ast.children[0];

      if (paragraph.type === "paragraph") {
        const results = sanitizeInlineNodes(paragraph.children as PhrasingContent[]);
        expect(results.length).toBeGreaterThan(0);
        const hasMultipleFlags = results.some((r) => r.bold && r.italic);
        expect(hasMultipleFlags).toBe(true);
      }
    });

    it("should extract text from links, ignoring URL", () => {
      const markdown = "[click here](https://example.com)";
      const ast = parseMarkdown(markdown);
      const paragraph = ast.children[0];

      if (paragraph.type === "paragraph") {
        const result = sanitizeInlineNode(paragraph.children[0] as PhrasingContent);
        expect(result).toHaveLength(1);
        expect(result[0].text).toBe("click here");
        // URL should be ignored
      }
    });

    it("should normalize quotes in text", () => {
      const markdown = `"Smart quotes"`;
      const ast = parseMarkdown(markdown);
      const paragraph = ast.children[0];

      if (paragraph.type === "paragraph") {
        const result = sanitizeInlineNode(paragraph.children[0] as PhrasingContent);
        expect(result[0].text).toContain('"');
      }
    });
  });

  describe("sanitizeInlineNodes", () => {
    it("should handle multiple inline nodes", () => {
      const markdown = "This is **bold** and *italic*.";
      const ast = parseMarkdown(markdown);
      const paragraph = ast.children[0];

      if (paragraph.type === "paragraph") {
        const results = sanitizeInlineNodes(paragraph.children as PhrasingContent[]);
        expect(results.length).toBeGreaterThan(3);

        // Find bold text
        const boldText = results.find((r) => r.bold);
        expect(boldText).toBeDefined();
        expect(boldText?.text).toBe("bold");

        // Find italic text
        const italicText = results.find((r) => r.italic);
        expect(italicText).toBeDefined();
        expect(italicText?.text).toBe("italic");
      }
    });

    it("should preserve semantic flags independently", () => {
      const markdown = "**bold** *italic* `code`";
      const ast = parseMarkdown(markdown);
      const paragraph = ast.children[0];

      if (paragraph.type === "paragraph") {
        const results = sanitizeInlineNodes(paragraph.children as PhrasingContent[]);

        const bold = results.find((r) => r.bold && !r.italic && !r.code);
        const italic = results.find((r) => r.italic && !r.bold && !r.code);
        const code = results.find((r) => r.code && !r.bold && !r.italic);

        expect(bold).toBeDefined();
        expect(italic).toBeDefined();
        expect(code).toBeDefined();
      }
    });

    it("should handle empty nodes gracefully", () => {
      const results = sanitizeInlineNodes([]);
      expect(results).toEqual([]);
    });
  });

  describe("sanitizeNode", () => {
    it("should work as alias for sanitizeInlineNode", () => {
      const markdown = "**test**";
      const ast = parseMarkdown(markdown);
      const paragraph = ast.children[0];

      if (paragraph.type === "paragraph") {
        const result = sanitizeNode(paragraph.children[0] as PhrasingContent);
        expect(result).toHaveLength(1);
        expect(result[0].text).toBe("test");
        expect(result[0].bold).toBe(true);
      }
    });
  });

  describe("edge cases", () => {
    it("should handle line breaks", () => {
      const markdown = "Line one  \nLine two";
      const ast = parseMarkdown(markdown);
      const paragraph = ast.children[0];

      if (paragraph.type === "paragraph") {
        const results = sanitizeInlineNodes(paragraph.children as PhrasingContent[]);
        expect(results.length).toBeGreaterThan(0);
        // Should have space or break between lines
      }
    });

    it("should handle complex nested structures", () => {
      const markdown = "**bold with *italic* inside**";
      const ast = parseMarkdown(markdown);
      const paragraph = ast.children[0];

      if (paragraph.type === "paragraph") {
        const results = sanitizeInlineNodes(paragraph.children as PhrasingContent[]);
        expect(results.length).toBeGreaterThan(0);

        // Should have segments with both bold and bold+italic
        const onlyBold = results.filter((r) => r.bold && !r.italic);
        const bothFlags = results.filter((r) => r.bold && r.italic);

        expect(onlyBold.length).toBeGreaterThan(0);
        expect(bothFlags.length).toBeGreaterThan(0);
      }
    });
  });
});

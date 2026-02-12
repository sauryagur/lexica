/**
 * Tests for content-stream.ts
 */

import { describe, it, expect } from "vitest";
import {
  buildContentStream,
  isEmptyDocument,
  isImagesOnlyDocument,
} from "../../../app/lib/engine/content-stream";
import { getTotalTokens, getToken } from "../../../app/lib/engine/token-pages";
import { readFileSync } from "fs";
import { resolve } from "path";

describe("Content Stream Builder", () => {
  describe("buildContentStream", () => {
    it("should build stream from simple markdown", () => {
      const markdown = "# Heading\n\nParagraph text.";
      const result = buildContentStream(markdown);

      expect(result.stream.length).toBeGreaterThan(0);
      expect(result.pages.length).toBeGreaterThan(0);
      expect(getTotalTokens(result.pages)).toBeGreaterThan(0);
    });

    it("should process headings correctly", () => {
      const markdown = "# Main Title\n\nSome text.";
      const result = buildContentStream(markdown);

      // Check heading in stream
      const headingNode = result.stream.find((n) => n.type === "heading");
      expect(headingNode).toBeDefined();
      if (headingNode?.type === "heading") {
        expect(headingNode.level).toBe(1);
        expect(headingNode.text).toBe("Main Title");
      }

      // Check heading in anchors
      expect(result.anchors.headingAnchors.size).toBe(1);
      const [tokenIndex, heading] = Array.from(result.anchors.headingAnchors.entries())[0];
      expect(heading.level).toBe(1);
      expect(heading.text).toBe("Main Title");
    });

    it("should process paragraphs correctly", () => {
      const markdown = "First paragraph.\n\nSecond paragraph.";
      const result = buildContentStream(markdown);

      // Check text nodes in stream
      const textNodes = result.stream.filter((n) => n.type === "text");
      expect(textNodes.length).toBe(2);

      // Check paragraph anchors
      expect(result.anchors.paragraphAnchors.size).toBe(2);
    });

    it("should process bold text", () => {
      const markdown = "This is **bold** text.";
      const result = buildContentStream(markdown);

      // Find bold token
      const totalTokens = getTotalTokens(result.pages);
      let foundBold = false;
      for (let i = 0; i < totalTokens; i++) {
        const token = getToken(result.pages, i);
        if (token?.bold) {
          foundBold = true;
          expect(token.text).toBe("bold");
          break;
        }
      }
      expect(foundBold).toBe(true);
    });

    it("should process italic text", () => {
      const markdown = "This is *italic* text.";
      const result = buildContentStream(markdown);

      // Find italic token
      const totalTokens = getTotalTokens(result.pages);
      let foundItalic = false;
      for (let i = 0; i < totalTokens; i++) {
        const token = getToken(result.pages, i);
        if (token?.italic) {
          foundItalic = true;
          expect(token.text).toBe("italic");
          break;
        }
      }
      expect(foundItalic).toBe(true);
    });

    it("should process code text", () => {
      const markdown = "This is `code` text.";
      const result = buildContentStream(markdown);

      // Find code token
      const totalTokens = getTotalTokens(result.pages);
      let foundCode = false;
      for (let i = 0; i < totalTokens; i++) {
        const token = getToken(result.pages, i);
        if (token?.code) {
          foundCode = true;
          expect(token.text).toBe("code");
          break;
        }
      }
      expect(foundCode).toBe(true);
    });

    it("should process lists", () => {
      const markdown = "- Item 1\n- Item 2\n- Item 3";
      const result = buildContentStream(markdown);

      // Should have text nodes for each item
      const textNodes = result.stream.filter((n) => n.type === "text");
      expect(textNodes.length).toBeGreaterThan(0);

      // Should have tokens for all list items
      const totalTokens = getTotalTokens(result.pages);
      expect(totalTokens).toBeGreaterThanOrEqual(6); // At least "Item 1 Item 2 Item 3"
    });

    it("should process images", () => {
      const markdown = "![Alt text](https://example.com/image.png)";
      const result = buildContentStream(markdown);

      // Check image in stream
      const imageNode = result.stream.find((n) => n.type === "image");
      expect(imageNode).toBeDefined();
      if (imageNode?.type === "image") {
        expect(imageNode.src).toBe("https://example.com/image.png");
        expect(imageNode.alt).toBe("Alt text");
      }

      // Check image in anchors
      expect(result.anchors.imageAnchors.size).toBe(1);
    });

    it("should process blockquotes", () => {
      const markdown = "> This is a quote.";
      const result = buildContentStream(markdown);

      // Should have text nodes for blockquote content
      const textNodes = result.stream.filter((n) => n.type === "text");
      expect(textNodes.length).toBeGreaterThan(0);
    });

    it("should generate correct metadata", () => {
      const markdown = "# Title\n\nSome content with multiple words.";
      const result = buildContentStream(markdown, "test-id", "Test Document");

      expect(result.metadata.id).toBe("test-id");
      expect(result.metadata.title).toBe("Test Document");
      expect(result.metadata.totalTokens).toBeGreaterThan(0);
      expect(result.metadata.fileHash).toBeDefined();
      expect(result.metadata.uploadedAt).toBeGreaterThan(0);
      expect(result.metadata.lastReadAt).toBeGreaterThan(0);
    });

    it("should have matching token counts", () => {
      const markdown = "# Heading\n\nParagraph with **bold** and *italic* text.";
      const result = buildContentStream(markdown);

      const totalTokens = getTotalTokens(result.pages);
      expect(result.metadata.totalTokens).toBe(totalTokens);
    });

    it("should process complex document structure", () => {
      const markdown = `# Main Title

## Section 1

First paragraph with **bold** text.

Second paragraph with *italic* text.

- List item 1
- List item 2

## Section 2

![Image](url)

> Blockquote text

Final paragraph.`;

      const result = buildContentStream(markdown);

      // Check we have multiple heading levels
      const headings = Array.from(result.anchors.headingAnchors.values());
      expect(headings.length).toBe(3);
      expect(headings.some((h) => h.level === 1)).toBe(true);
      expect(headings.some((h) => h.level === 2)).toBe(true);

      // Check we have image
      expect(result.anchors.imageAnchors.size).toBe(1);

      // Check we have multiple paragraphs
      expect(result.anchors.paragraphAnchors.size).toBeGreaterThan(3);

      // Check stream has various node types
      const nodeTypes = new Set(result.stream.map((n) => n.type));
      expect(nodeTypes.has("heading")).toBe(true);
      expect(nodeTypes.has("text")).toBe(true);
      expect(nodeTypes.has("image")).toBe(true);
    });
  });

  describe("anchor correctness", () => {
    it("should have correct token indices for headings", () => {
      const markdown = "# First\n\nParagraph.\n\n## Second\n\nMore text.";
      const result = buildContentStream(markdown);

      const headingIndices = Array.from(result.anchors.headingAnchors.keys()).sort((a, b) => a - b);
      expect(headingIndices.length).toBe(2);

      // First heading should be at index 0
      expect(headingIndices[0]).toBe(0);

      // Second heading should be after first heading and paragraph
      expect(headingIndices[1]).toBeGreaterThan(headingIndices[0]);
    });

    it("should have correct token indices for paragraphs", () => {
      const markdown = "First paragraph.\n\nSecond paragraph.\n\nThird paragraph.";
      const result = buildContentStream(markdown);

      const paragraphIndices = Array.from(result.anchors.paragraphAnchors).sort((a, b) => a - b);
      expect(paragraphIndices.length).toBe(3);

      // Each should be after the previous
      for (let i = 1; i < paragraphIndices.length; i++) {
        expect(paragraphIndices[i]).toBeGreaterThan(paragraphIndices[i - 1]);
      }
    });
  });

  describe("edge cases", () => {
    it("should handle empty markdown", () => {
      const markdown = "";
      const result = buildContentStream(markdown);

      expect(isEmptyDocument(result)).toBe(true);
      expect(result.stream).toHaveLength(0);
      expect(getTotalTokens(result.pages)).toBe(0);
    });

    it("should handle whitespace-only markdown", () => {
      const markdown = "   \n\n\t\t\n   ";
      const result = buildContentStream(markdown);

      expect(result.stream.length).toBe(0);
      expect(getTotalTokens(result.pages)).toBe(0);
    });

    it("should handle images-only document", () => {
      const markdown = "![Image 1](url1)\n\n![Image 2](url2)";
      const result = buildContentStream(markdown);

      expect(isImagesOnlyDocument(result)).toBe(true);
      expect(result.anchors.imageAnchors.size).toBe(2);
    });

    it("should handle document with only headings", () => {
      const markdown = "# Title\n\n## Subtitle";
      const result = buildContentStream(markdown);

      expect(result.anchors.headingAnchors.size).toBe(2);
      expect(getTotalTokens(result.pages)).toBeGreaterThan(0);
    });

    it("should handle very long paragraphs", () => {
      const words = Array(1000).fill("word").join(" ");
      const markdown = words;
      const result = buildContentStream(markdown);

      expect(getTotalTokens(result.pages)).toBe(1000);
    });

    it("should handle nested formatting", () => {
      const markdown = "***bold and italic***";
      const result = buildContentStream(markdown);

      // Find token with both flags
      const totalTokens = getTotalTokens(result.pages);
      let foundBoth = false;
      for (let i = 0; i < totalTokens; i++) {
        const token = getToken(result.pages, i);
        if (token?.bold && token?.italic) {
          foundBoth = true;
          break;
        }
      }
      expect(foundBoth).toBe(true);
    });

    it("should handle links (extracting only text)", () => {
      const markdown = "[Click here](https://example.com)";
      const result = buildContentStream(markdown);

      // Should have tokens for "Click here" but not the URL
      const totalTokens = getTotalTokens(result.pages);
      expect(totalTokens).toBe(2);

      const token0 = getToken(result.pages, 0);
      const token1 = getToken(result.pages, 1);
      expect(token0?.text).toBe("Click");
      expect(token1?.text).toBe("here");
    });

    it("should handle smart quotes normalization", () => {
      const markdown = "\u201CSmart quotes\u201D and \u2018apostrophes\u2019";
      const result = buildContentStream(markdown);

      // Quotes should be normalized to ASCII
      const totalTokens = getTotalTokens(result.pages);
      const allText = [];
      for (let i = 0; i < totalTokens; i++) {
        const token = getToken(result.pages, i);
        if (token) allText.push(token.text);
      }
      const fullText = allText.join(" ");
      
      // Should contain normalized quotes
      expect(fullText).toContain('"');
      expect(fullText).not.toContain('\u201C'); // left double quote
      expect(fullText).not.toContain('\u201D'); // right double quote
    });

    it("should handle hyphenated words", () => {
      const markdown = "attention-deficit disorder";
      const result = buildContentStream(markdown);

      // Should have 2 tokens: "attention-deficit" and "disorder"
      expect(getTotalTokens(result.pages)).toBe(2);
      const token0 = getToken(result.pages, 0);
      expect(token0?.text).toBe("attention-deficit");
    });
  });

  describe("test fixture document", () => {
    it("should process complete test document", () => {
      const fixturePath = resolve(__dirname, "../../fixtures/test-document.md");
      const markdown = readFileSync(fixturePath, "utf-8");

      const result = buildContentStream(markdown, "fixture", "Test Document");

      // Should have processed all major elements
      expect(result.anchors.headingAnchors.size).toBeGreaterThan(3);
      expect(result.anchors.paragraphAnchors.size).toBeGreaterThan(5);
      expect(result.anchors.imageAnchors.size).toBe(1);

      // Should have significant token count
      expect(getTotalTokens(result.pages)).toBeGreaterThan(50);

      // Should have various stream node types
      const nodeTypes = new Set(result.stream.map((n) => n.type));
      expect(nodeTypes.has("heading")).toBe(true);
      expect(nodeTypes.has("text")).toBe(true);
      expect(nodeTypes.has("image")).toBe(true);

      // Metadata should be populated
      expect(result.metadata.id).toBe("fixture");
      expect(result.metadata.title).toBe("Test Document");
      expect(result.metadata.totalTokens).toBeGreaterThan(0);
    });
  });

  describe("performance", () => {
    it("should handle 50k word documents efficiently", () => {
      // Generate a large document
      const paragraphs = [];
      for (let i = 0; i < 1000; i++) {
        paragraphs.push(`Paragraph ${i} with some content and **bold** text.`);
      }
      const markdown = paragraphs.join("\n\n");

      const startTime = Date.now();
      const result = buildContentStream(markdown);
      const endTime = Date.now();

      // Should complete in reasonable time (< 5 seconds)
      expect(endTime - startTime).toBeLessThan(5000);

      // Should have processed all content
      const totalTokens = getTotalTokens(result.pages);
      expect(totalTokens).toBeGreaterThan(5000);
      expect(result.anchors.paragraphAnchors.size).toBe(1000);
    });

    it("should handle documents with many headings", () => {
      const sections = [];
      for (let i = 0; i < 500; i++) {
        sections.push(`## Section ${i}\n\nContent for section ${i}.`);
      }
      const markdown = sections.join("\n\n");

      const result = buildContentStream(markdown);

      expect(result.anchors.headingAnchors.size).toBe(500);
      expect(getTotalTokens(result.pages)).toBeGreaterThan(1000);
    });
  });

  describe("isEmptyDocument", () => {
    it("should detect empty documents", () => {
      const result = buildContentStream("");
      expect(isEmptyDocument(result)).toBe(true);
    });

    it("should not detect non-empty documents as empty", () => {
      const result = buildContentStream("Content");
      expect(isEmptyDocument(result)).toBe(false);
    });
  });

  describe("isImagesOnlyDocument", () => {
    it("should detect images-only documents", () => {
      const markdown = "![Image](url)";
      const result = buildContentStream(markdown);
      expect(isImagesOnlyDocument(result)).toBe(true);
    });

    it("should not detect text documents as images-only", () => {
      const markdown = "Text content\n\n![Image](url)";
      const result = buildContentStream(markdown);
      expect(isImagesOnlyDocument(result)).toBe(false);
    });

    it("should not detect empty documents as images-only", () => {
      const result = buildContentStream("");
      expect(isImagesOnlyDocument(result)).toBe(false);
    });
  });
});

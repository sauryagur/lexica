/**
 * Tests for markdown-parser.ts
 */

import { describe, it, expect } from "vitest";
import {
  parseMarkdown,
  extractNodes,
  isTextNode,
  isImageNode,
  extractInlineText,
} from "../../../app/lib/parser/markdown-parser";
import type { Root, Heading, Paragraph, Image, PhrasingContent } from "mdast";

describe("Markdown Parser", () => {
  describe("parseMarkdown", () => {
    it("should parse a simple paragraph", () => {
      const markdown = "Hello world";
      const ast = parseMarkdown(markdown);

      expect(ast.type).toBe("root");
      expect(ast.children).toHaveLength(1);
      expect(ast.children[0].type).toBe("paragraph");
    });

    it("should parse headings (h1-h6)", () => {
      const markdown = `# H1
## H2
### H3
#### H4
##### H5
###### H6`;
      const ast = parseMarkdown(markdown);

      const headings = ast.children.filter((node) => node.type === "heading") as Heading[];
      expect(headings).toHaveLength(6);
      expect(headings[0].depth).toBe(1);
      expect(headings[1].depth).toBe(2);
      expect(headings[5].depth).toBe(6);
    });

    it("should parse paragraphs with inline formatting", () => {
      const markdown = "This is **bold** and *italic* and `code`.";
      const ast = parseMarkdown(markdown);

      expect(ast.children).toHaveLength(1);
      const paragraph = ast.children[0];
      expect(paragraph.type).toBe("paragraph");

      if (paragraph.type === "paragraph") {
        expect(paragraph.children.length).toBeGreaterThan(1);
        // Check for strong (bold) node
        const hasStrong = paragraph.children.some((child) => child.type === "strong");
        expect(hasStrong).toBe(true);
      }
    });

    it("should parse unordered lists", () => {
      const markdown = `- Item 1
- Item 2
- Item 3`;
      const ast = parseMarkdown(markdown);

      expect(ast.children).toHaveLength(1);
      const list = ast.children[0];
      expect(list.type).toBe("list");

      if (list.type === "list") {
        expect(list.children).toHaveLength(3);
        expect(list.ordered).toBe(false);
      }
    });

    it("should parse ordered lists", () => {
      const markdown = `1. First
2. Second
3. Third`;
      const ast = parseMarkdown(markdown);

      const list = ast.children[0];
      expect(list.type).toBe("list");

      if (list.type === "list") {
        expect(list.children).toHaveLength(3);
        expect(list.ordered).toBe(true);
      }
    });

    it("should parse images with alt text", () => {
      const markdown = "![Alt text](https://example.com/image.png)";
      const ast = parseMarkdown(markdown);

      const image = ast.children[0];
      expect(image.type).toBe("paragraph");
      
      if (image.type === "paragraph") {
        const img = image.children[0] as Image;
        expect(img.type).toBe("image");
        expect(img.url).toBe("https://example.com/image.png");
        expect(img.alt).toBe("Alt text");
      }
    });

    it("should parse blockquotes", () => {
      const markdown = "> This is a quote";
      const ast = parseMarkdown(markdown);

      const blockquote = ast.children[0];
      expect(blockquote.type).toBe("blockquote");
    });

    it("should handle malformed markdown gracefully", () => {
      const markdown = "**unclosed bold";
      const ast = parseMarkdown(markdown);

      // Should not throw, should return valid AST
      expect(ast.type).toBe("root");
      expect(ast.children.length).toBeGreaterThan(0);
    });

    it("should ignore HTML blocks", () => {
      const markdown = `<div>HTML content</div>

Regular paragraph`;
      const ast = parseMarkdown(markdown);

      // Should have HTML node and paragraph
      expect(ast.children.length).toBeGreaterThan(0);
      const hasHtml = ast.children.some((node) => node.type === "html");
      expect(hasHtml).toBe(true);
    });

    it("should parse tables (but we'll filter them out)", () => {
      const markdown = `| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |`;
      const ast = parseMarkdown(markdown);

      // Should parse table
      const hasTable = ast.children.some((node) => node.type === "table");
      expect(hasTable).toBe(true);
    });
  });

  describe("extractNodes", () => {
    it("should extract supported node types", () => {
      const markdown = `# Heading

Paragraph

- List item

![Image](url)`;
      const ast = parseMarkdown(markdown);
      const nodes = extractNodes(ast);

      expect(nodes.length).toBeGreaterThan(0);
      const types = nodes.map((node) => node.type);
      expect(types).toContain("heading");
      expect(types).toContain("paragraph");
    });

    it("should filter out HTML nodes", () => {
      const markdown = `<div>HTML</div>

Paragraph`;
      const ast = parseMarkdown(markdown);
      const nodes = extractNodes(ast);

      const hasHtml = nodes.some((node) => node.type === "html");
      expect(hasHtml).toBe(false);
    });

    it("should filter out tables", () => {
      const markdown = `| A | B |
|---|---|
| 1 | 2 |

Paragraph`;
      const ast = parseMarkdown(markdown);
      const nodes = extractNodes(ast);

      const hasTable = nodes.some((node) => node.type === "table");
      expect(hasTable).toBe(false);
    });
  });

  describe("isTextNode", () => {
    it("should identify heading as text node", () => {
      const markdown = "# Heading";
      const ast = parseMarkdown(markdown);
      expect(isTextNode(ast.children[0])).toBe(true);
    });

    it("should identify paragraph as text node", () => {
      const markdown = "Paragraph";
      const ast = parseMarkdown(markdown);
      expect(isTextNode(ast.children[0])).toBe(true);
    });

    it("should not identify image as text node", () => {
      const markdown = "![Image](url)";
      const ast = parseMarkdown(markdown);
      const paragraph = ast.children[0];
      if (paragraph.type === "paragraph") {
        expect(isTextNode(paragraph.children[0])).toBe(false);
      }
    });
  });

  describe("isImageNode", () => {
    it("should identify image nodes", () => {
      const markdown = "![Image](url)";
      const ast = parseMarkdown(markdown);
      const paragraph = ast.children[0];
      if (paragraph.type === "paragraph") {
        expect(isImageNode(paragraph.children[0])).toBe(true);
      }
    });

    it("should not identify text as image node", () => {
      const markdown = "Text";
      const ast = parseMarkdown(markdown);
      expect(isImageNode(ast.children[0])).toBe(false);
    });
  });

  describe("extractInlineText", () => {
    it("should extract plain text", () => {
      const markdown = "Plain text";
      const ast = parseMarkdown(markdown);
      const paragraph = ast.children[0];
      if (paragraph.type === "paragraph") {
        const text = extractInlineText(paragraph.children as PhrasingContent[]);
        expect(text).toBe("Plain text");
      }
    });

    it("should extract text from bold formatting", () => {
      const markdown = "**bold text**";
      const ast = parseMarkdown(markdown);
      const paragraph = ast.children[0];
      if (paragraph.type === "paragraph") {
        const text = extractInlineText(paragraph.children as PhrasingContent[]);
        expect(text).toBe("bold text");
      }
    });

    it("should extract text from links", () => {
      const markdown = "[link text](url)";
      const ast = parseMarkdown(markdown);
      const paragraph = ast.children[0];
      if (paragraph.type === "paragraph") {
        const text = extractInlineText(paragraph.children as PhrasingContent[]);
        expect(text).toBe("link text");
      }
    });

    it("should extract text from nested formatting", () => {
      const markdown = "**bold *and italic***";
      const ast = parseMarkdown(markdown);
      const paragraph = ast.children[0];
      if (paragraph.type === "paragraph") {
        const text = extractInlineText(paragraph.children as PhrasingContent[]);
        expect(text).toBe("bold and italic");
      }
    });
  });
});

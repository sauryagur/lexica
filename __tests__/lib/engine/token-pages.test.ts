/**
 * Tests for token-pages.ts
 */

import { describe, it, expect } from "vitest";
import {
  createTokenPages,
  addTokens,
  getToken,
  getTotalTokens,
  getTokenRange,
  toGlobalIndex,
  toLocalIndex,
} from "../../../app/lib/engine/token-pages";
import { PAGE_SIZE } from "../../../app/types";
import type { Token } from "../../../app/types";

describe("Token Pages", () => {
  describe("createTokenPages", () => {
    it("should create empty pages array", () => {
      const pages = createTokenPages();
      expect(pages).toEqual([]);
    });
  });

  describe("addTokens", () => {
    it("should add tokens to first page", () => {
      const pages = createTokenPages();
      const tokens: Token[] = [
        { text: "hello", orp: 1 },
        { text: "world", orp: 1 },
      ];

      addTokens(pages, tokens);

      expect(pages).toHaveLength(1);
      expect(pages[0].pageIndex).toBe(0);
      expect(pages[0].tokens).toHaveLength(2);
    });

    it("should create new page when current page is full", () => {
      const pages = createTokenPages();

      // Create PAGE_SIZE tokens
      const tokens: Token[] = [];
      for (let i = 0; i < PAGE_SIZE; i++) {
        tokens.push({ text: `word${i}`, orp: 0 });
      }

      addTokens(pages, tokens);
      expect(pages).toHaveLength(1);

      // Add one more token - should create new page
      addTokens(pages, [{ text: "overflow", orp: 0 }]);
      expect(pages).toHaveLength(2);
      expect(pages[1].pageIndex).toBe(1);
      expect(pages[1].tokens).toHaveLength(1);
    });

    it("should handle adding multiple pages worth of tokens", () => {
      const pages = createTokenPages();

      // Create 2.5 pages worth of tokens
      const tokenCount = Math.floor(PAGE_SIZE * 2.5);
      const tokens: Token[] = [];
      for (let i = 0; i < tokenCount; i++) {
        tokens.push({ text: `word${i}`, orp: 0 });
      }

      addTokens(pages, tokens);

      expect(pages).toHaveLength(3);
      expect(pages[0].tokens).toHaveLength(PAGE_SIZE);
      expect(pages[1].tokens).toHaveLength(PAGE_SIZE);
      expect(pages[2].tokens.length).toBeLessThan(PAGE_SIZE);
    });

    it("should handle adding empty token array", () => {
      const pages = createTokenPages();
      addTokens(pages, []);
      expect(pages).toHaveLength(0);
    });

    it("should preserve token properties", () => {
      const pages = createTokenPages();
      const token: Token = {
        text: "hello",
        orp: 1,
        bold: true,
        italic: true,
      };

      addTokens(pages, [token]);

      const retrieved = getToken(pages, 0);
      expect(retrieved).toEqual(token);
    });
  });

  describe("getToken", () => {
    it("should retrieve token from first page", () => {
      const pages = createTokenPages();
      const tokens: Token[] = [
        { text: "hello", orp: 1 },
        { text: "world", orp: 1 },
      ];

      addTokens(pages, tokens);

      expect(getToken(pages, 0)?.text).toBe("hello");
      expect(getToken(pages, 1)?.text).toBe("world");
    });

    it("should retrieve token from multiple pages", () => {
      const pages = createTokenPages();

      // Add tokens across multiple pages
      const tokens: Token[] = [];
      for (let i = 0; i < PAGE_SIZE + 10; i++) {
        tokens.push({ text: `word${i}`, orp: 0 });
      }
      addTokens(pages, tokens);

      // Get token from second page
      const token = getToken(pages, PAGE_SIZE + 5);
      expect(token?.text).toBe(`word${PAGE_SIZE + 5}`);
    });

    it("should return undefined for negative index", () => {
      const pages = createTokenPages();
      addTokens(pages, [{ text: "hello", orp: 0 }]);

      expect(getToken(pages, -1)).toBeUndefined();
    });

    it("should return undefined for out of bounds index", () => {
      const pages = createTokenPages();
      addTokens(pages, [{ text: "hello", orp: 0 }]);

      expect(getToken(pages, 100)).toBeUndefined();
    });

    it("should return undefined for empty pages", () => {
      const pages = createTokenPages();
      expect(getToken(pages, 0)).toBeUndefined();
    });

    it("should handle boundary between pages", () => {
      const pages = createTokenPages();

      // Add exactly one page worth
      const tokens: Token[] = [];
      for (let i = 0; i < PAGE_SIZE; i++) {
        tokens.push({ text: `word${i}`, orp: 0 });
      }
      addTokens(pages, tokens);

      // Last token of first page
      expect(getToken(pages, PAGE_SIZE - 1)?.text).toBe(`word${PAGE_SIZE - 1}`);

      // First token of second page (doesn't exist yet)
      expect(getToken(pages, PAGE_SIZE)).toBeUndefined();
    });
  });

  describe("getTotalTokens", () => {
    it("should return 0 for empty pages", () => {
      const pages = createTokenPages();
      expect(getTotalTokens(pages)).toBe(0);
    });

    it("should count tokens in single page", () => {
      const pages = createTokenPages();
      addTokens(pages, [
        { text: "hello", orp: 0 },
        { text: "world", orp: 0 },
      ]);

      expect(getTotalTokens(pages)).toBe(2);
    });

    it("should count tokens across multiple pages", () => {
      const pages = createTokenPages();

      // Add 2.5 pages worth
      const tokenCount = Math.floor(PAGE_SIZE * 2.5);
      const tokens: Token[] = [];
      for (let i = 0; i < tokenCount; i++) {
        tokens.push({ text: `word${i}`, orp: 0 });
      }
      addTokens(pages, tokens);

      expect(getTotalTokens(pages)).toBe(tokenCount);
    });

    it("should handle full pages correctly", () => {
      const pages = createTokenPages();

      // Add exactly 2 full pages
      const tokens: Token[] = [];
      for (let i = 0; i < PAGE_SIZE * 2; i++) {
        tokens.push({ text: `word${i}`, orp: 0 });
      }
      addTokens(pages, tokens);

      expect(getTotalTokens(pages)).toBe(PAGE_SIZE * 2);
    });
  });

  describe("getTokenRange", () => {
    it("should get range from single page", () => {
      const pages = createTokenPages();
      addTokens(pages, [
        { text: "a", orp: 0 },
        { text: "b", orp: 0 },
        { text: "c", orp: 0 },
        { text: "d", orp: 0 },
      ]);

      const range = getTokenRange(pages, 1, 3);
      expect(range).toHaveLength(2);
      expect(range[0].text).toBe("b");
      expect(range[1].text).toBe("c");
    });

    it("should get range across page boundaries", () => {
      const pages = createTokenPages();

      // Add tokens crossing page boundary
      const tokens: Token[] = [];
      for (let i = 0; i < PAGE_SIZE + 10; i++) {
        tokens.push({ text: `word${i}`, orp: 0 });
      }
      addTokens(pages, tokens);

      // Get range crossing boundary
      const range = getTokenRange(pages, PAGE_SIZE - 2, PAGE_SIZE + 2);
      expect(range).toHaveLength(4);
      expect(range[0].text).toBe(`word${PAGE_SIZE - 2}`);
      expect(range[3].text).toBe(`word${PAGE_SIZE + 1}`);
    });

    it("should handle out of bounds range", () => {
      const pages = createTokenPages();
      addTokens(pages, [{ text: "hello", orp: 0 }]);

      const range = getTokenRange(pages, 0, 100);
      expect(range).toHaveLength(1);
    });

    it("should handle empty range", () => {
      const pages = createTokenPages();
      addTokens(pages, [{ text: "hello", orp: 0 }]);

      const range = getTokenRange(pages, 2, 2);
      expect(range).toHaveLength(0);
    });
  });

  describe("toGlobalIndex", () => {
    it("should convert first page coordinates", () => {
      expect(toGlobalIndex(0, 0)).toBe(0);
      expect(toGlobalIndex(0, 5)).toBe(5);
      expect(toGlobalIndex(0, PAGE_SIZE - 1)).toBe(PAGE_SIZE - 1);
    });

    it("should convert second page coordinates", () => {
      expect(toGlobalIndex(1, 0)).toBe(PAGE_SIZE);
      expect(toGlobalIndex(1, 5)).toBe(PAGE_SIZE + 5);
    });

    it("should convert third page coordinates", () => {
      expect(toGlobalIndex(2, 0)).toBe(PAGE_SIZE * 2);
      expect(toGlobalIndex(2, 10)).toBe(PAGE_SIZE * 2 + 10);
    });
  });

  describe("toLocalIndex", () => {
    it("should convert first page indices", () => {
      expect(toLocalIndex(0)).toEqual({ pageIndex: 0, offset: 0 });
      expect(toLocalIndex(5)).toEqual({ pageIndex: 0, offset: 5 });
      expect(toLocalIndex(PAGE_SIZE - 1)).toEqual({ pageIndex: 0, offset: PAGE_SIZE - 1 });
    });

    it("should convert second page indices", () => {
      expect(toLocalIndex(PAGE_SIZE)).toEqual({ pageIndex: 1, offset: 0 });
      expect(toLocalIndex(PAGE_SIZE + 5)).toEqual({ pageIndex: 1, offset: 5 });
    });

    it("should convert third page indices", () => {
      expect(toLocalIndex(PAGE_SIZE * 2)).toEqual({ pageIndex: 2, offset: 0 });
      expect(toLocalIndex(PAGE_SIZE * 2 + 10)).toEqual({ pageIndex: 2, offset: 10 });
    });

    it("should be inverse of toGlobalIndex", () => {
      const testIndices = [0, 5, 100, PAGE_SIZE, PAGE_SIZE + 50, PAGE_SIZE * 2 + 100];

      for (const globalIndex of testIndices) {
        const { pageIndex, offset } = toLocalIndex(globalIndex);
        expect(toGlobalIndex(pageIndex, offset)).toBe(globalIndex);
      }
    });
  });

  describe("large documents", () => {
    it("should handle 10k+ tokens efficiently", () => {
      const pages = createTokenPages();
      const tokenCount = 10000;

      const tokens: Token[] = [];
      for (let i = 0; i < tokenCount; i++) {
        tokens.push({ text: `word${i}`, orp: 0 });
      }

      addTokens(pages, tokens);

      expect(getTotalTokens(pages)).toBe(tokenCount);

      // Verify can retrieve tokens efficiently
      expect(getToken(pages, 0)?.text).toBe("word0");
      expect(getToken(pages, 5000)?.text).toBe("word5000");
      expect(getToken(pages, 9999)?.text).toBe("word9999");
    });

    it("should handle 50k+ tokens", () => {
      const pages = createTokenPages();
      const tokenCount = 50000;

      const tokens: Token[] = [];
      for (let i = 0; i < tokenCount; i++) {
        tokens.push({ text: `w${i}`, orp: 0 });
      }

      addTokens(pages, tokens);

      expect(getTotalTokens(pages)).toBe(tokenCount);
      expect(pages.length).toBe(Math.ceil(tokenCount / PAGE_SIZE));
    });
  });
});

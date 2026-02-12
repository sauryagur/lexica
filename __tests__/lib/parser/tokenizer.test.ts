/**
 * Tests for tokenizer.ts
 */

import { describe, it, expect } from "vitest";
import {
  calculateORP,
  splitIntoWords,
  tokenizeSanitized,
  tokenize,
  isHyphenatedCompound,
} from "../../../app/lib/parser/tokenizer";
import type { SanitizedText } from "../../../app/lib/parser/sanitizer";

describe("Tokenizer", () => {
  describe("calculateORP", () => {
    it("should calculate ORP for short words", () => {
      expect(calculateORP("the")).toBe(1); // floor(3 * 0.35) = 1
      expect(calculateORP("is")).toBe(0); // floor(2 * 0.35) = 0
      expect(calculateORP("a")).toBe(0); // floor(1 * 0.35) = 0
    });

    it("should calculate ORP for medium words", () => {
      expect(calculateORP("hello")).toBe(1); // floor(5 * 0.35) = 1
      expect(calculateORP("world")).toBe(1); // floor(5 * 0.35) = 1
      expect(calculateORP("reading")).toBe(2); // floor(7 * 0.35) = 2
    });

    it("should calculate ORP for long words", () => {
      expect(calculateORP("understanding")).toBe(4); // floor(13 * 0.35) = 4
      expect(calculateORP("comprehensive")).toBe(4); // floor(13 * 0.35) = 4
    });

    it("should handle very long words", () => {
      const longWord = "antidisestablishmentarianism"; // 28 chars
      expect(calculateORP(longWord)).toBe(9); // floor(28 * 0.35) = 9
    });
  });

  describe("splitIntoWords", () => {
    it("should split on spaces", () => {
      const text = "hello world test";
      const words = splitIntoWords(text);
      expect(words).toEqual(["hello", "world", "test"]);
    });

    it("should split on tabs and newlines", () => {
      const text = "hello\tworld\ntest";
      const words = splitIntoWords(text);
      expect(words).toEqual(["hello", "world", "test"]);
    });

    it("should keep punctuation attached to words", () => {
      const text = "hello, world! how are you?";
      const words = splitIntoWords(text);
      expect(words).toEqual(["hello,", "world!", "how", "are", "you?"]);
    });

    it("should handle hyphenated words as single tokens", () => {
      const text = "attention-deficit disorder";
      const words = splitIntoWords(text);
      expect(words).toEqual(["attention-deficit", "disorder"]);
    });

    it("should handle multiple spaces", () => {
      const text = "hello    world";
      const words = splitIntoWords(text);
      expect(words).toEqual(["hello", "world"]);
    });

    it("should handle empty strings", () => {
      expect(splitIntoWords("")).toEqual([]);
      expect(splitIntoWords("   ")).toEqual([]);
      expect(splitIntoWords("\n\t")).toEqual([]);
    });

    it("should handle strings with only punctuation", () => {
      const text = "!!!";
      const words = splitIntoWords(text);
      expect(words).toEqual(["!!!"]);
    });
  });

  describe("tokenizeSanitized", () => {
    it("should tokenize plain text", () => {
      const sanitized: SanitizedText = {
        text: "hello world",
      };
      const tokens = tokenizeSanitized(sanitized);

      expect(tokens).toHaveLength(2);
      expect(tokens[0].text).toBe("hello");
      expect(tokens[1].text).toBe("world");
      expect(tokens[0].orp).toBe(1); // floor(5 * 0.35)
    });

    it("should preserve bold flag", () => {
      const sanitized: SanitizedText = {
        text: "bold text",
        bold: true,
      };
      const tokens = tokenizeSanitized(sanitized);

      expect(tokens).toHaveLength(2);
      expect(tokens[0].bold).toBe(true);
      expect(tokens[1].bold).toBe(true);
    });

    it("should preserve italic flag", () => {
      const sanitized: SanitizedText = {
        text: "italic text",
        italic: true,
      };
      const tokens = tokenizeSanitized(sanitized);

      expect(tokens).toHaveLength(2);
      expect(tokens[0].italic).toBe(true);
      expect(tokens[1].italic).toBe(true);
    });

    it("should preserve code flag", () => {
      const sanitized: SanitizedText = {
        text: "code text",
        code: true,
      };
      const tokens = tokenizeSanitized(sanitized);

      expect(tokens).toHaveLength(2);
      expect(tokens[0].code).toBe(true);
      expect(tokens[1].code).toBe(true);
    });

    it("should preserve multiple flags", () => {
      const sanitized: SanitizedText = {
        text: "text",
        bold: true,
        italic: true,
      };
      const tokens = tokenizeSanitized(sanitized);

      expect(tokens).toHaveLength(1);
      expect(tokens[0].bold).toBe(true);
      expect(tokens[0].italic).toBe(true);
    });

    it("should handle empty text", () => {
      const sanitized: SanitizedText = {
        text: "",
      };
      const tokens = tokenizeSanitized(sanitized);
      expect(tokens).toHaveLength(0);
    });

    it("should handle text with only whitespace", () => {
      const sanitized: SanitizedText = {
        text: "   \n\t   ",
      };
      const tokens = tokenizeSanitized(sanitized);
      expect(tokens).toHaveLength(0);
    });
  });

  describe("tokenize", () => {
    it("should tokenize multiple sanitized segments", () => {
      const sanitizedTexts: SanitizedText[] = [
        { text: "plain text" },
        { text: "bold text", bold: true },
        { text: "italic text", italic: true },
      ];
      const tokens = tokenize(sanitizedTexts);

      expect(tokens.length).toBeGreaterThan(4);

      // Find bold token
      const boldToken = tokens.find((t) => t.bold);
      expect(boldToken).toBeDefined();

      // Find italic token
      const italicToken = tokens.find((t) => t.italic);
      expect(italicToken).toBeDefined();
    });

    it("should handle empty array", () => {
      const tokens = tokenize([]);
      expect(tokens).toEqual([]);
    });

    it("should maintain token order", () => {
      const sanitizedTexts: SanitizedText[] = [
        { text: "first" },
        { text: "second" },
        { text: "third" },
      ];
      const tokens = tokenize(sanitizedTexts);

      expect(tokens).toHaveLength(3);
      expect(tokens[0].text).toBe("first");
      expect(tokens[1].text).toBe("second");
      expect(tokens[2].text).toBe("third");
    });
  });

  describe("isHyphenatedCompound", () => {
    it("should identify hyphenated compounds", () => {
      expect(isHyphenatedCompound("attention-deficit")).toBe(true);
      expect(isHyphenatedCompound("well-known")).toBe(true);
      expect(isHyphenatedCompound("state-of-the-art")).toBe(true);
    });

    it("should not identify words with leading/trailing hyphens", () => {
      expect(isHyphenatedCompound("-word")).toBe(false);
      expect(isHyphenatedCompound("word-")).toBe(false);
    });

    it("should not identify plain words", () => {
      expect(isHyphenatedCompound("hello")).toBe(false);
      expect(isHyphenatedCompound("world")).toBe(false);
    });

    it("should not identify hyphen-only strings", () => {
      expect(isHyphenatedCompound("---")).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle words with apostrophes", () => {
      const sanitized: SanitizedText = {
        text: "it's can't won't",
      };
      const tokens = tokenizeSanitized(sanitized);

      expect(tokens).toHaveLength(3);
      expect(tokens[0].text).toBe("it's");
      expect(tokens[1].text).toBe("can't");
      expect(tokens[2].text).toBe("won't");
    });

    it("should handle ellipsis", () => {
      const sanitized: SanitizedText = {
        text: "wait...",
      };
      const tokens = tokenizeSanitized(sanitized);

      expect(tokens).toHaveLength(1);
      expect(tokens[0].text).toBe("wait...");
    });

    it("should handle numbers", () => {
      const sanitized: SanitizedText = {
        text: "123 456.78 1,000",
      };
      const tokens = tokenizeSanitized(sanitized);

      expect(tokens).toHaveLength(3);
      expect(tokens[0].text).toBe("123");
      expect(tokens[1].text).toBe("456.78");
      expect(tokens[2].text).toBe("1,000");
    });

    it("should handle mixed punctuation", () => {
      const sanitized: SanitizedText = {
        text: "(parentheses) [brackets] {braces}",
      };
      const tokens = tokenizeSanitized(sanitized);

      expect(tokens).toHaveLength(3);
      expect(tokens[0].text).toBe("(parentheses)");
      expect(tokens[1].text).toBe("[brackets]");
      expect(tokens[2].text).toBe("{braces}");
    });

    it("should calculate ORP for all tokens", () => {
      const sanitized: SanitizedText = {
        text: "hello world",
      };
      const tokens = tokenizeSanitized(sanitized);

      for (const token of tokens) {
        expect(token.orp).toBeDefined();
        expect(typeof token.orp).toBe("number");
        expect(token.orp).toBeGreaterThanOrEqual(0);
      }
    });
  });
});

/**
 * Tokenizer
 * Converts sanitized text into tokens with ORP calculation
 */

import type { Token } from "../../types";
import type { SanitizedText } from "./sanitizer";

/**
 * Calculate Optimal Recognition Point (ORP) for a word
 * ORP = floor(word.length * 0.35)
 * This is the character index that should be center-focused during reading
 */
export function calculateORP(text: string): number {
  return Math.floor(text.length * 0.35);
}

/**
 * Check if a string is only punctuation
 */
function isPunctuationOnly(text: string): boolean {
  return /^[^\w\s]+$/.test(text);
}

/**
 * Split text on whitespace while preserving punctuation attachment
 * Rules:
 * - Split on spaces, tabs, newlines
 * - Keep punctuation attached to words ("hello," stays together)
 * - Treat hyphenated compounds as single tokens ("attention-deficit")
 * - Handle edge cases: empty strings, punctuation-only, very long words
 */
export function splitIntoWords(text: string): string[] {
  if (!text || !text.trim()) {
    return [];
  }

  // Split on whitespace, but keep the text
  const words = text.split(/\s+/).filter(Boolean);

  return words;
}

/**
 * Tokenize a single sanitized text segment
 * @param sanitized - Sanitized text with semantic flags
 * @returns Array of tokens
 */
export function tokenizeSanitized(sanitized: SanitizedText): Token[] {
  const words = splitIntoWords(sanitized.text);
  const tokens: Token[] = [];

  for (const word of words) {
    // Skip empty strings
    if (!word) {
      continue;
    }

    // Create token with semantic flags
    const token: Token = {
      text: word,
      orp: calculateORP(word),
    };

    // Preserve semantic flags from sanitization
    if (sanitized.bold) {
      token.bold = true;
    }
    if (sanitized.italic) {
      token.italic = true;
    }
    if (sanitized.code) {
      token.code = true;
    }

    tokens.push(token);
  }

  return tokens;
}

/**
 * Tokenize an array of sanitized text segments
 * @param sanitizedTexts - Array of sanitized text segments
 * @returns Array of tokens
 */
export function tokenize(sanitizedTexts: SanitizedText[]): Token[] {
  const tokens: Token[] = [];

  for (const sanitized of sanitizedTexts) {
    tokens.push(...tokenizeSanitized(sanitized));
  }

  return tokens;
}

/**
 * Edge case handlers
 */

/**
 * Handle very long words (e.g., URLs, technical terms)
 * For now, treat them as single tokens
 * Future: might want to break on specific characters
 */
export function handleLongWord(word: string): string[] {
  // For MVP, just return as-is
  // Could implement breaking at 50+ chars in future
  return [word];
}

/**
 * Handle hyphenated compounds
 * Keep as single token (per spec)
 */
export function isHyphenatedCompound(word: string): boolean {
  return /\w+-\w+/.test(word);
}

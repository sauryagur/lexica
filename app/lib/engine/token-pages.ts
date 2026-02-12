/**
 * Token Pages
 * Implements paged storage for tokens to avoid monolithic arrays
 */

import type { Token, TokenPage } from "../../types";
import { PAGE_SIZE } from "../../types";

/**
 * Create a new empty token pages structure
 * @returns Array of token pages (initially empty)
 */
export function createTokenPages(): TokenPage[] {
  return [];
}

/**
 * Add tokens to the paged storage
 * Automatically creates new pages as needed
 * @param pages - Array of token pages
 * @param tokens - Tokens to add
 */
export function addTokens(pages: TokenPage[], tokens: Token[]): void {
  for (const token of tokens) {
    // Get or create the current page
    let currentPage: TokenPage;

    if (pages.length === 0) {
      // Create first page
      currentPage = {
        pageIndex: 0,
        tokens: [],
      };
      pages.push(currentPage);
    } else {
      // Get last page
      currentPage = pages[pages.length - 1];

      // Check if current page is full
      if (currentPage.tokens.length >= PAGE_SIZE) {
        // Create new page
        currentPage = {
          pageIndex: pages.length,
          tokens: [],
        };
        pages.push(currentPage);
      }
    }

    // Add token to current page
    currentPage.tokens.push(token);
  }
}

/**
 * Get a token by its global index
 * Global index = pageIndex * PAGE_SIZE + offset
 * @param pages - Array of token pages
 * @param globalIndex - Global token index
 * @returns Token or undefined if out of bounds
 */
export function getToken(pages: TokenPage[], globalIndex: number): Token | undefined {
  if (globalIndex < 0) {
    return undefined;
  }

  // Calculate page index and offset
  const pageIndex = Math.floor(globalIndex / PAGE_SIZE);
  const offset = globalIndex % PAGE_SIZE;

  // Check if page exists
  if (pageIndex >= pages.length) {
    return undefined;
  }

  const page = pages[pageIndex];

  // Check if offset is valid
  if (offset >= page.tokens.length) {
    return undefined;
  }

  return page.tokens[offset];
}

/**
 * Get total number of tokens across all pages
 * @param pages - Array of token pages
 * @returns Total token count
 */
export function getTotalTokens(pages: TokenPage[]): number {
  if (pages.length === 0) {
    return 0;
  }

  // Calculate total: full pages + last partial page
  const fullPages = pages.length - 1;
  const lastPage = pages[pages.length - 1];

  return fullPages * PAGE_SIZE + lastPage.tokens.length;
}

/**
 * Get tokens in a range (for rendering windows)
 * @param pages - Array of token pages
 * @param startIndex - Starting global index (inclusive)
 * @param endIndex - Ending global index (exclusive)
 * @returns Array of tokens in range
 */
export function getTokenRange(
  pages: TokenPage[],
  startIndex: number,
  endIndex: number
): Token[] {
  const tokens: Token[] = [];

  for (let i = startIndex; i < endIndex; i++) {
    const token = getToken(pages, i);
    if (token) {
      tokens.push(token);
    } else {
      break;
    }
  }

  return tokens;
}

/**
 * Convert local page coordinates to global index
 * @param pageIndex - Page index
 * @param offset - Offset within page
 * @returns Global index
 */
export function toGlobalIndex(pageIndex: number, offset: number): number {
  return pageIndex * PAGE_SIZE + offset;
}

/**
 * Convert global index to local page coordinates
 * @param globalIndex - Global token index
 * @returns Object with pageIndex and offset
 */
export function toLocalIndex(globalIndex: number): { pageIndex: number; offset: number } {
  return {
    pageIndex: Math.floor(globalIndex / PAGE_SIZE),
    offset: globalIndex % PAGE_SIZE,
  };
}

/**
 * Performance benchmarks for reader engine
 */

import { describe, it, expect } from "vitest";
import { buildContentStream } from "../../../app/lib/engine/content-stream";
import {
  createReaderState,
  advance,
  getPeripheralWindow,
} from "../../../app/lib/engine/reader-state";
import { getCurrentHeadingPath } from "../../../app/lib/engine/anchors";
import { LONG_DOCUMENT } from "../../fixtures/sample-documents";

describe("Reader Engine Performance", () => {
  it("should advance through tokens efficiently", () => {
    const { pages, anchors } = buildContentStream(LONG_DOCUMENT);
    let state = createReaderState(pages, anchors);

    const iterations = 10000;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      state = advance(state);
    }

    const end = performance.now();
    const totalTime = end - start;
    const avgTime = totalTime / iterations;

    console.log(`\n--- Performance Results ---`);
    console.log(`Advance ${iterations} times: ${totalTime.toFixed(2)}ms total`);
    console.log(`Average per advance: ${(avgTime * 1000).toFixed(2)}µs`);
    console.log(`Target: < 2ms (${avgTime < 2 ? "PASS" : "FAIL"})`);

    // Should be well under 2ms per advance
    expect(avgTime).toBeLessThan(2);
  });

  it("should get peripheral window efficiently", () => {
    const { pages, anchors } = buildContentStream(LONG_DOCUMENT);
    let state = createReaderState(pages, anchors);

    // Jump to middle of document
    state = { ...state, currentIndex: 5000 };

    const iterations = 10000;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      getPeripheralWindow(state);
    }

    const end = performance.now();
    const totalTime = end - start;
    const avgTime = totalTime / iterations;

    console.log(`\nGet peripheral window ${iterations} times: ${totalTime.toFixed(2)}ms total`);
    console.log(`Average per call: ${(avgTime * 1000).toFixed(2)}µs`);
    console.log(`Target: < 2ms (${avgTime < 2 ? "PASS" : "FAIL"})`);

    // Should be well under 2ms per call
    expect(avgTime).toBeLessThan(2);
  });

  it("should calculate heading path efficiently", () => {
    const { anchors } = buildContentStream(LONG_DOCUMENT);

    const iterations = 1000;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      getCurrentHeadingPath(5000, anchors);
    }

    const end = performance.now();
    const totalTime = end - start;
    const avgTime = totalTime / iterations;

    console.log(`\nGet heading path ${iterations} times: ${totalTime.toFixed(2)}ms total`);
    console.log(`Average per call: ${(avgTime * 1000).toFixed(2)}µs`);

    // Breadcrumb calculation can be a bit slower
    expect(avgTime).toBeLessThan(5);
  });

  it("should handle rapid navigation efficiently", () => {
    const { pages, anchors } = buildContentStream(LONG_DOCUMENT);
    let state = createReaderState(pages, anchors);

    const iterations = 1000;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      // Simulate rapid navigation
      state = advance(state);
      getPeripheralWindow(state);
      getCurrentHeadingPath(state.currentIndex, state.anchors);
    }

    const end = performance.now();
    const totalTime = end - start;
    const avgTime = totalTime / iterations;

    console.log(`\nRapid navigation (advance + window + breadcrumb) ${iterations} times:`);
    console.log(`Total: ${totalTime.toFixed(2)}ms`);
    console.log(`Average per iteration: ${avgTime.toFixed(2)}ms`);
    console.log(`Target: < 2ms (${avgTime < 2 ? "PASS" : "FAIL"})`);

    // Full navigation cycle should be under 2ms
    expect(avgTime).toBeLessThan(2);
  });
});

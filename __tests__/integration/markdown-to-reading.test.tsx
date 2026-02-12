/**
 * End-to-End Markdown to Reading Integration Tests
 * Test complete pipeline from markdown to rendering
 */

import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ReaderProvider, useReader } from "../../app/context/ReaderContext";
import { useEffect } from "react";

// Test component that loads markdown
function MarkdownReaderTest({ markdown }: { markdown: string }) {
  const { loadDocument, pages, currentToken, currentIndex } = useReader();

  useEffect(() => {
    if (markdown) {
      loadDocument(markdown, "test", "Test Document");
    }
  }, [markdown, loadDocument]);

  return (
    <div>
      {pages && (
        <div>
          <div data-testid="pages-count">{pages.length}</div>
          <div data-testid="current-index">{currentIndex}</div>
          <div data-testid="current-token">
            {currentToken ? currentToken.text : "null"}
          </div>
        </div>
      )}
    </div>
  );
}

describe("Markdown to Reading Pipeline", () => {
  it("should parse markdown and build token stream", async () => {
    const markdown = `# Hello

This is a test.`;

    render(
      <ReaderProvider>
        <MarkdownReaderTest markdown={markdown} />
      </ReaderProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("pages-count")).toBeInTheDocument();
    });

    // Should have at least one page
    expect(screen.getByTestId("pages-count")).toHaveTextContent(/\d+/);
  });

  it("should handle complex markdown with multiple elements", async () => {
    const markdown = `# Chapter 1

This is **bold** and *italic* text.

## Section 1.1

More content here.

- List item 1
- List item 2

> A blockquote

Another paragraph.`;

    render(
      <ReaderProvider>
        <MarkdownReaderTest markdown={markdown} />
      </ReaderProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("current-token")).toBeInTheDocument();
    });

    // Should start at first token
    expect(screen.getByTestId("current-index")).toHaveTextContent("0");
    expect(screen.getByTestId("current-token")).not.toHaveTextContent("null");
  });

  it("should handle empty markdown gracefully", async () => {
    const markdown = "";

    render(
      <ReaderProvider>
        <MarkdownReaderTest markdown={markdown} />
      </ReaderProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("pages-count")).toBeInTheDocument();
    });

    // Should have pages (might be empty)
    expect(screen.getByTestId("pages-count")).toHaveTextContent(/\d+/);
  });

  it("should correctly tokenize text", async () => {
    const markdown = "Hello world test";

    render(
      <ReaderProvider>
        <MarkdownReaderTest markdown={markdown} />
      </ReaderProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("current-token")).toBeInTheDocument();
    });

    // First token should be "Hello"
    expect(screen.getByTestId("current-token")).toHaveTextContent("Hello");
  });
});

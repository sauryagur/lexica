/**
 * Reader Flow Integration Tests
 * Test complete reading flow from upload to navigation
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ReaderProvider, useReader } from "../../app/context/ReaderContext";
import { ReaderEngine } from "../../app/components/reader/ReaderEngine";
import { useState } from "react";

// Test wrapper component
function TestApp() {
  const { loadDocument, pages, currentIndex, settings } = useReader();
  const [loaded, setLoaded] = useState(false);

  const handleLoad = () => {
    const markdown = `# Test

Paragraph with words.`;
    loadDocument(markdown, "test", "Test");
    setLoaded(true);
  };

  return (
    <div>
      {!loaded && <button onClick={handleLoad}>Load Document</button>}
      {pages && <div data-testid="current-index">{currentIndex}</div>}
      {pages && <div data-testid="font-size">{settings.fontSize}</div>}
      <ReaderEngine />
    </div>
  );
}

describe("Reader Flow Integration", () => {
  it("should complete full reading flow", async () => {
    render(
      <ReaderProvider>
        <TestApp />
      </ReaderProvider>
    );

    // 1. Initial state - no document
    expect(screen.getByText(/no document loaded/i)).toBeInTheDocument();

    // 2. Load document
    const loadButton = screen.getByText("Load Document");
    fireEvent.click(loadButton);

    await waitFor(() => {
      expect(screen.getByTestId("current-index")).toBeInTheDocument();
    });

    // 3. Verify initial position
    expect(screen.getByTestId("current-index")).toHaveTextContent("0");
  });

  it("should maintain state consistency throughout flow", async () => {
    render(
      <ReaderProvider>
        <TestApp />
      </ReaderProvider>
    );

    // Load document
    fireEvent.click(screen.getByText("Load Document"));

    await waitFor(() => {
      expect(screen.getByTestId("current-index")).toBeInTheDocument();
    });

    // Verify settings persist
    expect(screen.getByTestId("font-size")).toHaveTextContent("18");
  });
});

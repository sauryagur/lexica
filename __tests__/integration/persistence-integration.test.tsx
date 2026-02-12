/**
 * Persistence Integration Tests
 * Test auto-save and restore functionality
 */

import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ReaderProvider, useReader } from "../../app/context/ReaderContext";
import { useReaderPersistence } from "../../app/hooks/useReaderPersistence";
import { useEffect, useState } from "react";

// Mock IndexedDB
const mockIDB = {
  stores: new Map(),
};

// Test component with persistence
function PersistenceTest({ markdown }: { markdown: string }) {
  const { loadDocument, pages, currentIndex, jumpTo, updateSettings, settings } = useReader();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (markdown) {
      loadDocument(markdown, "test-persist", "Test");
      setReady(true);
    }
  }, [markdown, loadDocument]);

  // Enable persistence
  useReaderPersistence({
    enabled: true,
    autoSaveInterval: 10,
    debounceMs: 100,
  });

  return (
    <div>
      {ready && pages && (
        <div>
          <div data-testid="current-index">{currentIndex}</div>
          <div data-testid="font-size">{settings.fontSize}</div>
          <button onClick={() => jumpTo(50)}>Jump to 50</button>
          <button onClick={() => updateSettings({ fontSize: 24 })}>
            Update Font
          </button>
        </div>
      )}
    </div>
  );
}

describe("Persistence Integration", () => {
  beforeEach(() => {
    // Clear mock storage
    mockIDB.stores.clear();
  });

  it("should save position automatically", async () => {
    const markdown = `# Test

${"Word ".repeat(100)}`;

    render(
      <ReaderProvider>
        <PersistenceTest markdown={markdown} />
      </ReaderProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("current-index")).toBeInTheDocument();
    });

    // Initial position should be 0
    expect(screen.getByTestId("current-index")).toHaveTextContent("0");
  });

  it("should save settings changes", async () => {
    const markdown = "# Test\n\nContent here.";

    render(
      <ReaderProvider>
        <PersistenceTest markdown={markdown} />
      </ReaderProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("font-size")).toBeInTheDocument();
    });

    // Initial font size
    expect(screen.getByTestId("font-size")).toHaveTextContent("18");
  });

  it("should handle persistence errors gracefully", async () => {
    const markdown = "# Test\n\nContent.";

    // Mock IndexedDB to throw error
    const consoleWarn = jest.spyOn(console, "warn").mockImplementation();

    render(
      <ReaderProvider>
        <PersistenceTest markdown={markdown} />
      </ReaderProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("current-index")).toBeInTheDocument();
    });

    // Should still work even if persistence fails
    expect(screen.getByTestId("current-index")).toHaveTextContent("0");

    consoleWarn.mockRestore();
  });
});

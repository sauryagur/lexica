/**
 * Tests for IndexedDB Store
 * Uses fake-indexeddb for testing
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";
import {
  initDB,
  saveReaderState,
  loadReaderState,
  getAllDocuments,
  deleteDocument,
  clearAllDocuments,
  generateFileHash,
  isIndexedDBAvailable,
  type ReaderSettings,
} from "../../../app/lib/storage/idb-store";

// Reset IndexedDB before each test
beforeEach(() => {
  // Reset the global indexedDB to a fresh instance
  global.indexedDB = new IDBFactory();
});

afterEach(async () => {
  // Clean up after each test
  await clearAllDocuments();
});

describe("idb-store", () => {
  describe("initDB", () => {
    it("should initialize database successfully", async () => {
      const db = await initDB();
      expect(db).toBeDefined();
      expect(db.name).toBe("lexica-reader");
      expect(db.objectStoreNames.contains("documents")).toBe(true);
    });

    it("should create index on lastRead field", async () => {
      const db = await initDB();
      const tx = db.transaction("documents", "readonly");
      const store = tx.objectStore("documents");
      expect(store.indexNames.contains("lastRead")).toBe(true);
    });

    it("should return cached instance on subsequent calls", async () => {
      const db1 = await initDB();
      const db2 = await initDB();
      expect(db1).toBe(db2);
    });
  });

  describe("saveReaderState", () => {
    it("should save reader state successfully", async () => {
      const fileHash = "test-hash-123";
      const state = {
        fileName: "Test Document.md",
        currentIndex: 100,
        windowRadius: 2,
        theme: "dark" as const,
        fontSize: 18,
        skipImages: false,
      };

      await saveReaderState(fileHash, state);

      const loaded = await loadReaderState(fileHash);
      expect(loaded).toBeDefined();
      expect(loaded?.fileHash).toBe(fileHash);
      expect(loaded?.fileName).toBe(state.fileName);
      expect(loaded?.currentIndex).toBe(state.currentIndex);
      expect(loaded?.windowRadius).toBe(state.windowRadius);
      expect(loaded?.theme).toBe(state.theme);
      expect(loaded?.fontSize).toBe(state.fontSize);
      expect(loaded?.skipImages).toBe(state.skipImages);
      expect(loaded?.lastRead).toBeGreaterThan(0);
    });

    it("should update existing state", async () => {
      const fileHash = "test-hash-456";
      const state1 = {
        fileName: "Document.md",
        currentIndex: 50,
        windowRadius: 2,
        theme: "light" as const,
        fontSize: 16,
        skipImages: false,
      };

      await saveReaderState(fileHash, state1);

      // Update with new position
      const state2 = {
        ...state1,
        currentIndex: 150,
      };

      await saveReaderState(fileHash, state2);

      const loaded = await loadReaderState(fileHash);
      expect(loaded?.currentIndex).toBe(150);
      expect(loaded?.fileName).toBe("Document.md");
    });

    it("should handle metadata field", async () => {
      const fileHash = "test-hash-789";
      const metadata = {
        id: "doc-1",
        title: "Test Document",
        uploadedAt: Date.now(),
        lastReadAt: Date.now(),
        totalTokens: 1000,
        fileHash,
      };

      const state = {
        fileName: "Test.md",
        currentIndex: 0,
        windowRadius: 2,
        theme: "dark" as const,
        fontSize: 18,
        skipImages: false,
        metadata,
      };

      await saveReaderState(fileHash, state);

      const loaded = await loadReaderState(fileHash);
      expect(loaded?.metadata).toBeDefined();
      expect(loaded?.metadata?.id).toBe("doc-1");
      expect(loaded?.metadata?.title).toBe("Test Document");
    });
  });

  describe("loadReaderState", () => {
    it("should load saved state by hash", async () => {
      const fileHash = "load-test-123";
      const state = {
        fileName: "Load Test.md",
        currentIndex: 250,
        windowRadius: 3,
        theme: "light" as const,
        fontSize: 20,
        skipImages: true,
      };

      await saveReaderState(fileHash, state);
      const loaded = await loadReaderState(fileHash);

      expect(loaded).toBeDefined();
      expect(loaded?.currentIndex).toBe(250);
      expect(loaded?.windowRadius).toBe(3);
      expect(loaded?.skipImages).toBe(true);
    });

    it("should return null for missing documents", async () => {
      const loaded = await loadReaderState("non-existent-hash");
      expect(loaded).toBeNull();
    });
  });

  describe("getAllDocuments", () => {
    it("should return all documents sorted by lastRead", async () => {
      // Add documents with different timestamps
      await saveReaderState("hash-1", {
        fileName: "First.md",
        currentIndex: 0,
        windowRadius: 2,
        theme: "dark" as const,
        fontSize: 18,
        skipImages: false,
      });

      // Wait a bit to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      await saveReaderState("hash-2", {
        fileName: "Second.md",
        currentIndex: 0,
        windowRadius: 2,
        theme: "dark" as const,
        fontSize: 18,
        skipImages: false,
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      await saveReaderState("hash-3", {
        fileName: "Third.md",
        currentIndex: 0,
        windowRadius: 2,
        theme: "dark" as const,
        fontSize: 18,
        skipImages: false,
      });

      const documents = await getAllDocuments();

      expect(documents).toHaveLength(3);
      // Most recent should be first
      expect(documents[0].fileName).toBe("Third.md");
      expect(documents[1].fileName).toBe("Second.md");
      expect(documents[2].fileName).toBe("First.md");

      // Verify sorting
      expect(documents[0].lastRead).toBeGreaterThanOrEqual(documents[1].lastRead);
      expect(documents[1].lastRead).toBeGreaterThanOrEqual(documents[2].lastRead);
    });

    it("should return empty array when no documents", async () => {
      const documents = await getAllDocuments();
      expect(documents).toEqual([]);
    });
  });

  describe("deleteDocument", () => {
    it("should delete a document by hash", async () => {
      const fileHash = "delete-test-123";
      await saveReaderState(fileHash, {
        fileName: "Delete Me.md",
        currentIndex: 0,
        windowRadius: 2,
        theme: "dark" as const,
        fontSize: 18,
        skipImages: false,
      });

      // Verify it exists
      let loaded = await loadReaderState(fileHash);
      expect(loaded).toBeDefined();

      // Delete it
      await deleteDocument(fileHash);

      // Verify it's gone
      loaded = await loadReaderState(fileHash);
      expect(loaded).toBeNull();
    });

    it("should not throw when deleting non-existent document", async () => {
      await expect(deleteDocument("non-existent")).resolves.not.toThrow();
    });
  });

  describe("clearAllDocuments", () => {
    it("should clear all documents", async () => {
      // Add multiple documents
      await saveReaderState("clear-1", {
        fileName: "Doc1.md",
        currentIndex: 0,
        windowRadius: 2,
        theme: "dark" as const,
        fontSize: 18,
        skipImages: false,
      });

      await saveReaderState("clear-2", {
        fileName: "Doc2.md",
        currentIndex: 0,
        windowRadius: 2,
        theme: "dark" as const,
        fontSize: 18,
        skipImages: false,
      });

      // Verify they exist
      let documents = await getAllDocuments();
      expect(documents).toHaveLength(2);

      // Clear all
      await clearAllDocuments();

      // Verify all gone
      documents = await getAllDocuments();
      expect(documents).toEqual([]);
    });
  });

  describe("generateFileHash", () => {
    it("should generate consistent hash for same content", async () => {
      const content = "This is a test document with some content.";
      const hash1 = await generateFileHash(content);
      const hash2 = await generateFileHash(content);

      expect(hash1).toBe(hash2);
    });

    it("should generate different hashes for different content", async () => {
      const content1 = "This is document one.";
      const content2 = "This is document two.";

      const hash1 = await generateFileHash(content1);
      const hash2 = await generateFileHash(content2);

      expect(hash1).not.toBe(hash2);
    });

    it("should handle empty string", async () => {
      const hash = await generateFileHash("");
      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
      expect(hash.length).toBeGreaterThan(0);
    });

    it("should handle long content", async () => {
      const longContent = "a".repeat(100000);
      const hash = await generateFileHash(longContent);
      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
    });

    it("should handle unicode content", async () => {
      const unicodeContent = "Hello 世界 🌍 café";
      const hash = await generateFileHash(unicodeContent);
      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
    });
  });

  describe("isIndexedDBAvailable", () => {
    it("should return true in test environment", () => {
      const available = isIndexedDBAvailable();
      expect(available).toBe(true);
    });
  });

  describe("error handling", () => {
    it("should handle storage quota gracefully", async () => {
      // Note: This is difficult to test in fake-indexeddb
      // In real scenarios, this would be triggered by filling storage
      // We just verify the function doesn't throw
      const largeState = {
        fileName: "Large.md",
        currentIndex: 0,
        windowRadius: 2,
        theme: "dark" as const,
        fontSize: 18,
        skipImages: false,
      };

      await expect(saveReaderState("quota-test", largeState)).resolves.not.toThrow();
    });
  });
});

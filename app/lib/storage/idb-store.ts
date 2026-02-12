/**
 * IndexedDB Store for Lexica Reading Progress Persistence
 * Provides a wrapper around the idb library for storing reader state
 */

import { openDB, type IDBPDatabase, type DBSchema } from "idb";
import type { DocumentMetadata } from "../../types";

/**
 * Reader settings stored in IndexedDB
 */
export interface ReaderSettings {
  fileHash: string;
  fileName: string;
  currentIndex: number;
  windowRadius: number;
  theme: "light" | "dark";
  fontSize: number;
  skipImages: boolean;
  lastRead: number; // timestamp
  metadata?: DocumentMetadata; // optional document info
}

/**
 * Database schema interface for TypeScript
 */
interface ReaderDB extends DBSchema {
  documents: {
    key: string; // fileHash
    value: ReaderSettings;
    indexes: { lastRead: number };
  };
}

/**
 * Database configuration
 */
const DB_NAME = "lexica-reader";
const DB_VERSION = 1;
const STORE_NAME = "documents";

/**
 * Cached database instance
 */
let dbInstance: IDBPDatabase<ReaderDB> | null = null;

/**
 * Initialize the IndexedDB database
 * Creates the object store and indexes on first run
 */
export async function initDB(): Promise<IDBPDatabase<ReaderDB>> {
  // Return cached instance if available
  if (dbInstance) {
    return dbInstance;
  }

  try {
    dbInstance = await openDB<ReaderDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create the documents store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: "fileHash",
          });

          // Create index for sorting by last read
          store.createIndex("lastRead", "lastRead", { unique: false });
        }
      },
    });

    return dbInstance;
  } catch (error) {
    // Handle IndexedDB not available
    console.error("Failed to initialize IndexedDB:", error);
    throw new Error("IndexedDB is not available");
  }
}

/**
 * Save or update document reading state
 * @param fileHash - Hash of the document content
 * @param state - Reader settings to save
 */
export async function saveReaderState(
  fileHash: string,
  state: Omit<ReaderSettings, "fileHash" | "lastRead">
): Promise<void> {
  try {
    const db = await initDB();

    const readerSettings: ReaderSettings = {
      ...state,
      fileHash,
      lastRead: Date.now(),
    };

    await db.put(STORE_NAME, readerSettings);
  } catch (error) {
    // Handle storage quota exceeded
    if (
      error instanceof Error &&
      (error.name === "QuotaExceededError" ||
        error.message.includes("quota"))
    ) {
      console.warn(
        "Storage quota exceeded. Cannot save reading progress.",
        error
      );
      // Gracefully degrade - don't throw, just log
      return;
    }

    // Handle corrupt data
    if (
      error instanceof Error &&
      (error.name === "DataError" || error.name === "ConstraintError")
    ) {
      console.warn("Corrupt data detected, attempting to delete and retry...");
      try {
        await deleteDocument(fileHash);
        // Retry save
        const db = await initDB();
        await db.put(STORE_NAME, {
          ...state,
          fileHash,
          lastRead: Date.now(),
        });
      } catch (retryError) {
        console.error("Failed to recover from corrupt data:", retryError);
      }
      return;
    }

    console.error("Failed to save reader state:", error);
  }
}

/**
 * Load saved reading state for a document
 * @param fileHash - Hash of the document content
 * @returns Reader settings or null if not found
 */
export async function loadReaderState(
  fileHash: string
): Promise<ReaderSettings | null> {
  try {
    const db = await initDB();
    const state = await db.get(STORE_NAME, fileHash);
    return state || null;
  } catch (error) {
    console.error("Failed to load reader state:", error);
    return null;
  }
}

/**
 * Get all saved documents, sorted by last read (most recent first)
 * @returns Array of reader settings
 */
export async function getAllDocuments(): Promise<ReaderSettings[]> {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const index = tx.store.index("lastRead");

    // Get all documents ordered by lastRead descending
    const documents = await index.getAll();

    // Sort in descending order (most recent first)
    documents.sort((a, b) => b.lastRead - a.lastRead);

    return documents;
  } catch (error) {
    console.error("Failed to get all documents:", error);
    return [];
  }
}

/**
 * Delete a document's saved state
 * @param fileHash - Hash of the document to delete
 */
export async function deleteDocument(fileHash: string): Promise<void> {
  try {
    const db = await initDB();
    await db.delete(STORE_NAME, fileHash);
  } catch (error) {
    console.error("Failed to delete document:", error);
  }
}

/**
 * Clear all stored documents
 * Useful for testing and user-requested data clearing
 */
export async function clearAllDocuments(): Promise<void> {
  try {
    const db = await initDB();
    await db.clear(STORE_NAME);
  } catch (error) {
    console.error("Failed to clear all documents:", error);
  }
}

/**
 * Generate a hash for file content
 * Uses Web Crypto API if available, falls back to simple hash
 * @param content - Document content to hash
 * @returns Hash string
 */
export async function generateFileHash(content: string): Promise<string> {
  // Try to use SubtleCrypto (available in secure contexts)
  if (typeof crypto !== "undefined" && crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(content);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      return hashHex;
    } catch (error) {
      console.warn("SubtleCrypto not available, using fallback hash");
    }
  }

  // Fallback: Simple but effective hash function
  // Based on Java's String.hashCode() algorithm
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Check if IndexedDB is available in the current environment
 * @returns true if IndexedDB is supported
 */
export function isIndexedDBAvailable(): boolean {
  try {
    return typeof indexedDB !== "undefined";
  } catch {
    return false;
  }
}

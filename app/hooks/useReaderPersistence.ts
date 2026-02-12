/**
 * useReaderPersistence Hook
 * Automatic persistence of reading progress to IndexedDB
 * Auto-saves every 100 tokens and on window unload
 */

"use client";

import { useEffect, useRef, useCallback } from "react";
import { useReader } from "../context/ReaderContext";
import {
  saveReaderState,
  loadReaderState,
  isIndexedDBAvailable,
  generateFileHash,
} from "../lib/storage/idb-store";

/**
 * Hook options
 */
export interface UseReaderPersistenceOptions {
  enabled?: boolean; // Enable/disable persistence (default: true)
  autoSaveInterval?: number; // Number of tokens between saves (default: 100)
  debounceMs?: number; // Debounce delay for rapid changes (default: 300ms)
}

/**
 * Custom hook for automatic reader state persistence
 * Tracks reading progress and saves to IndexedDB
 */
export function useReaderPersistence(
  options: UseReaderPersistenceOptions = {}
): void {
  const {
    enabled = true,
    autoSaveInterval = 100,
    debounceMs = 300,
  } = options;

  const reader = useReader();
  const lastSavedIndexRef = useRef<number>(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileHashRef = useRef<string | null>(null);
  const isLoadingRef = useRef<boolean>(false);

  /**
   * Save current state to IndexedDB
   */
  const saveState = useCallback(async () => {
    // Don't save if disabled or no document loaded
    if (!enabled || !reader.metadata || !reader.pages) {
      return;
    }

    // Don't save while loading
    if (isLoadingRef.current) {
      return;
    }

    // Check IndexedDB availability
    if (!isIndexedDBAvailable()) {
      console.warn("IndexedDB not available, persistence disabled");
      return;
    }

    try {
      const fileHash = fileHashRef.current || reader.metadata.fileHash;

      await saveReaderState(fileHash, {
        fileName: reader.metadata.title || "Untitled",
        currentIndex: reader.currentIndex,
        windowRadius: reader.settings.windowRadius,
        theme: reader.settings.theme,
        fontSize: reader.settings.fontSize,
        skipImages: reader.settings.skipImages,
        metadata: reader.metadata,
      });

      // Update last saved index
      lastSavedIndexRef.current = reader.currentIndex;
    } catch (error) {
      console.error("Failed to save reader state:", error);
    }
  }, [enabled, reader]);

  /**
   * Debounced save function
   */
  const debouncedSave = useCallback(() => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout
    saveTimeoutRef.current = setTimeout(() => {
      saveState();
    }, debounceMs);
  }, [saveState, debounceMs]);

  /**
   * Load saved state when document changes
   */
  useEffect(() => {
    if (!enabled || !reader.metadata) {
      return;
    }

    const loadSavedState = async () => {
      try {
        isLoadingRef.current = true;

        const fileHash = reader.metadata!.fileHash;
        fileHashRef.current = fileHash;

        const savedState = await loadReaderState(fileHash);

        if (savedState) {
          // Restore position
          if (savedState.currentIndex !== reader.currentIndex) {
            reader.jumpTo(savedState.currentIndex);
          }

          // Restore settings (only if different)
          const settingsChanged =
            savedState.windowRadius !== reader.settings.windowRadius ||
            savedState.theme !== reader.settings.theme ||
            savedState.fontSize !== reader.settings.fontSize ||
            savedState.skipImages !== reader.settings.skipImages;

          if (settingsChanged) {
            reader.updateSettings({
              windowRadius: savedState.windowRadius,
              theme: savedState.theme,
              fontSize: savedState.fontSize,
              skipImages: savedState.skipImages,
            });
          }

          // Update last saved index
          lastSavedIndexRef.current = savedState.currentIndex;
        }
      } catch (error) {
        console.error("Failed to load saved state:", error);
      } finally {
        isLoadingRef.current = false;
      }
    };

    loadSavedState();
  }, [enabled, reader.metadata?.fileHash]); // Only trigger when document changes

  /**
   * Auto-save when currentIndex changes by ±autoSaveInterval tokens
   */
  useEffect(() => {
    if (!enabled || !reader.metadata || isLoadingRef.current) {
      return;
    }

    const indexDelta = Math.abs(reader.currentIndex - lastSavedIndexRef.current);

    if (indexDelta >= autoSaveInterval) {
      debouncedSave();
    }
  }, [enabled, reader.currentIndex, reader.metadata, autoSaveInterval, debouncedSave]);

  /**
   * Save on settings changes (debounced)
   */
  useEffect(() => {
    if (!enabled || !reader.metadata || isLoadingRef.current) {
      return;
    }

    debouncedSave();
  }, [
    enabled,
    reader.settings.windowRadius,
    reader.settings.theme,
    reader.settings.fontSize,
    reader.settings.skipImages,
    reader.metadata,
    debouncedSave,
  ]);

  /**
   * Save on window beforeunload event
   */
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleBeforeUnload = () => {
      // Synchronous save on unload (if possible)
      // Note: Modern browsers may not allow async operations here
      saveState();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [enabled, saveState]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Clear any pending save timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Final save on unmount (best effort)
      if (enabled && reader.metadata) {
        saveState();
      }
    };
  }, [enabled, saveState, reader.metadata]);
}

/**
 * Re-export for convenience
 */
export { generateFileHash, isIndexedDBAvailable } from "../lib/storage/idb-store";

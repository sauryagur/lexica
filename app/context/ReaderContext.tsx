/**
 * Reader Context Provider
 * React Context for global reader state management
 */

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";
import type {
  StreamNode,
  TokenPage,
  Anchors,
  DocumentMetadata,
  Token,
} from "../types";
import {
  type ReaderState,
  type ReaderSettings,
  DEFAULT_SETTINGS,
  createReaderState,
  getCurrentToken,
  getPeripheralWindow,
  isAtImageNode,
  getProgress,
  advance as advanceState,
  retreat as retreatState,
  jumpTo as jumpToState,
  jumpToHeading as jumpToHeadingState,
  jumpToPercentage as jumpToPercentageState,
  updateSettings as updateSettingsState,
  getCurrentImageNode,
} from "../lib/engine/reader-state";
import { getCurrentHeadingPath } from "../lib/engine/anchors";
import { buildContentStream } from "../lib/engine/content-stream";

/**
 * Reader Context value shape
 */
export interface ReaderContextValue {
  // Document state
  stream: StreamNode[] | null;
  pages: TokenPage[] | null;
  anchors: Anchors | null;
  metadata: DocumentMetadata | null;

  // Reader state
  currentIndex: number;
  settings: ReaderSettings;

  // Computed values (memoized)
  currentToken: Token | null;
  peripheralWindow: Token[];
  isOnImage: boolean;
  progress: number;
  breadcrumb: string[];

  // Actions
  loadDocument: (markdown: string, docId?: string, title?: string) => void;
  advance: () => void;
  retreat: () => void;
  jumpTo: (index: number) => void;
  jumpToHeading: (headingIndex: number) => void;
  jumpToPercentage: (percent: number) => void;
  updateSettings: (settings: Partial<ReaderSettings>) => void;
  reset: () => void;
}

/**
 * Create context with undefined default
 */
const ReaderContext = createContext<ReaderContextValue | undefined>(undefined);

/**
 * Reader Context Provider Props
 */
interface ReaderProviderProps {
  children: ReactNode;
  initialSettings?: Partial<ReaderSettings>;
}

/**
 * Reader Context Provider Component
 */
export function ReaderProvider({
  children,
  initialSettings,
}: ReaderProviderProps) {
  // Document state
  const [stream, setStream] = useState<StreamNode[] | null>(null);
  const [pages, setPages] = useState<TokenPage[] | null>(null);
  const [anchors, setAnchors] = useState<Anchors | null>(null);
  const [metadata, setMetadata] = useState<DocumentMetadata | null>(null);

  // Reader state
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [settings, setSettings] = useState<ReaderSettings>({
    ...DEFAULT_SETTINGS,
    ...initialSettings,
  });

  // Create reader state object for helper functions
  const readerState: ReaderState | null = useMemo(() => {
    if (!pages || !anchors) return null;
    return {
      pages,
      anchors,
      currentIndex,
      settings,
    };
  }, [pages, anchors, currentIndex, settings]);

  // Computed values (memoized) - Optimized for <2ms render
  // Performance: Only depend on specific values, not entire readerState
  const currentToken = useMemo<Token | null>(() => {
    if (!pages) return null;
    return getCurrentToken({ pages, anchors: anchors!, currentIndex, settings });
  }, [pages, anchors, currentIndex, settings]);

  const peripheralWindow = useMemo<Token[]>(() => {
    if (!pages) return [];
    return getPeripheralWindow({ pages, anchors: anchors!, currentIndex, settings });
  }, [pages, currentIndex, settings.windowRadius]);

  const isOnImage = useMemo<boolean>(() => {
    if (!pages || !anchors) return false;
    return isAtImageNode({ pages, anchors, currentIndex, settings });
  }, [anchors, currentIndex]);

  const progress = useMemo<number>(() => {
    if (!pages) return 0;
    return getProgress({ pages, anchors: anchors!, currentIndex, settings });
  }, [pages, currentIndex]);

  const breadcrumb = useMemo<string[]>(() => {
    if (!anchors) return [];
    return getCurrentHeadingPath(currentIndex, anchors);
  }, [currentIndex, anchors]);

  // Actions (memoized with useCallback)

  /**
   * Load a new document from markdown
   */
  const loadDocument = useCallback(
    (markdown: string, docId: string = "untitled", title: string = "Untitled Document") => {
      const result = buildContentStream(markdown, docId, title);
      
      setStream(result.stream);
      setPages(result.pages);
      setAnchors(result.anchors);
      setMetadata(result.metadata);
      setCurrentIndex(0);
    },
    []
  );

  /**
   * Advance to next token
   */
  const advance = useCallback(() => {
    if (!readerState) return;
    const newState = advanceState(readerState);
    setCurrentIndex(newState.currentIndex);
  }, [readerState]);

  /**
   * Retreat to previous token
   */
  const retreat = useCallback(() => {
    if (!readerState) return;
    const newState = retreatState(readerState);
    setCurrentIndex(newState.currentIndex);
  }, [readerState]);

  /**
   * Jump to specific token index
   */
  const jumpTo = useCallback(
    (index: number) => {
      if (!readerState) return;
      const newState = jumpToState(readerState, index);
      setCurrentIndex(newState.currentIndex);
    },
    [readerState]
  );

  /**
   * Jump to a specific heading
   */
  const jumpToHeading = useCallback(
    (headingIndex: number) => {
      if (!readerState) return;
      const newState = jumpToHeadingState(readerState, headingIndex);
      setCurrentIndex(newState.currentIndex);
    },
    [readerState]
  );

  /**
   * Jump to document position by percentage
   */
  const jumpToPercentage = useCallback(
    (percent: number) => {
      if (!readerState) return;
      const newState = jumpToPercentageState(readerState, percent);
      setCurrentIndex(newState.currentIndex);
    },
    [readerState]
  );

  /**
   * Update reader settings
   */
  const updateSettings = useCallback(
    (partialSettings: Partial<ReaderSettings>) => {
      setSettings((prev) => ({
        ...prev,
        ...partialSettings,
      }));
    },
    []
  );

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    setStream(null);
    setPages(null);
    setAnchors(null);
    setMetadata(null);
    setCurrentIndex(0);
    setSettings({
      ...DEFAULT_SETTINGS,
      ...initialSettings,
    });
  }, [initialSettings]);

  // Context value
  const value: ReaderContextValue = useMemo(
    () => ({
      // Document state
      stream,
      pages,
      anchors,
      metadata,

      // Reader state
      currentIndex,
      settings,

      // Computed values
      currentToken,
      peripheralWindow,
      isOnImage,
      progress,
      breadcrumb,

      // Actions
      loadDocument,
      advance,
      retreat,
      jumpTo,
      jumpToHeading,
      jumpToPercentage,
      updateSettings,
      reset,
    }),
    [
      stream,
      pages,
      anchors,
      metadata,
      currentIndex,
      settings,
      currentToken,
      peripheralWindow,
      isOnImage,
      progress,
      breadcrumb,
      loadDocument,
      advance,
      retreat,
      jumpTo,
      jumpToHeading,
      jumpToPercentage,
      updateSettings,
      reset,
    ]
  );

  return (
    <ReaderContext.Provider value={value}>{children}</ReaderContext.Provider>
  );
}

/**
 * Hook to use Reader Context
 * Throws error if used outside of ReaderProvider
 */
export function useReader(): ReaderContextValue {
  const context = useContext(ReaderContext);
  if (context === undefined) {
    throw new Error("useReader must be used within a ReaderProvider");
  }
  return context;
}

/**
 * Export context for testing
 */
export { ReaderContext };

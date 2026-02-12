# Lexica Architecture

## Overview

Lexica is a cognitive reading interface built with Next.js 16, React 19, and TypeScript. The architecture follows a clear separation of concerns with three main layers: parsing/processing, state management, and rendering.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface                            │
│  ┌────────────────┐  ┌──────────────┐  ┌───────────────────┐   │
│  │  ReaderEngine  │  │  UI Chrome   │  │ Settings Panel    │   │
│  │                │  │  - Breadcrumb│  │ - Theme           │   │
│  │  - WordLane    │  │  - Progress  │  │ - Font Size       │   │
│  │  - Peripheral  │  │  - ScrubBar  │  │ - Window Radius   │   │
│  │  - Images      │  └──────────────┘  └───────────────────┘   │
│  └────────────────┘                                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      State Management                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │               ReaderContext (React Context)              │   │
│  │                                                          │   │
│  │  - Document State (stream, pages, anchors, metadata)   │   │
│  │  - Reader State (currentIndex, settings)                │   │
│  │  - Computed Values (currentToken, progress, breadcrumb) │   │
│  │  - Actions (advance, retreat, jumpTo, etc.)            │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Core Engine Layer                           │
│  ┌──────────────┐  ┌───────────────┐  ┌───────────────────┐   │
│  │ Reader State │  │ Token Pages   │  │ Anchors           │   │
│  │              │  │               │  │                   │   │
│  │ - advance()  │  │ - O(1) lookup │  │ - Headings map    │   │
│  │ - retreat()  │  │ - 4096/page   │  │ - Images map      │   │
│  │ - jumpTo()   │  │ - Scalable    │  │ - Paragraphs set  │   │
│  └──────────────┘  └───────────────┘  └───────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Parsing Pipeline                            │
│  ┌──────────┐  ┌────────────┐  ┌───────────┐  ┌─────────────┐ │
│  │ Markdown │→ │ AST (mdast)│→ │ Sanitizer │→ │ Tokenizer   │ │
│  │ Parser   │  │            │  │           │  │             │ │
│  │ (unified)│  │  (remark)  │  │ - Strip   │  │ - Split on  │ │
│  │          │  │            │  │   syntax  │  │   whitespace│ │
│  └──────────┘  └────────────┘  │ - Preserve│  │ - Preserve  │ │
│                                 │   semant. │  │   punct.    │ │
│                                 └───────────┘  └─────────────┘ │
│                                       ↓                          │
│                             ┌───────────────────┐               │
│                             │ Content Stream    │               │
│                             │ Builder           │               │
│                             │                   │               │
│                             │ - Build pages     │               │
│                             │ - Create anchors  │               │
│                             │ - Generate stream │               │
│                             └───────────────────┘               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         Persistence                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    IndexedDB                             │   │
│  │  - Reading position                                      │   │
│  │  - User settings                                         │   │
│  │  - Document metadata                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Document Loading Flow

```
User uploads Markdown
       ↓
parseMarkdown() → mdast AST
       ↓
processNodes() → walk AST
       ↓
For each node:
  - Heading → sanitize → tokenize → add to pages + create anchor
  - Paragraph → sanitize → tokenize → add to pages
  - Image → create anchor
  - List → process items
       ↓
buildContentStream()
       ↓
Return {stream, pages, anchors, metadata}
       ↓
ReaderContext.loadDocument()
       ↓
State updates trigger re-render
```

### 2. Navigation Flow

```
User presses Space/Arrow
       ↓
useKeyboardNav hook captures event
       ↓
Performance mark "nav-start"
       ↓
advance() callback
       ↓
ReaderContext.advance()
       ↓
advanceState(readerState)
       ↓
currentIndex++
       ↓
Check boundaries (don't exceed total tokens)
       ↓
setCurrentIndex(newIndex)
       ↓
Performance mark "nav-end"
       ↓
Measure navigation time
       ↓
useMemo recalculates:
  - currentToken (from token pages)
  - peripheralWindow (from token pages)
  - progress (percentage)
  - breadcrumb (from anchors)
       ↓
React reconciliation (virtual DOM diff)
       ↓
DOM updates (only textContent changes)
       ↓
Browser paint
       ↓
Performance warning if >2ms
```

### 3. Rendering Flow

```
ReaderContext provides:
  - currentToken
  - peripheralWindow
  - isOnImage
       ↓
ReaderEngine decides layout:
  - If isOnImage → ImageDisplay
  - Else → WordLane + PeripheralContext
       ↓
WordLane:
  1. useMemo calculates ORP position
  2. useEffect measures character widths
  3. Applies transform to align ORP to center
  4. Updates span.textContent
       ↓
PeripheralContext:
  1. Creates fixed slot structure
  2. useEffect updates each slot's textContent
  3. Applies opacity based on distance from center
       ↓
No DOM nodes created/destroyed
Only textContent and inline styles updated
```

## Component Hierarchy

```
App (Next.js page)
└── ReaderProvider (Context)
    └── ReaderEngine
        ├── WordLane (center word)
        ├── PeripheralContext (surrounding words)
        ├── ImageDisplay (when on image)
        ├── Breadcrumb (heading path)
        ├── ProgressIndicator (percentage)
        ├── SettingsPanel (configuration)
        └── ScrubBar (seek bar)
```

## State Management

### ReaderContext State

```typescript
{
  // Document state (immutable after load)
  stream: StreamNode[] | null,
  pages: TokenPage[] | null,
  anchors: Anchors | null,
  metadata: DocumentMetadata | null,

  // Reader state (mutable)
  currentIndex: number,
  settings: ReaderSettings,

  // Computed values (memoized)
  currentToken: Token | null,
  peripheralWindow: Token[],
  isOnImage: boolean,
  progress: number,
  breadcrumb: string[],

  // Actions
  loadDocument: (markdown, docId, title) => void,
  advance: () => void,
  retreat: () => void,
  jumpTo: (index) => void,
  jumpToHeading: (headingIndex) => void,
  jumpToPercentage: (percent) => void,
  updateSettings: (settings) => void,
  reset: () => void
}
```

### Memoization Strategy

**Critical for performance (<2ms navigation):**

- `currentToken`: Memoized on `currentIndex` and `pages`
- `peripheralWindow`: Memoized on `currentIndex` and `windowRadius`
- `progress`: Memoized on `currentIndex` and `pages`
- `breadcrumb`: Memoized on `currentIndex` and `anchors`
- `isOnImage`: Memoized on `currentIndex` and `anchors`

**Component memoization:**

- `WordLane`: React.memo with shallow comparison of token properties
- `PeripheralContext`: React.memo with array content comparison

## Token Pages Architecture

### Why Paged Structure?

Large documents (50k+ words) in a single array cause:
- High memory pressure
- Slow JSON serialization (for persistence)
- Array resizing overhead

### Design

```typescript
const PAGE_SIZE = 4096;

type TokenPage = {
  pageIndex: number;
  tokens: Token[];
}

// O(1) lookup
function getTokenAtIndex(pages: TokenPage[], globalIndex: number): Token | null {
  const pageIndex = Math.floor(globalIndex / PAGE_SIZE);
  const offset = globalIndex % PAGE_SIZE;
  
  if (pageIndex >= pages.length) return null;
  
  const page = pages[pageIndex];
  return page.tokens[offset] ?? null;
}
```

### Performance

- **Lookup**: O(1) with simple arithmetic
- **Memory**: Only active pages need to be in memory (future optimization)
- **Serialization**: Can persist pages individually
- **Scalability**: Handles documents up to ~16M tokens (4096 pages × 4096 tokens)

## Anchors System

### Purpose

Fast lookups for:
- Document structure (headings hierarchy)
- Non-text content (images)
- Paragraph boundaries (for scrubbing)

### Structure

```typescript
type Anchors = {
  headingAnchors: Map<globalIndex, HeadingNode>;
  imageAnchors: Map<globalIndex, ImageNode>;
  paragraphAnchors: Set<globalIndex>;
}

type HeadingNode = {
  level: number;      // 1-6
  text: string;       // Heading text
  tokenIndex: number; // Global token position
}

type ImageNode = {
  src: string;        // Image URL
  alt?: string;       // Alt text
  tokenIndex: number; // Global token position
}
```

### Operations

**Get current heading path:**
```typescript
function getCurrentHeadingPath(currentIndex: number, anchors: Anchors): string[] {
  // Find all headings before current position
  const previousHeadings = Array.from(anchors.headingAnchors.entries())
    .filter(([index]) => index <= currentIndex)
    .map(([_, heading]) => heading);
  
  // Build hierarchy (keep last of each level)
  const hierarchy: (HeadingNode | null)[] = [null, null, null, null, null, null];
  
  for (const heading of previousHeadings) {
    hierarchy[heading.level - 1] = heading;
    // Clear deeper levels
    for (let i = heading.level; i < 6; i++) {
      hierarchy[i] = null;
    }
  }
  
  return hierarchy.filter(h => h !== null).map(h => h!.text);
}
```

**Check if on image:**
```typescript
function isAtImageNode(currentIndex: number, anchors: Anchors): boolean {
  return anchors.imageAnchors.has(currentIndex);
}
```

**Snap to paragraph:**
```typescript
function snapToParagraph(targetIndex: number, anchors: Anchors): number {
  // Find nearest paragraph anchor <= targetIndex
  const sorted = Array.from(anchors.paragraphAnchors).sort((a, b) => a - b);
  
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i] <= targetIndex) {
      return sorted[i];
    }
  }
  
  return 0;
}
```

## Performance Optimizations

### 1. Memoization

- All computed values use `useMemo` with minimal dependencies
- Components use `React.memo` with custom comparison
- Callbacks use `useCallback` to prevent re-renders

### 2. Fixed DOM Structure

- WordLane: One container + one span + one ORP line (never changes)
- PeripheralContext: Fixed slots based on windowRadius (created once)
- Only `textContent` and inline styles update

### 3. Hardware Acceleration

```css
.reader-text {
  transform: translateZ(0);
  backface-visibility: hidden;
  will-change: auto;
}
```

### 4. Performance Monitoring

Built-in performance tracking:
```typescript
performance.mark("nav-start");
advance();
performance.mark("nav-end");
performance.measure("navigation", "nav-start", "nav-end");

// Warn if >2ms
if (measure.duration > 2) {
  console.warn(`⚠️ Navigation latency: ${measure.duration}ms`);
}
```

### 5. Efficient Updates

- No array scans during navigation
- No DOM queries during render
- No layout thrashing (batch reads, then writes)

## Error Handling

### Parsing Errors

```typescript
try {
  const result = buildContentStream(markdown);
  if (isEmptyDocument(result)) {
    // Handle empty document
  }
} catch (error) {
  // Show error toast
  // Log to console
  // Keep previous document loaded
}
```

### Navigation Errors

- Clamp indices to valid range (0 to totalTokens - 1)
- Skip invalid nodes
- Fallback to safe state

### Persistence Errors

- Continue without persistence if IndexedDB fails
- Log warning to console
- Graceful degradation

## Accessibility Features

1. **Keyboard Navigation**
   - Full control without mouse
   - Standard keys (Space, Arrows, Esc)

2. **ARIA Labels**
   - `role="main"` on reading area
   - `role="slider"` on scrub bar with value attributes
   - `role="dialog"` on settings panel
   - Descriptive labels on all controls

3. **Focus Management**
   - Focus trap in settings panel
   - Visible focus indicators
   - Skip to content

4. **Reduced Motion**
   - Respects `prefers-reduced-motion`
   - Disables all transitions/animations

5. **Screen Reader Support**
   - Semantic HTML
   - Live regions for announcements
   - Alternative text for images

## Testing Strategy

### Unit Tests (Engine Layer)

- Token pages operations
- Anchor lookups
- Navigation logic
- Parsing pipeline

### Integration Tests (Component Layer)

- ReaderContext state management
- ReaderEngine orchestration
- Keyboard/mouse interactions

### End-to-End Tests (User Flows)

- Document upload → navigation → settings
- Error handling
- Persistence across reloads

### Performance Tests

- Navigation latency benchmarks
- Memory profiling with large documents
- Render performance with DevTools

## Security Considerations

1. **Markdown Sanitization**
   - Strip HTML (except allowed tags)
   - Block script execution
   - Sanitize URLs

2. **File Upload**
   - Type validation (.md, .txt, .markdown)
   - Size limits (prevent DoS)
   - Content sanitization

3. **External Resources**
   - Image URLs validated
   - No inline JavaScript
   - CSP headers (future)

## Future Optimizations

1. **Virtual Paging**
   - Only keep active pages in memory
   - Lazy load pages on demand

2. **Web Workers**
   - Move parsing to worker thread
   - Prevents UI blocking on large files

3. **Service Worker**
   - Cache parsed documents
   - Offline support

4. **Code Splitting**
   - Lazy load settings panel
   - Lazy load less-used features

5. **Streaming Parser**
   - Process document incrementally
   - Show reading interface while parsing

## Deployment

### Build Process

```bash
npm run build
```

Generates:
- Static HTML pages (SSG)
- Optimized JavaScript bundles
- CSS with Tailwind
- Source maps (dev only)

### Hosting

Optimized for:
- Vercel (recommended)
- Netlify
- Any static host

### Environment Variables

None required for core functionality.

Optional:
- `NEXT_PUBLIC_ANALYTICS_ID` (analytics)
- `NEXT_PUBLIC_SENTRY_DSN` (error tracking)

## Monitoring & Debugging

### Performance

- Browser DevTools Performance tab
- React DevTools Profiler
- Console warnings for >2ms navigation

### State

- React DevTools: Inspect ReaderContext
- Redux DevTools (not currently used)

### Errors

- Console logs
- Error boundaries catch React errors
- Toast notifications for user-facing errors

## Conclusion

Lexica's architecture prioritizes:

1. **Performance**: <2ms navigation through memoization and fixed DOM
2. **Scalability**: Paged structure handles documents of any size
3. **Maintainability**: Clear separation of concerns
4. **Accessibility**: Full keyboard control and screen reader support
5. **Reliability**: Comprehensive error handling and testing

The architecture is designed for long-term maintainability while delivering a smooth, responsive reading experience.

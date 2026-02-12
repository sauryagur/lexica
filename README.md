# Lexica

**Product Design Document (PDD) + System Design Document (SDD)**

---

# 1. Product Overview

Lexica is a web-based cognitive reading interface that presents text through a center-pinned, token-driven sliding window. Instead of requiring users to scan lines and pages, Lexica brings language into a stable focal region, allowing manual, word-level traversal while preserving peripheral context.

Lexica is designed primarily for:

* Readers with ADHD or attention regulation challenges
* Students reading dense or technical material
* Knowledge workers seeking high-retention reading

Lexica is not a speed-reading application. It is a **focus scaffolding system**.

---

# 2. Problem Statement

Traditional reading interfaces rely on:

* Page scanning
* Eye saccades
* Spatial memory of page layout

These mechanisms are fragile for users with attention variability. Distraction, fatigue, and loss of place are common failure modes.

Existing RSVP-style readers solve eye movement but break comprehension by removing phrase context and document hierarchy.

Lexica aims to balance:

* Stable visual focus
* Context preservation
* Structural awareness
* Manual pacing

---

# 3. Goals

* Reduce attentional friction while reading
* Preserve phrase-level and paragraph-level context
* Enable word-level traversal with minimal latency
* Maintain document hierarchy awareness
* Scale to book-length documents
* Provide deterministic, predictable interaction

---

# 4. Non-Goals (MVP)

* No social features
* No collaboration
* No annotation system
* No AI summarization
* No mobile-first support
* No offline-first guarantees

---

# 5. Target Users

Primary:

* Students
* ADHD readers
* Researchers

Secondary:

* Developers
* Writers
* Knowledge workers

---

# 6. Core UX Principles

1. Single visual focal point
2. No scrolling during reading
3. Keyboard-first interaction
4. Minimal persistent UI
5. Predictable behavior

---

# 7. Canonical Format

Markdown is the canonical internal representation.

All imported formats (PDF, EPUB) must be converted to Markdown before entering the system.

Rationale:

* Human-readable
* Structured
* Easily parsed into AST
* Tooling ecosystem

---

# 8. High-Level Architecture

```
Upload
  ↓
Markdown Parser
  ↓
AST
  ↓
Sanitization Layer
  ↓
Content Stream Builder
  ↓
Token Pages + Anchors
  ↓
Reader Engine
  ↓
Renderer
```

---

# 9. Data Model

## 9.1 Stream Node

```ts
type StreamNode =
  | { type: "text"; startToken: number; endToken: number }
  | { type: "image"; src: string; alt?: string }
  | { type: "heading"; level: number; text: string }
```

---

## 9.2 Token

```ts
type Token = {
  text: string
  bold?: boolean
  italic?: boolean
  code?: boolean
}
```

---

## 9.3 Token Pages

Paged storage to avoid monolithic arrays.

```ts
PAGE_SIZE = 4096

TokenPage {
  pageIndex: number
  tokens: Token[]
}
```

Global token index:

```
globalIndex = pageIndex * PAGE_SIZE + offset
```

---

## 9.4 Anchors

```ts
headingAnchors: Map<globalIndex, HeadingNode>
imageAnchors: Map<globalIndex, ImageNode>
paragraphAnchors: Set<globalIndex>
```

---

## 9.5 Reader State

```ts
currentIndex: number
windowRadius: number
skipImages: boolean
```

---

# 10. Markdown Processing Pipeline

## Step 1: Parse Markdown → AST

Use a Markdown parser producing block and inline nodes.

---

## Step 2: Sanitization Layer

* Remove Markdown symbols (`**`, `_`, backticks, brackets)
* Preserve inline semantic flags
* Extract only renderable text

Links:

```
[Click Here](url) → "Click Here"
```

---

## Step 3: Block Extraction

Accept:

* Headings
* Paragraphs
* List items
* Blockquotes
* Images

Ignore:

* HTML
* Tables (MVP)

---

## Step 4: Tokenization

* Split on whitespace
* Preserve punctuation attached to words
* Normalize Unicode quotes
* Treat hyphenated compounds as single tokens

---

## Step 5: Stream Construction

For each block:

* Append tokens to TokenPages
* Create StreamNode referencing token range
* Insert anchors

---

# 11. Reader Engine

Lexica operates on a **stream cursor**, not a mode toggle.

```
cursor → StreamNode
tokenIndex → within text node
```

Traversal:

* Spacebar advances tokenIndex
* If end of node reached → cursor++

---

# 12. Rendering Model

## 12.1 Center-Pinned ORP Rendering

Each word rendered with a fixed focus character aligned to screen center.

Focus index heuristic:

```
floor(word.length * 0.35)
```

---

## 12.2 Peripheral Gradient

Opacity:

* Center word: 100%
* Neighbors ±1: 45%
* Neighbors ±2: 20%

---

## 12.3 Fixed Lane

DOM elements remain constant.

Only textContent updates.

---

# 13. Input Handling

### Spacebar

```
advance()
```

### ArrowLeft

```
currentIndex--
```

### ArrowRight

```
currentIndex++
```

### Esc / Mouse Move

Reveal UI chrome

---

# 14. Image Handling

When cursor encounters image node:

* Replace word lane with centered image
* Spacebar advances cursor

If skipImages:

```
while next node is image:
    cursor++
```

---

# 15. Hierarchy Awareness

Breadcrumb rail at top-left:

```
Chapter > Section > Subsection
```

Derived from nearest headingAnchor behind currentIndex.

---

# 16. Navigation & Recovery

### Jump to Section (TOC)

Select heading → set currentIndex to heading.startToken

### Scrub Bar

Percent-based:

```
currentIndex = floor(totalTokens * p)
snap to nearest paragraphAnchor
```

### Checkpoints

Every N tokens (e.g., 50):

Persist lastCheckpointIndex

---

# 17. Persistence

Stored in IndexedDB:

```json
{
  "fileHash": "...",
  "currentIndex": 10432,
  "windowRadius": 2,
  "theme": "dark",
  "fontSize": 18,
  "skipImages": false
}
```

---

# 18. Performance Targets

* Keypress → render under 2ms
* No re-parsing during reading
* No large array scans
* No DOM node creation per step

---

# 19. Security

* Sanitize Markdown
* Block script execution
* Disallow inline HTML
* Optional image domain allowlist

---

# 20. Accessibility

* Full keyboard control
* Adjustable font size
* High contrast modes
* No forced animation

---

# 21. MVP Feature Set

* Markdown upload
* Tokenization
* ORP reader
* Word traversal
* Images
* Breadcrumb
* Scrub bar
* Persistence

---

# 22. Deferred Features

* EPUB import
* PDF import
* Active recall quizzes
* Notes
* Highlights
* Analytics

---

# 23. Design Philosophy

Lexica treats reading as a **continuous cognitive process**, not page navigation.

The system optimizes for:

* Stability
* Predictability
* Attention conservation
* User-controlled pacing

---

# 24. Summary

Lexica is a semantic document runtime with a token-level reader.

It is:

* Not a speed reader
* Not a page viewer
* Not a novelty UI

It is an attentional interface.

If implemented according to this document, Lexica becomes a reliable cognitive tool rather than a gimmick.


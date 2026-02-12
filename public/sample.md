# Welcome to Lexica

Lexica is a **focus-scaffolding reading interface** designed to help you read with greater attention and comprehension.

## How It Works

Instead of scanning pages, Lexica presents text token-by-token through a center-pinned sliding window. Your eyes stay focused on a single point while words flow through your visual field.

### Key Features

- **Center-pinned reading**: Words appear at a fixed focal point
- **Peripheral context**: See surrounding words for phrase comprehension
- **Manual pacing**: You control the reading speed
- **Hierarchy awareness**: Track your position in the document
- **Progress persistence**: Resume where you left off

## Reading with Lexica

### Basic Navigation

Press **Space** or **→** to advance to the next word. Press **←** to go back. The current word appears at full opacity in the center, while surrounding words fade into the periphery.

### Understanding the Interface

When you move your mouse or press **Esc**, the interface chrome becomes visible:

1. **Breadcrumb** (top-left): Shows your current section
2. **Progress indicator** (top-right): Current position in document
3. **Scrub bar** (bottom): Jump to any position
4. **Settings** (press Esc): Adjust reading preferences

### Settings You Can Adjust

- **Font size**: Make text larger or smaller
- **Window radius**: How many surrounding words to show
- **Theme**: Light or dark background
- **Skip images**: Automatically skip over images

## Why Use Lexica?

Traditional reading interfaces require constant eye movement and attention management. This creates friction for readers with ADHD, students tackling dense material, or anyone seeking deeper comprehension.

Lexica removes this friction by:

- Eliminating the need for eye saccades
- Reducing loss-of-place incidents
- Maintaining consistent visual focus
- Preserving document structure awareness
- Supporting self-paced reading

## Design Philosophy

Lexica is **not** a speed-reading tool. It's designed for:

- **Attention conservation**: Reduce cognitive load
- **Deep comprehension**: Maintain context while reading
- **Predictable interaction**: No surprises or distractions
- **User control**: You set the pace

## Technical Details

### Markdown Support

Lexica processes Markdown documents and supports:

- Headings (all levels)
- **Bold** and *italic* text
- `Code formatting`
- Lists (ordered and unordered)
- Blockquotes
- Images
- Paragraphs with proper spacing

### Performance

The interface is optimized for responsiveness:

- Token navigation under 2ms
- No re-parsing during reading
- Efficient memory usage for long documents
- Smooth transitions

### Privacy & Storage

Your reading progress is stored locally in your browser using IndexedDB. No data is sent to any server. All processing happens on your device.

## Getting Started

You're already reading! Here are some tips:

1. **Find your rhythm**: Experiment with different reading speeds
2. **Use the breadcrumb**: Keep track of where you are
3. **Adjust settings**: Find what works for your eyes
4. **Take breaks**: The interface will remember your position

## About Images

When Lexica encounters an image in the document, it displays the image in place of the word lane. Press Space to continue reading after viewing.

![Sample Image](https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600)

If you prefer to skip images and continue reading, enable "Skip Images" in settings.

## Blockquotes

> "Reading is to the mind what exercise is to the body."
> — Joseph Addison

## Lists

### Numbered Lists

1. Load a markdown document
2. Begin reading at your own pace
3. Adjust settings as needed
4. Take breaks when necessary
5. Resume exactly where you left off

### Bullet Lists

- Supports all standard Markdown features
- Works with keyboard navigation
- Saves progress automatically
- Adapts to your preferences
- Works entirely offline

## Advanced Usage

### Keyboard Shortcuts

- **Space** or **→**: Next word
- **←**: Previous word
- **Esc**: Toggle settings panel
- Mouse movement: Show interface chrome

### Navigation Tips

Use the scrub bar at the bottom to jump to different sections. Click and drag to seek through the document quickly. The interface will snap to the nearest paragraph boundary.

### Document Structure

The breadcrumb trail shows your current position in the document hierarchy. For example: `Chapter > Section > Subsection`

This helps maintain spatial awareness even though you're reading token-by-token.

## Technical Architecture

Lexica follows a specific data pipeline:

1. **Markdown Upload**: You provide a .md or .txt file
2. **Parsing**: Document is converted to an AST
3. **Tokenization**: Text is split into individual tokens
4. **Stream Building**: Tokens are organized into a content stream
5. **Rendering**: Current token and periphery are displayed
6. **Persistence**: Progress is saved automatically

## Accessibility

Lexica is designed with accessibility in mind:

- Full keyboard control (no mouse required)
- Adjustable font sizes
- High contrast mode support
- No forced animations
- Screen reader compatible (when chrome is visible)

## Limitations (MVP)

Current version focuses on core reading experience. Future versions may add:

- PDF import
- EPUB support
- Annotations and highlights
- Reading analytics
- Multiple documents
- Sync across devices

## Credits

Lexica is built with modern web technologies:

- React and Next.js for the UI
- TypeScript for type safety
- IndexedDB for local storage
- Markdown parsing with sanitization

## Final Thoughts

Lexica treats reading as a **continuous cognitive process** rather than page navigation. It's an attention interface, not a novelty.

The goal is simple: help you read with less friction and greater focus.

**Happy reading!**

---

*This is the end of the sample document. Press Space to return to the beginning, or upload your own markdown file to continue.*

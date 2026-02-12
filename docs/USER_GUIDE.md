# Lexica User Guide

Welcome to Lexica! This guide will help you get the most out of your cognitive reading experience.

## Table of Contents

1. [What is Lexica?](#what-is-lexica)
2. [Getting Started](#getting-started)
3. [Reading Interface](#reading-interface)
4. [Navigation](#navigation)
5. [Settings](#settings)
6. [Tips for Optimal Reading](#tips-for-optimal-reading)
7. [Keyboard Shortcuts](#keyboard-shortcuts)
8. [Troubleshooting](#troubleshooting)
9. [FAQ](#faq)

## What is Lexica?

Lexica is a **focus scaffolding system** that helps you read with greater concentration and retention. Unlike traditional reading interfaces that require you to scan lines of text, Lexica presents words one at a time in a fixed focal point, with surrounding context visible at reduced opacity.

### Key Benefits

- **Reduced eye movement**: No need to scan across lines
- **Stable focal point**: Your eyes stay in one place
- **Preserved context**: See surrounding words for comprehension
- **Manual pacing**: You control reading speed
- **Structural awareness**: Always know where you are in the document

### Who is Lexica For?

- **Readers with ADHD**: Reduces distraction and helps maintain focus
- **Students**: Better retention for dense or technical material
- **Knowledge workers**: More efficient deep reading
- **Anyone**: Who wants to improve reading focus and comprehension

## Getting Started

### 1. Upload a Document

1. Press `Esc` to open the settings panel (bottom-left)
2. Click the **"Choose Markdown File"** button
3. Select a `.md` or `.txt` file from your computer
4. The document will load and you'll see the first word

**Supported formats**: Markdown (.md), plain text (.txt)

### 2. Start Reading

1. Press `Space` or `→` (right arrow) to advance to the next word
2. The center word will update, surrounded by context words
3. Continue pressing `Space` or `→` to read through the document

### 3. Adjust Settings (Optional)

1. Press `Esc` to open settings
2. Adjust font size (12-32px)
3. Change window radius (1-3 words of context)
4. Switch between light and dark themes

## Reading Interface

### Center Word (Focus Area)

The **center word** is displayed at 100% opacity with the ORP (Optimal Recognition Point) aligned to the center of your screen. The ORP is marked by a subtle vertical line.

**ORP**: The character in a word that your eye naturally focuses on for fastest recognition (approximately 35% into the word).

### Peripheral Context

Words surrounding the center word appear at reduced opacity:

- **±1 word**: 45% opacity (immediate neighbors)
- **±2 words**: 20% opacity (outer neighbors)
- **±3 words**: Even dimmer (if window radius is 3)

This gradient helps you maintain phrase-level context while focusing on the center word.

### UI Chrome (Optional Overlay)

The UI chrome appears when you:
- Move your mouse
- Press `Esc`

It disappears automatically after 3 seconds of inactivity.

**UI Elements**:

- **Breadcrumb** (top-left): Shows your position in document hierarchy
  - Example: `Chapter 3 › Neural Plasticity › Long-Term Potentiation`
  
- **Progress Indicator** (bottom-right): Shows percentage complete
  - Example: `◆ 42%`

- **Scrub Bar** (bottom): Interactive progress bar
  - Click to jump to any position
  - Drag the thumb to scrub through the document
  - Hover to expand

- **Settings Panel** (bottom-left): Configuration options
  - Theme, font size, window radius, file upload

## Navigation

### Forward/Backward

- **Space** or **→**: Next word
- **←**: Previous word

### Scrubbing

1. Move your mouse to reveal the UI chrome
2. The scrub bar appears at the bottom
3. Click anywhere on the bar to jump to that position
4. Or drag the thumb to scrub smoothly

The scrubber automatically snaps to paragraph boundaries for smoother transitions.

### Jumping to Headings

*Coming soon: Table of Contents panel*

Currently, use the scrub bar to navigate to different sections of your document.

## Settings

Press `Esc` to open the settings panel.

### Theme

- **Dark** (default): Pure black background, white text
- **Light**: White background, black text

Choose based on lighting conditions and personal preference.

### Font Size

**Range**: 12px to 32px (default: 18px)

**Recommendations**:
- **Small screens**: 16-20px
- **Large screens**: 20-24px
- **Dense technical text**: Slightly larger (20-22px)
- **Light reading**: Medium (18-20px)

### Window Radius

**Range**: 1 to 3 words (default: 2)

Controls how much peripheral context you see:

- **Radius 1**: See 3 words total (previous, current, next)
  - Best for maximum focus
  - Good for highly distracting environments
  
- **Radius 2**: See 5 words total (±2 around center)
  - Default setting
  - Balances focus and context
  
- **Radius 3**: See 7 words total (±3 around center)
  - Maximum context
  - Better for complex sentences
  - More helpful for comprehension

### File Upload

Upload a new document:

1. Click **"Choose Markdown File"**
2. Select a file
3. Your current reading position is saved
4. The new document loads from the beginning

## Tips for Optimal Reading

### 1. Find Your Rhythm

- Start slow to get used to the interface
- Gradually increase your natural pace
- Don't rush - Lexica is about focus, not speed

### 2. Adjust Window Radius

- Try different settings for different content types
- Technical/complex: Radius 3 (more context)
- Narrative/simple: Radius 1-2 (more focus)

### 3. Take Breaks

- The fixed focal point can cause eye strain
- Follow the 20-20-20 rule: Every 20 minutes, look at something 20 feet away for 20 seconds
- Stand up and stretch regularly

### 4. Minimize Distractions

- Use full-screen mode (F11)
- Close other tabs and applications
- Turn off notifications
- Lexica hides UI automatically - let it

### 5. Experiment with Font Size

- Larger isn't always better
- Find the size that feels most comfortable
- Adjust based on screen distance

### 6. Use Breadcrumbs

- Check your position in the document
- Helps maintain orientation
- Especially useful in long documents

### 7. Scrub When Lost

- If you lose focus, use the scrub bar to go back
- Find a natural paragraph break
- Resume reading from there

## Keyboard Shortcuts

| Key | Action | Notes |
|-----|--------|-------|
| `Space` | Next word | Primary navigation |
| `→` | Next word | Alternative to Space |
| `←` | Previous word | Go back if needed |
| `Esc` | Toggle settings | Opens/closes settings panel |
| Mouse movement | Show UI | Reveals breadcrumb, progress, scrub bar |
| `F11` | Full screen | Browser full-screen (recommended) |

### Scrub Bar (when visible)

| Key | Action |
|-----|--------|
| `→` | Seek forward 5% |
| `←` | Seek backward 5% |
| `Home` | Jump to start |
| `End` | Jump to end |
| Click | Jump to position |
| Drag | Scrub through document |

## Troubleshooting

### Document Won't Load

**Problem**: File upload doesn't work or shows error

**Solutions**:
- Ensure file is Markdown (.md) or plain text (.txt)
- Check file size (very large files may take time)
- Try refreshing the page
- Check browser console for errors

### Performance Issues

**Problem**: Navigation feels sluggish or laggy

**Solutions**:
- Close other browser tabs
- Disable browser extensions
- Try a different browser (Chrome/Edge recommended)
- Check console for performance warnings
- Reduce window radius to 1

### Text Too Small/Large

**Problem**: Font size is uncomfortable

**Solutions**:
- Press `Esc` and adjust font size slider
- Try different screen distances
- Adjust your browser zoom (Ctrl/Cmd +/-)
- Recommended starting point: 18-20px

### Lost My Place

**Problem**: Don't know where I am in document

**Solutions**:
- Move mouse to see breadcrumb (top-left)
- Check progress indicator (bottom-right)
- Use scrub bar to navigate
- Reading position is auto-saved

### Settings Not Saving

**Problem**: Settings reset after page reload

**Solutions**:
- Check if browser allows IndexedDB
- Enable cookies/storage for the site
- Try incognito mode to test
- Clear browser cache and retry

### ORP Line Not Visible

**Problem**: Can't see the vertical alignment line

**Solutions**:
- Check if dark/light theme is appropriate
- Try increasing screen brightness
- The line is intentionally subtle (30% opacity)
- Focus on the center word, not the line

## FAQ

### Is Lexica a speed reading app?

No. Lexica is a **focus scaffolding system**, not a speed reader. It helps you maintain concentration and comprehension, not maximize reading speed.

### Can I use Lexica on mobile?

The current version is optimized for desktop/laptop with keyboard. Mobile support may come in future versions.

### What file formats are supported?

Currently: Markdown (.md) and plain text (.txt). PDF and EPUB support may come in the future.

### Does Lexica work offline?

The app works offline once loaded, but you need an internet connection for the initial load. Uploaded documents are stored locally in your browser.

### Is my reading data private?

Yes! All data stays in your browser. Nothing is sent to servers. Your documents and reading positions are stored locally using IndexedDB.

### Can I highlight or annotate?

Not in the current version. The MVP focuses on the core reading experience. Annotations may come in future versions.

### Why does navigation slow down sometimes?

If you see console warnings about navigation >2ms, it means:
- Your document is very large
- Your browser is under load
- Background processes are running

Target performance is <2ms per navigation.

### Can I customize the colors?

Currently only dark/light themes. More customization options may come in future versions.

### How do I report bugs or request features?

Check the project repository for issue tracker and contribution guidelines.

### What's the maximum document size?

Lexica can theoretically handle ~16 million words. Practical limits depend on your device's memory. Most documents up to 100k words should work smoothly.

### Why is the peripheral text so dim?

This is intentional! The opacity gradient (100% → 45% → 20%) helps your eyes focus on the center word while maintaining phrase-level context for comprehension.

### Can I adjust reading speed automatically?

No. Lexica uses manual pacing. You press Space/Arrow for each word. This gives you full control and prevents the "firehose" effect of auto-paced RSVP readers.

### What is ORP?

ORP (Optimal Recognition Point) is the character position in a word where your eye naturally fixates for fastest recognition. Research suggests this is approximately 35% into the word. Lexica aligns this point to the center of your screen.

### Does Lexica support tables or complex formatting?

The MVP focuses on flowing text. Tables, complex layouts, and fancy formatting are simplified or skipped. This is intentional to maintain reading flow.

---

## Getting Help

If you're stuck or have questions:

1. Re-read this guide
2. Check the [README](../README.md)
3. Check the [Architecture docs](../ARCHITECTURE.md)
4. Open an issue on the project repository

Happy reading! 📖

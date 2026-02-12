# Visual Rendering Description - Lexica Core UI

## Overall Layout

```
┌─────────────────────────────────────────────────────────┐
│                    Pure Black (#000)                     │
│                                                          │
│                                                          │
│                                                          │
│   [far-left]  [left]  │ WORD │  [right]  [far-right]   │
│      20%       45%    │ 100% │    45%        20%        │
│                       │      │                           │
│                       │ ORP  │                           │
│                       │ LINE │                           │
│                                                          │
│                                                          │
│                                                          │
│                    (UI Chrome hidden)                    │
└─────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
ReaderEngine (Fixed Position, Full Viewport)
├── reading-area (Centered Flexbox)
│   ├── (Text Mode)
│   │   ├── PeripheralContext (Absolute Positioned)
│   │   │   ├── Token Slot [-2] (20% opacity)
│   │   │   ├── Token Slot [-1] (45% opacity)
│   │   │   ├── Token Slot [0]  (100% opacity, hidden)
│   │   │   ├── Token Slot [+1] (45% opacity)
│   │   │   └── Token Slot [+2] (20% opacity)
│   │   │
│   │   └── WordLane (Relative Positioned)
│   │       ├── ORP Line (Vertical, 1px, 20% white)
│   │       └── Word Span (Transform aligned to ORP)
│   │
│   └── (Image Mode)
│       └── ImageDisplay (Centered, Max 80vw×80vh)
│           ├── Image (Object-fit: contain)
│           └── Caption (Optional, below image)
│
└── ui-chrome (Hidden by default, shown on ESC)
    └── Help Text
```

## Typography

### Fonts
- **Merriweather** (Reader): Serif font for optimal reading
  - Regular (400): Normal text
  - Bold (700): Bold tokens
  - Italic: Emphasized text
  
- **Geist Mono** (Code): Monospace for code tokens
  - Used inline with slight background tint

- **Geist Sans** (UI): Sans-serif for UI elements
  - Used in help text and error messages

### Sizes
- Default: 18px (var(--reader-font-size))
- Line height: 1.6
- User adjustable (via settings)

## Color Palette

```css
Background:    #000000 (Pure Black)
Foreground:    #FFFFFF (White)
ORP Line:      rgba(255, 255, 255, 0.2)
Code BG:       rgba(255, 255, 255, 0.1)
UI BG:         rgba(20, 20, 20, 0.95)
UI Border:     rgba(255, 255, 255, 0.1)
```

## Opacity Gradient

```
Distance from Center    Opacity    Visual Weight
─────────────────────────────────────────────────
      ±2 (far)           20%       Very faint
      ±1 (near)          45%       Readable
       0 (center)       100%       Full emphasis
```

## Interactions

### Keyboard Navigation
```
┌─────────────┬──────────────────────────────┐
│   Key       │   Action                     │
├─────────────┼──────────────────────────────┤
│ Space       │ Advance to next token        │
│ →           │ Advance to next token        │
│ ←           │ Retreat to previous token    │
│ Esc         │ Toggle UI chrome visibility  │
└─────────────┴──────────────────────────────┘
```

### State Changes
- **Token Change**: Smooth content update, no DOM recreation
- **Image Transition**: Fade in with 0.2s ease-in-out
- **UI Toggle**: Instant show/hide of chrome layer

## Responsive Behavior

- Viewport units (vw, vh) for full-screen coverage
- Image max dimensions scale with viewport
- Text wrapping disabled (nowrap)
- Overflow hidden (no scrolling)

## Performance Characteristics

- **Fixed DOM Structure**: No node creation/destruction per token
- **Transform-based Alignment**: Hardware accelerated
- **Minimal Re-renders**: Only content updates, not structure
- **Render Time**: ~3ms per token advance (target: <2ms)

## Edge Cases Handled

1. **Null Token**: Displays non-breaking space
2. **Document Start**: Empty peripheral slots on left
3. **Document End**: Empty peripheral slots on right
4. **Image Load Error**: Fallback UI with alt text
5. **No Document**: Clear loading state message
6. **Empty Document**: Informative empty state

## Accessibility Features

- Semantic HTML structure
- Alt text for images
- Keyboard-first interaction
- High contrast (pure black/white)
- ARIA hidden for decorative elements (ORP line)
- Focus management (to be enhanced)

## Example Rendering Scenarios

### Scenario 1: Reading Normal Text
```
Text: "The quick brown fox jumps"
Position: "brown" (index 2)
Window: radius=2

Display:
  The (20%)  quick (45%)  │ brown (100%) │  fox (45%)  jumps (20%)
                          │              │
                          └─ ORP at 'o' ─┘
```

### Scenario 2: Bold + Italic Token
```
Token: { text: "emphasis", bold: true, italic: true }

Display:
  [emphasis]
  ^^^^^^^^^^^^
  Font: Merriweather Bold Italic
  Weight: 700
  Style: italic
  Opacity: 100%
```

### Scenario 3: Code Token
```
Token: { text: "console.log", code: true }

Display:
  ┌─────────────────┐
  │ console.log     │  Font: Geist Mono
  └─────────────────┘  Background: rgba(255,255,255,0.1)
```

### Scenario 4: Image Display
```
Image Node: { src: "image.jpg", alt: "A landscape" }

Display:
     ┌──────────────────────┐
     │                      │
     │   [Image Content]    │  Max: 80vw × 80vh
     │                      │  Object-fit: contain
     └──────────────────────┘
          "A landscape"          Caption (italic, 60% opacity)
```

## Visual Design Principles

1. **Single Focal Point**: Eye naturally drawn to center word
2. **Contextual Awareness**: Peripheral tokens provide phrase context
3. **Minimal Distraction**: Pure black, no UI chrome during reading
4. **Predictable Behavior**: Fixed positions, smooth transitions
5. **Attention Conservation**: No scanning required, stable focus

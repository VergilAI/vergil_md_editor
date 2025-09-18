# Technical and Functional Specification
## Bidirectional Markdown Editor

### Executive Summary

This document outlines the technical architecture and functional requirements for a bidirectional markdown editor that provides both WYSIWYG (What You See Is What You Get) visual editing and source code editing capabilities. The system leverages modern web technologies to deliver a seamless editing experience with real-time synchronization between visual and source representations.

---

## Core Technologies

### 1. Milkdown with Crepe
**Package**: `@milkdown/crepe` (v7.15.5)

**Purpose**: Provides the WYSIWYG visual editing experience

**Why We Use It**:
- **Plugin-driven architecture**: Everything is a plugin, allowing maximum flexibility and customization
- **Built on ProseMirror**: Leverages the robust ProseMirror framework internally, providing a solid foundation for rich text editing
- **Remark integration**: Uses Remark for markdown parsing, which provides AST-based processing for better transformations
- **Out-of-the-box solution**: Crepe specifically provides pre-configured UI components, eliminating the need to build toolbars and menus from scratch
- **Lightweight**: Despite its features, maintains a reasonable bundle size (~40kb gzipped core)

**How We Use It**:
```javascript
const crepe = new Crepe({
    root: containerElement,
    defaultValue: markdownContent,
    featureConfigs: {
        // Configure specific features as needed
    }
});
const editor = await crepe.create();
```

### 2. CodeMirror 6
**Packages**:
- `codemirror` (v6.0.2)
- `@codemirror/lang-markdown` (v6.3.4)
- `@codemirror/theme-one-dark` (v6.1.3)

**Purpose**: Provides source code editing with syntax highlighting

**Why We Use It**:
- **Performance**: Handles large documents efficiently with virtual scrolling
- **Extensibility**: Modular architecture allows adding only needed features
- **Markdown support**: Dedicated markdown language mode with proper syntax highlighting
- **Same author**: Created by Marijn Haverbeke (also created ProseMirror), ensuring architectural consistency
- **Mobile support**: Better mobile editing experience compared to alternatives

**How We Use It**:
```javascript
const editor = new EditorView({
    state: EditorState.create({
        doc: markdownContent,
        extensions: [
            basicSetup,
            markdown(),
            oneDark, // or other themes
            updateListener // for change detection
        ]
    }),
    parent: containerElement
});
```

### 3. Dependencies We Don't Need

**Important**: We do NOT need separate ProseMirror packages because:
- Milkdown bundles all necessary ProseMirror dependencies internally
- Crepe provides the UI layer that would otherwise require manual ProseMirror configuration
- Direct ProseMirror manipulation is abstracted away by Milkdown's API

**We removed**:
- All standalone `prosemirror-*` packages
- `marked` (Milkdown uses Remark instead)
- `markdown-it` (included via prosemirror-markdown in Milkdown)

---

## Architecture Overview

### Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                     User Input                           │
├────────────────┬────────────────────┬───────────────────┤
│  Visual Mode   │   Split View       │   Source Mode     │
│  (Milkdown)    │   (Both Visible)   │   (CodeMirror)   │
└────────┬───────┴────────┬───────────┴────────┬──────────┘
         │                 │                     │
         ▼                 ▼                     ▼
    ┌─────────┐      ┌───────────┐        ┌──────────┐
    │ Remark  │◄────►│ Markdown  │◄──────►│ Raw Text │
    │  (AST)  │      │  (String) │        │  Editor  │
    └─────────┘      └───────────┘        └──────────┘
         │                 │                     │
         ▼                 ▼                     ▼
    ┌─────────┐      ┌───────────┐        ┌──────────┐
    │ Visual  │      │   Local   │        │  Syntax  │
    │ Render  │      │  Storage  │        │ Highlight│
    └─────────┘      └───────────┘        └──────────┘
```

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|---------------|----------------|
| **Milkdown/Crepe** | Visual editing, toolbar, rich formatting | Handles all WYSIWYG operations |
| **CodeMirror** | Source editing, syntax highlighting | Provides raw markdown editing |
| **Remark (via Milkdown)** | Markdown parsing to AST | Enables bidirectional conversion |
| **Synchronization Layer** | Content sync between editors | Custom implementation required |
| **Storage Layer** | Persistence and auto-save | localStorage or backend API |

---

## Functional Requirements

### 1. View Modes

**Visual Mode**
- WYSIWYG editing using Milkdown
- Rich formatting toolbar
- Real-time preview of markdown elements
- Support for tables, lists, code blocks, images

**Source Mode**
- Raw markdown editing with CodeMirror
- Syntax highlighting
- Line numbers and code folding
- Theme support (light/dark)

**Split View**
- Side-by-side display of both editors
- Resizable divider
- Synchronized scrolling (optional)
- Real-time content synchronization

### 2. Synchronization Strategy

**Challenge**: Milkdown Crepe doesn't provide easy methods to update content after initialization

**Solutions**:

**Option A: One-Way Sync (Recommended for Crepe)**
```javascript
// CodeMirror → Milkdown (requires re-initialization)
// Milkdown → CodeMirror (simple dispatch)
```

**Option B: Custom Milkdown Setup (Without Crepe)**
```javascript
// Use Milkdown core directly for more control
// Implement custom toolbar if needed
// Full bidirectional sync possible
```

### 3. Supported Markdown Features

**Standard Markdown**:
- Headers (H1-H6)
- Bold, Italic, Strikethrough
- Links and Images
- Code blocks and inline code
- Lists (ordered, unordered, task lists)
- Blockquotes
- Horizontal rules

**GitHub Flavored Markdown** (via Milkdown GFM plugin):
- Tables
- Task lists with checkboxes
- Strikethrough
- Autolinks

**Extended Features** (configurable):
- Math equations (KaTeX/MathJax)
- Diagrams (Mermaid)
- Footnotes
- Custom HTML blocks

---

## Implementation Guidelines

### 1. Initialization Sequence

```javascript
async function initializeEditor() {
    // 1. Load saved content
    const content = loadFromStorage();

    // 2. Initialize Milkdown
    const milkdown = await initMilkdown(content);

    // 3. Initialize CodeMirror
    const codemirror = initCodeMirror(content);

    // 4. Set up synchronization
    setupSync(milkdown, codemirror);

    // 5. Initialize UI controls
    setupViewModes();
    setupThemeToggle();

    // 6. Start auto-save
    initAutoSave();
}
```

### 2. Synchronization Implementation

```javascript
// Simplified sync approach for Crepe limitations
let isSyncing = false;

function syncToCodeMirror(markdown) {
    if (isSyncing) return;
    isSyncing = true;

    codeMirrorInstance.dispatch({
        changes: {
            from: 0,
            to: codeMirrorInstance.state.doc.length,
            insert: markdown
        }
    });

    setTimeout(() => isSyncing = false, 100);
}

// Note: Syncing to Milkdown with Crepe requires workarounds
// or switching to core Milkdown without Crepe
```

### 3. Performance Considerations

**Bundle Size Management**:
- Use dynamic imports for large features
- Lazy load themes and language modes
- Consider code splitting for production

**Rendering Optimization**:
- Debounce synchronization (100-300ms)
- Use requestAnimationFrame for UI updates
- Virtual scrolling handled by libraries

**Memory Management**:
- Cleanup editors on unmount
- Limit undo history size
- Clear large temporary data

---

## Development Setup

### Required NPM Scripts

```json
{
  "scripts": {
    "dev": "npx http-server -p 8080 -o",
    "build": "npx esbuild app.js --bundle --outfile=app.bundle.js --format=iife",
    "clean": "rm -f *.html *.css *.js *.bundle.js"
  }
}
```

### Minimal Package Dependencies

```json
{
  "dependencies": {
    "@milkdown/core": "^7.15.5",
    "@milkdown/crepe": "^7.15.5",
    "@milkdown/preset-commonmark": "^7.15.5",
    "@milkdown/preset-gfm": "^7.15.5",
    "@milkdown/theme-nord": "^7.15.5",
    "codemirror": "^6.0.2",
    "@codemirror/lang-markdown": "^6.3.4",
    "@codemirror/theme-one-dark": "^6.1.3"
  },
  "devDependencies": {
    "esbuild": "^0.25.10"
  }
}
```

---

## Trade-offs and Decisions

### Why Milkdown over Pure ProseMirror?

**Pros**:
- Faster development with pre-built features
- Plugin ecosystem ready to use
- Markdown-first design
- Remark integration for AST processing

**Cons**:
- Less control over internals
- Crepe specifically has update limitations
- Larger bundle size than minimal ProseMirror

### Why Not Use Marked?

- **Redundant**: Milkdown includes markdown parsing via Remark
- **One-way only**: Marked only converts MD→HTML, not bidirectional
- **No AST**: Remark provides AST for better transformations
- **Bundle size**: Avoiding duplicate functionality

### Why Keep CodeMirror for Source View?

- **Specialized**: Purpose-built for code editing
- **Performance**: Better than contenteditable for large documents
- **Features**: Syntax highlighting, folding, search/replace
- **Consistency**: Same author as ProseMirror (architectural harmony)

---

## Future Enhancements

### Potential Improvements

1. **Collaboration Features**
   - Add Y.js for real-time collaboration
   - Implement presence indicators
   - Conflict resolution strategies

2. **Export Capabilities**
   - PDF export
   - HTML export with styling
   - Docx conversion

3. **Advanced Markdown**
   - Custom syntax extensions
   - Plugin system for domain-specific markdown
   - Template support

4. **Performance Optimizations**
   - Web Workers for parsing
   - IndexedDB for larger documents
   - Incremental rendering

### Alternative Architectures

**For Full Bidirectional Sync**:
Consider using Milkdown core directly without Crepe:
- More control over updates
- Custom toolbar implementation required
- Direct access to ProseMirror state

**For Simpler Implementation**:
Consider single-editor approach:
- Use only Milkdown with source mode plugin
- Or use Monaco Editor with markdown preview
- Reduces complexity but limits features

---

## Conclusion

This architecture leverages best-in-class tools for their specialized purposes:
- **Milkdown/Crepe** for rich visual editing
- **CodeMirror** for source code editing
- **Remark** (via Milkdown) for robust markdown processing

The modular approach ensures maintainability, performance, and extensibility while providing users with a professional markdown editing experience comparable to tools like Typora, Obsidian, and VSCode.
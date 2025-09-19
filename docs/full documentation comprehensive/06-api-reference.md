# API Reference Documentation

## Overview

This document provides comprehensive API documentation for the Dual-Pane Markdown Editor, including all functions, interfaces, classes, and data structures. The API is organized into logical modules for easy navigation and understanding.

## Table of Contents

1. [Core Initialization](#core-initialization)
2. [Sync Manager](#sync-manager)
3. [CodeMirror Integration](#codemirror-integration)
4. [Milkdown Integration](#milkdown-integration)
5. [UI Management](#ui-management)
6. [Event Handlers](#event-handlers)
7. [Utility Functions](#utility-functions)
8. [Configuration Options](#configuration-options)
9. [Data Structures](#data-structures)
10. [Error Handling](#error-handling)

## Core Initialization

### `initialize()`

Main initialization function that sets up the entire editor system.

**Signature:**
```javascript
async function initialize(): Promise<void>
```

**Description:**
Initializes the dual-pane markdown editor by setting up both editor instances, UI components, and event handlers.

**Returns:**
- `Promise<void>` - Resolves when initialization is complete

**Example:**
```javascript
document.addEventListener('DOMContentLoaded', initialize);
```

**Dependencies:**
- `initializeCodeMirror()`
- `initializeMilkdown()`
- `initializeDivider()`
- `initializeToolbar()`
- `initializeScrollSync()`

**Error Handling:**
- Logs initialization progress and errors to console
- Throws if critical dependencies are missing

---

## Sync Manager

### `syncManager` Object

Global state manager for handling synchronization between editors.

**Type Definition:**
```typescript
interface SyncManager {
    isUpdating: boolean;
    lastSource: 'codemirror' | 'milkdown' | null;
    debounceTimer: number | null;
    debounceDelay: number;
    scrollSync: boolean;
}
```

**Properties:**
- `isUpdating: boolean` - Flag to prevent circular updates during sync
- `lastSource: string | null` - Tracks which editor initiated the last update
- `debounceTimer: number | null` - Timer ID for debounced updates
- `debounceDelay: number` - Delay in milliseconds for debouncing (default: 300ms)
- `scrollSync: boolean` - Enable/disable synchronized scrolling (default: false)

**Default Values:**
```javascript
const syncManager = {
    isUpdating: false,
    lastSource: null,
    debounceTimer: null,
    debounceDelay: 300,
    scrollSync: false
};
```

### `syncToMilkdown(content)`

Synchronizes content from CodeMirror to Milkdown editor.

**Signature:**
```javascript
async function syncToMilkdown(content: string): Promise<void>
```

**Parameters:**
- `content: string` - Markdown content to sync to Milkdown

**Returns:**
- `Promise<void>` - Resolves when synchronization is complete

**Side Effects:**
- Updates `syncManager.isUpdating` flag
- Updates sync status indicators in UI
- Preserves cursor/selection position when possible

**Example:**
```javascript
const markdownContent = "# Hello World\n\nThis is **bold** text.";
await syncToMilkdown(markdownContent);
```

**Error Handling:**
- Catches and logs synchronization errors
- Updates UI to show error state
- Resets synchronization flags on completion

### `syncToCodeMirror(ctx)`

Synchronizes content from Milkdown to CodeMirror editor.

**Signature:**
```javascript
function syncToCodeMirror(ctx: Context): void
```

**Parameters:**
- `ctx: Context` - Milkdown context object containing editor state

**Side Effects:**
- Updates `syncManager.isUpdating` flag
- Updates sync status indicators in UI
- Preserves cursor position relative to document length

**Example:**
```javascript
// Called automatically from Milkdown listener
ctx.get(listenerCtx).updated((ctx, doc, prevDoc) => {
    if (!syncManager.isUpdating && doc !== prevDoc) {
        handleMilkdownChange(ctx);
    }
});
```

---

## CodeMirror Integration

### `initializeCodeMirror()`

Sets up the CodeMirror editor instance with configuration and extensions.

**Signature:**
```javascript
function initializeCodeMirror(): EditorView
```

**Returns:**
- `EditorView` - Configured CodeMirror editor instance

**Configuration:**
```javascript
const extensions = [
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightActiveLine(),
    drawSelection(),
    history(),
    foldGutter(),
    bracketMatching(),
    markdown(),
    oneDark,
    keymap.of([...defaultKeymap, ...historyKeymap, ...foldKeymap]),
    updateListener,
    theme
];
```

**Features:**
- Line numbers and active line highlighting
- Markdown syntax highlighting
- One Dark theme
- History support (undo/redo)
- Code folding
- Bracket matching
- Custom update listener for sync

### `handleCodeMirrorChange(update)`

Handles content changes in CodeMirror editor.

**Signature:**
```javascript
function handleCodeMirrorChange(update: ViewUpdate): void
```

**Parameters:**
- `update: ViewUpdate` - CodeMirror update object containing change information

**Properties of ViewUpdate:**
- `state: EditorState` - Current editor state
- `view: EditorView` - Editor view instance
- `docChanged: boolean` - Whether document content changed
- `selectionSet: boolean` - Whether selection was modified

**Side Effects:**
- Triggers debounced sync to Milkdown
- Updates UI status indicators
- Updates status bar information

**Example:**
```javascript
EditorView.updateListener.of((update) => {
    if (update.docChanged && !syncManager.isUpdating) {
        handleCodeMirrorChange(update);
    }
    updateStatusBar(update);
})
```

### `updateStatusBar(update)`

Updates the status bar with current editor metrics.

**Signature:**
```javascript
function updateStatusBar(update: ViewUpdate): void
```

**Parameters:**
- `update: ViewUpdate` - CodeMirror update object

**Updates:**
- Word count
- Character count
- Cursor position (line and column)

**Calculations:**
```javascript
// Word count calculation
const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;

// Character count (includes spaces)
const characters = text.length;

// Cursor position
const line = doc.lineAt(selection.head);
const lineNum = doc.lineAt(selection.head).number;
const col = selection.head - line.from + 1;
```

---

## Milkdown Integration

### `initializeMilkdown()`

Sets up the Milkdown editor instance with plugins and configuration.

**Signature:**
```javascript
async function initializeMilkdown(): Promise<Editor>
```

**Returns:**
- `Promise<Editor>` - Configured Milkdown editor instance

**Configuration:**
```javascript
const editor = await Editor
    .make()
    .config((ctx) => {
        ctx.set(rootCtx, container);
        ctx.set(defaultValueCtx, initialContent);
        // Configure listener for changes
    })
    .use(nord)           // Nord theme
    .use(commonmark)     // CommonMark support
    .use(gfm)           // GitHub Flavored Markdown
    .use(listener)       // Change listener
    .use(milkdownHistory) // History support
    .create();
```

**Plugins Used:**
- **Nord Theme**: Provides styling and theming
- **CommonMark**: Standard Markdown parsing and rendering
- **GFM**: GitHub Flavored Markdown extensions
- **Listener**: Change detection and event handling
- **History**: Undo/redo functionality

### `handleMilkdownChange(ctx)`

Handles content changes in Milkdown editor.

**Signature:**
```javascript
function handleMilkdownChange(ctx: Context): void
```

**Parameters:**
- `ctx: Context` - Milkdown context object

**Context Properties:**
- `editorViewCtx` - Current editor view
- `serializerCtx` - Markdown serializer
- `parserCtx` - Markdown parser

**Side Effects:**
- Triggers debounced sync to CodeMirror
- Updates UI status indicators

**Example:**
```javascript
ctx.get(listenerCtx).updated((ctx, doc, prevDoc) => {
    if (!syncManager.isUpdating && doc !== prevDoc) {
        handleMilkdownChange(ctx);
    }
});
```

---

## UI Management

### `initializeDivider()`

Sets up the resizable divider between editor panes.

**Signature:**
```javascript
function initializeDivider(): void
```

**Event Handlers:**
- `mousedown` - Start resize operation
- `mousemove` - Handle resize dragging
- `mouseup` - End resize operation

**Resize Logic:**
```javascript
const dx = e.clientX - startX;
const newLeftWidth = startLeftWidth + dx;
const newRightWidth = startRightWidth - dx;

// Minimum width constraint
if (newLeftWidth < 200 || newRightWidth < 200) return;

const leftPercent = (newLeftWidth / containerWidth) * 100;
const rightPercent = (newRightWidth / containerWidth) * 100;
```

**Constraints:**
- Minimum pane width: 200px
- Maintains proportional sizing
- Smooth cursor feedback during resize

### `initializeToolbar()`

Sets up toolbar button event handlers.

**Signature:**
```javascript
function initializeToolbar(): void
```

**Button Functions:**

#### Toggle Buttons
```javascript
function togglePane(paneId, divider, otherPane) {
    const pane = document.getElementById(paneId);
    pane.classList.toggle('hidden');

    if (pane.classList.contains('hidden')) {
        divider.style.display = 'none';
        otherPane.style.flex = '1';
    } else {
        divider.style.display = 'block';
        otherPane.style.flex = '';
        pane.style.flex = '';
    }
}
```

#### Full-Width Buttons
```javascript
function setFullWidth(activePane, hiddenPane, divider) {
    hiddenPane.classList.add('hidden');
    divider.style.display = 'none';
    activePane.classList.remove('hidden');
    activePane.style.flex = '1';
}
```

**Available Actions:**
- `toggle-codemirror` - Show/hide CodeMirror pane
- `toggle-milkdown` - Show/hide Milkdown pane
- `fullwidth-codemirror` - CodeMirror full-width mode
- `fullwidth-milkdown` - Milkdown full-width mode

### `initializeScrollSync()`

Sets up synchronized scrolling between editor panes.

**Signature:**
```javascript
function initializeScrollSync(): void
```

**Behavior:**
- Disabled by default (`syncManager.scrollSync = false`)
- Proportional scroll position synchronization
- Prevents infinite scroll loops with timing flags

**Implementation:**
```javascript
const scrollPercent = sourceElement.scrollTop /
    (sourceElement.scrollHeight - sourceElement.clientHeight);
targetElement.scrollTop = scrollPercent *
    (targetElement.scrollHeight - targetElement.clientHeight);
```

---

## Event Handlers

### Debounced Update Handler

**Pattern:**
```javascript
function createDebouncedHandler(callback, delay) {
    let timer = null;

    return function(...args) {
        if (timer) clearTimeout(timer);

        timer = setTimeout(() => {
            callback.apply(this, args);
            timer = null;
        }, delay);
    };
}
```

### Update Listener Pattern

**CodeMirror:**
```javascript
EditorView.updateListener.of((update) => {
    if (update.docChanged && !syncManager.isUpdating) {
        handleCodeMirrorChange(update);
    }
    updateStatusBar(update);
});
```

**Milkdown:**
```javascript
ctx.get(listenerCtx).updated((ctx, doc, prevDoc) => {
    if (!syncManager.isUpdating && doc !== prevDoc) {
        handleMilkdownChange(ctx);
    }
});
```

---

## Utility Functions

### Status Update Functions

```javascript
function updateSyncStatus(elementId, status, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = `sync-status ${status}`;
}

function showSyncProgress(elementId) {
    updateSyncStatus(elementId, 'syncing', 'Syncing...');
}

function showSyncComplete(elementId) {
    updateSyncStatus(elementId, '', 'Ready');
}

function showSyncError(elementId, error) {
    updateSyncStatus(elementId, 'error', 'Sync Error');
    console.error('Sync error:', error);
}
```

### Position Preservation

```javascript
function preserveRelativePosition(oldLength, newLength, position) {
    const relativePos = oldLength > 0 ? position / oldLength : 0;
    return Math.min(Math.round(relativePos * newLength), newLength);
}
```

### Content Validation

```javascript
function validateMarkdownContent(content) {
    if (typeof content !== 'string') {
        throw new Error('Content must be a string');
    }
    return content;
}
```

---

## Configuration Options

### Initial Content

```javascript
const initialContent = `# Welcome to the Dual-Pane Markdown Editor

This editor features **bidirectional sync** between CodeMirror and Milkdown.

## Features
- 📝 **CodeMirror**: Raw markdown editing
- 🎨 **Milkdown**: Rich WYSIWYG editing
- 🔄 **Bidirectional Sync**: Real-time updates
`;
```

### Theme Configuration

**CodeMirror Theme:**
```javascript
import { oneDark } from '@codemirror/theme-one-dark';

// Applied in editor extensions
extensions: [
    // ... other extensions
    oneDark,
    // ... remaining extensions
]
```

**Milkdown Theme:**
```javascript
import { nord } from '@milkdown/theme-nord';

// Applied in editor setup
.use(nord)
```

### Sync Configuration

```javascript
const syncConfig = {
    debounceDelay: 300,        // ms delay for sync operations
    scrollSync: false,         // enable scroll synchronization
    preserveSelection: true,   // maintain cursor position during sync
    maxContentLength: 100000   // maximum content length (optional)
};
```

---

## Data Structures

### Editor State

```typescript
interface EditorState {
    content: string;
    selection: {
        from: number;
        to: number;
        head: number;
        anchor: number;
    };
    wordCount: number;
    characterCount: number;
    lineCount: number;
    cursorPosition: {
        line: number;
        column: number;
    };
}
```

### Sync State

```typescript
interface SyncState {
    status: 'ready' | 'syncing' | 'error';
    lastSync: Date;
    source: 'codemirror' | 'milkdown' | null;
    conflicts: boolean;
    errorMessage?: string;
}
```

### UI State

```typescript
interface UIState {
    layout: 'dual' | 'codemirror-only' | 'milkdown-only';
    paneWidths: {
        left: number;
        right: number;
    };
    visibility: {
        codemirror: boolean;
        milkdown: boolean;
        divider: boolean;
    };
}
```

---

## Error Handling

### Error Types

```typescript
enum EditorError {
    INITIALIZATION_FAILED = 'INITIALIZATION_FAILED',
    SYNC_FAILED = 'SYNC_FAILED',
    CONTENT_INVALID = 'CONTENT_INVALID',
    EDITOR_NOT_FOUND = 'EDITOR_NOT_FOUND',
    CONTEXT_MISSING = 'CONTEXT_MISSING'
}
```

### Error Handling Patterns

**Async Function Error Handling:**
```javascript
async function safeSyncOperation(operation) {
    try {
        await operation();
        showSyncComplete();
    } catch (error) {
        console.error('Sync operation failed:', error);
        showSyncError(error.message);
        // Reset sync state
        syncManager.isUpdating = false;
    }
}
```

**Initialization Error Handling:**
```javascript
async function initialize() {
    try {
        console.log('Initializing editors...');

        initializeCodeMirror();
        await initializeMilkdown();

        initializeDivider();
        initializeToolbar();
        initializeScrollSync();

        console.log('Initialization complete');
    } catch (error) {
        console.error('Initialization failed:', error);
        // Show user-friendly error message
        displayErrorMessage('Failed to initialize editor. Please refresh the page.');
    }
}
```

### Recovery Strategies

**Sync Recovery:**
```javascript
function recoverFromSyncError() {
    // Reset sync state
    syncManager.isUpdating = false;
    syncManager.lastSource = null;

    // Clear any pending timers
    if (syncManager.debounceTimer) {
        clearTimeout(syncManager.debounceTimer);
        syncManager.debounceTimer = null;
    }

    // Update UI to show ready state
    showSyncComplete('codemirror-status');
    showSyncComplete('milkdown-status');
    showSyncComplete('sync-indicator');
}
```

---

## Performance Considerations

### Debouncing

All sync operations are debounced to prevent excessive updates:

```javascript
const debouncedSync = debounce(syncOperation, 300);
```

### Memory Management

- Event listeners are properly cleaned up
- Timer references are cleared
- Large content is handled efficiently

### Optimization Techniques

- **Incremental Updates**: Only changed content is synchronized
- **Selection Preservation**: Cursor position is maintained across syncs
- **Efficient DOM Updates**: Minimal DOM manipulation during status updates

This comprehensive API reference provides detailed information about all functions, interfaces, and patterns used in the Dual-Pane Markdown Editor. Each function includes type signatures, parameters, return values, examples, and error handling information.
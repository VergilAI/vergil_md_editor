# Complete Implementation Guide

## Overview

This guide provides step-by-step instructions to build the dual-pane markdown editor from scratch. Each section includes complete code examples and explanations.

## Phase 1: Project Setup

### Step 1.1: Initialize Project

```bash
# Create project directory
mkdir md_editor
cd md_editor

# Initialize npm project
npm init -y

# Configure package.json for ES modules
npm pkg set type="module"
```

### Step 1.2: Install Dependencies

```bash
# Install CodeMirror packages
npm install codemirror @codemirror/lang-markdown @codemirror/theme-one-dark

# Install Milkdown packages
npm install @milkdown/core @milkdown/preset-commonmark @milkdown/preset-gfm
npm install @milkdown/plugin-listener @milkdown/plugin-history @milkdown/theme-nord

# Install dev dependencies
npm install --save-dev esbuild
```

### Step 1.3: Configure Build Scripts

Update `package.json`:

```json
{
  "scripts": {
    "dev": "npx http-server -p 8081 -o",
    "build": "npx esbuild main.js --bundle --outfile=main.bundle.js --format=iife --global-name=MarkdownEditor --loader:.css=text"
  }
}
```

## Phase 2: HTML Structure

### Step 2.1: Create index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dual-Pane Markdown Editor</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="editor-container">
        <!-- Header with toolbar -->
        <div class="editor-header">
            <h1>Markdown Editor</h1>
            <div class="toolbar">
                <button id="toggle-codemirror" class="btn">Toggle Source</button>
                <button id="toggle-milkdown" class="btn">Toggle Preview</button>
                <button id="fullwidth-codemirror" class="btn">Source Only</button>
                <button id="fullwidth-milkdown" class="btn">Preview Only</button>
            </div>
        </div>

        <!-- Main editor body with two panes -->
        <div class="editor-body">
            <!-- CodeMirror pane -->
            <div class="editor-pane" id="codemirror-pane">
                <div class="pane-header">
                    <h3>Source (CodeMirror)</h3>
                    <span class="sync-status" id="codemirror-status">Ready</span>
                </div>
                <div id="codemirror-editor"></div>
            </div>

            <!-- Draggable divider -->
            <div class="pane-divider" id="divider"></div>

            <!-- Milkdown pane -->
            <div class="editor-pane" id="milkdown-pane">
                <div class="pane-header">
                    <h3>Preview (Milkdown)</h3>
                    <span class="sync-status" id="milkdown-status">Ready</span>
                </div>
                <div id="milkdown-editor"></div>
            </div>
        </div>

        <!-- Status bar -->
        <div class="editor-footer">
            <div class="status-bar">
                <span id="word-count">Words: 0</span>
                <span id="char-count">Characters: 0</span>
                <span id="cursor-position">Line: 1, Col: 1</span>
                <span id="sync-indicator">Synced</span>
            </div>
        </div>
    </div>

    <script src="main.bundle.js"></script>
</body>
</html>
```

## Phase 3: Styling

### Step 3.1: Create styles.css

```css
/* Base reset and typography */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #1e1e1e;
    color: #d4d4d4;
    height: 100vh;
    overflow: hidden;
}

/* Main container */
.editor-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

/* Header styling */
.editor-header {
    background: #2d2d2d;
    padding: 1rem;
    border-bottom: 1px solid #3e3e3e;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

/* Toolbar buttons */
.btn {
    background: #3c3c3c;
    color: #cccccc;
    border: 1px solid #4a4a4a;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.2s;
}

.btn:hover {
    background: #4a4a4a;
    color: #ffffff;
}

/* Editor body with flexbox layout */
.editor-body {
    display: flex;
    flex: 1;
    overflow: hidden;
}

/* Individual editor panes */
.editor-pane {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 200px;
    overflow: hidden;
}

.editor-pane.hidden {
    display: none;
}

/* Pane headers */
.pane-header {
    background: #2d2d2d;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #3e3e3e;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

/* Sync status indicators */
.sync-status {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    background: #1e3a1e;
    color: #4ade80;
    border-radius: 3px;
}

.sync-status.syncing {
    background: #3a3a1e;
    color: #fbbf24;
}

/* Editor containers */
#codemirror-editor,
#milkdown-editor {
    flex: 1;
    overflow: auto;
}

#codemirror-editor .cm-editor {
    height: 100%;
}

#milkdown-editor {
    background: #ffffff;
    color: #000000;
}

/* Draggable divider */
.pane-divider {
    width: 4px;
    background: #3e3e3e;
    cursor: col-resize;
    transition: background 0.2s;
}

.pane-divider:hover {
    background: #4a4a4a;
}

/* Status bar */
.status-bar {
    display: flex;
    gap: 2rem;
    font-size: 0.75rem;
    color: #969696;
    background: #2d2d2d;
    padding: 0.5rem 1rem;
    border-top: 1px solid #3e3e3e;
}

#sync-indicator {
    margin-left: auto;
    padding: 0.125rem 0.5rem;
    background: #1e3a1e;
    color: #4ade80;
    border-radius: 3px;
}

#sync-indicator.syncing {
    animation: pulse 1s infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}
```

## Phase 4: JavaScript Core Implementation

### Step 4.1: Create main.js - Imports and Initial Setup

```javascript
// Import CodeMirror modules
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter,
         highlightActiveLine, drawSelection } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { bracketMatching, foldGutter, foldKeymap } from '@codemirror/language';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';

// Import Milkdown modules
import { Editor, rootCtx, defaultValueCtx, editorViewCtx,
         parserCtx, serializerCtx } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { gfm } from '@milkdown/preset-gfm';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { nord } from '@milkdown/theme-nord';
import { history as milkdownHistory } from '@milkdown/plugin-history';

// Initial content
const initialContent = `# Welcome to the Dual-Pane Markdown Editor

This editor features **bidirectional sync** between CodeMirror and Milkdown.

## Features

- 📝 **CodeMirror**: Raw markdown editing
- 🎨 **Milkdown**: Rich WYSIWYG editing
- 🔄 **Bidirectional Sync**: Real-time synchronization
`;

// Global state
let codemirrorView = null;
let milkdownEditor = null;

const syncManager = {
    isUpdating: false,
    lastSource: null,
    debounceTimer: null,
    debounceDelay: 300,
    scrollSync: false
};
```

### Step 4.2: Initialize CodeMirror

```javascript
function initializeCodeMirror() {
    const container = document.getElementById('codemirror-editor');

    const state = EditorState.create({
        doc: initialContent,
        extensions: [
            // Visual features
            lineNumbers(),
            highlightActiveLineGutter(),
            highlightActiveLine(),
            drawSelection(),

            // Functionality
            history(),
            foldGutter(),
            bracketMatching(),

            // Language and theme
            markdown(),
            oneDark,

            // Keymaps
            keymap.of([
                ...defaultKeymap,
                ...historyKeymap,
                ...foldKeymap
            ]),

            // Change listener
            EditorView.updateListener.of((update) => {
                if (update.docChanged && !syncManager.isUpdating) {
                    handleCodeMirrorChange(update);
                }
                updateStatusBar(update);
            }),

            // Editor styling
            EditorView.theme({
                "&": { height: "100%" },
                ".cm-scroller": { overflow: "auto" },
                ".cm-content": { padding: "1rem" }
            })
        ]
    });

    codemirrorView = new EditorView({
        state,
        parent: container
    });

    console.log('CodeMirror initialized');
    return codemirrorView;
}
```

### Step 4.3: Initialize Milkdown

```javascript
async function initializeMilkdown() {
    const container = document.getElementById('milkdown-editor');

    try {
        milkdownEditor = await Editor
            .make()
            .config((ctx) => {
                ctx.set(rootCtx, container);
                ctx.set(defaultValueCtx, initialContent);

                // Set up change listener
                ctx.get(listenerCtx)
                    .updated((ctx, doc, prevDoc) => {
                        if (!syncManager.isUpdating && doc !== prevDoc) {
                            handleMilkdownChange(ctx);
                        }
                    });
            })
            .use(nord)
            .use(commonmark)
            .use(gfm)
            .use(listener)
            .use(milkdownHistory)
            .create();

        console.log('Milkdown initialized');
        return milkdownEditor;
    } catch (error) {
        console.error('Failed to initialize Milkdown:', error);
        throw error;
    }
}
```

### Step 4.4: Implement Synchronization

```javascript
// Handle CodeMirror changes
function handleCodeMirrorChange(update) {
    if (syncManager.debounceTimer) {
        clearTimeout(syncManager.debounceTimer);
    }

    const statusEl = document.getElementById('codemirror-status');
    statusEl.textContent = 'Syncing...';
    statusEl.classList.add('syncing');

    syncManager.debounceTimer = setTimeout(async () => {
        const content = update.state.doc.toString();
        await syncToMilkdown(content);

        statusEl.textContent = 'Ready';
        statusEl.classList.remove('syncing');
    }, syncManager.debounceDelay);
}

// Sync to Milkdown
async function syncToMilkdown(content) {
    if (!milkdownEditor) return;

    syncManager.isUpdating = true;
    syncManager.lastSource = 'codemirror';

    try {
        const statusEl = document.getElementById('sync-indicator');
        statusEl.textContent = 'Syncing...';
        statusEl.classList.add('syncing');

        await milkdownEditor.action((ctx) => {
            const view = ctx.get(editorViewCtx);
            const parser = ctx.get(parserCtx);
            const doc = parser(content);

            if (!view) return;

            const state = view.state;

            // Save cursor position
            const { from, to } = state.selection;
            const docSize = state.doc.content.size;
            const relativeFrom = docSize > 0 ? from / docSize : 0;
            const relativeTo = docSize > 0 ? to / docSize : 0;

            // Create transaction
            const tr = state.tr.replaceWith(
                0,
                state.doc.content.size,
                doc.content
            );

            // Restore cursor position
            const newDocSize = doc.content.size;
            const newFrom = Math.min(
                Math.round(relativeFrom * newDocSize),
                newDocSize
            );
            const newTo = Math.min(
                Math.round(relativeTo * newDocSize),
                newDocSize
            );

            // Apply selection
            if (newFrom === newTo) {
                tr.setSelection(
                    state.selection.constructor.near(
                        tr.doc.resolve(newFrom)
                    )
                );
            }

            view.dispatch(tr);
        });

        statusEl.textContent = 'Synced';
        statusEl.classList.remove('syncing');
    } catch (error) {
        console.error('Error syncing to Milkdown:', error);
        const statusEl = document.getElementById('sync-indicator');
        statusEl.textContent = 'Sync Error';
        statusEl.classList.add('error');
    } finally {
        syncManager.isUpdating = false;
    }
}

// Handle Milkdown changes
function handleMilkdownChange(ctx) {
    if (syncManager.debounceTimer) {
        clearTimeout(syncManager.debounceTimer);
    }

    const statusEl = document.getElementById('milkdown-status');
    statusEl.textContent = 'Syncing...';
    statusEl.classList.add('syncing');

    syncManager.debounceTimer = setTimeout(() => {
        syncToCodeMirror(ctx);

        statusEl.textContent = 'Ready';
        statusEl.classList.remove('syncing');
    }, syncManager.debounceDelay);
}

// Sync to CodeMirror
function syncToCodeMirror(ctx) {
    if (!codemirrorView) return;

    syncManager.isUpdating = true;
    syncManager.lastSource = 'milkdown';

    try {
        const statusEl = document.getElementById('sync-indicator');
        statusEl.textContent = 'Syncing...';
        statusEl.classList.add('syncing');

        // Get markdown from Milkdown
        const serializer = ctx.get(serializerCtx);
        const view = ctx.get(editorViewCtx);
        const markdown = serializer(view.state.doc);

        // Save cursor position
        const cursorPos = codemirrorView.state.selection.main.head;
        const docLength = codemirrorView.state.doc.length;
        const relativePos = docLength > 0 ? cursorPos / docLength : 0;

        // Update CodeMirror
        const transaction = codemirrorView.state.update({
            changes: {
                from: 0,
                to: docLength,
                insert: markdown
            }
        });

        codemirrorView.dispatch(transaction);

        // Restore cursor position
        const newLength = codemirrorView.state.doc.length;
        const newPos = Math.min(
            Math.round(relativePos * newLength),
            newLength
        );

        codemirrorView.dispatch({
            selection: { anchor: newPos, head: newPos },
            scrollIntoView: false
        });

        statusEl.textContent = 'Synced';
        statusEl.classList.remove('syncing');
    } catch (error) {
        console.error('Error syncing to CodeMirror:', error);
        const statusEl = document.getElementById('sync-indicator');
        statusEl.textContent = 'Sync Error';
        statusEl.classList.add('error');
    } finally {
        syncManager.isUpdating = false;
    }
}
```

### Step 4.5: UI Controls Implementation

```javascript
// Initialize draggable divider
function initializeDivider() {
    const divider = document.getElementById('divider');
    const leftPane = document.getElementById('codemirror-pane');
    const rightPane = document.getElementById('milkdown-pane');
    const container = document.querySelector('.editor-body');

    let isResizing = false;
    let startX = 0;
    let startLeftWidth = 0;
    let startRightWidth = 0;

    divider.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.clientX;
        startLeftWidth = leftPane.offsetWidth;
        startRightWidth = rightPane.offsetWidth;

        document.body.style.cursor = 'col-resize';
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        const dx = e.clientX - startX;
        const containerWidth = container.offsetWidth;
        const newLeftWidth = startLeftWidth + dx;
        const newRightWidth = startRightWidth - dx;

        // Enforce minimum pane width
        if (newLeftWidth < 200 || newRightWidth < 200) return;

        const leftPercent = (newLeftWidth / containerWidth) * 100;
        const rightPercent = (newRightWidth / containerWidth) * 100;

        leftPane.style.flex = `0 0 ${leftPercent}%`;
        rightPane.style.flex = `0 0 ${rightPercent}%`;
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = '';
        }
    });
}

// Initialize toolbar buttons
function initializeToolbar() {
    const toggleCM = document.getElementById('toggle-codemirror');
    const toggleMD = document.getElementById('toggle-milkdown');
    const fullCM = document.getElementById('fullwidth-codemirror');
    const fullMD = document.getElementById('fullwidth-milkdown');

    const cmPane = document.getElementById('codemirror-pane');
    const mdPane = document.getElementById('milkdown-pane');
    const divider = document.getElementById('divider');

    toggleCM.addEventListener('click', () => {
        cmPane.classList.toggle('hidden');
        if (cmPane.classList.contains('hidden')) {
            divider.style.display = 'none';
            mdPane.style.flex = '1';
        } else {
            divider.style.display = 'block';
            mdPane.style.flex = '';
            cmPane.style.flex = '';
        }
    });

    toggleMD.addEventListener('click', () => {
        mdPane.classList.toggle('hidden');
        if (mdPane.classList.contains('hidden')) {
            divider.style.display = 'none';
            cmPane.style.flex = '1';
        } else {
            divider.style.display = 'block';
            cmPane.style.flex = '';
            mdPane.style.flex = '';
        }
    });

    fullCM.addEventListener('click', () => {
        mdPane.classList.add('hidden');
        divider.style.display = 'none';
        cmPane.classList.remove('hidden');
        cmPane.style.flex = '1';
    });

    fullMD.addEventListener('click', () => {
        cmPane.classList.add('hidden');
        divider.style.display = 'none';
        mdPane.classList.remove('hidden');
        mdPane.style.flex = '1';
    });
}

// Update status bar
function updateStatusBar(update) {
    const state = update.state;
    const doc = state.doc;
    const selection = state.selection.main;

    // Word count
    const text = doc.toString();
    const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    document.getElementById('word-count').textContent = `Words: ${words}`;

    // Character count
    document.getElementById('char-count').textContent = `Characters: ${text.length}`;

    // Cursor position
    const line = doc.lineAt(selection.head);
    const lineNum = doc.lineAt(selection.head).number;
    const col = selection.head - line.from + 1;
    document.getElementById('cursor-position').textContent = `Line: ${lineNum}, Col: ${col}`;
}

// Optional scroll sync
function initializeScrollSync() {
    if (!syncManager.scrollSync) return;

    const cmEditor = document.querySelector('#codemirror-editor .cm-scroller');
    const mdEditor = document.getElementById('milkdown-editor');

    if (!cmEditor || !mdEditor) return;

    let isScrolling = false;

    cmEditor.addEventListener('scroll', () => {
        if (isScrolling) return;
        isScrolling = true;

        const scrollPercent = cmEditor.scrollTop /
                             (cmEditor.scrollHeight - cmEditor.clientHeight);
        mdEditor.scrollTop = scrollPercent *
                            (mdEditor.scrollHeight - mdEditor.clientHeight);

        setTimeout(() => { isScrolling = false; }, 50);
    });

    mdEditor.addEventListener('scroll', () => {
        if (isScrolling) return;
        isScrolling = true;

        const scrollPercent = mdEditor.scrollTop /
                             (mdEditor.scrollHeight - mdEditor.clientHeight);
        cmEditor.scrollTop = scrollPercent *
                            (cmEditor.scrollHeight - cmEditor.clientHeight);

        setTimeout(() => { isScrolling = false; }, 50);
    });
}
```

### Step 4.6: Main Initialization

```javascript
// Initialize the application
async function initialize() {
    console.log('Initializing Dual-Pane Markdown Editor...');

    // Initialize CodeMirror
    initializeCodeMirror();

    // Initialize Milkdown
    await initializeMilkdown();

    // Initialize UI components
    initializeDivider();
    initializeToolbar();

    // Initialize scroll sync (optional)
    initializeScrollSync();

    console.log('Dual-Pane Markdown Editor initialized successfully!');
}

// Start the application
document.addEventListener('DOMContentLoaded', initialize);
```

## Phase 5: Build and Deploy

### Step 5.1: Build the Bundle

```bash
npm run build
```

This creates `main.bundle.js` with all dependencies bundled.

### Step 5.2: Run Development Server

```bash
npm run dev
```

Opens browser at http://localhost:8081

## Phase 6: Testing Checklist

### Functional Tests

- [ ] CodeMirror loads with initial content
- [ ] Milkdown loads with initial content
- [ ] Typing in CodeMirror updates Milkdown
- [ ] Editing in Milkdown updates CodeMirror
- [ ] Cursor position preserved during sync
- [ ] Debouncing prevents rapid updates
- [ ] No infinite sync loops

### UI Tests

- [ ] Divider dragging resizes panes
- [ ] Toggle buttons hide/show panes
- [ ] Full-width buttons work correctly
- [ ] Status bar updates accurately
- [ ] Sync indicators show status

### Performance Tests

- [ ] Large documents (>10,000 lines)
- [ ] Rapid typing doesn't lag
- [ ] Memory usage remains stable
- [ ] No memory leaks on long sessions

## Common Issues and Solutions

### Issue 1: Editors Not Syncing

```javascript
// Check sync manager state
console.log('Sync Manager:', syncManager);

// Verify editors initialized
console.log('CodeMirror:', codemirrorView);
console.log('Milkdown:', milkdownEditor);
```

### Issue 2: Cursor Jumping

```javascript
// Ensure scrollIntoView is false
codemirrorView.dispatch({
    selection: { anchor: newPos, head: newPos },
    scrollIntoView: false  // Critical!
});
```

### Issue 3: Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Next Steps

1. **Add Features**:
   - File operations (open/save)
   - Export formats (PDF, HTML)
   - Theme customization
   - Plugin system

2. **Optimize Performance**:
   - Implement virtual scrolling
   - Add web workers for parsing
   - Optimize bundle size

3. **Enhance UX**:
   - Add keyboard shortcuts
   - Implement find/replace
   - Add split view options

---

This implementation guide provides all the code and instructions needed to build the dual-pane markdown editor from scratch. Follow each phase sequentially for best results.
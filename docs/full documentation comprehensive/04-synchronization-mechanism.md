# Synchronization Mechanism Deep Dive

## Overview

The synchronization mechanism is the heart of the dual-pane editor, enabling real-time bidirectional updates between CodeMirror (raw markdown) and Milkdown (WYSIWYG). This document provides an in-depth analysis of how synchronization works.

## Core Concepts

### 1. Bidirectional Synchronization

```
CodeMirror ←→ Sync Manager ←→ Milkdown
     ↑                            ↑
     |                            |
  Markdown                   ProseMirror
    Text                       Document
```

### 2. Key Challenges Solved

1. **Circular Update Prevention**: Avoiding infinite loops
2. **Performance**: Debouncing rapid changes
3. **State Preservation**: Maintaining cursor/selection
4. **Content Transformation**: Markdown ↔ ProseMirror conversion
5. **Error Recovery**: Graceful handling of sync failures

## The Sync Manager

### Core Structure

```javascript
const syncManager = {
    isUpdating: false,      // Mutex to prevent circular updates
    lastSource: null,       // Track which editor initiated change
    debounceTimer: null,    // Timer reference for debouncing
    debounceDelay: 300,     // Milliseconds to wait before syncing
    scrollSync: false       // Optional scroll synchronization
};
```

### Purpose of Each Field

- **`isUpdating`**: Acts as a mutex to prevent circular updates. When one editor updates the other, this flag prevents the receiving editor from triggering another sync.

- **`lastSource`**: Tracks which editor ('codemirror' or 'milkdown') initiated the last change. Useful for debugging and potential future features.

- **`debounceTimer`**: Holds the timeout reference, allowing cancellation of pending syncs when new changes occur.

- **`debounceDelay`**: The time in milliseconds to wait after the last change before syncing. 300ms provides a good balance between responsiveness and performance.

- **`scrollSync`**: Boolean flag to enable/disable synchronized scrolling between panes.

## CodeMirror to Milkdown Synchronization

### Step 1: Change Detection

```javascript
EditorView.updateListener.of((update) => {
    if (update.docChanged && !syncManager.isUpdating) {
        handleCodeMirrorChange(update);
    }
    updateStatusBar(update);
})
```

**Key Points:**
- `update.docChanged`: Only trigger on document changes, not cursor movements
- `!syncManager.isUpdating`: Skip if this change came from Milkdown
- `updateStatusBar`: Always update UI regardless of sync state

### Step 2: Debouncing

```javascript
function handleCodeMirrorChange(update) {
    // Cancel any pending sync
    if (syncManager.debounceTimer) {
        clearTimeout(syncManager.debounceTimer);
    }

    // Show syncing status
    const statusEl = document.getElementById('codemirror-status');
    statusEl.textContent = 'Syncing...';
    statusEl.classList.add('syncing');

    // Schedule new sync
    syncManager.debounceTimer = setTimeout(async () => {
        const content = update.state.doc.toString();
        await syncToMilkdown(content);

        statusEl.textContent = 'Ready';
        statusEl.classList.remove('syncing');
    }, syncManager.debounceDelay);
}
```

**Debouncing Benefits:**
- Groups rapid keystrokes into single update
- Reduces computational overhead
- Improves perceived performance
- Prevents UI flashing

### Step 3: Content Transformation

```javascript
async function syncToMilkdown(content) {
    if (!milkdownEditor) return;

    syncManager.isUpdating = true;  // Set mutex
    syncManager.lastSource = 'codemirror';

    try {
        await milkdownEditor.action((ctx) => {
            const view = ctx.get(editorViewCtx);
            const parser = ctx.get(parserCtx);

            // Transform markdown string to ProseMirror document
            const doc = parser(content);

            // ... apply to editor
        });
    } finally {
        syncManager.isUpdating = false;  // Always release mutex
    }
}
```

**Transformation Process:**
1. Get markdown string from CodeMirror
2. Use Milkdown's parser to create ProseMirror document
3. Parser handles all markdown syntax rules
4. Result is a structured document tree

### Step 4: Cursor Preservation

```javascript
// Save relative position before update
const { from, to } = state.selection;
const docSize = state.doc.content.size;
const relativeFrom = docSize > 0 ? from / docSize : 0;
const relativeTo = docSize > 0 ? to / docSize : 0;

// Apply content change
const tr = state.tr.replaceWith(0, state.doc.content.size, doc.content);

// Restore position based on new document size
const newDocSize = doc.content.size;
const newFrom = Math.min(Math.round(relativeFrom * newDocSize), newDocSize);
const newTo = Math.min(Math.round(relativeTo * newDocSize), newDocSize);

// Set selection
if (newFrom === newTo) {
    tr.setSelection(
        state.selection.constructor.near(tr.doc.resolve(newFrom))
    );
}

view.dispatch(tr);
```

**Why Relative Positioning?**
- Absolute positions change when content is modified
- Percentage-based positions adapt to content changes
- Provides stable cursor experience during sync

## Milkdown to CodeMirror Synchronization

### Step 1: Change Detection

```javascript
ctx.get(listenerCtx)
    .updated((ctx, doc, prevDoc) => {
        if (!syncManager.isUpdating && doc !== prevDoc) {
            handleMilkdownChange(ctx);
        }
    });
```

**Key Points:**
- `doc !== prevDoc`: Only sync on actual document changes
- `!syncManager.isUpdating`: Skip if change came from CodeMirror
- Context passed for serialization access

### Step 2: Serialization

```javascript
function syncToCodeMirror(ctx) {
    const serializer = ctx.get(serializerCtx);
    const view = ctx.get(editorViewCtx);

    // Transform ProseMirror document to markdown string
    const markdown = serializer(view.state.doc);

    // ... apply to CodeMirror
}
```

**Serialization Process:**
1. Get ProseMirror document from Milkdown
2. Use serializer to convert to markdown
3. Handles all node types and marks
4. Produces clean markdown string

### Step 3: CodeMirror Update

```javascript
// Save cursor position
const cursorPos = codemirrorView.state.selection.main.head;
const docLength = codemirrorView.state.doc.length;
const relativePos = docLength > 0 ? cursorPos / docLength : 0;

// Create transaction with new content
const transaction = codemirrorView.state.update({
    changes: {
        from: 0,
        to: docLength,
        insert: markdown
    }
});

codemirrorView.dispatch(transaction);

// Restore cursor
const newLength = codemirrorView.state.doc.length;
const newPos = Math.min(Math.round(relativePos * newLength), newLength);

codemirrorView.dispatch({
    selection: { anchor: newPos, head: newPos },
    scrollIntoView: false  // Prevent jarring scroll
});
```

## Circular Update Prevention

### The Problem

Without prevention, this cycle would occur:
1. User types in CodeMirror
2. Sync to Milkdown
3. Milkdown change triggers sync to CodeMirror
4. CodeMirror change triggers sync to Milkdown
5. Infinite loop...

### The Solution

```javascript
// In change handlers
if (!syncManager.isUpdating) {
    // Process change
}

// In sync functions
syncManager.isUpdating = true;
try {
    // Perform update
} finally {
    syncManager.isUpdating = false;
}
```

### Why It Works

- Single-threaded JavaScript ensures atomic flag operations
- Flag set before update, cleared after
- Change handlers skip when flag is set
- Try/finally ensures flag always cleared

## Performance Optimization Strategies

### 1. Debouncing

```javascript
const DEBOUNCE_DELAY = 300;  // Milliseconds

function debounce(func, delay) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
    };
}
```

**Benefits:**
- Reduces sync operations by 80-90% during rapid typing
- Improves perceived responsiveness
- Reduces CPU usage

### 2. Differential Updates (Future Enhancement)

```javascript
// Potential optimization using diff
function diffUpdate(oldContent, newContent) {
    const diff = computeDiff(oldContent, newContent);
    return diff.changes;  // Only sync changed portions
}
```

### 3. Async Operations

```javascript
async function syncToMilkdown(content) {
    // Async allows UI to remain responsive
    await milkdownEditor.action(/* ... */);
}
```

## Error Handling

### Graceful Degradation

```javascript
try {
    // Attempt sync
    await syncOperation();
    updateStatus('success');
} catch (error) {
    console.error('Sync failed:', error);
    updateStatus('error');
    // Editor continues to function independently
}
```

### Recovery Strategies

1. **Log and Continue**: Don't break the editor
2. **Visual Feedback**: Show error state to user
3. **Retry Logic**: Could implement exponential backoff
4. **Fallback Mode**: Editors work independently if sync fails

## Advanced Synchronization Features

### 1. Scroll Synchronization

```javascript
function initializeScrollSync() {
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
}
```

### 2. Selection Synchronization

```javascript
// Sync selection ranges, not just cursor
function syncSelection(source, target) {
    const { from, to } = source.selection;
    const relativeSelection = {
        from: from / source.doc.size,
        to: to / source.doc.size
    };

    target.setSelection(
        Math.round(relativeSelection.from * target.doc.size),
        Math.round(relativeSelection.to * target.doc.size)
    );
}
```

### 3. Collaborative Editing (Future)

```javascript
// WebSocket-based collaboration
class CollaborativeSync {
    constructor(websocket) {
        this.ws = websocket;
        this.version = 0;
    }

    sendChange(change) {
        this.ws.send(JSON.stringify({
            type: 'change',
            version: this.version++,
            change: change
        }));
    }

    receiveChange(data) {
        // Apply operational transformation
        const transformed = OT.transform(data.change, this.localChanges);
        applyChange(transformed);
    }
}
```

## Testing the Sync Mechanism

### Unit Tests

```javascript
describe('Sync Manager', () => {
    test('prevents circular updates', () => {
        syncManager.isUpdating = true;
        const result = shouldSync();
        expect(result).toBe(false);
    });

    test('debounces rapid changes', async () => {
        const syncSpy = jest.fn();
        const debounced = debounce(syncSpy, 300);

        debounced();
        debounced();
        debounced();

        await wait(350);
        expect(syncSpy).toHaveBeenCalledTimes(1);
    });
});
```

### Integration Tests

```javascript
describe('Bidirectional Sync', () => {
    test('CodeMirror to Milkdown', async () => {
        typeInCodeMirror('# Test');
        await waitForSync();

        const mdContent = getMilkdownContent();
        expect(mdContent).toContain('Test');
    });

    test('Milkdown to CodeMirror', async () => {
        typeInMilkdown('Test');
        await waitForSync();

        const cmContent = getCodeMirrorContent();
        expect(cmContent).toBe('Test');
    });
});
```

## Debugging Synchronization Issues

### Debug Helpers

```javascript
// Add to window for console debugging
window.debugSync = {
    get state() {
        return {
            syncManager,
            cmContent: codemirrorView?.state.doc.toString(),
            mdContent: milkdownEditor?.ctx.get(serializerCtx)?.(
                milkdownEditor.ctx.get(editorViewCtx).state.doc
            )
        };
    },

    forceSync() {
        syncManager.isUpdating = false;
        const content = codemirrorView.state.doc.toString();
        syncToMilkdown(content);
    },

    toggleDebugMode() {
        syncManager.debug = !syncManager.debug;
    }
};
```

### Common Sync Issues

1. **Content Mismatch**
   - Check parser/serializer compatibility
   - Verify markdown dialect settings

2. **Cursor Jumping**
   - Ensure `scrollIntoView: false`
   - Check relative position calculations

3. **Performance Degradation**
   - Increase debounce delay
   - Profile sync operations
   - Check for memory leaks

## Best Practices

1. **Always use try/finally for mutex**
   ```javascript
   syncManager.isUpdating = true;
   try {
       // Sync operation
   } finally {
       syncManager.isUpdating = false;
   }
   ```

2. **Validate editor instances**
   ```javascript
   if (!milkdownEditor || !codemirrorView) {
       console.warn('Editors not initialized');
       return;
   }
   ```

3. **Provide user feedback**
   ```javascript
   updateSyncStatus('syncing');
   // ... perform sync
   updateSyncStatus('synced');
   ```

4. **Log errors for debugging**
   ```javascript
   catch (error) {
       console.error('Sync failed:', error);
       // Still update UI
   }
   ```

---

This synchronization mechanism provides robust, performant bidirectional updates while maintaining excellent user experience through cursor preservation and debouncing.
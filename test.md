# Test Markdown File

This is a test file to verify the editor functionality.

## Features Implemented

✅ **Phase 1: Setup Base Editors**
- HTML structure with split-pane layout
- CodeMirror with markdown syntax highlighting
- Milkdown with WYSIWYG editing
- Draggable divider between panes

✅ **Phase 2: Bidirectional Sync**
- CodeMirror → Milkdown sync with debouncing
- Milkdown → CodeMirror sync with debouncing
- Sync state manager preventing infinite loops

✅ **Phase 3: Edge Cases**
- Cursor/selection preservation during sync
- Optional scroll position synchronization
- Smooth performance with debounced updates

✅ **Phase 4: User Interface**
- Toggle buttons for each pane
- Full-width mode for single pane view
- Resizable pane divider
- Status indicators showing sync state
- Word count, character count, cursor position

## Testing the Editor

1. Open http://127.0.0.1:8081 in your browser
2. Edit text in either pane
3. Watch automatic synchronization
4. Try the layout controls in the toolbar
5. Resize panes by dragging the divider

## Code Features

- **Bold text** and *italic text*
- `inline code`
- Lists and nested lists
- Blockquotes
- Code blocks with syntax highlighting

```javascript
function example() {
    console.log("Dual-pane editor is working!");
}
```

The editor is now fully functional!
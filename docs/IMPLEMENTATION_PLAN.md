# Dual-Pane Markdown Editor Implementation Plan

## Overview
Create a synchronized dual-pane markdown editor with CodeMirror (source view) and Milkdown (rich editor view) that maintains bidirectional sync without re-initialization.

## Architecture

### Core Components

1. **CodeMirror Instance**
   - Raw markdown text editor
   - Left pane
   - Handles direct text input
   - Syntax highlighting for markdown

2. **Milkdown Core Instance**
   - Rich WYSIWYG editor
   - Right pane
   - Visual markdown editing
   - Uses ProseMirror under the hood

3. **Sync Manager**
   - Coordinates updates between editors
   - Prevents infinite update loops
   - Manages debouncing/throttling
   - Preserves cursor positions

## Implementation Steps

### Phase 1: Setup Base Editors

1. **Create HTML Structure**
   - Split-pane layout (flexbox/grid)
   - Left: CodeMirror container
   - Right: Milkdown container
   - Draggable divider

2. **Initialize CodeMirror**
   - Basic setup with markdown mode
   - Theme (One Dark)
   - Line numbers, folding
   - No auto-sync yet

3. **Initialize Milkdown Core**
   - Use `@milkdown/core` directly (not Crepe)
   - Add presets: commonmark, gfm
   - Add listener plugin for change detection
   - Theme (Nord or custom)
   - No auto-sync yet

### Phase 2: Implement Sync Logic

1. **Create Sync State Manager**
   ```
   - isUpdating flag (prevent loops)
   - lastSource tracking ('codemirror' | 'milkdown')
   - debounce timers
   ```

2. **CodeMirror → Milkdown Sync**
   - Listen to CodeMirror's `change` events
   - Debounce updates (500ms)
   - Convert markdown string to ProseMirror doc:
     - Use Milkdown's parser
     - Get current Milkdown editor instance
     - Create transaction with new doc
     - Apply transaction while preserving selection

3. **Milkdown → CodeMirror Sync**
   - Use Milkdown's listener plugin
   - On document change:
     - Check if change originated from Milkdown
     - Serialize ProseMirror doc to markdown
     - Update CodeMirror using `dispatch`
     - Preserve CodeMirror cursor position

### Phase 3: Handle Edge Cases

1. **Cursor/Selection Preservation**
   - Store cursor position before updates
   - Calculate equivalent position after sync
   - Restore cursor/selection post-update

2. **Scroll Position Sync**
   - Option 1: Independent scrolling (simpler)
   - Option 2: Synchronized scrolling (calculate relative positions)

3. **Performance Optimization**
   - Implement diff-based updates (optional)
   - Only sync changed portions for large documents
   - Consider virtual scrolling for huge files

### Phase 4: User Interface

1. **Layout Controls**
   - Toggle buttons for each pane
   - Full-width mode for single pane
   - Resizable pane divider

2. **Toolbar (Optional)**
   - Basic formatting buttons
   - Works with both editors
   - Insert templates/snippets

3. **Status Indicators**
   - Sync status
   - Word/character count
   - Cursor position

### Phase 5: Enhanced Milkdown Features (Attempted - Issues Found)

*Note: This phase encountered CSS bundling issues with Crepe. See Phase 6 for the solution.*

1. **Crepe Integration**
   - Switched from `@milkdown/core` to `@milkdown/crepe` for built-in toolbars
   - Maintains full sync compatibility with CodeMirror

2. **Toolbar Features Implemented**
   - **Inline/Bubble Toolbar**: Appears on text selection with formatting options
     - Bold, Italic, Strikethrough
     - Code inline, Links
     - LaTeX support (when enabled)
   - **Block-Level Controls**: Side handles for each content block
     - Drag handle for reordering blocks
     - Add button to insert new blocks
   - **Slash Menu**: Command palette triggered by "/"
     - Grouped items (Text, Lists, Advanced)
     - Keyboard navigation
     - Filtered search as you type

3. **Feature Configuration**
   ```javascript
   features: {
     [CrepeFeature.Toolbar]: true,        // Inline toolbar
     [CrepeFeature.BlockEdit]: true,      // Block handles
     [CrepeFeature.ListItem]: true,       // List features
     [CrepeFeature.Table]: true,          // Table editing
     [CrepeFeature.LinkTooltip]: true,    // Link tooltips
     [CrepeFeature.ImageBlock]: true,     // Image support
     [CrepeFeature.Placeholder]: true     // Placeholder text
   }
   ```

### Phase 6: Hybrid Component Extraction (Final Solution)

1. **Problem Identified**
   - Crepe's CSS uses `@import` chains that bundlers can't resolve
   - Toolbars created but invisible due to missing styles

2. **Innovative Solution: Component Extraction**
   - Extracted Vue components from Crepe
   - Used Core Milkdown for stability
   - Attached extracted UI components directly

3. **Implementation**
   ```
   extracted-components/
   ├── toolbar.js       # Inline formatting toolbar
   ├── block-edit.js    # Block controls & slash menu
   └── crepe-ui.css     # Consolidated styles
   ```

4. **Architecture**
   - Core Milkdown provides editor logic
   - Extracted components provide UI
   - CSS injected at runtime
   - No bundling issues

5. **Benefits**
   - ✅ All toolbar features working
   - ✅ No CSS import errors
   - ✅ Smaller bundle size
   - ✅ Full control over components
   - ✅ Clean separation of concerns

## Technical Details

### Key Libraries/APIs

**CodeMirror:**
- `EditorView.dispatch()` - Update content
- `view.state.doc.toString()` - Get content
- `view.state.selection` - Get/set cursor

**Milkdown:**
- `editor.action()` - Execute commands
- `ctx.get(editorViewCtx)` - Access ProseMirror view
- `parser.parse()` - Markdown → ProseMirror
- `serializer.serialize()` - ProseMirror → Markdown

### Sync Algorithm

```
1. User types in CodeMirror
2. Debounced change handler triggered
3. Set isUpdating = true
4. Get markdown text from CodeMirror
5. Parse to ProseMirror doc
6. Apply to Milkdown via transaction
7. Set isUpdating = false

Reverse flow:
1. User edits in Milkdown
2. Listener plugin detects change
3. Check isUpdating flag (skip if true)
4. Serialize to markdown
5. Update CodeMirror via dispatch
6. Preserve CodeMirror cursor
```

### Preventing Infinite Loops

- Use `isUpdating` flag
- Compare content before updating
- Track update source
- Implement smart diffing

## File Structure

```
/md_editor/
  ├── index.html          # Main dual-pane layout
  ├── main.js            # Entry point, initialization
  ├── sync-manager.js    # Sync logic between editors
  ├── codemirror-setup.js # CodeMirror configuration
  ├── milkdown-setup.js  # Milkdown configuration
  └── styles.css         # Layout and custom styles
```

## Testing Strategy

1. **Basic Sync**
   - Type in CodeMirror → appears in Milkdown
   - Edit in Milkdown → updates CodeMirror

2. **Edge Cases**
   - Rapid typing
   - Large pastes
   - Complex markdown (tables, code blocks)
   - Undo/redo operations

3. **Performance**
   - Large documents (10k+ lines)
   - Rapid switching between panes
   - Memory leak detection

## Future Enhancements

1. **Collaboration** - Add WebRTC/WebSocket for real-time collaboration
2. **Plugins** - Custom Milkdown/CodeMirror plugins
3. **Export** - PDF, HTML, DOCX export options
4. **Themes** - User-selectable themes
5. **Mobile** - Responsive design for mobile editing

## Success Criteria

- [x] Seamless bidirectional sync
- [x] No noticeable lag during normal typing
- [x] Cursor position preserved during sync
- [x] No infinite update loops
- [x] Handles all standard markdown features
- [x] Clean, maintainable code structure
- [x] Inline toolbar on text selection
- [x] Block-level editing controls
- [x] Slash menu for quick content insertion
- [x] Drag-and-drop block reordering
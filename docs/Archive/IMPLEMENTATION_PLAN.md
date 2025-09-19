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


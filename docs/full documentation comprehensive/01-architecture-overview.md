# Architecture Overview

## System Design

The Dual-Pane Markdown Editor follows a modular architecture with clear separation between the view layer, editing engines, and synchronization logic. The system is designed for real-time bidirectional synchronization while maintaining high performance and user experience.

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         Browser Window                        │
├──────────────────────────────────────────────────────────────┤
│                          Header Bar                           │
│  [Logo/Title]                    [Toolbar Controls]          │
├────────────────────┬─────┬───────────────────────────────────┤
│                    │     │                                   │
│    CodeMirror      │  D  │         Milkdown                 │
│   (Source View)    │  i  │      (WYSIWYG View)             │
│                    │  v  │                                   │
│  - Raw Markdown    │  i  │    - Rich Text Editing          │
│  - Syntax          │  d  │    - Visual Formatting          │
│    Highlighting    │  e  │    - Real-time Preview          │
│  - Line Numbers    │  r  │    - ProseMirror Based          │
│                    │     │                                   │
├────────────────────┴─────┴───────────────────────────────────┤
│                         Status Bar                            │
│  [Word Count] [Char Count] [Cursor Pos]    [Sync Status]    │
└──────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. Core Components

#### 1.1 Editor Instances

```javascript
// Global editor instances managed at application level
let codemirrorView = null;  // CodeMirror 6 EditorView instance
let milkdownEditor = null;   // Milkdown Editor instance
```

#### 1.2 Synchronization Manager

```javascript
const syncManager = {
    isUpdating: false,      // Prevents circular updates
    lastSource: null,       // Tracks update origin
    debounceTimer: null,    // Debounce timer reference
    debounceDelay: 300,     // Milliseconds to wait
    scrollSync: false       // Optional scroll synchronization
};
```

### 2. Data Flow Architecture

```
User Input → Editor A → Change Event → Debounce → Sync Manager → Parser/Serializer → Editor B
                ↑                                                                        ↓
                └────────────────────── Prevent Circular Update ←───────────────────────┘
```

#### 2.1 CodeMirror to Milkdown Flow

1. User types in CodeMirror
2. `EditorView.updateListener` detects change
3. Change is debounced (300ms)
4. Markdown string extracted from CodeMirror
5. Sync manager sets `isUpdating = true`
6. Milkdown parser converts markdown to ProseMirror doc
7. ProseMirror transaction updates Milkdown
8. Cursor position preserved using relative positioning
9. Sync manager sets `isUpdating = false`

#### 2.2 Milkdown to CodeMirror Flow

1. User edits in Milkdown
2. Listener plugin detects document change
3. Change is debounced (300ms)
4. ProseMirror doc serialized to markdown
5. Sync manager sets `isUpdating = true`
6. CodeMirror state updated with new text
7. Cursor position preserved using relative positioning
8. Sync manager sets `isUpdating = false`

## Module Structure

### 1. Initialization Module

```
initialize()
├── initializeCodeMirror()
│   ├── Create EditorState
│   ├── Configure extensions
│   └── Attach update listener
├── initializeMilkdown()
│   ├── Create Editor instance
│   ├── Configure plugins
│   └── Attach listener
├── initializeDivider()
│   └── Setup resize handlers
├── initializeToolbar()
│   └── Bind button events
└── initializeScrollSync()
    └── Setup scroll listeners
```

### 2. Synchronization Module

```
Sync Module
├── handleCodeMirrorChange()
│   ├── Debounce logic
│   └── Call syncToMilkdown()
├── handleMilkdownChange()
│   ├── Debounce logic
│   └── Call syncToCodeMirror()
├── syncToMilkdown()
│   ├── Parse markdown
│   ├── Create transaction
│   └── Preserve cursor
└── syncToCodeMirror()
    ├── Serialize to markdown
    ├── Update state
    └── Preserve cursor
```

### 3. UI Control Module

```
UI Module
├── Toolbar Controls
│   ├── toggleCodeMirror()
│   ├── toggleMilkdown()
│   ├── fullwidthCodeMirror()
│   └── fullwidthMilkdown()
├── Divider Controls
│   ├── mousedown handler
│   ├── mousemove handler
│   └── mouseup handler
└── Status Bar Updates
    ├── updateWordCount()
    ├── updateCharCount()
    ├── updateCursorPosition()
    └── updateSyncStatus()
```

## State Management

### 1. Application State

The application maintains minimal global state:

- **Editor Instances**: References to CodeMirror and Milkdown editors
- **Sync State**: Flags and timers to prevent circular updates
- **UI State**: Managed through DOM classes and inline styles

### 2. State Synchronization

```javascript
// Critical state synchronization points
1. Document Content - The markdown text
2. Cursor Position - Relative position preserved
3. Selection Range - Start and end positions
4. Scroll Position - Optional synchronization
5. View State - Pane visibility and sizes
```

### 3. State Update Patterns

#### Preventing Circular Updates

```javascript
// Pattern used throughout the application
if (!syncManager.isUpdating) {
    syncManager.isUpdating = true;
    // Perform update
    syncManager.isUpdating = false;
}
```

#### Debouncing Updates

```javascript
// Consistent debounce pattern
if (debounceTimer) clearTimeout(debounceTimer);
debounceTimer = setTimeout(() => {
    // Perform sync operation
}, debounceDelay);
```

## Performance Considerations

### 1. Debouncing Strategy

- **300ms delay**: Balances responsiveness with performance
- **Single timer**: Previous timers cleared on new input
- **Batched updates**: Multiple rapid changes consolidated

### 2. Cursor Preservation

- **Relative positioning**: Position calculated as percentage
- **Smart restoration**: Accounts for content length changes
- **No scroll jump**: `scrollIntoView: false` prevents jarring

### 3. DOM Optimization

- **Minimal reflows**: CSS classes used for state changes
- **Flex layout**: Efficient pane resizing
- **Event delegation**: Where applicable

## Extension Points

### 1. Plugin Architecture

Both editors support plugin systems:

#### CodeMirror Extensions
- Custom commands
- Additional languages
- Theme modifications
- Custom widgets

#### Milkdown Plugins
- Custom nodes/marks
- Input rules
- Keyboard shortcuts
- Custom rendering

### 2. Sync Customization

```javascript
// Potential extension points
- Custom parsers/serializers
- Transform middleware
- Sync filters
- Content processors
```

### 3. UI Enhancements

- Additional toolbar buttons
- Context menus
- Keyboard shortcuts
- Custom themes

## Security Considerations

### 1. Content Sanitization

- Markdown parsing inherently safe
- No direct HTML injection
- XSS prevention through proper escaping

### 2. Performance Limits

- Debouncing prevents DoS through rapid updates
- Maximum document size considerations
- Memory management for large documents

## Scalability Patterns

### 1. Large Documents

- Virtual scrolling potential
- Incremental parsing
- Diff-based updates

### 2. Collaborative Editing

- WebSocket integration points
- Operational Transform compatibility
- CRDT potential with ProseMirror

## Error Handling

### 1. Graceful Degradation

```javascript
try {
    // Sync operation
} catch (error) {
    console.error('Sync failed:', error);
    updateSyncStatus('error');
    // Continue operation without breaking
}
```

### 2. User Feedback

- Visual status indicators
- Console logging for debugging
- Non-blocking error states

## Testing Strategy

### 1. Unit Testing Points

- Parser/serializer functions
- Debounce logic
- Cursor calculations
- State management

### 2. Integration Testing

- Bidirectional sync
- UI interactions
- Performance metrics
- Edge cases

## Deployment Architecture

### 1. Build Process

```
Source Files → esbuild → Bundle → Static Hosting
```

### 2. Production Optimizations

- Minification
- Tree shaking
- Code splitting potential
- CDN distribution

## Future Architecture Considerations

### 1. Microservices Potential

- Separate sync service
- Plugin marketplace
- Cloud storage integration

### 2. Platform Expansion

- Electron desktop app
- Mobile responsive design
- PWA capabilities

---

This architecture provides a solid foundation for a performant, maintainable, and extensible dual-pane markdown editor. The modular design allows for easy modifications and feature additions while maintaining system stability.
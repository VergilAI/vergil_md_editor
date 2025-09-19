# UI Components Documentation

## Overview

The Dual-Pane Markdown Editor features a comprehensive component-based architecture with a focus on usability, accessibility, and responsive design. This document provides detailed information about all UI components, their structure, styling, and responsive behavior.

## Component Architecture

### Main Container Structure

```
editor-container
├── editor-header
│   ├── title
│   └── toolbar
├── editor-body
│   ├── codemirror-pane
│   ├── pane-divider
│   └── milkdown-pane
└── editor-footer
    └── status-bar
```

## Core UI Components

### 1. Editor Container

The root container that holds the entire editor interface.

**HTML Structure:**
```html
<div class="editor-container">
  <!-- All editor content -->
</div>
```

**CSS Properties:**
```css
.editor-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
}
```

**Features:**
- Full viewport height layout
- Flexbox-based vertical structure
- Contains all editor components

### 2. Editor Header

Top navigation bar containing the title and toolbar controls.

**HTML Structure:**
```html
<div class="editor-header">
    <h1>Markdown Editor</h1>
    <div class="toolbar">
        <!-- Toolbar buttons -->
    </div>
</div>
```

**CSS Properties:**
```css
.editor-header {
    background: #2d2d2d;
    padding: 1rem;
    border-bottom: 1px solid #3e3e3e;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
```

**Features:**
- Fixed height header with dark theme
- Flexbox layout for title and toolbar alignment
- Bottom border for visual separation

### 3. Toolbar Component

Interactive control panel for editor actions.

**HTML Structure:**
```html
<div class="toolbar">
    <button id="toggle-codemirror" class="btn">Toggle Source</button>
    <button id="toggle-milkdown" class="btn">Toggle Preview</button>
    <button id="fullwidth-codemirror" class="btn">Source Only</button>
    <button id="fullwidth-milkdown" class="btn">Preview Only</button>
</div>
```

**Button Styles:**
```css
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

.btn:active {
    background: #525252;
}
```

**Button Functions:**
- **Toggle Source**: Show/hide CodeMirror pane
- **Toggle Preview**: Show/hide Milkdown pane
- **Source Only**: Full-width CodeMirror view
- **Preview Only**: Full-width Milkdown view

**Interactive States:**
- **Normal**: Default button appearance
- **Hover**: Lighter background, white text
- **Active**: Darker background on click
- **Focus**: Keyboard accessibility support

### 4. Editor Body

Main content area containing the dual-pane editor interface.

**HTML Structure:**
```html
<div class="editor-body">
    <div class="editor-pane" id="codemirror-pane">
        <!-- CodeMirror content -->
    </div>
    <div class="pane-divider" id="divider"></div>
    <div class="editor-pane" id="milkdown-pane">
        <!-- Milkdown content -->
    </div>
</div>
```

**CSS Properties:**
```css
.editor-body {
    display: flex;
    flex: 1;
    overflow: hidden;
}
```

**Features:**
- Flexbox horizontal layout
- Takes remaining viewport height
- Prevents overflow scrolling

### 5. Editor Panes

Individual containers for each editor instance.

**HTML Structure:**
```html
<div class="editor-pane" id="codemirror-pane">
    <div class="pane-header">
        <h3>Source (CodeMirror)</h3>
        <span class="sync-status" id="codemirror-status">Ready</span>
    </div>
    <div id="codemirror-editor"></div>
</div>
```

**CSS Properties:**
```css
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

.editor-pane.fullwidth {
    flex: 1;
    width: 100%;
}
```

**Pane States:**
- **Normal**: Equal width split (50/50)
- **Hidden**: Completely hidden from view
- **Fullwidth**: Takes entire editor body width

### 6. Pane Headers

Header bars for individual panes with titles and status indicators.

**HTML Structure:**
```html
<div class="pane-header">
    <h3>Source (CodeMirror)</h3>
    <span class="sync-status" id="codemirror-status">Ready</span>
</div>
```

**CSS Properties:**
```css
.pane-header {
    background: #2d2d2d;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #3e3e3e;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.pane-header h3 {
    font-size: 0.875rem;
    font-weight: 500;
    color: #cccccc;
}
```

**Features:**
- Compact header design
- Flexbox layout for title and status alignment
- Consistent with main header styling

### 7. Sync Status Indicators

Visual feedback for synchronization state between editors.

**HTML Structure:**
```html
<span class="sync-status" id="codemirror-status">Ready</span>
<span class="sync-status" id="milkdown-status">Ready</span>
```

**CSS Properties:**
```css
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

.sync-status.error {
    background: #3a1e1e;
    color: #f87171;
}
```

**Status States:**
- **Ready** (Green): Editor ready for input
- **Syncing** (Yellow): Content synchronization in progress
- **Error** (Red): Synchronization error occurred

### 8. Resizable Divider

Interactive divider for adjusting pane widths.

**HTML Structure:**
```html
<div class="pane-divider" id="divider"></div>
```

**CSS Properties:**
```css
.pane-divider {
    width: 4px;
    background: #3e3e3e;
    cursor: col-resize;
    position: relative;
    transition: background 0.2s;
}

.pane-divider:hover {
    background: #4a4a4a;
}

.pane-divider:active {
    background: #525252;
}
```

**Interactive Features:**
- **Drag Resize**: Mouse drag to adjust pane widths
- **Visual Feedback**: Color changes on hover/active
- **Minimum Width**: Prevents panes from becoming too small (200px minimum)
- **Smooth Transitions**: 0.2s transition for hover states

**Resize Behavior:**
```javascript
// Minimum pane width constraint
if (newLeftWidth < 200 || newRightWidth < 200) return;

// Proportional width calculation
const leftPercent = (newLeftWidth / containerWidth) * 100;
const rightPercent = (newRightWidth / containerWidth) * 100;

leftPane.style.flex = `0 0 ${leftPercent}%`;
rightPane.style.flex = `0 0 ${rightPercent}%`;
```

### 9. Editor Footer

Bottom status bar with editor metrics and sync indicators.

**HTML Structure:**
```html
<div class="editor-footer">
    <div class="status-bar">
        <span id="word-count">Words: 0</span>
        <span id="char-count">Characters: 0</span>
        <span id="cursor-position">Line: 1, Col: 1</span>
        <span id="sync-indicator">Synced</span>
    </div>
</div>
```

**CSS Properties:**
```css
.editor-footer {
    background: #2d2d2d;
    border-top: 1px solid #3e3e3e;
    padding: 0.5rem 1rem;
}

.status-bar {
    display: flex;
    gap: 2rem;
    font-size: 0.75rem;
    color: #969696;
}

.status-bar span {
    display: flex;
    align-items: center;
}
```

**Status Information:**
- **Word Count**: Live word count from editor content
- **Character Count**: Total character count including spaces
- **Cursor Position**: Current line and column position
- **Sync Indicator**: Global synchronization status

### 10. Global Sync Indicator

Main synchronization status indicator in the footer.

**CSS Properties:**
```css
#sync-indicator {
    margin-left: auto;
    padding: 0.125rem 0.5rem;
    background: #1e3a1e;
    color: #4ade80;
    border-radius: 3px;
}

#sync-indicator.syncing {
    background: #3a3a1e;
    color: #fbbf24;
    animation: pulse 1s infinite;
}

#sync-indicator.error {
    background: #3a1e1e;
    color: #f87171;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}
```

**Animation Features:**
- **Pulse Effect**: Animated pulse during synchronization
- **Color Coding**: Green (synced), Yellow (syncing), Red (error)
- **Right Alignment**: Positioned at the right end of status bar

## Layout System

### Flexbox Architecture

The entire interface uses CSS Flexbox for responsive layout:

```css
/* Vertical layout for main container */
.editor-container {
    display: flex;
    flex-direction: column;
}

/* Horizontal layout for editor body */
.editor-body {
    display: flex;
    flex: 1;
}

/* Individual pane flexibility */
.editor-pane {
    flex: 1;
    min-width: 200px;
}
```

### Responsive Behavior

#### Viewport Height Adaptation
```css
body, .editor-container {
    height: 100vh;
    overflow: hidden;
}
```

#### Pane Width Management
- **Default**: 50/50 split between panes
- **Resizable**: User can drag divider to adjust widths
- **Minimum**: 200px minimum width per pane
- **Hidden State**: Panes can be completely hidden
- **Full Width**: Single pane can take full width

#### Mobile Considerations

While primarily designed for desktop use, the component system includes:

- **Minimum Width Constraints**: Prevents unusably narrow panes
- **Touch-Friendly Buttons**: Adequate button sizes for touch interaction
- **Flexible Layout**: Components adapt to container changes

## Styling System

### Color Scheme

**Dark Theme Palette:**
```css
/* Primary backgrounds */
--bg-primary: #1e1e1e;     /* Main editor background */
--bg-secondary: #2d2d2d;   /* Header, footer, pane headers */
--bg-tertiary: #3c3c3c;    /* Buttons, interactive elements */

/* Border colors */
--border-primary: #3e3e3e;  /* Main borders */
--border-secondary: #4a4a4a; /* Button borders */

/* Text colors */
--text-primary: #d4d4d4;    /* Main text */
--text-secondary: #cccccc;  /* Headers, labels */
--text-muted: #969696;      /* Status bar text */

/* Status colors */
--status-success: #4ade80;  /* Synced, ready states */
--status-warning: #fbbf24;  /* Syncing states */
--status-error: #f87171;    /* Error states */
```

### Typography

**Font Stack:**
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
```

**Font Sizes:**
- **Main Title**: 1.25rem (20px)
- **Pane Headers**: 0.875rem (14px)
- **Buttons**: 0.875rem (14px)
- **Status Elements**: 0.75rem (12px)

### Transitions and Animations

**Button Transitions:**
```css
.btn {
    transition: all 0.2s;
}
```

**Divider Transitions:**
```css
.pane-divider {
    transition: background 0.2s;
}
```

**Sync Pulse Animation:**
```css
@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

#sync-indicator.syncing {
    animation: pulse 1s infinite;
}
```

## Editor-Specific Styling

### CodeMirror Integration

**Container Styling:**
```css
#codemirror-editor {
    flex: 1;
    overflow: auto;
    background: #1e1e1e;
}

#codemirror-editor .cm-editor {
    height: 100%;
}
```

**Theme Integration:**
- Uses One Dark theme for syntax highlighting
- Custom padding and height adjustments
- Overflow handling for large documents

### Milkdown Integration

**Container Styling:**
```css
#milkdown-editor {
    background: #ffffff;
    color: #000000;
    height: 100%;
    overflow: auto;
}

#milkdown-editor .milkdown {
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem;
    min-height: 100%;
}
```

**Content Styling:**
```css
.milkdown .editor {
    font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
    line-height: 1.6;
}

.milkdown h1, .milkdown h2, .milkdown h3,
.milkdown h4, .milkdown h5, .milkdown h6 {
    margin-top: 1em;
    margin-bottom: 0.5em;
}

.milkdown p {
    margin-bottom: 1em;
}
```

## Accessibility Features

### Keyboard Navigation

**Tab Order:**
1. Toolbar buttons (left to right)
2. CodeMirror editor
3. Milkdown editor
4. Status bar elements

**Keyboard Shortcuts:**
- All standard editor shortcuts work within each pane
- Tab key moves between major interface elements
- Enter/Space activate toolbar buttons

### Screen Reader Support

**ARIA Labels:**
```html
<button id="toggle-codemirror"
        class="btn"
        aria-label="Toggle CodeMirror source editor visibility">
    Toggle Source
</button>
```

**Semantic Structure:**
- Proper heading hierarchy (h1, h3)
- Meaningful element roles
- Status information announced by screen readers

### Focus Management

**Visual Focus Indicators:**
```css
.btn:focus {
    outline: 2px solid #4ade80;
    outline-offset: 2px;
}
```

**Focus Trap:**
- Focus remains within the editor interface
- Logical tab progression through interactive elements

## Component Interaction Patterns

### Pane Visibility Management

```javascript
// Toggle pane visibility
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

### Status Updates

```javascript
// Update sync status indicators
function updateSyncStatus(elementId, status, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = `sync-status ${status}`;
}
```

### Responsive Resize Handling

```javascript
// Handle window resize events
window.addEventListener('resize', () => {
    // Recalculate pane dimensions
    // Maintain minimum width constraints
    // Update editor view dimensions
});
```

## Performance Considerations

### DOM Optimization

- **Minimal DOM Manipulation**: Status updates use textContent and className changes
- **Event Delegation**: Single event listeners for multiple similar elements
- **Efficient Reflows**: CSS transforms for animations instead of layout changes

### Memory Management

- **Event Listener Cleanup**: Proper removal of event listeners when components are destroyed
- **Debounced Updates**: Status updates are debounced to prevent excessive DOM manipulation
- **Lazy Rendering**: Large content is handled efficiently by each editor component

### CSS Optimization

- **CSS Variables**: Consistent color scheme management
- **Minimal Repaints**: Efficient use of CSS properties that don't trigger reflows
- **GPU Acceleration**: CSS transforms for smooth animations

This comprehensive documentation covers all UI components, their styling, interactions, and responsive behavior in the Dual-Pane Markdown Editor. Each component is designed to work together seamlessly while maintaining individual functionality and accessibility standards.
# Hybrid Extraction Approach: Core Milkdown + Crepe UI Components

## Overview

This document describes our innovative approach to solving the Crepe CSS bundling issue by extracting Crepe's UI components and using them with Core Milkdown directly.

## The Problem

When using `@milkdown/crepe`, we encountered CSS import chain issues:
- Crepe's CSS files use `@import` statements that reference non-existent paths
- The bundler (esbuild) couldn't resolve nested CSS imports
- Toolbars were being created in the DOM but were invisible due to missing styles

## The Solution: Surgical Extraction

Instead of fixing the bundler or using Crepe as-is, we extracted only the UI components from Crepe and attached them to Core Milkdown.

### Architecture

```
Core Milkdown (editor logic)
    ↓
+ Extracted Vue Components (from Crepe)
    ↓
+ Consolidated CSS (extracted from Crepe themes)
    ↓
= Hybrid Editor with Full Toolbar Support
```

## Implementation Details

### 1. Extracted Components

We extracted two main components from Crepe:

#### `toolbar.js`
- Vue 3 component for inline text formatting toolbar
- Appears on text selection
- Supports: Bold, Italic, Strikethrough, Code
- Uses Milkdown's tooltip plugin for positioning

#### `block-edit.js`
- Vue 3 component for block-level controls
- Includes:
  - Block handles (drag & add buttons)
  - Slash menu for inserting content
  - Keyboard navigation support

### 2. CSS Consolidation

We concatenated necessary CSS from Crepe's theme files:
- `toolbar.css` - Styles for inline toolbar
- `block-edit.css` - Styles for block handles and slash menu
- Added CSS variables for theming
- Total CSS: ~260 lines (vs entire Crepe bundle)

### 3. Integration Pattern

```javascript
// 1. Use Core Milkdown for editor
const editor = await Editor.make()
    .use(commonmark)
    .use(gfm)
    .use(listener)
    .create();

// 2. Add extracted UI components
createToolbar(editor);    // Our extracted toolbar
createBlockEdit(editor);   // Our extracted block controls

// 3. CSS injected at runtime
injectCSS(); // Injects our consolidated CSS
```

## Benefits of This Approach

### 1. **Clean Separation**
- Core provides editor logic
- UI components are independent modules
- CSS is self-contained

### 2. **No Bundling Issues**
- No complex CSS import chains
- CSS injected as a string at runtime
- Works with any bundler

### 3. **Minimal Bundle Size**
- Only includes needed components
- No unused Crepe features
- Smaller CSS footprint

### 4. **Maximum Control**
- Can modify UI components directly
- Easy to customize styles
- Full control over features

### 5. **Maintainable**
- Clear separation of concerns
- Easy to understand code structure
- Can update components independently

## File Structure

```
/md_editor/
├── extracted-components/
│   ├── toolbar.js          # Extracted toolbar component
│   ├── block-edit.js       # Extracted block edit component
│   └── crepe-ui.css        # Consolidated CSS
├── milkdown-setup.js        # Core Milkdown + our components
└── main.js                  # Application entry point
```

## Technical Details

### Dependencies
- `@milkdown/core` - Core editor
- `@milkdown/preset-commonmark` - Markdown support
- `@milkdown/preset-gfm` - GitHub Flavored Markdown
- `@milkdown/plugin-listener` - Change detection
- `@milkdown/plugin-tooltip` - Tooltip positioning
- `@milkdown/plugin-slash` - Slash commands
- `@milkdown/plugin-block` - Block manipulation
- `vue@3` - For UI components

### How It Works

1. **Initialization**: Core Milkdown creates the editor
2. **Plugin Setup**: Tooltip, slash, and block plugins provide APIs
3. **Component Mount**: Vue components are mounted to use these APIs
4. **Event Handling**: Components listen to editor events and execute commands
5. **CSS Injection**: Styles are injected as a `<style>` tag

## Comparison with Standard Approaches

| Approach | Pros | Cons |
|----------|------|------|
| **Use Crepe as-is** | Easy setup | CSS bundling issues |
| **Fix bundler** | Automatic updates | Complex configuration |
| **Build from scratch** | Full control | Time-consuming |
| **Our Hybrid Approach** | Best of both worlds | Manual extraction |

## Future Improvements

1. **Automated Extraction**: Script to extract components from Crepe updates
2. **TypeScript Support**: Add type definitions for extracted components
3. **Additional Components**: Extract more Crepe features as needed
4. **Theme System**: Make CSS variables configurable

## Conclusion

This hybrid approach successfully combines:
- The stability of Core Milkdown
- The polished UI of Crepe
- Complete control over the implementation
- No bundling complexity

It demonstrates that sometimes the best solution is to extract and adapt existing components rather than accepting framework limitations or building from scratch.

## Success Metrics

- ✅ Toolbars appear and function correctly
- ✅ Bidirectional sync maintained
- ✅ No CSS import errors
- ✅ Smaller bundle size than full Crepe
- ✅ Clean, maintainable code structure
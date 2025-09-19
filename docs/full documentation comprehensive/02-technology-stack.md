# Technology Stack and Dependencies

## Core Technologies

### 1. CodeMirror 6

**Version**: `^6.0.2`
**Purpose**: Source code editing with syntax highlighting
**License**: MIT

CodeMirror 6 is a complete rewrite of the popular code editor, built with modularity and performance in mind.

#### Key Packages

```json
{
  "codemirror": "^6.0.2",
  "@codemirror/lang-markdown": "^6.3.4",
  "@codemirror/theme-one-dark": "^6.1.3"
}
```

#### Core Modules Used

- **@codemirror/state**: Editor state management
  - `EditorState`: Immutable state representation
  - `Transaction`: State updates
  - `StateField`: Custom state fields

- **@codemirror/view**: Visual representation and DOM integration
  - `EditorView`: Main view component
  - `keymap`: Keyboard shortcut handling
  - `lineNumbers`: Line number gutter
  - `highlightActiveLineGutter`: Active line highlighting
  - `drawSelection`: Selection rendering

- **@codemirror/commands**: Standard editing commands
  - `defaultKeymap`: Basic editing shortcuts
  - `history`: Undo/redo functionality
  - `historyKeymap`: Undo/redo shortcuts

- **@codemirror/language**: Language support infrastructure
  - `bracketMatching`: Bracket pair highlighting
  - `foldGutter`: Code folding UI
  - `foldKeymap`: Folding shortcuts

#### Configuration Example

```javascript
const state = EditorState.create({
    doc: initialContent,
    extensions: [
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
        EditorView.updateListener.of((update) => {
            // Change detection
        })
    ]
});
```

### 2. Milkdown

**Version**: `^7.15.5`
**Purpose**: WYSIWYG markdown editing with ProseMirror
**License**: MIT

Milkdown is a plugin-driven WYSIWYG markdown editor framework built on top of ProseMirror.

#### Key Packages

```json
{
  "@milkdown/core": "^7.15.5",
  "@milkdown/preset-commonmark": "^7.15.5",
  "@milkdown/preset-gfm": "^7.15.5",
  "@milkdown/plugin-listener": "^7.15.5",
  "@milkdown/plugin-history": "^7.15.5",
  "@milkdown/theme-nord": "^7.15.5"
}
```

#### Core Components

- **@milkdown/core**: Core editor functionality
  - `Editor`: Main editor class
  - `rootCtx`: Root DOM element context
  - `defaultValueCtx`: Initial content context
  - `editorViewCtx`: ProseMirror EditorView access
  - `parserCtx`: Markdown to ProseMirror parser
  - `serializerCtx`: ProseMirror to markdown serializer

- **@milkdown/preset-commonmark**: Standard markdown support
  - Paragraphs, headings, lists
  - Emphasis, strong, code
  - Links, images, blockquotes
  - Code blocks, horizontal rules

- **@milkdown/preset-gfm**: GitHub Flavored Markdown
  - Tables
  - Strikethrough
  - Task lists
  - Autolinks

- **@milkdown/plugin-listener**: Change detection
  - Document update events
  - Selection change events
  - Transaction monitoring

#### Configuration Example

```javascript
const editor = await Editor
    .make()
    .config((ctx) => {
        ctx.set(rootCtx, container);
        ctx.set(defaultValueCtx, initialContent);
        ctx.get(listenerCtx).updated((ctx, doc, prevDoc) => {
            // Change handling
        });
    })
    .use(nord)
    .use(commonmark)
    .use(gfm)
    .use(listener)
    .use(milkdownHistory)
    .create();
```

### 3. Build Tools

#### esbuild

**Version**: `^0.25.10`
**Purpose**: JavaScript bundling and minification
**License**: MIT

Ultra-fast JavaScript bundler with zero configuration needed.

**Build Configuration**:
```bash
npx esbuild main.js \
  --bundle \
  --outfile=main.bundle.js \
  --format=iife \
  --global-name=MarkdownEditor \
  --loader:.css=text
```

**Features Used**:
- Bundle resolution
- ES6+ transformation
- Tree shaking
- IIFE format output
- CSS as text loading

#### http-server

**Version**: `^14.1.1`
**Purpose**: Local development server
**License**: MIT

Simple, zero-configuration HTTP server for local development.

**Configuration**:
```json
{
  "scripts": {
    "dev": "npx http-server -p 8081 -o"
  }
}
```

## Language and Runtime

### JavaScript ES6+

**Features Used**:

- **Modules**: ES6 import/export syntax
- **Async/Await**: Asynchronous initialization
- **Arrow Functions**: Concise function syntax
- **Template Literals**: String interpolation
- **Destructuring**: Object and array destructuring
- **Let/Const**: Block-scoped variables
- **Default Parameters**: Function parameter defaults
- **Spread Operator**: Array/object spreading

### Node.js

**Version Required**: 18.0.0+
**Purpose**: Development environment and tooling

**Used For**:
- Package management (npm)
- Build process (esbuild)
- Development server
- Dependency resolution

## Styling Technologies

### CSS3

**Features Used**:

- **Flexbox**: Layout system
- **CSS Grid**: Advanced layouts
- **CSS Variables**: Theme customization
- **Transitions**: Smooth animations
- **Media Queries**: Responsive design
- **Pseudo-classes**: Interactive states

**Architecture**:
```css
/* Component-based styling */
.editor-container { /* Container styles */ }
.editor-pane { /* Individual pane styles */ }
.pane-divider { /* Divider specific styles */ }
.toolbar { /* Toolbar component */ }
.status-bar { /* Status bar component */ }
```

## Web APIs

### DOM APIs

- **querySelector/querySelectorAll**: Element selection
- **addEventListener**: Event handling
- **classList**: Class manipulation
- **style**: Inline style updates
- **createElement**: Dynamic element creation
- **appendChild/removeChild**: DOM manipulation

### Browser APIs

- **LocalStorage** (potential): Settings persistence
- **ResizeObserver** (potential): Responsive updates
- **IntersectionObserver** (potential): Lazy loading
- **Performance API** (potential): Performance monitoring

## Package Management

### npm

**Version**: 8.0.0+
**Configuration File**: `package.json`

```json
{
  "name": "md_editor",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "npx http-server -p 8081 -o",
    "build": "npx esbuild main.js --bundle --outfile=main.bundle.js --format=iife --global-name=MarkdownEditor --loader:.css=text"
  },
  "dependencies": {
    "@codemirror/lang-markdown": "^6.3.4",
    "@codemirror/theme-one-dark": "^6.1.3",
    "@milkdown/core": "^7.15.5",
    "@milkdown/preset-commonmark": "^7.15.5",
    "@milkdown/preset-gfm": "^7.15.5",
    "@milkdown/plugin-listener": "^7.15.5",
    "@milkdown/plugin-history": "^7.15.5",
    "@milkdown/theme-nord": "^7.15.5",
    "codemirror": "^6.0.2"
  },
  "devDependencies": {
    "esbuild": "^0.25.10"
  }
}
```

## Dependency Tree

```
md_editor
├── CodeMirror Ecosystem
│   ├── codemirror (core)
│   ├── @codemirror/state
│   ├── @codemirror/view
│   ├── @codemirror/commands
│   ├── @codemirror/language
│   ├── @codemirror/lang-markdown
│   └── @codemirror/theme-one-dark
├── Milkdown Ecosystem
│   ├── @milkdown/core
│   │   └── prosemirror-* (internal)
│   ├── @milkdown/preset-commonmark
│   ├── @milkdown/preset-gfm
│   ├── @milkdown/plugin-listener
│   ├── @milkdown/plugin-history
│   └── @milkdown/theme-nord
└── Build Tools
    └── esbuild
```

## Version Compatibility

### Critical Version Constraints

1. **CodeMirror 6**: Requires ES6+ support in browser
2. **Milkdown 7**: Requires ProseMirror 1.x
3. **Node.js 18+**: For ES modules support
4. **esbuild**: Compatible with Node 12+

### Browser Compatibility

**Minimum Requirements**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Required Features**:
- ES6 modules
- Async/await
- CSS Flexbox
- CSS Grid
- DOM Level 3 Events

## Security Considerations

### Dependencies

- All packages from npm registry
- Regular security audits via `npm audit`
- No known vulnerabilities in current versions
- MIT licensed (permissive)

### Content Security Policy

Recommended CSP headers:
```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self' 'unsafe-inline';
               style-src 'self' 'unsafe-inline';">
```

## Performance Metrics

### Bundle Sizes

- **CodeMirror**: ~300KB (minified)
- **Milkdown**: ~500KB (minified)
- **Total Bundle**: ~2MB (uncompressed)
- **Minified Bundle**: ~800KB
- **Gzipped Bundle**: ~250KB

### Load Time Targets

- **Initial Load**: < 2 seconds
- **Time to Interactive**: < 3 seconds
- **First Contentful Paint**: < 1 second

## Alternative Technologies Considered

### Editors

1. **Monaco Editor**: Too heavy for markdown
2. **Ace Editor**: Less modern architecture
3. **Quill**: Not markdown-focused
4. **TinyMCE**: Commercial licensing

### Frameworks

1. **React**: Unnecessary complexity
2. **Vue**: Additional abstraction layer
3. **Svelte**: Compilation overhead

### Build Tools

1. **Webpack**: Configuration complexity
2. **Rollup**: Slower than esbuild
3. **Parcel**: Less control
4. **Vite**: Overkill for simple project

## Future Technology Considerations

### Potential Additions

1. **TypeScript**: Type safety
2. **Web Components**: Encapsulation
3. **Service Workers**: Offline support
4. **WebAssembly**: Performance optimization
5. **IndexedDB**: Local storage
6. **WebRTC**: Collaborative editing

### Upgrade Path

1. **CodeMirror**: Follow v6 releases
2. **Milkdown**: Track v7 updates
3. **ProseMirror**: Monitor for v2
4. **Build tools**: Consider Vite for HMR

---

This technology stack provides a modern, performant foundation for a dual-pane markdown editor with excellent developer experience and user performance.
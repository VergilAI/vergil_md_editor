import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightActiveLine, drawSelection } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { bracketMatching, foldGutter, foldKeymap } from '@codemirror/language';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';

import { Editor, rootCtx, defaultValueCtx, editorViewCtx, parserCtx, serializerCtx } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { gfm } from '@milkdown/preset-gfm';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { nord } from '@milkdown/theme-nord';
import { history as milkdownHistory } from '@milkdown/plugin-history';

// Initial markdown content
const initialContent = `# Welcome to the Dual-Pane Markdown Editor

This editor features **bidirectional sync** between CodeMirror (source view) and Milkdown (rich view).

## Features

- 📝 **CodeMirror**: Raw markdown editing with syntax highlighting
- 🎨 **Milkdown**: Rich WYSIWYG editing experience
- 🔄 **Bidirectional Sync**: Changes in one editor automatically update the other
- ⚡ **Real-time Updates**: Instant synchronization between panes

## Try it out!

1. Edit text in either pane
2. Watch it sync automatically
3. Use markdown syntax:
   - **Bold text**
   - *Italic text*
   - \`inline code\`

### Code Block Example

\`\`\`javascript
function hello() {
    console.log("Hello, World!");
}
\`\`\`

> This is a blockquote example

- List item 1
- List item 2
  - Nested item
  - Another nested item
`;

// Global editor instances
let codemirrorView = null;
let milkdownEditor = null;

// Sync state manager
const syncManager = {
    isUpdating: false,
    lastSource: null,
    debounceTimer: null,
    debounceDelay: 300,
    scrollSync: false // Set to true to enable synchronized scrolling
};

// Initialize CodeMirror
function initializeCodeMirror() {
    const container = document.getElementById('codemirror-editor');

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
            keymap.of([
                ...defaultKeymap,
                ...historyKeymap,
                ...foldKeymap
            ]),
            EditorView.updateListener.of((update) => {
                if (update.docChanged && !syncManager.isUpdating) {
                    handleCodeMirrorChange(update);
                }
                updateStatusBar(update);
            }),
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

// Sync content to Milkdown
async function syncToMilkdown(content) {
    if (!milkdownEditor) return;

    syncManager.isUpdating = true;
    syncManager.lastSource = 'codemirror';

    try {
        const statusEl = document.getElementById('sync-indicator');
        statusEl.textContent = 'Syncing...';
        statusEl.classList.add('syncing');

        // Update Milkdown content
        await milkdownEditor.action((ctx) => {
            const view = ctx.get(editorViewCtx);
            const parser = ctx.get(parserCtx);
            const doc = parser(content);

            if (!view) return;

            const state = view.state;

            // Save selection position (relative)
            const { from, to } = state.selection;
            const docSize = state.doc.content.size;
            const relativeFrom = docSize > 0 ? from / docSize : 0;
            const relativeTo = docSize > 0 ? to / docSize : 0;

            // Replace content
            const tr = state.tr.replaceWith(
                0,
                state.doc.content.size,
                doc.content
            );

            // Restore selection position
            const newDocSize = doc.content.size;
            const newFrom = Math.min(Math.round(relativeFrom * newDocSize), newDocSize);
            const newTo = Math.min(Math.round(relativeTo * newDocSize), newDocSize);

            // Set selection
            if (newFrom === newTo) {
                tr.setSelection(state.schema.nodes.doc.createAndFill()
                    ? state.selection.constructor.near(tr.doc.resolve(newFrom))
                    : state.selection);
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

        // Minimum pane width
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

// Initialize Milkdown
async function initializeMilkdown() {
    const container = document.getElementById('milkdown-editor');

    try {
        milkdownEditor = await Editor
            .make()
            .config((ctx) => {
                ctx.set(rootCtx, container);
                ctx.set(defaultValueCtx, initialContent);

                // Set up listener for changes
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

// Sync content to CodeMirror
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
        const newPos = Math.min(Math.round(relativePos * newLength), newLength);

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

// Initialize scroll sync (optional)
function initializeScrollSync() {
    if (!syncManager.scrollSync) return;

    const cmEditor = document.querySelector('#codemirror-editor .cm-scroller');
    const mdEditor = document.getElementById('milkdown-editor');

    if (!cmEditor || !mdEditor) return;

    let isScrolling = false;

    // Sync scroll from CodeMirror to Milkdown
    cmEditor.addEventListener('scroll', () => {
        if (isScrolling) return;
        isScrolling = true;

        const scrollPercent = cmEditor.scrollTop / (cmEditor.scrollHeight - cmEditor.clientHeight);
        mdEditor.scrollTop = scrollPercent * (mdEditor.scrollHeight - mdEditor.clientHeight);

        setTimeout(() => { isScrolling = false; }, 50);
    });

    // Sync scroll from Milkdown to CodeMirror
    mdEditor.addEventListener('scroll', () => {
        if (isScrolling) return;
        isScrolling = true;

        const scrollPercent = mdEditor.scrollTop / (mdEditor.scrollHeight - mdEditor.clientHeight);
        cmEditor.scrollTop = scrollPercent * (cmEditor.scrollHeight - cmEditor.clientHeight);

        setTimeout(() => { isScrolling = false; }, 50);
    });
}

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

    // Initialize scroll sync (optional - disabled by default)
    initializeScrollSync();

    console.log('Dual-Pane Markdown Editor initialized successfully!');
}

// Start the application
document.addEventListener('DOMContentLoaded', initialize);
import { initializeCodeMirror } from './codemirror-setup.js';
import { initializeMilkdown } from './milkdown-setup.js';
import { SyncManager } from './sync-manager.js';

const initialContent = `# Dual-Pane Markdown Editor

Welcome to the synchronized dual-pane markdown editor!

## Features

- **Real-time synchronization** between CodeMirror and Milkdown
- **Syntax highlighting** for markdown in CodeMirror
- **Rich WYSIWYG editing** in Milkdown
- **Draggable divider** to resize panes
- **Toggle between views** using the toolbar buttons

## Try It Out

Start typing in either pane and watch the content sync automatically!

### Code Example

\`\`\`javascript
function hello() {
    console.log("Hello, World!");
}
\`\`\`

### Lists

- Item 1
- Item 2
  - Nested item
  - Another nested item
- Item 3

### Table

| Feature | Status |
|---------|--------|
| Sync | ✅ |
| Themes | ✅ |
| Export | 🔄 |
`;

let codemirrorEditor = null;
let milkdownEditor = null;
let syncManager = null;
let isDragging = false;
let startX = 0;
let startWidths = [];

async function initialize() {
    const codemirrorContainer = document.getElementById('codemirror-editor');
    const milkdownContainer = document.getElementById('milkdown-editor');

    syncManager = new SyncManager();

    codemirrorEditor = initializeCodeMirror(
        codemirrorContainer,
        initialContent,
        (content, source) => {
            if (source === 'codemirror') {
                syncManager.handleCodeMirrorChange(content);
            }
        }
    );

    milkdownEditor = await initializeMilkdown(
        milkdownContainer,
        initialContent,
        (content, source) => {
            if (source === 'milkdown') {
                syncManager.handleMilkdownChange(content);
            }
        }
    );

    syncManager.init(codemirrorEditor, milkdownEditor);

    setupPaneDivider();
    setupToolbarButtons();

    syncManager.updateWordCount(initialContent);
}

function setupPaneDivider() {
    const divider = document.getElementById('divider');
    const editorPanes = document.querySelector('.editor-panes');
    const codemirrorPane = document.getElementById('codemirror-pane');
    const milkdownPane = document.getElementById('milkdown-pane');

    divider.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startWidths = [
            codemirrorPane.offsetWidth,
            milkdownPane.offsetWidth
        ];
        document.body.style.cursor = 'col-resize';
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const deltaX = e.clientX - startX;
        const totalWidth = editorPanes.offsetWidth;

        const newLeftWidth = startWidths[0] + deltaX;
        const newRightWidth = startWidths[1] - deltaX;

        if (newLeftWidth >= 200 && newRightWidth >= 200) {
            const leftPercent = (newLeftWidth / totalWidth) * 100;
            const rightPercent = (newRightWidth / totalWidth) * 100;

            codemirrorPane.style.flex = `0 0 ${leftPercent}%`;
            milkdownPane.style.flex = `0 0 ${rightPercent}%`;
        }
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            document.body.style.cursor = '';
        }
    });
}

function setupToolbarButtons() {
    const toggleCodeMirror = document.getElementById('toggle-codemirror');
    const toggleMilkdown = document.getElementById('toggle-milkdown');
    const toggleBoth = document.getElementById('toggle-both');
    const codemirrorPane = document.getElementById('codemirror-pane');
    const milkdownPane = document.getElementById('milkdown-pane');
    const divider = document.getElementById('divider');

    function setActiveButton(button) {
        [toggleCodeMirror, toggleMilkdown, toggleBoth].forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
    }

    toggleCodeMirror.addEventListener('click', () => {
        codemirrorPane.style.display = 'flex';
        milkdownPane.style.display = 'none';
        divider.style.display = 'none';
        codemirrorPane.style.flex = '1';
        setActiveButton(toggleCodeMirror);
        codemirrorEditor.focus();
    });

    toggleMilkdown.addEventListener('click', () => {
        codemirrorPane.style.display = 'none';
        milkdownPane.style.display = 'flex';
        divider.style.display = 'none';
        milkdownPane.style.flex = '1';
        setActiveButton(toggleMilkdown);
        milkdownEditor.focus();
    });

    toggleBoth.addEventListener('click', () => {
        codemirrorPane.style.display = 'flex';
        milkdownPane.style.display = 'flex';
        divider.style.display = 'block';
        codemirrorPane.style.flex = '0 0 50%';
        milkdownPane.style.flex = '0 0 50%';
        setActiveButton(toggleBoth);
    });
}

window.addEventListener('DOMContentLoaded', initialize);

window.addEventListener('beforeunload', () => {
    if (syncManager) {
        syncManager.destroy();
    }
    if (codemirrorEditor) {
        codemirrorEditor.destroy();
    }
    if (milkdownEditor) {
        milkdownEditor.destroy();
    }
});
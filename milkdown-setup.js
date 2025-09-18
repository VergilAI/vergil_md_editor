import { Editor, rootCtx, defaultValueCtx, editorViewCtx, parserCtx, serializerCtx } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { gfm } from '@milkdown/preset-gfm';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { history } from '@milkdown/plugin-history';
import { nord } from '@milkdown/theme-nord';
// These plugins are used by our extracted components

// Import our extracted components
import { createToolbar } from './extracted-components/toolbar.js';
import { createBlockEdit } from './extracted-components/block-edit.js';

// Import and inject CSS
import crepeCSS from './extracted-components/crepe-ui.css';

// Inject CSS into the page
function injectCSS() {
    const style = document.createElement('style');
    style.textContent = crepeCSS;
    document.head.appendChild(style);
}

export async function initializeMilkdown(container, initialContent = '', onChange) {
    let editorInstance = null;
    let isInternalUpdate = false;

    // Inject the CSS for our UI components
    injectCSS();

    const editor = await Editor.make()
        .config((ctx) => {
            ctx.set(rootCtx, container);
            ctx.set(defaultValueCtx, initialContent);
        })
        .config(nord)
        .use(commonmark)
        .use(gfm)
        .use(history)
        .use(listener)
        .config((ctx) => {
            const listenerAPI = ctx.get(listenerCtx);

            listenerAPI.markdownUpdated((ctx, markdown, prevMarkdown) => {
                if (!isInternalUpdate && onChange && markdown !== prevMarkdown) {
                    onChange(markdown, 'milkdown');
                }
            });
        })
        .create();

    editorInstance = editor;

    // Add our extracted UI components
    createToolbar(editor);
    createBlockEdit(editor);

    return {
        editor: editorInstance,
        getContent: () => {
            return editorInstance.action((ctx) => {
                const view = ctx.get(editorViewCtx);
                const serializer = ctx.get(serializerCtx);
                const doc = view.state.doc;
                return serializer(doc);
            });
        },
        setContent: async (content) => {
            isInternalUpdate = true;
            try {
                await editorInstance.action((ctx) => {
                    const view = ctx.get(editorViewCtx);
                    const parser = ctx.get(parserCtx);
                    const doc = parser(content);

                    if (doc) {
                        const tr = view.state.tr.replaceWith(0, view.state.doc.content.size, doc.content);
                        view.dispatch(tr);
                    }
                });
            } finally {
                setTimeout(() => {
                    isInternalUpdate = false;
                }, 100);
            }
        },
        getCursorPosition: () => {
            return editorInstance.action((ctx) => {
                const view = ctx.get(editorViewCtx);
                return view.state.selection.main?.head || 0;
            });
        },
        setCursorPosition: (pos) => {
            editorInstance.action((ctx) => {
                const view = ctx.get(editorViewCtx);
                const tr = view.state.tr.setSelection(
                    view.state.selection.constructor.near(view.state.doc.resolve(Math.min(pos, view.state.doc.content.size)))
                );
                view.dispatch(tr);
            });
        },
        focus: () => {
            editorInstance.action((ctx) => {
                const view = ctx.get(editorViewCtx);
                view.focus();
            });
        },
        destroy: async () => {
            if (editorInstance) {
                await editorInstance.destroy();
            }
        }
    };
}
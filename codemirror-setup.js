import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine } from '@codemirror/view';
import { foldGutter } from '@codemirror/language';

export function initializeCodeMirror(container, initialContent = '', onChange) {
    const extensions = [
        basicSetup,
        markdown(),
        oneDark,
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        foldGutter(),
        drawSelection(),
        dropCursor(),
        rectangularSelection(),
        crosshairCursor(),
        highlightActiveLine(),
        EditorView.updateListener.of((update) => {
            if (update.docChanged && onChange) {
                const content = update.state.doc.toString();
                onChange(content, 'codemirror');
            }
        }),
        EditorView.theme({
            "&": {
                fontSize: "14px",
                height: "100%"
            },
            ".cm-content": {
                padding: "12px",
                fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace"
            },
            ".cm-scroller": {
                fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace"
            }
        })
    ];

    const state = EditorState.create({
        doc: initialContent,
        extensions
    });

    const view = new EditorView({
        state,
        parent: container
    });

    return {
        view,
        getContent: () => view.state.doc.toString(),
        setContent: (content) => {
            const currentContent = view.state.doc.toString();
            if (currentContent !== content) {
                view.dispatch({
                    changes: {
                        from: 0,
                        to: view.state.doc.length,
                        insert: content
                    }
                });
            }
        },
        getCursorPosition: () => {
            return view.state.selection.main.head;
        },
        setCursorPosition: (pos) => {
            view.dispatch({
                selection: { anchor: pos, head: pos }
            });
        },
        focus: () => view.focus(),
        destroy: () => view.destroy()
    };
}
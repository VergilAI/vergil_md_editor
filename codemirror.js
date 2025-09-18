import { EditorView, basicSetup } from "codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";

const view = new EditorView({
  doc: "# Hello CodeMirror\n\nStart typing...",
  extensions: [basicSetup, markdown(), oneDark],
  parent: document.getElementById("editor")
});
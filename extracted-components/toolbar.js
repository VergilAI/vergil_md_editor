import { defineComponent, ref, h, createApp } from 'vue';
import { tooltipFactory, TooltipProvider } from '@milkdown/plugin-tooltip';
import {
  commandsCtx,
  editorViewCtx
} from '@milkdown/core';
import {
  toggleStrongCommand,
  toggleEmphasisCommand,
  toggleInlineCodeCommand,
  toggleLinkCommand
} from '@milkdown/preset-commonmark';
import {
  toggleStrikethroughCommand
} from '@milkdown/preset-gfm';

// Toolbar item configuration
const toolbarItems = [
  {
    icon: 'bold',
    command: toggleStrongCommand,
    active: (ctx) => {
      // Check if bold is active
      const view = ctx.get(editorViewCtx);
      const { state } = view;
      const { from, to } = state.selection;
      return state.doc.rangeHasMark(from, to, state.schema.marks.strong);
    }
  },
  {
    icon: 'italic',
    command: toggleEmphasisCommand,
    active: (ctx) => {
      const view = ctx.get(editorViewCtx);
      const { state } = view;
      const { from, to } = state.selection;
      return state.doc.rangeHasMark(from, to, state.schema.marks.emphasis);
    }
  },
  {
    icon: 'strikethrough',
    command: toggleStrikethroughCommand,
    active: (ctx) => {
      const view = ctx.get(editorViewCtx);
      const { state } = view;
      const { from, to } = state.selection;
      return state.doc.rangeHasMark(from, to, state.schema.marks.strikethrough);
    }
  },
  {
    icon: 'code',
    command: toggleInlineCodeCommand,
    active: (ctx) => {
      const view = ctx.get(editorViewCtx);
      const { state } = view;
      const { from, to } = state.selection;
      return state.doc.rangeHasMark(from, to, state.schema.marks.inlineCode);
    }
  }
];

// Icon SVGs
const icons = {
  bold: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path></svg>`,
  italic: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg>`,
  strikethrough: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4H9a3 3 0 0 0-2.83 4"></path><path d="M14 12a4 4 0 0 1 0 8H6"></path><line x1="4" y1="12" x2="20" y2="12"></line></svg>`,
  code: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
  link: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`
};

// Vue component for toolbar
const ToolbarComponent = defineComponent({
  name: 'MilkdownToolbar',
  props: {
    ctx: Object,
    show: Boolean
  },
  setup(props) {
    const activeItems = ref(new Set());

    const updateActiveItems = () => {
      if (!props.ctx) return;
      const newActive = new Set();
      toolbarItems.forEach((item, index) => {
        if (item.active && item.active(props.ctx)) {
          newActive.add(index);
        }
      });
      activeItems.value = newActive;
    };

    const handleClick = (item) => {
      if (!props.ctx || !item.command) return;
      const commands = props.ctx.get(commandsCtx);
      const command = commands.get(item.command.key);
      if (command) {
        command();
      }
    };

    return () => {
      if (!props.show) return null;

      updateActiveItems();

      return h('div', {
        class: 'milkdown-toolbar',
        'data-show': props.show
      }, [
        toolbarItems.map((item, index) =>
          h('button', {
            class: ['toolbar-item', activeItems.value.has(index) ? 'active' : ''],
            onClick: () => handleClick(item),
            innerHTML: icons[item.icon]
          })
        )
      ]);
    };
  }
});

// Create and setup toolbar
export function createToolbar(editor) {
  const tooltip = tooltipFactory('TOOLBAR');

  editor.use(tooltip);

  // After editor is ready, set up the toolbar
  editor.action((ctx) => {
    const tooltipProvider = new TooltipProvider({
      content: () => {
        const div = document.createElement('div');

        // Create Vue app for toolbar
        const app = createApp(ToolbarComponent, {
          ctx: ctx,
          show: true
        });

        app.mount(div);
        return div;
      },
      debounce: 100,
      shouldShow: (view) => {
        const { selection } = view.state;
        const { empty, from, to } = selection;

        // Show toolbar only for non-empty text selection
        if (empty) return false;
        if (from === to) return false;

        // Check if it's a text selection
        const text = view.state.doc.textBetween(from, to, ' ');
        return text.length > 0;
      }
    });

    // Get the tooltip plugin instance and configure it
    const plugin = ctx.get(tooltip.key);
    const view = ctx.get(editorViewCtx);

    tooltipProvider.bind(view);
  });
}
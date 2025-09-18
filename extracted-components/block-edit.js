import { defineComponent, ref, computed, h, createApp } from 'vue';
import { block, BlockProvider } from '@milkdown/plugin-block';
import { slashFactory, SlashProvider } from '@milkdown/plugin-slash';
import {
  commandsCtx,
  editorViewCtx,
  editorCtx
} from '@milkdown/core';
import {
  setBlockTypeCommand,
  headingSchema,
  blockquoteSchema,
  codeBlockSchema,
  bulletListSchema,
  orderedListSchema,
  hrSchema
} from '@milkdown/preset-commonmark';

// Slash menu items
const slashMenuItems = [
  // Text group
  { group: 'Text', items: [
    { label: 'Heading 1', icon: 'H1', command: setBlockTypeCommand, schema: headingSchema, attrs: { level: 1 } },
    { label: 'Heading 2', icon: 'H2', command: setBlockTypeCommand, schema: headingSchema, attrs: { level: 2 } },
    { label: 'Heading 3', icon: 'H3', command: setBlockTypeCommand, schema: headingSchema, attrs: { level: 3 } },
    { label: 'Quote', icon: '"', command: setBlockTypeCommand, schema: blockquoteSchema },
    { label: 'Divider', icon: '—', schema: hrSchema }
  ]},
  // List group
  { group: 'Lists', items: [
    { label: 'Bullet List', icon: '•', schema: bulletListSchema },
    { label: 'Numbered List', icon: '1.', schema: orderedListSchema }
  ]},
  // Advanced group
  { group: 'Advanced', items: [
    { label: 'Code Block', icon: '</>', command: setBlockTypeCommand, schema: codeBlockSchema }
  ]}
];

// Block handle component
const BlockHandleComponent = defineComponent({
  name: 'BlockHandle',
  props: {
    ctx: Object,
    blockNode: Object
  },
  setup(props) {
    const showMenu = ref(false);

    const handleAdd = () => {
      showMenu.value = !showMenu.value;
    };

    const handleDrag = (e) => {
      // Implement drag logic if needed
      e.preventDefault();
    };

    return () => h('div', { class: 'milkdown-block-handle' }, [
      h('button', {
        class: 'block-handle-add',
        onClick: handleAdd,
        innerHTML: '<svg width="16" height="16" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
      }),
      h('button', {
        class: 'block-handle-drag',
        onMousedown: handleDrag,
        innerHTML: '<svg width="16" height="16" viewBox="0 0 24 24"><path d="M9 5h6M9 12h6M9 19h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
      })
    ]);
  }
});

// Slash menu component
const SlashMenuComponent = defineComponent({
  name: 'SlashMenu',
  props: {
    ctx: Object,
    show: Boolean,
    items: Array
  },
  setup(props) {
    const selectedIndex = ref(0);
    const filter = ref('');

    const filteredItems = computed(() => {
      if (!filter.value) return props.items;

      const searchTerm = filter.value.toLowerCase();
      return props.items.map(group => ({
        ...group,
        items: group.items.filter(item =>
          item.label.toLowerCase().includes(searchTerm)
        )
      })).filter(group => group.items.length > 0);
    });

    const handleSelect = (item) => {
      if (!props.ctx) return;

      const commands = props.ctx.get(commandsCtx);
      const view = props.ctx.get(editorViewCtx);

      if (item.command) {
        const command = commands.get(item.command.key);
        if (command) {
          if (item.schema && item.attrs) {
            command({ type: item.schema.type(props.ctx), attrs: item.attrs });
          } else {
            command();
          }
        }
      } else if (item.schema) {
        // Insert node directly
        const node = item.schema.type(props.ctx).create(item.attrs);
        const tr = view.state.tr.replaceSelectionWith(node);
        view.dispatch(tr);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex.value = Math.min(selectedIndex.value + 1, getTotalItems() - 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex.value = Math.max(selectedIndex.value - 1, 0);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = getItemByIndex(selectedIndex.value);
        if (item) handleSelect(item);
      }
    };

    const getTotalItems = () => {
      return filteredItems.value.reduce((acc, group) => acc + group.items.length, 0);
    };

    const getItemByIndex = (index) => {
      let count = 0;
      for (const group of filteredItems.value) {
        for (const item of group.items) {
          if (count === index) return item;
          count++;
        }
      }
      return null;
    };

    return () => {
      if (!props.show) return null;

      let itemIndex = 0;

      return h('div', {
        class: 'milkdown-slash-menu',
        'data-show': props.show,
        onKeydown: handleKeyDown
      }, [
        h('input', {
          class: 'slash-menu-filter',
          type: 'text',
          placeholder: 'Search...',
          value: filter.value,
          onInput: (e) => filter.value = e.target.value
        }),
        filteredItems.value.map(group =>
          h('div', { class: 'slash-menu-group' }, [
            h('div', { class: 'slash-menu-group-label' }, group.group),
            group.items.map(item => {
              const currentIndex = itemIndex++;
              return h('button', {
                class: ['slash-menu-item', currentIndex === selectedIndex.value ? 'selected' : ''],
                onClick: () => handleSelect(item)
              }, [
                h('span', { class: 'slash-menu-item-icon' }, item.icon),
                h('span', { class: 'slash-menu-item-label' }, item.label)
              ]);
            })
          ])
        )
      ]);
    };
  }
});

// Setup block editing features
export function createBlockEdit(editor) {
  // Add block plugin for drag handles
  editor.use(block);

  // Add slash plugin for command menu
  const slash = slashFactory('SLASH_MENU');
  editor.use(slash);

  // Configure after editor is ready
  editor.action((ctx) => {
    // Set up block handles
    const blockProvider = new BlockProvider({
      ctx: ctx,
      content: (blockNode) => {
        const div = document.createElement('div');

        const app = createApp(BlockHandleComponent, {
          ctx: ctx,
          blockNode: blockNode
        });

        app.mount(div);
        return div;
      }
    });

    // Set up slash menu
    const slashProvider = new SlashProvider({
      content: () => {
        const div = document.createElement('div');

        const app = createApp(SlashMenuComponent, {
          ctx: ctx,
          show: true,
          items: slashMenuItems
        });

        app.mount(div);
        return div;
      },
      trigger: '/',
      shouldShow: (view, prevState) => {
        // Show when user types /
        const { state } = view;
        const { selection } = state;
        const { empty } = selection;

        if (!empty) return false;

        const textBefore = state.doc.textBetween(
          Math.max(0, selection.from - 1),
          selection.from,
          ' '
        );

        return textBefore === '/';
      }
    });

    const view = ctx.get(editorViewCtx);
    blockProvider.bind(view);
    slashProvider.bind(view);
  });
}
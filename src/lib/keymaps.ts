import hotkeys from 'hotkeys-js';

// N: Normal mode
// I: Insert mode (while typing in a textbox)
// mod: Alt, Shift, Ctrl (or combination of them seperated with comma(,))
// keys: A~Z, Enter, Delete, Space, Escape, ArrowUp, ArrowLeft, ArrowRight, ArrowDown
// keys: sequence of keys (seperated with space)

export type Action = 'today' | 'up' | 'down' | 'left' | 'right' | 'move-up' | 'move-down' | 'move-left' | 'move-right' | 'delete' | 'edit_start' | 'edit_end' | 'edit_all' | 'copy' | 'paste' | 'copy_all_items_text' | 'toggle_theme' | 'toggle_status' | 'toggle_type' | 'paste' | 'paste_above' | 'cancel' | 'create' | 'create_above' | 'todo';

export type KeyMap = {
  mode?: "N" | "NI";
  group: "GENERAL" | "COMMON" | "VIMMODE";
  key?: string | string[];
  sequence?: string[];
  fastTyping?: string[];
  action: Action;
  desc: string;
};

export const KEYMAPS: Array<KeyMap> = [
  { group: "GENERAL", key: "up", fastTyping: ["down+up"], action: 'up', desc: "Select Previous Item" },
  { group: "GENERAL", key: "down", fastTyping: ["up+down"], action: 'down', desc: "Select Next Item" },
  { group: "GENERAL", key: "left", fastTyping: ["right+left"], action: 'left', desc: "Go to Previous Week/Year/Section" },
  { group: "GENERAL", key: "right", fastTyping: ["left+right"], action: 'right', desc: "Go to Next Week/Year/Section" },
  { group: "GENERAL", key: "escape", action: 'cancel', desc: "Cancel Editing/Selection" },
  { group: "GENERAL", key: "ctrl+up", fastTyping: ["ctrl+down+up"], action: 'move-up', desc: "Move Selected Item Up" },
  { group: "GENERAL", key: "ctrl+down", fastTyping: ["ctrl+up+down"], action: 'move-down', desc: "Move Selected Item Down" },
  { group: "GENERAL", key: "ctrl+left", fastTyping: ["ctrl+right+left"], action: 'move-left', desc: "Move Selected Item to Previous Week/Year/Section" },
  { group: "GENERAL", key: "ctrl+right", fastTyping: ["ctrl+left+right"], action: 'move-right', desc: "Move Selected Item to Next Week/Year/Section" },
  { group: "GENERAL", key: ["ctrl+e"], fastTyping: [], action: 'edit_end', desc: "Edit Selected Item" },
  { group: "GENERAL", key: ["ctrl+c"], fastTyping: [], action: 'copy', desc: "Copy Selected Item" },
  { group: "GENERAL", key: ["ctrl+v"], fastTyping: [], action: 'paste', desc: "Paste Copied Item or Text from Clipboard" },
  { group: "GENERAL", key: ["ctrl+n"], fastTyping: [], action: 'create', desc: "Create New Item (ToDo/Note)" },
  { group: "GENERAL", key: ["ctrl+t"], fastTyping: [], action: 'toggle_type', desc: "Toggle Item Type (ToDo/Note)" },
  { group: "GENERAL", key: "t", fastTyping: [], action: 'today', desc: "Go to Today" },

  { group: "VIMMODE", key: "k", fastTyping: ["j+k"], action: 'up', desc: "Select Previous Item" },
  { group: "VIMMODE", key: "j", fastTyping: ["k+j"], action: 'down', desc: "Select Next Item" },
  { group: "VIMMODE", key: "h", fastTyping: ["l+h"], action: 'left', desc: "Go to Previous Week/Year/Section" },
  { group: "VIMMODE", key: "l", fastTyping: ["h+l"], action: 'right', desc: "Go to Next Week/Year/Section" },
  { group: "VIMMODE", key: "ctrl+k", fastTyping: ["ctrl+j+k"], action: 'move-up', desc: "Move Selected Item Up" },
  { group: "VIMMODE", key: "ctrl+j", fastTyping: ["ctrl+k+j"], action: 'move-down', desc: "Move Selected Item Down" },
  { group: "VIMMODE", key: "ctrl+h", fastTyping: ["ctrl+l+h"], action: 'move-left', desc: "Move Selected Item to Previous Week/Year/Section" },
  { group: "VIMMODE", key: "ctrl+l", fastTyping: ["ctrl+h+l"], action: 'move-right', desc: "Move Selected Item to Next Week/Year/Section" },
  { group: "VIMMODE", key: ["i", "a", "A"], fastTyping: [], action: 'edit_end', desc: "Edit Selected Item (caret at end)" },
  { group: "VIMMODE", key: "shift+i", fastTyping: [], action: 'edit_start', desc: "Edit Selected Item (caret at start)" },
  { group: "VIMMODE", key: "p", fastTyping: [], action: 'paste', desc: "Paste Copied Item or Text from Clipboard" },
  { group: "VIMMODE", key: "shift+p", fastTyping: [], action: 'paste_above', desc: "Paste Copied Item or Text from Clipboard (above selected item)" },
  { group: "VIMMODE", key: "o", fastTyping: [], action: 'create', desc: "Create New Item (bellow selected item)" },
  { group: "VIMMODE", key: "shift+o", fastTyping: [], action: 'create_above', desc: "Create New Item (above selected item)" },
  { group: "VIMMODE", sequence: ["space", "t"], fastTyping: ["", "space+t"], action: 'toggle_theme', desc: "Toggle Theme (Dark/Light)" },
  { group: "VIMMODE", sequence: ["space", "space"], fastTyping: [], action: 'toggle_status', desc: "Toggle Item Complete Status" },
  { group: "VIMMODE", sequence: ["d", "d"], fastTyping: [], action: 'delete', desc: "Delete Selected Item" },
  { group: "VIMMODE", sequence: ["y", "y"], fastTyping: [], action: 'copy', desc: "Copy Selected Item" },
  { group: "VIMMODE", sequence: ["y", "a", "p"], fastTyping: ["", "y+a", "a+p,y+a+p"], action: 'copy_all_items_text', desc: "Copy All Items Text" }, // fix:
]

let listeners: Array<(action: Action) => void> = [];

export function listenToActions(cb: (action: Action) => void) {
  if (!listeners.includes(cb)) { // avoid multiple same callback register
    listeners.push(cb);
  }
  // console.log("registering new callback listener keymap. count:", listeners.length);
  // the unlisten function
  return () => {
    console.log("deregistering the listener callback.");
    listeners = listeners.filter((c) => c !== cb);
  };
}

function broadcastAction(action: Action) {
  console.log("broadcasting action:", action);
  listeners.forEach((c) => c(action));
}

const INITKEYSCOPE = "INITKEYSCOPE";

export const init = (initGroup: string) => {
  console.log("binding hotkeys...");
  hotkeys.setScope(INITKEYSCOPE);
  hotkeys('escape', 'all', function(event, handler) {
    handler.key;
    event.preventDefault()
    if (hotkeys.getScope() !== INITKEYSCOPE)
      hotkeys.setScope(INITKEYSCOPE);
    console.log("cancelling sequence!");
  });

  KEYMAPS.forEach(({ group, key, sequence, fastTyping = [], action }) => {
    if (group !== initGroup) return;
    if (key) {
      const keyArray = Array.isArray(key) ? key : [key];
      let keys = []
      keys.push(...keyArray);
      keys.push(...fastTyping);
      const allKeys = keys.join(',');
      // console.log('keys:', keys, action, desc)
      hotkeys(allKeys, INITKEYSCOPE, function(event, handler) {
        handler.key;
        event.preventDefault()
        broadcastAction(action);
      });
    }
    if (sequence) {
      // console.log('sequence:', sequence, action, desc);
      const sequenceLength = sequence.length;
      let scope: string = INITKEYSCOPE;
      sequence.forEach((mainKey, i) => {
        const nextScope = i === (sequenceLength - 1) ? INITKEYSCOPE : scope + "_" + mainKey;
        const fastTypingKeys = fastTyping[i] ? "," + fastTyping[i] : "";
        const keys = i === 0 ? mainKey : mainKey + fastTypingKeys + ",*";
        const keysArray = keys.split(",");
        // console.log("keys:", keys, "keysArray:", keysArray);
        // console.log("setting scopes/next_scope:", scope, nextScope);
        hotkeys(keys, scope, function(event, handler) {
          const key = handler.key;
          // console.log("key received:", key);
          // console.log("handler:", handler);
          const keysCode = handler.keys;
          // console.log("keysCode:", keysCode);
          if (key === "*") {
            if (keysCode.length === 0) { /* console.log("ignored"); */ }
            else if (keysCode.length === 1 && keysCode.includes(0)) { /* console.log("ignored"); */ }
            else if (keysCode.length === 1 && keysCode.includes(16)) { /* console.log("ignored"); */ }
            else if (keysCode.length === 1 && keysCode.includes(17)) { /* console.log("ignored"); */ }
            else if (keysCode.length === 1 && keysCode.includes(18)) { /* console.log("ignored"); */ }
            else {
              hotkeys.setScope(INITKEYSCOPE);
              // console.log(`changing scope to: ${INITKEYSCOPE}`);
            }
          } else if (keysArray.includes(key)) {
            event.preventDefault();
            hotkeys.setScope(nextScope);
            // console.log(`changing scope to: ${nextScope}`);
            if (nextScope === INITKEYSCOPE) {
              broadcastAction(action);
            }
          } else { }
        });
        scope = nextScope;
      })
    }
  });
}

export const deinit = () => {
  console.log("unbinding hotkeys...");
  hotkeys.unbind();
}


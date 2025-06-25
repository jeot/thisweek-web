import hotkeys from 'hotkeys-js';

let listeners: Array<(action: string) => void> = [];

export function listenToActions(cb: (action: string) => void) {
  if (!listeners.includes(cb)) { // avoid multiple same callback register
    listeners.push(cb);
  }
  console.log("registering new callback listener keymap. count:", listeners.length);
  // the unlisten function
  return () => {
    console.log("deregistering the listener callback.");
    listeners = listeners.filter((c) => c !== cb);
  };
}

function broadcastAction(action: string) {
  console.log("broadcasting action:", action);
  listeners.forEach((c) => c(action));
}

export const init = () => {
  console.log("binding hotkeys...");
  hotkeys.setScope('KEY_SCOPE_FIRST');

  // movement
  hotkeys('k,j,j+k,k+j', 'KEY_SCOPE_FIRST', function(event, handler) {
    event.preventDefault()
    const key = handler.key
    if (key === 'k' || key === 'j+k') broadcastAction("up");
    if (key === 'j' || key === 'k+j') broadcastAction("down");
  });
  hotkeys('h,l,h+l,l+h', 'KEY_SCOPE_FIRST', function(event, handler) {
    event.preventDefault()
    const key = handler.key
    if (key === 'h' || key === 'l+h') broadcastAction("left");
    if (key === 'l' || key === 'h+l') broadcastAction("right");
  });
  hotkeys('t', 'KEY_SCOPE_FIRST', function(event, handler) {
    event.preventDefault()
    const key = handler.key
    if (key === 't') broadcastAction("today");
  });

  // scopes (for key sequence)
  // g: goto (then 'i' for example)
  hotkeys('g', 'KEY_SCOPE_FIRST', function(event, handler) {
    handler.key;
    event.preventDefault()
    hotkeys.setScope('KEY_SCOPE_G');
  });
  hotkeys('i,o,g+i,g+o,*', 'KEY_SCOPE_G', (event, handler) => {
    event.preventDefault()
    const key = handler.key
    if (key === 'i' || key === 'g+i') broadcastAction("goto_item");
    if (key === 'o' || key === 'g+o') broadcastAction("goto_objectives");
    hotkeys.setScope('KEY_SCOPE_FIRST');
  });

  // d: delete
  hotkeys('d', 'KEY_SCOPE_FIRST', function(event, handler) {
    handler.key;
    event.preventDefault()
    hotkeys.setScope('KEY_SCOPE_D');
  });
  hotkeys('d,d+d,*', 'KEY_SCOPE_D', (event, handler) => {
    event.preventDefault()
    const key = handler.key
    if (key === 'd' || key === 'd+d') broadcastAction("delete");
    hotkeys.setScope('KEY_SCOPE_FIRST');
  });

  // c: change/edit
  hotkeys('c', 'KEY_SCOPE_FIRST', function(event, handler) {
    handler.key;
    event.preventDefault()
    hotkeys.setScope('KEY_SCOPE_C');
  });
  hotkeys('c,c+c,*', 'KEY_SCOPE_C', (event, handler) => {
    event.preventDefault()
    const key = handler.key
    if (key === 'c' || key === 'c+c') broadcastAction("change");
    hotkeys.setScope('KEY_SCOPE_FIRST');
  });

  // y: yank/copy
  hotkeys('y', 'KEY_SCOPE_FIRST', function(event, handler) {
    handler.key;
    event.preventDefault()
    hotkeys.setScope('KEY_SCOPE_Y');
  });
  hotkeys('y,y+y,*', 'KEY_SCOPE_Y', (event, handler) => {
    event.preventDefault()
    const key = handler.key
    if (key === 'y' || key === 'y+y') broadcastAction("yank");
    hotkeys.setScope('KEY_SCOPE_FIRST');
  });

  // space: leader key
  hotkeys('space', 'KEY_SCOPE_FIRST', function(event, handler) {
    handler.key;
    event.preventDefault()
    hotkeys.setScope('KEY_SCOPE_SPACE');
  });
  hotkeys('t,space+t,*', 'KEY_SCOPE_SPACE', (event, handler) => {
    const key = handler.key
    event.preventDefault()
    if (key === 't' || key === 'space+t') broadcastAction("toggle_theme");
    hotkeys.setScope('KEY_SCOPE_FIRST');
  });
  hotkeys('space,space+space,*', 'KEY_SCOPE_SPACE', (event, handler) => {
    const key = handler.key
    event.preventDefault()
    if (key === 'space' || key === 'space+space') broadcastAction("toggle_status");
    hotkeys.setScope('KEY_SCOPE_FIRST');
  });

  // paste
  hotkeys('p', 'KEY_SCOPE_FIRST', function(event, handler) {
    handler.key;
    event.preventDefault()
    broadcastAction("paste");
  });
  hotkeys('shift+p', 'KEY_SCOPE_FIRST', function(event, handler) {
    handler.key;
    event.preventDefault()
    broadcastAction("paste_above");
  });

  // append
  hotkeys('a', 'KEY_SCOPE_FIRST', function(event, handler) {
    handler.key;
    event.preventDefault()
    broadcastAction("append");
  });
  hotkeys('shift+a', 'KEY_SCOPE_FIRST', function(event, handler) {
    handler.key;
    event.preventDefault()
    broadcastAction("append");
  });

  // insert
  hotkeys('i', 'KEY_SCOPE_FIRST', function(event, handler) {
    handler.key;
    event.preventDefault()
    broadcastAction("insert");
  });
  hotkeys('shift+i', 'KEY_SCOPE_FIRST', function(event, handler) {
    handler.key;
    event.preventDefault()
    broadcastAction("insert_at_begining");
  });

  // escape (cancel)
  hotkeys('escape', 'KEY_SCOPE_FIRST', function(event, handler) {
    handler.key;
    event.preventDefault()
    broadcastAction("cancel");
  });

  // create tasks
  hotkeys('o,shift+o', 'KEY_SCOPE_FIRST', function(event, handler) {
    const key = handler.key;
    event.preventDefault()
    if (key === 'o') broadcastAction("create_item");
    if (key === 'shift+o') broadcastAction("create_item_above");
  });

  // toggle task type
  hotkeys('ctrl+x', 'KEY_SCOPE_FIRST', function(event, handler) {
    const key = handler.key;
    event.preventDefault()
    if (key === 'ctrl+x') broadcastAction("toggle_item_type");
  });
}

export const deinit = () => {
  console.log("unbinding hotkeys...");
  hotkeys.unbind();
}


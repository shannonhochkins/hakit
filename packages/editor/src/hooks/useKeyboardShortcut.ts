import { useCallback, useEffect } from 'react';

export type Shortcut = {
  keys: string[];
  onEvent: (event: ShortcutEvent) => void;
  disabled?: boolean;
  preventDefault?: boolean;
};

export enum EventType {
  keydown = 'keydown',
  wheel = 'wheel',
}

export enum ComboKey {
  ctrl = 'ctrl',
  shift = 'shift',
  alt = 'alt',
}

export type ShortcutEvent = KeyboardEvent | WheelEvent;

const ALLOWED_COMBO_KEYS = Object.keys(ComboKey);
const ALLOWED_EVENTS = Object.keys(EventType);
const EDITABLE_TAGS = ['INPUT', 'TEXTAREA'];

const allComboKeysPressed = (keys: string[], event: ShortcutEvent) => {
  keys = keys.map(key => key.toLowerCase());
  if (keys.includes('ctrl') && !event.ctrlKey && !event.metaKey) return false;
  if (keys.includes('shift') && !event.shiftKey) return false;
  if (keys.includes('alt') && !event.altKey) return false;
  return true;
};

const validateKeys = (keys: string[]): boolean => {
  let errorMessage: string | null = null;

  if (!keys.length) errorMessage = `You need to specify a key besides ${JSON.stringify(ALLOWED_COMBO_KEYS)} for keydown events.`;
  if (keys.length > 1)
    errorMessage = `Only one key besides ${JSON.stringify(
      ALLOWED_COMBO_KEYS
    )} can be used. Found ${keys.length}: [${keys.map(key => `"${key}"`)}].`;

  if (errorMessage) {
    throw new Error(errorMessage);
  }

  return true;
};

const withoutComboKeys = (key: string) => !ALLOWED_COMBO_KEYS.includes(key.toLowerCase());

const comboKeys = (key: string) => ALLOWED_COMBO_KEYS.includes(key.toLowerCase());

const isSingleKeyEvent = (e: ShortcutEvent) => !e.shiftKey && !e.metaKey && !e.altKey && !e.ctrlKey;

const isSingleKeyShortcut = (shortcut: Shortcut) => !shortcut.keys.filter(comboKeys).length;

const getKeyCode = (key: string) => {
  if (key.length === 1 && key.search(/[^a-zA-Z]+/) === -1) return `Key${key.toUpperCase()}`;

  if (key.length === 1 && typeof Number(key) === 'number') return `Digit${key}`;

  return key;
};

/**
 * @example
 *   useKeyboardShortcuts([
      { keys: ["ctrl", "a"], onEvent: event => alert("ctrl + a was pressed") },
      { keys: ["shift", "b"], onEvent: event => alert("shift + b was pressed") },
      { keys: ["Tab"], handleNext },
      { keys: ["Esc"], handleClose },
      { keys: ["Enter"], handleSubmit, preventDefault: false },
    ])

    useKeyboardShortcuts(
      [{ keys: ["ctrl", "shift"], onEvent: () => alert('ctrl + shift + scroll is active') }],
      true,
      [],
      "mousewheel"
    )
  }


  import useKeyboardShortcuts from "use-keyboard-shortcuts"

  const Example = () => {
    const [isOpen, setIsOpen] = React.useState(false)

    useKeyboardShortcuts([
      { keys: ["ctrl", "a"], onEvent: event => alert("ctrl + a was pressed") },
      { keys: ["Esc"], onEvent: () => setIsOpen(false) },
    ])

    return <div>...</div>
  }
 */
export const useKeyboardShortcuts = (shortcuts: Shortcut[], active = true, eventType: 'keydown' | 'wheel' = 'keydown'): void => {
  if (!ALLOWED_EVENTS.includes(eventType))
    throw new Error(`Unsupported event. Supported events are: ${JSON.stringify(ALLOWED_EVENTS)}. Found event: "${eventType}".`);

  const shortcutHasPriority = useCallback(
    (inputShortcut: Shortcut, event: ShortcutEvent) => {
      if (shortcuts.length === 1) return true;
      if (isSingleKeyShortcut(inputShortcut) && isSingleKeyEvent(event)) return true;

      return !shortcuts.find(shortcut => allComboKeysPressed(shortcut.keys, event) && shortcut.keys.length > inputShortcut.keys.length);
    },
    [shortcuts]
  );

  const callCallback = useCallback(
    (shortcut: Shortcut, event: ShortcutEvent) => {
      if (event instanceof KeyboardEvent) {
        const keys = shortcut.keys.filter(withoutComboKeys);
        const valid = validateKeys(keys);
        const singleKey = shortcut.keys.length === 1 && shortcut.keys[0] === event.key;

        if (!valid || !(singleKey || getKeyCode(keys[0]) === event.code)) return;
      }

      // If the targeted element is a input for example, and the user doesn't
      // press ctrl or meta or escape it probably means that they are trying to type in the
      // input field
      const writing =
        event.target &&
        EDITABLE_TAGS.includes((event.target as HTMLElement).tagName) &&
        'code' in event &&
        event.code !== 'Escape' &&
        !event.ctrlKey &&
        !event.metaKey;

      const shouldExecAction =
        !shortcut.disabled && !writing && allComboKeysPressed(shortcut.keys, event) && shortcutHasPriority(shortcut, event);

      if (shouldExecAction) {
        // If undefined, use the default behavior which is true
        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut.onEvent(event);
      }
    },
    [shortcutHasPriority]
  );

  const handleKeyboardShortcuts = useCallback(
    (e: ShortcutEvent) => shortcuts.forEach(shortcut => callCallback(shortcut, e)),
    [shortcuts, callCallback]
  );

  const addEventListener = useCallback(
    () =>
      document.addEventListener(eventType, handleKeyboardShortcuts, {
        passive: false,
      }),
    [eventType, handleKeyboardShortcuts]
  );

  const removeEventListener = useCallback(
    () => document.removeEventListener(eventType, handleKeyboardShortcuts),
    [eventType, handleKeyboardShortcuts]
  );

  useEffect(() => {
    if (active) {
      addEventListener();
    } else {
      removeEventListener();
    }
    return removeEventListener;
  }, [active, addEventListener, removeEventListener]);
};

// TODO - swap this out for react-hotkeys-hook

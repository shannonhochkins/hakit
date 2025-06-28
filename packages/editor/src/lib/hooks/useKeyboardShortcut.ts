import { useEffect } from 'react';

type CallbackFunction = (isKeyUp?: boolean) => void;

interface ShortcutOptions {
  shift?: boolean;
  ctrl?: boolean;
  alt?: boolean;
  meta?: boolean;
}

/**
 * A custom hook that allows you to register a keyboard shortcut and execute a callback function
 * when the specified key and optional modifiers are pressed.
 *
 * @param key - The key to listen for. This should be a single character or key name (e.g., "a", "Enter").
 * @param callback - The function to execute when the keyboard shortcut is triggered.
 * @param modifiers - Optional modifiers to customize the shortcut behavior. If not provided, the default
 * behavior listens for `Ctrl` (or `Cmd` on macOS) combined with the specified key.
 *
 * @example
 * // Example 1: Registering a shortcut for "Ctrl + S"
 * useKeyboardShortcut('s', () => {
 *   console.log('Save triggered!');
 * });
 *
 * @example
 * // Example 2: Registering a shortcut for "Shift + Alt + A"
 * useKeyboardShortcut('a', () => {
 *   console.log('Custom shortcut triggered!');
 * }, { shift: true, alt: true });
 */
export function useKeyboardShortcut(
  key: string,
  callback: CallbackFunction,
  modifiers?: ShortcutOptions
): void {
  useEffect(() => {
    const handleKeyChange = (event: KeyboardEvent) => {
      const pressedKey = event.key.toLowerCase();
      const expectedKey = key.toLowerCase();
      const isKeyUp = event.type === 'keyup';

      if (modifiers) {
        const {
          shift = false,
          ctrl = false,
          alt = false,
          meta = false,
        } = modifiers;

        const modifierMatch =
          event.shiftKey === shift &&
          event.ctrlKey === ctrl &&
          event.altKey === alt &&
          event.metaKey === meta;

        if (modifierMatch && pressedKey === expectedKey) {
          event.preventDefault();
          callback(isKeyUp);
        }
      } else {
        // Default behavior: Ctrl (or Cmd) + key
        if ((event.ctrlKey || event.metaKey) && pressedKey === expectedKey) {
          event.preventDefault();
          callback(isKeyUp);
        }
      }
    };

    document.addEventListener('keydown', handleKeyChange);
    document.addEventListener('keyup', handleKeyChange);
    return () => {
      document.removeEventListener('keydown', handleKeyChange);
      document.removeEventListener('keyup', handleKeyChange);
    };
  }, [key, callback, modifiers]);
}

export function useSingleKeyboardShortcut(
  key: string,
  onKeyDown: CallbackFunction,
  onKeyUp?: CallbackFunction // Optional keyup callback
): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === key) {
        event.preventDefault(); // Prevent default only for specific keys if needed
        onKeyDown();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === key && onKeyUp) {
        onKeyUp();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [key, onKeyDown, onKeyUp]);
}

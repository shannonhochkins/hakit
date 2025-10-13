import { useSyncExternalStore, useCallback, useEffect, useMemo } from 'react';

type ValidStorageKeys = 'hassUrl' | 'hassToken' | 'panel' | 'hasCreatedAccount' | 'selectedBreakpoint';

type Value = string | null | undefined;

const getLocalStorageItem = (key: ValidStorageKeys) => {
  return window.localStorage.getItem(key);
};

export const setLocalStorageItem = <T>(key: ValidStorageKeys, value: T) => {
  const stringifiedValue = JSON.stringify(value);
  window.localStorage.setItem(key, stringifiedValue);
  dispatchStorageEvent(key, stringifiedValue);
};

const removeLocalStorageItem = (key: ValidStorageKeys) => {
  window.localStorage.removeItem(key);
  dispatchStorageEvent(key, null);
};

function dispatchStorageEvent(key: ValidStorageKeys, newValue: Value) {
  window.dispatchEvent(new StorageEvent('storage', { key, newValue }));
}

const useLocalStorageSubscribe = (callback: (this: Window, ev: StorageEvent) => void) => {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
};

const getLocalStorageServerSnapshot = () => {
  throw Error('useLocalStorage is a client-only hook');
};

/**
 * A React hook for managing localStorage state with React's concurrent features.
 *
 * This hook provides a reactive interface to localStorage that automatically
 * synchronizes across components and browser tabs. It uses React's useSyncExternalStore
 * for optimal performance and concurrent rendering compatibility.
 *
 * @template T - The type of the stored value
 * @param {ValidStorageKeys} key - The localStorage key to read from and write to
 * @param {T} [initialValue] - The initial value to use if no value exists in localStorage
 * @returns {[T, (v: T) => void]} A tuple containing the current value and a setter function
 *
 * @example
 * // Basic usage with string
 * const [name, setName] = useLocalStorage('userName', 'Anonymous');
 *
 * @example
 * // Usage with objects
 * const [settings, setSettings] = useLocalStorage('appSettings', {
 *   theme: 'light',
 *   language: 'en'
 * });
 *
 * @example
 * // Usage with arrays
 * const [items, setItems] = useLocalStorage<string[]>('todoItems', []);
 *
 * @example
 * // Removing a value (sets to null in localStorage)
 * const [token, setToken] = useLocalStorage<string | null>('authToken');
 * setToken(null); // Removes the item from localStorage
 *
 * @example
 * // Type-safe usage with interfaces
 * interface User {
 *   id: number;
 *   name: string;
 *   email: string;
 * }
 * const [user, setUser] = useLocalStorage<User | null>('currentUser', null);
 *
 * @note This is a client-only hook and will throw an error during SSR.
 * @note Values are automatically JSON.stringify'd when stored and JSON.parse'd when retrieved.
 * @note Setting a value to `null` or `undefined` will remove the item from localStorage.
 * @note Changes are automatically synchronized across all components using the same key.
 * @note Changes are also synchronized across browser tabs/windows.
 */
export function useLocalStorage<T>(key: ValidStorageKeys, initialValue?: T): [T, (v: T) => void] {
  const getSnapshot = () => getLocalStorageItem(key);

  const store = useSyncExternalStore(useLocalStorageSubscribe, getSnapshot, getLocalStorageServerSnapshot);

  const setState = useCallback(
    (v: T) => {
      try {
        const nextState = v;

        if (nextState === undefined || nextState === null) {
          removeLocalStorageItem(key);
        } else {
          setLocalStorageItem(key, nextState);
        }
      } catch (e) {
        console.warn(e);
      }
    },
    [key]
  );

  useEffect(() => {
    const currentValue = getLocalStorageItem(key);
    if (currentValue === null && typeof initialValue !== 'undefined') {
      setLocalStorageItem(key, initialValue);
    }
  }, [key, initialValue]);
  const value: T = store !== null ? (JSON.parse(store) as T) : (initialValue as T);

  return useMemo(() => [value, setState], [value, setState]);
}

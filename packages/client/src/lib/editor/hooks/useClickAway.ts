import { useRef, useLayoutEffect, useEffect } from 'react';

export function useClickAway<T extends Element>(cb: (e: Event) => void): React.RefObject<T | null> {
  const ref = useRef<T | null>(null);
  const refCb = useRef(cb);

  useLayoutEffect(() => {
    refCb.current = cb;
  });

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      const element = ref.current;
      if (element && !element.contains(e.target as Node)) {
        refCb.current(e);
      }
    };

    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);

    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, []);

  return ref;
}

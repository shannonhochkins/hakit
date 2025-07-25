import { RefObject, useEffect, useRef } from 'react';

export function usePrevious<T>(value: T): RefObject<T | undefined>['current'] {
  const ref = useRef<T>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

import { useEffect, RefObject } from 'react';

export interface ElementSize {
  width: number;
  height: number;
}

export function useElementSizeChange(ref: RefObject<HTMLElement | null>, onChange: (size: ElementSize) => void) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        onChange({ width, height });
      }
    });

    observer.observe(element);

    // Trigger once on mount
    const rect = element.getBoundingClientRect();
    onChange({ width: rect.width, height: rect.height });

    return () => observer.disconnect();
  }, [ref, onChange]);
}

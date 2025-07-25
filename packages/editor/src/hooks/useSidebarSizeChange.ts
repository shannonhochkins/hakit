import { useEffect } from 'react';

const SIDEBAR_VARIABLE_NAME = '--sidebar-panel-width';

export function useSidebarSizeChange(onChange: (newValue: string) => void, target: HTMLElement = document.documentElement) {
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const newVal = getComputedStyle(target).getPropertyValue(SIDEBAR_VARIABLE_NAME).trim();
      onChange(newVal);
    });

    observer.observe(target, {
      attributes: true,
      attributeFilter: ['style'],
    });

    // Trigger once on mount
    const initialVal = getComputedStyle(target).getPropertyValue(SIDEBAR_VARIABLE_NAME).trim();
    onChange(initialVal);

    return () => observer.disconnect();
  }, [onChange, target]);
}

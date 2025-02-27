import { DefaultComponentProps, usePuck, type ComponentData } from '@measured/puck';
import { DEFAULT_DROPZONE_NAME } from '@editor/constants';
import { useMemo } from 'react';
import { useActiveBreakpoint } from './useActiveBreakpoint';
import { transformProps } from '../helpers/breakpoints';

export function usePuckSelectedItem<T extends DefaultComponentProps>(transform?: boolean) {
  const activeBreakpoint = useActiveBreakpoint();
  const { appState } = usePuck();
  const selectedItem = appState.ui.itemSelector;
  const item = useMemo(() => {
    if (!selectedItem?.zone) {
      if (typeof selectedItem?.index === 'number') {
        return appState.data.content[selectedItem.index];
      }
    }
    return selectedItem?.zone === DEFAULT_DROPZONE_NAME
      ? appState.data.content[selectedItem?.index ?? -1]
      : appState.data.zones?.[selectedItem?.zone ?? '']?.[selectedItem?.index ?? -1];
  }, [appState.data.content, appState.data.zones, selectedItem?.index, selectedItem?.zone]);

  const transformedData = useMemo(
    () => (item && transform ? transformProps(item, activeBreakpoint) : item),
    [activeBreakpoint, transform, item]
  );

  return transformedData as ComponentData<T> | undefined;
}

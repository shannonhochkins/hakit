import { ComponentData, createUsePuck, DefaultComponentProps } from '@measured/puck';
import { DEFAULT_DROPZONE_NAME } from '@lib/constants';
import { useMemo } from 'react';

const usePuck = createUsePuck();

export function usePuckSelectedItem<T extends DefaultComponentProps>(): ComponentData<T> | undefined {
  const selectedItem = usePuck(c => c.appState.ui.itemSelector);
  const data = usePuck(c => c.appState.data);
  const item = useMemo(() => {
    if (!selectedItem?.zone) {
      if (typeof selectedItem?.index === 'number') {
        return data.content[selectedItem.index];
      }
    }
    return selectedItem?.zone === DEFAULT_DROPZONE_NAME || selectedItem?.zone === `root:${DEFAULT_DROPZONE_NAME}`
      ? data.content[selectedItem?.index ?? -1]
      : data.zones?.[selectedItem?.zone ?? '']?.[selectedItem?.index ?? -1];
  }, [data.content, data.zones, selectedItem?.index, selectedItem?.zone]);

  return item as ComponentData<T> | undefined;
}

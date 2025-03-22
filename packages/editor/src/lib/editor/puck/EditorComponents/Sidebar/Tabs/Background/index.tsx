import { Puck, usePuck } from '@measured/puck';
import { usePuckSelectedItem } from '@editor/hooks/usePuckSelectedItem';
import { TabHeading } from '../TabHeading';
import { TabPadding } from '../TabPadding';
import { useEffect, useRef } from 'react';
import { usePuckData } from '@editor/hooks/usePuckData';

export function Background() {
  const puckData = usePuckData();
  const setBackgroundSelector = useRef(false);
  const selectedItem = usePuckSelectedItem();
  const backgroundItemIndex = puckData.content.findIndex(item => item.type === 'Background');

  const { dispatch } = usePuck();

  useEffect(() => {
    // we only do this once when the tab is first rendered, other wise user selection won't work.
    if (setBackgroundSelector.current) return;
    if ((!selectedItem && backgroundItemIndex >= 0) || (selectedItem && selectedItem.type !== 'Background')) {
      setBackgroundSelector.current = true;
      dispatch({
        type: 'setUi',
        ui: {
          itemSelector: {
            index: backgroundItemIndex,
            zone: undefined,
          },
        },
        recordHistory: true,
      });
    }
  }, [selectedItem, backgroundItemIndex, dispatch]);

  if (!selectedItem) {
    return <></>;
  }
  return (
    <div>
      <TabPadding>
        <TabHeading>
          <span>{selectedItem.type + ' Options'}</span>
        </TabHeading>
      </TabPadding>
      <Puck.Fields />
    </div>
  );
}

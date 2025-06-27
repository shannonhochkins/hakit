import { Puck, createUsePuck } from '@measured/puck';
import { usePuckSelectedItem } from '@lib/hooks/usePuckSelectedItem';
import { TabHeading } from '../TabHeading';
import { TabPadding } from '../TabPadding';
import { useCallback } from 'react';
import { X } from 'lucide-react';
import { IconButton } from '@lib/page/shared/Button/IconButton';

const usePuck = createUsePuck();

export function Options() {
  const selectedItem = usePuckSelectedItem();
  const dispatch = usePuck(c => c.dispatch);
  const deselect = useCallback(() => {
    dispatch({
      type: 'setUi',
      ui: { itemSelector: null },
      recordHistory: true,
    });
  }, [dispatch]);

  if (!selectedItem) {
    return (
      <div>
        <TabPadding>
          <TabHeading>Global Options</TabHeading>
        </TabPadding>
        <TabPadding>
          <Puck.Fields wrapFields={false} />
        </TabPadding>
      </div>
    );
  }
  return (
    <div>
      <TabPadding>
        <TabHeading>
          <span>{selectedItem.type + ' Options'}</span>
          <IconButton
            onClick={deselect}
            icon={<X size={16} />}
            tooltipProps={{
              placement: 'left',
            }}
            aria-label='Deselect Component'
          ></IconButton>
        </TabHeading>
      </TabPadding>
      <Puck.Fields />
    </div>
  );
}

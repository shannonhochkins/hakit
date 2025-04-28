import { Puck, createUsePuck } from '@measured/puck';
import { usePuckSelectedItem } from '@lib/hooks/usePuckSelectedItem';
import { TabHeading } from '../TabHeading';
import { TabPadding } from '../TabPadding';
import { useCallback } from 'react';
import { X } from 'lucide-react';
import { Tooltip } from '@lib/components/Tooltip';
import { StyledIconButton } from '../../ActionBar/IconButtons';

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
          <Tooltip title='Deselect Component' placement='left'>
            <StyledIconButton onClick={deselect}>
              <X size={16} />
            </StyledIconButton>
          </Tooltip>
        </TabHeading>
      </TabPadding>
      <Puck.Fields />
    </div>
  );
}

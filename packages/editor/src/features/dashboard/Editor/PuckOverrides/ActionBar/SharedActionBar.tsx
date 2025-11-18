import { createUsePuck, useGetPuck, walkTree } from '@measured/puck';
import { Box, Copy, EllipsisVertical, Trash, X } from 'lucide-react';
import { useCallback } from 'react';
import { IconButton } from '@components/Button';
import { Menu, MenuAnchor, MenuContent, MenuItem } from '@components/Menu';
import { useGlobalStore } from '@hooks/useGlobalStore';
import { ContainerProps } from '../../InternalComponents/Container';

const usePuck = createUsePuck();

export function SharedActionBar() {
  const getPuck = useGetPuck();
  const getPermissions = usePuck(s => s.getPermissions);
  const dispatch = usePuck(s => s.dispatch);
  const itemSelector = usePuck(s => s.appState.ui.itemSelector);

  const globalPermissions = getPermissions();

  const onDuplicate = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      if (!itemSelector) return;
      const { index, zone = 'root' } = itemSelector;
      dispatch({
        type: 'duplicate',
        sourceIndex: index,
        sourceZone: zone,
      });
    },
    [itemSelector, dispatch]
  );

  const onDelete = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      if (!itemSelector) return;
      const { index, zone = 'root' } = itemSelector;
      dispatch({
        type: 'remove',
        index: index,
        zone: zone,
      });
    },
    [itemSelector, dispatch]
  );

  const deselect = useCallback(() => {
    dispatch({
      type: 'setUi',
      ui: { itemSelector: null },
      recordHistory: true,
    });
  }, [dispatch]);

  const wrapInContainer = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      const { appState, config, getItemBySelector, dispatch } = getPuck();
      const selected = appState.ui.itemSelector;
      const item = selected ? getItemBySelector(selected) : null;
      if (!item) return;
      const newContent = walkTree(appState.data, config, content => {
        return content.map(component => {
          if (component.props.id === item.props.id) {
            const container = useGlobalStore.getState().actions.createComponentInstance<ContainerProps>('Container');
            if (!container) return component;
            container.props.content = [component];
            return container;
          }
          return component;
        });
      });
      dispatch({
        type: 'setData',
        data: newContent,
      });
    },
    [getPuck]
  );

  return (
    <Menu>
      <MenuAnchor>
        <IconButton
          disabled={!itemSelector}
          size='xs'
          variant='transparent'
          aria-label={!itemSelector ? 'No component selected' : 'Component Actions'}
          aria-haspopup='menu'
          icon={<EllipsisVertical size={16} />}
        />
      </MenuAnchor>
      <MenuContent>
        <MenuItem onClick={wrapInContainer} label='Wrap in Container' startIcon={<Box size={16} />} />
        <MenuItem label='Delete' onClick={onDelete} startIcon={<Trash size={16} />} disabled={!globalPermissions.delete} />
        <MenuItem label='Duplicate' onClick={onDuplicate} startIcon={<Copy size={16} />} disabled={!globalPermissions.duplicate} />
        <MenuItem label='Deselect' onClick={deselect} startIcon={<X size={16} />} />
      </MenuContent>
    </Menu>
  );
}

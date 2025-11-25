import { createUsePuck, useGetPuck } from '@measured/puck';
import { Box, Copy, EllipsisVertical, RectangleHorizontal, RotateCcw, Trash, X } from 'lucide-react';
import { useCallback } from 'react';
import { IconButton } from '@components/Button';
import { Menu, MenuAnchor, MenuContent, MenuDivider, MenuItem } from '@components/Menu';
import { useGlobalStore } from '@hooks/useGlobalStore';
import { ContainerProps } from '../../InternalComponents/Container';
import { toast } from 'react-toastify';
import { DEFAULT_DROPZONE_NAME } from '@constants/index';

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
      const { index, zone = DEFAULT_DROPZONE_NAME } = itemSelector;
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
      const { index, zone = DEFAULT_DROPZONE_NAME } = itemSelector;
      dispatch({
        type: 'remove',
        index: index,
        zone: zone,
      });
    },
    [itemSelector, dispatch]
  );

  const deselect = useCallback(() => {
    useGlobalStore.getState().actions.deselectComponent(getPuck());
  }, [getPuck]);

  const wrapInComponent = useCallback(
    (e: React.MouseEvent<HTMLElement>, type: string) => {
      e.stopPropagation();
      const { appState, getItemBySelector, dispatch } = getPuck();
      const selected = appState.ui.itemSelector;
      const item = selected ? getItemBySelector(selected) : null;

      if (!selected || selected.zone === undefined) {
        toast.error('No selected component to wrap.');
        return;
      }
      if (!item) {
        toast.error('No component data found to wrap.');
      }
      const container = useGlobalStore.getState().actions.createComponentInstance<ContainerProps>(type);
      if (!container) {
        toast.error(`Unable to create "${type}" component.`);
        return;
      }
      // first, delete the existing item
      dispatch({
        type: 'remove',
        index: selected.index,
        zone: selected.zone,
      });
      // then insert the container at the same index
      dispatch({
        type: 'insert',
        destinationIndex: selected.index,
        destinationZone: selected.zone,
        componentType: container.type,
        id: container.props.id,
      });
      // now, replace the component to update the "content" property
      dispatch({
        type: 'replace',
        destinationIndex: selected.index,
        destinationZone: selected.zone,
        data: {
          type: container.type,
          props: {
            ...container.props,
            content: [item],
          },
        },
      });
    },
    [getPuck]
  );

  const resetComponentToDefaults = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      const { appState, config, getItemBySelector, dispatch } = getPuck();
      const selected = appState.ui.itemSelector;
      const item = selected ? getItemBySelector(selected) : null;
      const type = item?.type;
      const componentConfig = type ? config.components[type] : null;
      if (!item || !type || !componentConfig?.defaultProps || !selected?.zone) {
        toast.error('Unable to reset component to defaults.');
        return;
      }
      dispatch({
        type: 'replace',
        destinationIndex: selected.index,
        destinationZone: selected.zone,
        data: {
          type: type,
          props: {
            ...componentConfig.defaultProps,
            // Preserve the id of the existing component
            id: item.props.id,
          },
        },
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
        <MenuItem onClick={e => wrapInComponent(e, 'Container')} label='Wrap in Container' startIcon={<Box size={16} />} />
        <MenuItem onClick={e => wrapInComponent(e, 'Card')} label='Wrap in Card' startIcon={<RectangleHorizontal size={16} />} />
        <MenuItem label='Delete' onClick={onDelete} startIcon={<Trash size={16} />} disabled={!globalPermissions.delete} />
        <MenuItem label='Duplicate' onClick={onDuplicate} startIcon={<Copy size={16} />} disabled={!globalPermissions.duplicate} />
        <MenuDivider />
        <MenuItem label='Reset to defaults' onClick={resetComponentToDefaults} startIcon={<RotateCcw size={16} />} />
        <MenuDivider />
        <MenuItem label='Deselect' onClick={deselect} startIcon={<X size={16} />} />
      </MenuContent>
    </Menu>
  );
}

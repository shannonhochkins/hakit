import { ComponentData, createUsePuck, ActionBar as PuckActionBar, Slot, useGetPuck, walkTree } from '@measured/puck';
import { ArrowDown, ArrowUp, Box, Copy, CornerLeftUp, DotIcon, Trash } from 'lucide-react';
import { PopupProps } from '../../InternalComponents/Popup';
import { useCallback, useMemo, useState } from 'react';
import { usePopupStore } from '@hooks/usePopupStore';
import { IconButton } from '@components/Button';
import styles from './ActionBar.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
import { Menu, MenuItem } from '@components/Menu';
import { usePuckIframeElements } from '@hooks/usePuckIframeElements';
import { useGlobalStore } from '@hooks/useGlobalStore';
import { ContainerProps } from '../../InternalComponents/Container';

const cn = getClassNameFactory('ActionBar', styles);

const usePuck = createUsePuck();

export function ActionBar() {
  const getPuck = useGetPuck();
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const selectedItem = usePuck(s => s.selectedItem);
  const getPermissions = usePuck(s => s.getPermissions);
  const dispatch = usePuck(s => s.dispatch);
  const appState = usePuck(s => s.appState);
  const config = usePuck(s => s.config);
  const puckElements = usePuckIframeElements();
  // const refreshPermissions = usePuck((s) => s.refreshPermissions);
  const itemSelector = usePuck(s => s.appState.ui.itemSelector);
  const getItemBySelector = usePuck(s => s.getItemBySelector);
  const getSelectorForId = usePuck(s => s.getSelectorForId);
  const getItemById = usePuck(s => s.getItemById);
  const selectedNode = itemSelector ? getItemBySelector(itemSelector) : null;
  const isPopup = selectedNode?.type === 'Popup';
  const popup = isPopup ? (selectedNode as ComponentData<PopupProps>) : null;

  const globalPermissions = getPermissions();

  let parentId: string | null = null;
  walkTree(appState.data, config, (content, options) => {
    return content.map(component => {
      if (component.props.id === selectedNode?.props.id) {
        parentId = options.parentId;
      }
      return component;
    });
  });
  const isRoot = parentId === 'root' || parentId === null;
  // console.log('ActionBarData', {
  //   parentId,
  //   isRoot,
  //   selectedNode,
  //   itemSelector,
  // });

  const onSelectPopupParent = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      usePopupStore.getState().closePopup(popup!.props.id);
      const relatedComponentId = popup?.props.relatedComponentId;
      if (relatedComponentId) {
        const itemSelector = getSelectorForId(relatedComponentId);
        if (itemSelector) {
          dispatch({
            type: 'setUi',
            ui: {
              itemSelector,
            },
            recordHistory: true,
          });
        }
      }
    },
    [dispatch, getSelectorForId, popup]
  );

  const onSelectParent = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      if (parentId) {
        const selector = getSelectorForId(parentId);
        if (selector) {
          console.log('sending select parent action', { selector });

          dispatch({
            type: 'setUi',
            ui: {
              itemSelector: selector,
            },
            recordHistory: true,
          });
        }
      }
    },
    [getSelectorForId, dispatch, parentId]
  );

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

  const onMoveUp = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      if (!itemSelector) return;
      const { index, zone = 'root' } = itemSelector;
      if (index <= 0) return;
      dispatch({
        type: 'reorder',
        sourceIndex: index,
        destinationIndex: index - 1,
        destinationZone: zone,
      });
      // now select the moved item
      requestAnimationFrame(() => {
        dispatch({
          type: 'setUi',
          ui: {
            itemSelector: {
              index: index - 1,
              zone: zone,
            },
          },
          recordHistory: true,
        });
      });
    },
    [itemSelector, dispatch]
  );

  const onMoveDown = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      if (!itemSelector || !parentId) return;
      const { index, zone = 'root' } = itemSelector;
      const selector = getItemById(parentId) as ComponentData<{
        content: Slot;
      }>;
      const contentArray = selector?.props.content || [];
      // check if the new index would be out of bounds
      if (index >= contentArray.length - 1) return;
      dispatch({
        type: 'reorder',
        sourceIndex: index,
        destinationIndex: index + 1,
        destinationZone: zone,
      });
      // now select the moved item
      requestAnimationFrame(() => {
        dispatch({
          type: 'setUi',
          ui: {
            itemSelector: {
              index: index + 1,
              zone: zone,
            },
          },
          recordHistory: true,
        });
      });
    },
    [itemSelector, getItemById, parentId, dispatch]
  );

  const parentAction = useMemo(() => {
    if (isPopup) return null;
    if (isRoot) return null;
    if (!parentId) return null;
    return (
      <IconButton
        size='xs'
        variant='transparent'
        aria-label='Select Parent Component'
        tooltipProps={{
          basic: true,
        }}
        icon={<CornerLeftUp size={16} />}
        onClick={onSelectParent}
      />
    );
  }, [isPopup, isRoot, parentId, onSelectParent]);

  const copyAction = useMemo(() => {
    if (!globalPermissions.duplicate) return null;
    return (
      <IconButton
        size='xs'
        variant='transparent'
        aria-label='Duplicate Component'
        tooltipProps={{
          basic: true,
        }}
        icon={<Copy size={16} />}
        onClick={onDuplicate}
      />
    );
  }, [globalPermissions.duplicate, onDuplicate]);

  const deleteAction = useMemo(() => {
    if (!globalPermissions.delete) return null;
    return (
      <IconButton
        size='xs'
        variant='transparent'
        aria-label='Delete Component'
        tooltipProps={{
          basic: true,
        }}
        icon={<Trash size={16} />}
        onClick={onDelete}
      />
    );
  }, [globalPermissions.delete, onDelete]);

  const moveUpAction = useMemo(() => {
    if (!globalPermissions.edit || !globalPermissions.drag || !itemSelector) return null;
    const disabled = itemSelector.index <= 0;
    return (
      <IconButton
        size='xs'
        variant='transparent'
        aria-label='Move Up'
        disabled={disabled}
        tooltipProps={{
          basic: true,
        }}
        icon={<ArrowUp size={16} />}
        onClick={onMoveUp}
      />
    );
  }, [globalPermissions.edit, globalPermissions.drag, onMoveUp, itemSelector]);

  const selectLinkedComponentAction = useMemo(() => {
    return (
      <IconButton
        size='xs'
        variant='transparent'
        aria-label='Select Linked Component'
        tooltipProps={{
          basic: true,
        }}
        icon={<CornerLeftUp size={16} />}
        onClick={onSelectPopupParent}
      />
    );
  }, [onSelectPopupParent]);

  const moveDownAction = useMemo(() => {
    if (!globalPermissions.edit || !globalPermissions.drag || !parentId || !itemSelector) return null;
    const selector = getItemById(parentId) as ComponentData<{
      content: Slot;
    }>;
    const contentArray = selector?.props.content || [];
    // check if the new index would be out of bounds
    const disabled = itemSelector?.index >= contentArray.length - 1;
    return (
      <IconButton
        size='xs'
        variant='transparent'
        aria-label='Move Down'
        disabled={disabled}
        tooltipProps={{
          basic: true,
        }}
        icon={<ArrowDown size={16} />}
        onClick={onMoveDown}
      />
    );
  }, [globalPermissions.edit, globalPermissions.drag, onMoveDown, parentId, getItemById, itemSelector]);

  const handleMenuClose = useCallback(() => {
    setMenuAnchorEl(null);
  }, []);

  const additionalActionsMenu = useMemo(() => {
    return (
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        doc={puckElements?.document ?? document}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuItem
          onClick={() => {
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
          }}
          startIcon={<Box size={16} />}
        >
          Wrap in Container
        </MenuItem>
      </Menu>
    );
  }, [menuAnchorEl, handleMenuClose, puckElements, getPuck]);

  const handleAdditionalActionsClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      const sameAnchor = menuAnchorEl && e.currentTarget === menuAnchorEl;

      if (menuAnchorEl && sameAnchor) {
        // Toggle close if clicking the active trigger again
        handleMenuClose();
        return;
      }

      setMenuAnchorEl(e.currentTarget);
    },
    [handleMenuClose, menuAnchorEl]
  );

  if (!selectedItem)
    return (
      <div className={cn()}>
        <PuckActionBar.Group>{parentAction}</PuckActionBar.Group>
        <PuckActionBar.Group>
          {moveUpAction}
          {moveDownAction}
        </PuckActionBar.Group>
        <PuckActionBar.Group>
          {copyAction}
          {deleteAction}
        </PuckActionBar.Group>
        <PuckActionBar.Group>
          <IconButton
            size='xs'
            variant='transparent'
            aria-label='Additional Actions'
            aria-haspopup='menu'
            aria-expanded={Boolean(menuAnchorEl)}
            tooltipProps={{ basic: true }}
            icon={<DotIcon size={16} />}
            onClick={handleAdditionalActionsClick}
          />
          {additionalActionsMenu}
        </PuckActionBar.Group>
      </div>
    );

  return (
    <div className={cn()}>
      <PuckActionBar.Group>{isPopup ? selectLinkedComponentAction : parentAction}</PuckActionBar.Group>
      <PuckActionBar.Group>
        {moveUpAction}
        {moveDownAction}
      </PuckActionBar.Group>
      <PuckActionBar.Group>
        {copyAction}
        {deleteAction}
      </PuckActionBar.Group>
      <PuckActionBar.Group>
        <IconButton
          size='xs'
          variant='transparent'
          aria-label='Additional Actions'
          aria-haspopup='menu'
          aria-expanded={Boolean(menuAnchorEl)}
          tooltipProps={{ basic: true }}
          icon={<DotIcon size={16} />}
          onClick={handleAdditionalActionsClick}
        />
        {additionalActionsMenu}
      </PuckActionBar.Group>
    </div>
  );
}

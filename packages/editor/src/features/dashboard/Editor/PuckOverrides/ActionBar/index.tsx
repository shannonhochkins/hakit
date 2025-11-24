import { ComponentData, createUsePuck, Slot, walkTree, useGetPuck } from '@measured/puck';
import { ArrowDown, ArrowUp, CornerLeftUp } from 'lucide-react';
import { PopupProps } from '../../InternalComponents/Popup';
import { useCallback, useMemo } from 'react';
import { usePopupStore } from '@hooks/usePopupStore';
import { IconButton } from '@components/Button';
import styles from './ActionBar.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
import { SharedActionBar } from './SharedActionBar';
import { COMPONENT_TYPE_DELIMITER } from '@helpers/editor/pageData/constants';
import { toast } from 'react-toastify';
import { DEFAULT_DROPZONE_NAME } from '@constants/index';
import { useGlobalStore } from '@hooks/useGlobalStore';

const cn = getClassNameFactory('ActionBar', styles);

const usePuck = createUsePuck();

export function ActionBar() {
  const getPuck = useGetPuck();
  const selectedItem = usePuck(s => s.selectedItem);
  const getPermissions = usePuck(s => s.getPermissions);
  const dispatch = usePuck(s => s.dispatch);
  const appState = usePuck(s => s.appState);
  const config = usePuck(s => s.config);
  const itemSelector = usePuck(s => s.appState.ui.itemSelector);
  const getItemBySelector = usePuck(s => s.getItemBySelector);
  const getSelectorForId = usePuck(s => s.getSelectorForId);
  const getItemById = usePuck(s => s.getItemById);
  const selectedNode = itemSelector ? getItemBySelector(itemSelector) : null;
  const isPopup = selectedNode?.type?.startsWith(`Popup${COMPONENT_TYPE_DELIMITER}@hakit`);
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

  const onSelectPopupParent = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      usePopupStore.getState().closePopup(popup!.props.id);
      const relatedComponentId = popup?.props.relatedComponentId;

      if (relatedComponentId) {
        useGlobalStore.getState().actions.selectComponentById(relatedComponentId, getPuck());
      } else {
        toast.info('This popup is not linked to any component.');
      }
    },
    [getPuck, popup]
  );

  const onSelectParent = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      if (parentId) {
        const selector = getSelectorForId(parentId);
        if (selector) {
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

  const onMoveUp = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      if (!itemSelector) return;
      const { index, zone = DEFAULT_DROPZONE_NAME } = itemSelector;
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
      const { index, zone = DEFAULT_DROPZONE_NAME } = itemSelector;
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

  if (!selectedItem)
    return (
      <div className={cn()}>
        {parentAction && <div className={cn('group')}>{parentAction}</div>}
        <div className={cn('group')}>
          {moveUpAction}
          {moveDownAction}
        </div>
        <div className={cn('group')}>
          <SharedActionBar />
        </div>
      </div>
    );
  const parentActionEl = isPopup ? selectLinkedComponentAction : parentAction;
  return (
    <div className={cn()}>
      {parentActionEl && <div className={cn('group')}>{parentActionEl}</div>}
      <div className={cn('group')}>
        {moveUpAction}
        {moveDownAction}
      </div>
      <div className={cn('group')}>
        <SharedActionBar />
      </div>
    </div>
  );
}

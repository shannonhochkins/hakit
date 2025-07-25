import { ActionBar, ComponentConfig, createUsePuck } from '@measured/puck';
import { useCallback } from 'react';
import { Copy, Trash } from 'lucide-react';

const usePuck = createUsePuck();

export function Actions(permissions: ComponentConfig['permissions']) {
  const appState = usePuck(c => c.appState);
  const dispatch = usePuck(c => c.dispatch);
  const { index, zone } = appState.ui.itemSelector ?? {};

  const onDelete = useCallback(() => {
    if (typeof index !== 'number' || typeof zone !== 'string') return;
    dispatch({
      type: 'remove',
      index,
      zone,
    });
  }, [index, zone, dispatch]);

  const onDuplicate = useCallback(() => {
    if (typeof index !== 'number' || typeof zone !== 'string') return;
    dispatch({
      type: 'duplicate',
      sourceIndex: index,
      sourceZone: zone,
    });
  }, [index, zone, dispatch]);

  const actions = [
    {
      label: 'Delete',
      onClick: onDelete,
      disabled: !permissions?.delete,
      icon: <Trash size={16} />,
    },
    {
      label: 'Duplicate',
      onClick: onDuplicate,
      disabled: !permissions?.duplicate,
      icon: <Copy size={16} />,
    },
  ];

  return (
    <ActionBar>
      <ActionBar.Group>
        {actions
          .filter(action => !action.disabled)
          .map(({ label, icon, onClick }) => (
            <ActionBar.Action key={label} onClick={onClick}>
              {icon}
            </ActionBar.Action>
          ))}
      </ActionBar.Group>
    </ActionBar>
  );
}

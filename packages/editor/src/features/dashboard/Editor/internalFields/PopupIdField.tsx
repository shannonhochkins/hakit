import { Row } from '@components/Layout';
import { ComponentData, createUsePuck, CustomFieldRender, setDeep } from '@measured/puck';
import { useGlobalStore } from '@hooks/useGlobalStore';
import { toast } from 'react-toastify';
import { usePopupStore } from '@hooks/usePopupStore';
import type { PopupProps } from '../InternalComponents/Popup';
import styles from './PopupIdField.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
import { IconButton, SecondaryButton } from '@components/Button';
import { Plus, SquareArrowOutUpRight, Trash } from 'lucide-react';
const usePuck = createUsePuck();

const cn = getClassNameFactory('PopupIdField', styles);

export const PopupIdField: CustomFieldRender<string> = ({ value, onChange }: Parameters<CustomFieldRender<string>>[0]) => {
  const dispatch = usePuck(s => s.dispatch);
  const state = usePuck(s => s.appState);
  const getSelectorForId = usePuck(s => s.getSelectorForId);
  const getItemBySelector = usePuck(s => s.getItemBySelector);
  const currentComponent = state.ui.itemSelector ? getItemBySelector(state.ui.itemSelector) : null;
  const hasPopupLinked = usePopupStore(store => store.popups.find(p => p.id === value)) !== undefined;
  // an auto complete, populated with all existing popups
  // and a button to "create" a new popup, which will assign the id of the popup via onchange once created
  // this will need to be done via the puck api
  // popups will be pushed to the root content and all rendered at the same level
  // onChange should only be triggered with a qualified id
  // dropdown should pre-select the current value if it exists
  // use a new store to maintain/manage available popups
  // need a way to "remove/delete" a popup as well
  const handleInsertPopup = () => {
    dispatch({
      type: 'setData',
      data(previous) {
        // creates an instance of the component with the default props
        const newPopup = useGlobalStore.getState().actions.createComponentInstance<PopupProps>('Popup');
        if (!newPopup) {
          toast.error('Failed to create new popup');
          return previous;
        }
        const root = previous.root.props ?? {};
        // if we have it, assign the relatedComponentId, this will be useful when closing the popup, deleting the popup
        // we can try to focus the parent component again
        if (currentComponent) {
          newPopup.props.relatedComponentId = currentComponent.props.id;
        }
        // push into the root content array to render at the same level
        const content: ComponentData[] = 'content' in root ? ((root.content as ComponentData[]) ?? []) : [];
        const newContent = [...content, newPopup];
        onChange(newPopup.props.id);
        // update the array property with the new array
        return setDeep(previous, `root.props.content`, newContent);
      },
    });
  };
  const handleRemovePopup = () => {
    if (!value) return;
    dispatch({
      type: 'setData',
      data(previous) {
        const root = previous.root.props ?? {};
        // remove from the root content array
        const content: ComponentData[] = 'content' in root ? ((root.content as ComponentData[]) ?? []) : [];
        const newContent = content.filter(c => c.props.id !== value);
        // update the array property with the new array
        usePopupStore.getState().removePopup(value);
        onChange('');
        return setDeep(previous, `root.props.content`, newContent);
      },
    });
  };
  const openPopup = () => {
    if (!value) return;
    usePopupStore.getState().openPopup(value);
    const itemSelector = getSelectorForId(value);
    if (itemSelector) {
      dispatch({
        type: 'set',
        state: {
          ...state,
          ui: {
            ...state.ui,
            itemSelector,
          },
        },
      });
    } else {
      console.error('Failed to find selector for popup id', value);
    }
  };
  return (
    <>
      <div
        className={cn({
          PopupIdField: true,
        })}
      >
        <hr className={cn('divider')} />
        <p>Popup Configuration</p>
        <span className={cn('status')}>
          <span
            className={cn({
              orb: true,
              'orb-success': hasPopupLinked,
              'orb-warning': !hasPopupLinked,
            })}
          />
          <span>{!hasPopupLinked ? 'No popup created' : 'Popup created'}</span>
        </span>
        {hasPopupLinked && (
          <Row wrap='nowrap' gap={'var(--space-2)'} justifyContent='space-between' alignItems='center'>
            <SecondaryButton
              size='sm'
              fullWidth
              startIcon={<SquareArrowOutUpRight size={16} />}
              onClick={openPopup}
              aria-label='Open Popup'
              style={{
                borderRadius: 'var(--radius-sm)',
              }}
            >
              Open Popup
            </SecondaryButton>
            <IconButton variant='error' icon={<Trash size={16} />} onClick={handleRemovePopup} aria-label='Remove Popup' />
          </Row>
        )}
        {!hasPopupLinked && (
          <SecondaryButton
            style={{
              borderRadius: 'var(--radius-sm)',
            }}
            startIcon={<Plus size={16} />}
            aria-label='Create Popup'
            size='sm'
            fullWidth
            onClick={handleInsertPopup}
          >
            Create Popup
          </SecondaryButton>
        )}
      </div>
    </>
  );
};

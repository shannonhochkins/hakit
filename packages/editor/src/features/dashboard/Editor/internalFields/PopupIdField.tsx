import { Row } from '@components/Layout';
import { ComponentData, createUsePuck, CustomFieldRender, setDeep } from '@measured/puck';
import { useGlobalStore } from '@hooks/useGlobalStore';
import { toast } from 'react-toastify';
import { usePopupStore } from '@hooks/usePopupStore';
import type { PopupProps } from '../InternalComponents/Popup';
import styles from './PopupIdField.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
import { IconButton, SecondaryButton } from '@components/Button';
import { Plus, SquareArrowOutUpRight, Trash, X } from 'lucide-react';
import { SelectField } from '@components/Form/Field/Select';
const usePuck = createUsePuck();

const cn = getClassNameFactory('PopupIdField', styles);

export const PopupIdField: CustomFieldRender<string> = ({ value, onChange, id }: Parameters<CustomFieldRender<string>>[0]) => {
  const dispatch = usePuck(s => s.dispatch);
  const state = usePuck(s => s.appState);
  const getSelectorForId = usePuck(s => s.getSelectorForId);
  const getItemBySelector = usePuck(s => s.getItemBySelector);
  const getItemById = usePuck(s => s.getItemById);
  const currentComponent = state.ui.itemSelector ? getItemBySelector(state.ui.itemSelector) : null;
  const popups = usePopupStore(store => store.popups);
  const hasPopupLinked = popups.find(p => p.id === value) !== undefined;
  const existingPopupComponents = popups
    .map(p => getItemById(p.id))
    .filter((c): c is ComponentData<PopupProps> => !!c && c.type === 'Popup');
  // an auto complete, populated with all existing popups
  // and a button to "create" a new popup, which will assign the id of the popup via onchange once created
  // this will need to be done via the puck api
  // popups will be pushed to the root content and all rendered at the same level
  // onChange should only be triggered with a qualified id
  // dropdown should pre-select the current value if it exists
  // use a new store to maintain/manage available popups
  // need a way to "remove/delete" a popup as well
  const handleInsertPopup = () => {
    let id: string | undefined;
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
        // push into the root popupContent array to render at the same level
        const popupContent: ComponentData[] = 'popupContent' in root ? ((root.popupContent as ComponentData[]) ?? []) : [];
        const newContent = [...popupContent, newPopup];
        onChange(newPopup.props.id);
        id = newPopup.props.id;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            openPopup(id);
          });
        });
        // update the array property with the new array
        return setDeep(previous, `root.props.popupContent`, newContent);
      },
    });
  };
  const handleDeselectPopup = () => {
    onChange('');
  };
  const handleRemovePopup = () => {
    if (!value) return;
    dispatch({
      type: 'setData',
      data(previous) {
        const root = previous.root.props ?? {};
        // remove from the root popupContent array
        const popupContent: ComponentData[] = 'popupContent' in root ? ((root.popupContent as ComponentData[]) ?? []) : [];
        const newContent = popupContent.filter(c => c.props.id !== value);
        // update the array property with the new array
        usePopupStore.getState().removePopup(value);
        onChange('');
        return setDeep(previous, `root.props.popupContent`, newContent);
      },
    });
  };
  const openPopup = (id?: string) => {
    const popupToOpen = id || value;
    if (!popupToOpen) return;
    usePopupStore.getState().openPopup(popupToOpen);
    const itemSelector = getSelectorForId(popupToOpen);
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

  const options = existingPopupComponents.map(c => ({ label: c.props.title || 'Popup', value: c.props.id }));
  const selectValue = options.find(o => o.value === value);

  return (
    <>
      <div
        className={cn({
          PopupIdField: true,
        })}
      >
        <hr className={cn('divider')} />
        <p>Popup Configuration</p>
        <Row fullWidth wrap='nowrap' gap={'var(--space-2)'} justifyContent='space-between' alignItems='center'>
          <SelectField
            id={`popup-selector-${id}`}
            name={`popup-selector-${id}`}
            value={selectValue}
            options={options}
            onChange={option => {
              onChange(option ? option.value : '');
            }}
            startAdornment={
              <span
                className={cn({
                  orb: true,
                  'orb-success': hasPopupLinked,
                  'orb-warning': !hasPopupLinked,
                })}
              />
            }
            disabled={options.length === 0}
            placeholder={options.length === 0 ? 'No Popups Available' : 'Select Existing Popup...'}
          />
          <IconButton
            disabled={!hasPopupLinked}
            variant='secondary'
            icon={<X size={18} />}
            onClick={handleDeselectPopup}
            aria-label='Unlink Popup'
          />
        </Row>
        <Row wrap='nowrap' gap={'var(--space-2)'} justifyContent='space-between' alignItems='center'>
          <SecondaryButton
            size='sm'
            startIcon={<SquareArrowOutUpRight size={16} />}
            onClick={() => openPopup()}
            aria-label='Open Popup'
            fullWidth
            disabled={!hasPopupLinked}
            style={{
              borderRadius: 'var(--radius-sm)',
            }}
          >
            Open
          </SecondaryButton>
          <SecondaryButton
            style={{
              borderRadius: 'var(--radius-sm)',
            }}
            startIcon={<Plus size={16} />}
            aria-label='Create Popup'
            fullWidth
            size='sm'
            onClick={handleInsertPopup}
          >
            New
          </SecondaryButton>
          <IconButton
            disabled={!hasPopupLinked}
            variant='error'
            icon={<Trash size={18} />}
            onClick={handleRemovePopup}
            aria-label='Delete Popup'
          />
        </Row>
      </div>
    </>
  );
};

import { Row } from '@components/Layout';
import { ComponentData, createUsePuck, useGetPuck, CustomFieldRender } from '@measured/puck';
import { useGlobalStore } from '@hooks/useGlobalStore';
import { toast } from 'react-toastify';
import { usePopupStore } from '@hooks/usePopupStore';
import type { PopupProps } from '../InternalComponents/Popup';
import styles from './PopupIdField.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
import { IconButton, SecondaryButton } from '@components/Button';
import { Plus, SquareArrowOutUpRight, Trash, X } from 'lucide-react';
import { SelectField } from '@components/Form/Field/Select';
import { COMPONENT_TYPE_DELIMITER, DEFAULT_POPUP_ZONE } from '@helpers/editor/pageData/constants';
const usePuck = createUsePuck();

const cn = getClassNameFactory('PopupIdField', styles);

export const PopupIdField: CustomFieldRender<string> = ({ value, onChange, id }: Parameters<CustomFieldRender<string>>[0]) => {
  const getPuck = useGetPuck();
  const getItemById = usePuck(s => s.getItemById);
  const popups = usePopupStore(store => store.popups);
  const hasPopupLinked = popups.find(p => p.id === value) !== undefined;
  const existingPopupComponents = popups
    .map(p => getItemById(p.id))
    .filter((c): c is ComponentData<PopupProps> => !!c && c.type.startsWith(`Popup${COMPONENT_TYPE_DELIMITER}@hakit`));
  // an auto complete, populated with all existing popups
  // and a button to "create" a new popup, which will assign the id of the popup via onchange once created
  // this will need to be done via the puck api
  // popups will be pushed to the root content and all rendered at the same level
  // onChange should only be triggered with a qualified id
  // dropdown should pre-select the current value if it exists
  // use a new store to maintain/manage available popups
  // need a way to "remove/delete" a popup as well
  const handleInsertPopup = () => {
    const { dispatch, appState, getItemBySelector } = getPuck();
    const currentComponent = appState.ui.itemSelector ? getItemBySelector(appState.ui.itemSelector) : null;
    const root = appState.data.root;
    const newPopup = useGlobalStore.getState().actions.createComponentInstance<PopupProps>('Popup');
    if (!newPopup) {
      return;
    }
    // if we have it, assign the relatedComponentId, this will be useful when closing the popup, deleting the popup
    // we can try to focus the parent component again
    if (currentComponent) {
      newPopup.props.relatedComponentId = currentComponent.props.id;
    }
    const popupContent: ComponentData[] = 'popupContent' in root ? ((root.popupContent as ComponentData[]) ?? []) : [];
    dispatch({
      type: 'insert',
      componentType: newPopup.type,
      destinationIndex: popupContent.length, // append to end
      destinationZone: DEFAULT_POPUP_ZONE,
      id: newPopup.props.id,
    });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // if we have it, assign the relatedComponentId, this will be useful when closing the popup, deleting the popup
        // we can try to focus the parent component again
        if (currentComponent) {
          newPopup.props.relatedComponentId = currentComponent.props.id;
        }
        dispatch({
          type: 'replace',
          destinationIndex: popupContent.length,
          destinationZone: DEFAULT_POPUP_ZONE,
          data: {
            type: newPopup.type,
            props: {
              ...newPopup.props,
            },
          },
        });
        onChange(newPopup.props.id);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            openPopup(newPopup.props.id);
          });
        });
      });
    });
  };
  const handleDeselectPopup = () => {
    onChange('');
  };
  const handleRemovePopup = () => {
    if (!value) return;
    const { dispatch, getSelectorForId } = getPuck();
    const selector = getSelectorForId(value);
    if (!selector) {
      toast.error('Unable to find the popup to delete.');
      return;
    }
    dispatch({
      type: 'remove',
      ...selector,
    });
    onChange('');
  };
  const openPopup = (id?: string) => {
    const popupToOpen = id || value;
    if (!popupToOpen) return;
    usePopupStore.getState().openPopup(popupToOpen);
    useGlobalStore.getState().actions.selectComponentById(popupToOpen, getPuck());
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
            placeholder={options.length === 0 ? 'No Popups' : 'Select Existing Popup...'}
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
            variant='danger'
            icon={<Trash size={18} />}
            onClick={handleRemovePopup}
            aria-label='Delete Popup'
          />
        </Row>
      </div>
    </>
  );
};

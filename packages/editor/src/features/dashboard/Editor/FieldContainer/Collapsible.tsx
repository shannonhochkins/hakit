import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { createUsePuck, UiState, type DefaultComponentProps } from '@measured/puck';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { FieldConfiguration } from '@typings/fields';
import { Fieldset } from './Fieldset';
import { FieldLabel } from '@components/Form/Field/_shared/FieldLabel';
import { FieldWrapper } from './FieldWrapper';
import { ICON_MAP } from './constants';
import { CustomAutoField } from './CustomAutoField';
import styles from './FieldContainer.module.css';
import { IconButton } from '@components/Button';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
import { AutoHeight } from '@components/AutoHeight';
import { HelperText } from '@components/Form/Field/_shared/HelperText';
import { Row } from '@components/Layout';

const usePuck = createUsePuck();

const getClassName = getClassNameFactory('CollapsibleFieldWrapper', styles);
/**
 * Helper function to create custom fields (cf - custom field)
 */

export type CollapsibleFieldComponentProps<Props extends DefaultComponentProps = DefaultComponentProps> = {
  // these excluded field types render differently and don't need all these fancy changes
  field: Extract<FieldConfiguration[string], { type: 'object' | 'array' }>;
  name: string;
  onChange: (value: Props) => void;
  value: Props;
  id: string;
};

export function CollapsibleFieldWrapper<Props extends DefaultComponentProps = DefaultComponentProps>({
  field,
  name,
  onChange: puckOnChange,
  // NOTE: Important we don't transform the value here for objects/arrays, each field type handles this via the Standard field type
  value,
  id,
}: CollapsibleFieldComponentProps<Props>) {
  const addonId = 'addonId' in field ? (field.addonId as string) : undefined;
  const [isExpanded, toggleExpanded] = useState(field.section ? (field.section?.expanded ?? false) : false);
  const _icon = useMemo(() => field.icon ?? ICON_MAP[field.type], [field.icon, field.type]);
  const selectedItem = usePuck(state => state.selectedItem);
  const appState = usePuck(state => state.appState);
  const itemOrRoot = selectedItem ?? appState.data.root;
  const selectedItemOrRootProps = useMemo(() => itemOrRoot?.props, [itemOrRoot]);

  const onChange = useCallback(
    (value: unknown, uiState?: Partial<UiState>) => {
      if (typeof value === 'undefined') return;
      // we don't need to transform the value here for objects/arrays, each field type handles this via the Standard field type
      // object/array fields don't support responsive values, we we just send back the value here
      // @ts-expect-error - Types are wrong in internal types for puck, uiState is required
      puckOnChange(value, uiState);
    },
    [puckOnChange]
  );

  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const isVisible = useMemo(() => {
    if (typeof field.visible === 'function') {
      // If there's no expected selectedItem, we can assume the root options should be shown
      const visibleData = selectedItemOrRootProps ? selectedItemOrRootProps : appState.data.root?.props;
      if (!visibleData) return;
      // when a addonId is available, we're a root component field and we need to only send a subset of data
      const data = addonId ? visibleData[addonId] : visibleData;
      return field.visible(data);
    }
    return field.visible ?? true;
  }, [selectedItemOrRootProps, appState, field, addonId]);

  const onToggleExpand = useCallback(() => {
    toggleExpanded(prev => !prev);
  }, []);

  const onFieldsetClick = useCallback(
    (e: React.MouseEvent<HTMLFieldSetElement | HTMLDivElement>) => {
      e.stopPropagation();
      onToggleExpand();
    },
    [onToggleExpand]
  );

  const className = getClassName(
    {
      CollapsibleFieldWrapper: true,
      collapsed: !isExpanded,
      expanded: isExpanded,
    },
    field.className
  );

  const fieldLabelClassName = getClassName(
    'FieldLabel',
    {
      collapsed: !isExpanded,
      expanded: isExpanded,
      collapsible: true,
    },
    `field-label ${field.type ? `field-${field.type}` : ''}`
  );

  const fieldLabelLabelClassName = getClassName(
    'FieldLabel',
    {
      color: true,
    },
    `field-label ${field.type ? `field-${field.type}` : ''}`
  );

  const styles = useMemo(() => {
    return {
      display: isVisible ? 'block' : 'none',
    };
  }, [isVisible]);

  const fieldsetClassName = useMemo(() => {
    return `hakit-field ${className} ${field.type ? `field-${field.type}` : ''}`;
  }, [className, field.type]);

  return (
    <Fieldset style={styles} id={id} className={fieldsetClassName} onClick={onFieldsetClick}>
      <FieldLabel
        label={field.label}
        icon={_icon}
        readOnly={field.readOnly}
        className={fieldLabelClassName}
        labelClassName={fieldLabelLabelClassName}
        iconClassName={fieldLabelLabelClassName}
        endAdornment={
          <IconButton
            icon={isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            onClick={onFieldsetClick}
            variant='transparent'
            size='xs'
            tooltipProps={{
              placement: 'left',
            }}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          />
        }
      />
      {field.description && isExpanded && (
        <Row alignItems='flex-start' justifyContent='flex-start' gap='var(--space-2)' className={getClassName('helperTextRow')}>
          <HelperText helperText={field.description} />
        </Row>
      )}

      <AutoHeight isOpen={isExpanded} duration={300} renderChildren>
        {isExpanded && (
          <FieldWrapper className='hakit-field-wrapper'>
            <div className={getClassName('fieldInput')}>
              <CustomAutoField field={field} name={name} onChange={onChange} value={value} id={id} icon={_icon} fieldLabel={field.label} />
            </div>
          </FieldWrapper>
        )}
      </AutoHeight>
    </Fieldset>
  );
}

import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { UiState, useGetPuck, type DefaultComponentProps } from '@measured/puck';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { FieldConfiguration } from '@typings/fields';
import { Fieldset } from './Fieldset';
import { FieldLabel } from '@components/Form/Field/_shared/FieldLabel';
import { FieldWrapper } from './FieldWrapper';
import { ICON_MAP } from './constants';
import { CustomAutoField } from './CustomAutoField';
import styles from './FieldContainer.module.css';
import { IconButton } from '@components/Button';

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
  value,
  id,
}: CollapsibleFieldComponentProps<Props>) {
  const repositoryId = 'repositoryId' in field ? (field.repositoryId as string) : undefined;

  const [isExpanded, toggleExpanded] = useState(field.collapseOptions ? (field.collapseOptions?.startExpanded ?? false) : true);
  const _icon = useMemo(() => field.icon ?? ICON_MAP[field.type], [field.icon, field.type]);
  const getPuck = useGetPuck();
  const { selectedItem, appState } = getPuck();
  const itemOrRoot = selectedItem ?? appState.data.root;
  const selectedItemOrRootProps = useMemo(() => itemOrRoot?.props, [itemOrRoot]);

  const onChange = useCallback(
    (value: unknown, uiState?: Partial<UiState>) => {
      if (typeof value === 'undefined') return;
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
      const { appState } = getPuck();
      // If there's no expected selectedItem, we can assume the root options should be shown
      const visibleData = selectedItemOrRootProps ? selectedItemOrRootProps : appState.data.root?.props;
      if (!visibleData) return;
      // when a repositoryId is available, we're a root component field and we need to only send a subset of data
      const data = repositoryId ? visibleData[repositoryId] : visibleData;
      return field.visible(data);
    }
    return field.visible ?? true;
  }, [selectedItemOrRootProps, getPuck, field, repositoryId]);

  const onToggleExpand = useCallback(() => {
    toggleExpanded(prev => !prev);
  }, []);

  const onFieldsetClick = useCallback(() => {
    if (typeof field.collapseOptions === 'object') {
      onToggleExpand();
    }
  }, [field.collapseOptions, onToggleExpand]);

  return (
    <Fieldset
      style={{
        display: isVisible ? 'block' : 'none',
      }}
      id={id}
      className={`hakit-field ${field.className ?? ''} ${field.type ? `field-${field.type}` : ''}`}
      onClick={onFieldsetClick}
    >
      {/* <FieldLabel
        label={field.label}
        description={field.description}
        icon={_icon}
        readOnly={field.readOnly}
        className={`hakit-field-label ${!isExpanded && field.collapseOptions ? 'collapsed' : ''}`}
        endAdornment={
          <>
            {field.collapseOptions && (
              <IconButton
                icon={isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                onClick={onToggleExpand}
                variant='transparent'
                size='xs'
                tooltipProps={{
                  placement: 'left',
                }}
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
              />
            )}
          </>
        }
      /> */}
      <FieldLabel
        className='field-label'
        label={field.label}
        icon={_icon}
        readOnly={field.readOnly}
        style={{
          paddingTop: `var(--space-3)`,
          paddingBottom: `var(--space-3)`,
          paddingLeft: `var(--space-2)`,
          paddingRight: `var(--space-2)`,
          ...(field.collapseOptions
            ? {
                cursor: 'pointer',
              }
            : {}),
          ...(field.collapseOptions && isExpanded
            ? {
                color: 'var(--color-primary-50)',
                backgroundColor: 'var(--color-primary-950)',
              }
            : {}),
          ...(field.collapseOptions && !isExpanded
            ? {
                borderBottom: `1px solid var(--color-gray-800)`,
              }
            : {}),
        }}
        endAdornment={
          <>
            {field.collapseOptions && (
              <IconButton
                icon={isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                onClick={onToggleExpand}
                variant='transparent'
                size='xs'
                tooltipProps={{
                  placement: 'left',
                }}
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
              />
            )}
          </>
        }
      />
      <FieldWrapper className={`hakit-field-wrapper ${!isExpanded && field.collapseOptions ? styles.fieldWrapperCollapsed : ''} `}>
        <div className={styles.fieldInput}>
          <CustomAutoField field={field} name={name} onChange={onChange} value={value} id={id} icon={_icon} />
        </div>
      </FieldWrapper>
    </Fieldset>
  );
}

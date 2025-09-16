import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { UiState, useGetPuck, type DefaultComponentProps } from '@measured/puck';
import { ChevronDown, ChevronUp } from 'lucide-react';

import type { FieldConfiguration } from '@typings/fields';
import { Fieldset } from '../CollapsibleFieldWrapper/Fieldset';
import { FieldLabel } from '../CollapsibleFieldWrapper/FieldLabel';
import { IconButton } from '@components/Button/IconButton';
import { FieldWrapper } from '../CollapsibleFieldWrapper/FieldWrapper';
import styled from '@emotion/styled';
import { useActiveBreakpoint } from '@hooks/useActiveBreakpoint';
import { useTemplateMode } from '../CollapsibleFieldWrapper/useTemplateMode';
import { ICON_MAP } from './constants';

const FieldInput = styled.div`
  width: 100%;
  > * {
    width: 100%;
  }
`;

/**
 * Helper function to create custom fields (cf - custom field)
 */

type CustomFieldComponentProps<Props extends DefaultComponentProps> = {
  // these excluded field types render differently and don't need all these fancy changes
  field: Extract<FieldConfiguration[string], { type: 'object' | 'array' }>;
  name: string;
  onChange: (value: Props) => void;
  value: Props;
  id: string;
  children: React.ReactNode;
};

export function CollapsibleFieldWrapper<Props extends DefaultComponentProps>({
  field,
  name,
  onChange: puckOnChange,
  value,
  id,
  children,
}: CustomFieldComponentProps<Props>) {
  // const field = deepCopy(field) as CustomFieldsWithDefinition<Props>['_field'];
  const repositoryId = 'repositoryId' in field ? (field.repositoryId as string) : undefined;

  // const [breakpointMode, setBreakpointMode] = useState(false);
  const [isExpanded, toggleExpanded] = useState(field.collapseOptions ? (field.collapseOptions?.startExpanded ?? false) : true);
  const _icon = useMemo(() => field.icon ?? ICON_MAP[field.type], [field.icon, field.type]);
  // const activeBreakpoint = useActiveBreakpoint();
  const getPuck = useGetPuck();
  const { selectedItem, appState } = getPuck();
  const itemOrRoot = selectedItem ?? appState.data.root;
  const selectedItemOrRootProps = useMemo(() => itemOrRoot?.props, [itemOrRoot]);

  // const onChange = useCallback(
  //   (value: unknown, uiState?: Partial<UiState>) => {
  //     if (typeof value === 'undefined') return;
  //     // @ts-expect-error - Types are wrong in internal types for puck, uiState is required
  //     puckOnChange(value, uiState);
  //   },
  //   [puckOnChange]
  // );

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
      className={`hakit-field ${field.className ?? ''} ${field.type ? `field-${field.type}` : ''} ${field.collapseOptions ? 'collapsible' : ''}`}
      onClick={onFieldsetClick}
    >
      <FieldLabel
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
      />
      <FieldWrapper className={`hakit-field-wrapper ${!isExpanded && field.collapseOptions ? 'collapsed' : ''} `}>
        <FieldInput className='hakit-field-input'>{children}</FieldInput>
      </FieldWrapper>
    </Fieldset>
  );
}

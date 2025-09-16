import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { UiState, useGetPuck, type DefaultComponentProps } from '@measured/puck';
import { Touchpad, TouchpadOff } from 'lucide-react';

import type { FieldConfiguration } from '@typings/fields';
import { Fieldset } from './Fieldset';
import { FieldLabel } from './FieldLabel';
import { IconButton } from '@components/Button/IconButton';
import { FieldWrapper } from './FieldWrapper';
import styled from '@emotion/styled';
import { Row } from '@hakit/components';
import { useActiveBreakpoint } from '@hooks/useActiveBreakpoint';
import { CodeField } from '@components/Form/Fields/Code';
import { SwitchField } from '@components/Form/Fields/Switch';
import { useTemplateMode } from './useTemplateMode';
import { ICON_MAP } from './constants';

const Description = styled.div`
  font-size: 12px;
  margin-top: 6px;
  font-weight: 400;
`;

const Mark = styled.div`
  color: var(--color-gray-300);
  background-color: var(--color-gray-950);
  padding: 4px 6px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 4px;
`;

const FieldInput = styled.div`
  width: 100%;
  > * {
    width: 100%;
  }
`;

const RESPONSIVE_MODE_DEFAULT = true;

/**
 * Helper function to create custom fields (cf - custom field)
 */

type CustomFieldComponentProps<Props extends DefaultComponentProps> = {
  // these excluded field types render differently and don't need all these fancy changes
  field: Exclude<FieldConfiguration[string], { type: 'slot' | 'hidden' | 'object' | 'array' | 'divider' | 'hidden' }>;
  name: string;
  onChange: (value: Props) => void;
  value: Props;
  id: string;
  children: React.ReactNode;
};

export function StandardFieldWrapper<Props extends DefaultComponentProps>({
  field,
  name,
  onChange: puckOnChange,
  value,
  id,
  children,
}: CustomFieldComponentProps<Props>) {
  const responsiveMode = useMemo(() => {
    if ('responsiveMode' in field) {
      return field.responsiveMode ?? RESPONSIVE_MODE_DEFAULT;
    }
    return RESPONSIVE_MODE_DEFAULT;
  }, [field]);

  // const field = deepCopy(field) as CustomFieldsWithDefinition<Props>['_field'];
  const repositoryId = 'repositoryId' in field ? (field.repositoryId as string) : undefined;

  const [breakpointMode, setBreakpointMode] = useState(false);
  const _icon = useMemo(() => field.icon ?? ICON_MAP[field.type], [field.icon, field.type]);
  const activeBreakpoint = useActiveBreakpoint();
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

  const componentIdForMap = typeof selectedItemOrRootProps?.id === 'string' ? selectedItemOrRootProps.id : 'root';
  const { allowTemplates, templateMode, handleTemplateToggle, templateInputValue, onTemplateInputChange } = useTemplateMode({
    field,
    name,
    value,
    repositoryId,
    onChange,
    componentIdForMap,
  });

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

  const onToggleBreakpointMode = useCallback(() => {
    // TODO - Can't be achieved until https://github.com/puckeditor/puck/pull/1131 is merged and released
    // we need the nested name value to work properly with custom fields and currently it doesn't
    // once we have the name field populated, we can extract or update from the breakpoint map below
    // const { componentBreakpointMap, setComponentBreakpointMap } = useGlobalStore.getState();
    setBreakpointMode(prev => {
      const isBreakpointModeEnabled = !prev;
      if (!isBreakpointModeEnabled) {
        onChange(valueRef.current);
      }
      return isBreakpointModeEnabled;
    });
  }, [onChange]);

  return (
    <Fieldset
      style={{
        display: isVisible ? 'block' : 'none',
      }}
      id={id}
      className={`hakit-field ${field.className ?? ''} ${field.type ? `field-${field.type}` : ''} ${
        breakpointMode && responsiveMode ? 'bp-mode-enabled' : ''
      }`}
    >
      <FieldLabel
        label={field.label}
        description={field.description}
        icon={_icon}
        readOnly={field.readOnly}
        className={`hakit-field-label`}
        endAdornment={
          <>
            {allowTemplates && (
              <SwitchField
                name={`${id}-template-toggle`}
                label='Template'
                checked={templateMode}
                onChange={e => {
                  e.stopPropagation();
                  handleTemplateToggle((e.target as HTMLInputElement).checked);
                }}
              />
            )}
          </>
        }
      />
      <FieldWrapper className={`hakit-field-wrapper`}>
        <FieldInput className='hakit-field-input'>
          {allowTemplates && templateMode ? (
            <CodeField value={templateInputValue} language='jinja2' onChange={onTemplateInputChange} />
          ) : (
            children
          )}
        </FieldInput>
        {responsiveMode && (
          <IconButton
            icon={breakpointMode ? <Touchpad size={16} /> : <TouchpadOff size={16} />}
            onClick={onToggleBreakpointMode}
            active={breakpointMode}
            variant='transparent'
            size='xs'
            tooltipProps={{
              placement: 'left',
            }}
            aria-label={breakpointMode ? 'Responsive Values Enabled' : 'Responsive Values Disabled'}
          />
        )}
      </FieldWrapper>
      {breakpointMode && responsiveMode && (
        <>
          <Description className='hakit-field-responsive-description'>
            <Row fullWidth alignItems='center' justifyContent='flex-start' gap='0.5rem'>
              <Row justifyContent='flex-start' gap='0.25rem'>
                Active <Mark>{activeBreakpoint}</Mark>
              </Row>
            </Row>
          </Description>
        </>
      )}
    </Fieldset>
  );
}

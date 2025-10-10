import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { UiState, useGetPuck, type DefaultComponentProps } from '@measured/puck';
import { Settings } from 'lucide-react';

import type { FieldConfiguration } from '@typings/fields';
import { Fieldset } from './Fieldset';
import { IconButton } from '@components/Button/IconButton';
import { FieldWrapper } from './FieldWrapper';
import { Row } from '@components/Layout';
import { CodeField } from '@components/Form/Field/Code';
import { useTemplateMode } from './useTemplateMode';
import { ICON_MAP } from './constants';
import { CustomAutoField } from './CustomAutoField';
import styles from './FieldContainer.module.css';
import { FieldOptions } from './FieldOptions';
import { useFieldBreakpointConfig } from '@hooks/useFieldBreakpointConfig';
import { dbValueToPuck } from '@helpers/editor/pageData/dbValueToPuck';
import { isBreakpointObject, hasXlgBreakpoint } from '@helpers/editor/pageData/isBreakpointObject';
import { useGlobalStore } from '@hooks/useGlobalStore';
import { BreakpointIndicators } from './BreakpointIndicators';

/**
 * Helper function to create custom fields (cf - custom field)
 */

export type StandardFieldComponentProps<Props extends DefaultComponentProps = DefaultComponentProps> = {
  // these excluded field types render differently and don't need all these fancy changes
  field: Exclude<FieldConfiguration[string], { type: 'slot' | 'hidden' | 'object' | 'array' | 'hidden' }>;
  name: string;
  onChange: (value: Props) => void;
  value: Props;
  id: string;
};

export function StandardFieldWrapper<Props extends DefaultComponentProps>({
  field,
  name,
  onChange: puckOnChange,
  value: puckValue,
  id,
}: StandardFieldComponentProps<Props>) {
  const repositoryId = 'repositoryId' in field ? (field.repositoryId as string) : undefined;
  const activeBreakpoint = useGlobalStore(state => state.activeBreakpoint);
  const value = useMemo(() => dbValueToPuck(puckValue, activeBreakpoint ?? 'xlg'), [puckValue, activeBreakpoint]);
  const _icon = useMemo(() => field.icon ?? ICON_MAP[field.type], [field.icon, field.type]);
  const getPuck = useGetPuck();
  const { selectedItem, appState } = getPuck();
  const itemOrRoot = selectedItem ?? appState.data.root;
  const [fieldOptionsOpen, setFieldOptionsOpen] = useState(false);
  const selectedItemOrRootProps = useMemo(() => itemOrRoot?.props, [itemOrRoot]);

  // Use the shared hook for breakpoint configuration
  const { responsiveMode, isBreakpointModeEnabled } = useFieldBreakpointConfig(field, name);

  const onChange = useCallback(
    (value: unknown) => {
      if (typeof value === 'undefined') return;
      const uiState = getPuck().appState.ui;
      const isValueBreakpointObject = isBreakpointObject(puckValue);
      if (responsiveMode && isBreakpointModeEnabled) {
        puckOnChange(
          {
            // push the original value into $xlg, we always need to have a value for $xlg
            // when responsive mode is enabled, the next merge may override it anyway
            ...(hasXlgBreakpoint(puckValue)
              ? {}
              : {
                  ['$xlg']: value,
                }),
            ...(isValueBreakpointObject ? puckValue : {}),
            [`$${activeBreakpoint}`]: value,
          },
          // @ts-expect-error - Types are wrong in internal types for puck, uiState is required
          uiState
        );
      } else {
        puckOnChange(
          // Send back the large breakpoint value if available
          isBreakpointObject(value) ? value.$xlg : value,
          // @ts-expect-error - Types are wrong in internal types for puck, uiState is required
          uiState
        );
      }
    },
    [puckOnChange, puckValue, activeBreakpoint, responsiveMode, isBreakpointModeEnabled, getPuck]
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

  const fieldOptions = useMemo(
    () => (
      <IconButton
        aria-label='Field options'
        icon={<Settings size={16} />}
        onClick={() => {
          setFieldOptionsOpen(true);
        }}
        variant='transparent'
        size='xs'
        tooltipProps={{
          placement: 'left',
        }}
      />
    ),
    []
  );

  const fieldLabel = useMemo(
    () => (
      <Row fullWidth alignItems='center' justifyContent='space-between' gap='0.5rem'>
        <span>{field.label ?? ''}</span>
        {fieldOptions}
      </Row>
    ),
    [field.label, fieldOptions]
  );

  const onRemoveBreakpoint = useCallback(
    (newValue: unknown) => {
      const uiState = getPuck().appState.ui;
      // intentionally just triggering puckOnChange instead of onChange as we know it's already
      // a breakpoint object so we just send it
      // the user has just decided to remove an individual breakpoint value
      puckOnChange(
        newValue,
        // @ts-expect-error - Types are wrong in internal types for puck, uiState is required
        uiState
      );
    },
    [getPuck, puckOnChange]
  );

  const onResponsiveToggleChange = useCallback(() => {
    onChange(value);
  }, [onChange, value]);

  const onCloseFieldOptions = useCallback(() => {
    setFieldOptionsOpen(false);
  }, []);

  const fieldsetClassName = useMemo(() => {
    return `hakit-field ${field.className ?? ''} ${field.type ? `field-${field.type}` : ''} ${
      isBreakpointModeEnabled && responsiveMode ? styles.bpModeEnabled : ''
    }`;
  }, [field.className, field.type, isBreakpointModeEnabled, responsiveMode]);

  const fieldsetStyles = useMemo(() => {
    return {
      display: isVisible ? 'block' : 'none',
    };
  }, [isVisible]);

  return (
    <Fieldset style={fieldsetStyles} id={id} className={fieldsetClassName}>
      <FieldWrapper className={`hakit-field-wrapper`}>
        <div className={styles.fieldInput}>
          {allowTemplates && templateMode ? (
            <CodeField value={templateInputValue} language='jinja2' onChange={onTemplateInputChange} id={id} name={name} />
          ) : (
            <CustomAutoField field={field} fieldLabel={fieldLabel} name={name} onChange={onChange} value={value} id={id} icon={_icon} />
          )}
        </div>
      </FieldWrapper>
      <BreakpointIndicators
        puckValue={puckValue}
        isBreakpointModeEnabled={isBreakpointModeEnabled}
        responsiveMode={responsiveMode}
        onRemoveBreakpoint={onRemoveBreakpoint}
      />
      <FieldOptions
        open={fieldOptionsOpen}
        field={field}
        name={name}
        templateMode={allowTemplates && templateMode}
        onResponsiveToggleChange={onResponsiveToggleChange}
        onTemplateToggleChange={handleTemplateToggle}
        onClose={onCloseFieldOptions}
      />
    </Fieldset>
  );
}

import { useCallback, useMemo, useRef, useEffect } from 'react';
import { createUsePuck, type DefaultComponentProps } from '@measured/puck';
import { Code } from 'lucide-react';

import type { FieldConfiguration } from '@typings/fields';
import { Fieldset } from './Fieldset';
import { FieldWrapper } from './FieldWrapper';
import { Row } from '@components/Layout';
import { CodeField } from '@components/Form/Field/Code';
import { useTemplateMode } from '@hooks/useTemplateMode';
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
const usePuck = createUsePuck();

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
  const addonId = 'addonId' in field ? (field.addonId as string) : undefined;
  const activeBreakpoint = useGlobalStore(state => state.activeBreakpoint);
  const value = useMemo(() => dbValueToPuck(puckValue, activeBreakpoint ?? 'xlg'), [puckValue, activeBreakpoint]);
  const _icon = useMemo(() => field.icon ?? ICON_MAP[field.type], [field.icon, field.type]);
  const selectedItem = usePuck(state => state.selectedItem);
  const appState = usePuck(state => state.appState);
  const uiState = usePuck(state => state.appState.ui);
  const itemOrRoot = selectedItem ?? appState.data.root;
  const selectedItemOrRootProps = useMemo(() => itemOrRoot?.props, [itemOrRoot]);

  // Use the shared hook for breakpoint configuration
  const { responsiveMode, isBreakpointModeEnabled, toggleBreakpointMode } = useFieldBreakpointConfig(field, name);

  const onChange = useCallback(
    (value: unknown) => {
      if (typeof value === 'undefined') return;
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
          isBreakpointObject(puckValue) ? puckValue.$xlg : value,
          // @ts-expect-error - Types are wrong in internal types for puck, uiState is required
          uiState
        );
      }
    },
    [puckOnChange, puckValue, activeBreakpoint, responsiveMode, isBreakpointModeEnabled, uiState]
  );

  const componentIdForMap = typeof selectedItemOrRootProps?.id === 'string' ? selectedItemOrRootProps.id : 'root';
  const { allowTemplates, templateMode, handleTemplateToggle, templateInputValue, onTemplateInputChange } = useTemplateMode({
    field,
    name,
    value,
    addonId,
    onChange,
    componentIdForMap,
  });

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

  const onResponsiveToggleChange = useCallback(() => {
    onChange(value);
  }, [onChange, value]);

  const onResetToDefault = useCallback(() => {
    // should reset breakpoint mode, template mode, and field value back to the default
    const defaultValue = field.default;
    puckOnChange(
      defaultValue,
      // @ts-expect-error - Types are wrong in internal types for puck, uiState is required
      uiState
    );
    // reset template mode back to default
    handleTemplateToggle(false);
    // reset breakpoint mode back to default
    if (isBreakpointModeEnabled) {
      toggleBreakpointMode();
    }
  }, [field, puckOnChange, uiState, handleTemplateToggle, isBreakpointModeEnabled, toggleBreakpointMode]);

  const fieldLabel = useMemo(
    () => (
      <Row fullWidth alignItems='center' justifyContent='space-between' gap='0.5rem'>
        <span>{field.label ?? ''}</span>
        <FieldOptions
          field={field}
          name={name}
          allowTemplates={allowTemplates}
          templateMode={templateMode}
          onResetToDefault={onResetToDefault}
          onResponsiveToggleChange={onResponsiveToggleChange}
          onTemplateToggleChange={handleTemplateToggle}
        />
      </Row>
    ),
    [field, name, allowTemplates, templateMode, handleTemplateToggle, onResponsiveToggleChange, onResetToDefault]
  );

  const onRemoveBreakpoint = useCallback(
    (newValue: unknown) => {
      // intentionally just triggering puckOnChange instead of onChange as we know it's already
      // a breakpoint object so we just send it
      // the user has just decided to remove an individual breakpoint value
      puckOnChange(
        newValue,
        // @ts-expect-error - Types are wrong in internal types for puck, uiState is required
        uiState
      );
    },
    [uiState, puckOnChange]
  );

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
            <CodeField
              value={templateInputValue}
              language='jinja2'
              onChange={onTemplateInputChange}
              id={id}
              name={name}
              label={fieldLabel}
              icon={<Code size={16} />}
              helperText={field.description}
              readOnly={field.readOnly}
            />
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
    </Fieldset>
  );
}

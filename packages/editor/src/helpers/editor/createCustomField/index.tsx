import { useCallback, useMemo, useState, useRef, useEffect, memo } from 'react';
import { createUsePuck, UiState, useGetPuck, type DefaultComponentProps } from '@measured/puck';
import { ReactNode } from 'react';
import {
  Hash,
  Type,
  Server,
  List,
  MoreVertical,
  ChevronDown,
  CheckCircle,
  Palette,
  Volleyball,
  ExternalLink,
  TableCellsSplit,
  ImagePlus,
  CodeXml,
  Minus,
  ChevronUp,
  Touchpad,
  TouchpadOff,
} from 'lucide-react';

import { EXCLUDE_FIELD_TYPES_FROM_RESPONSIVE_VALUES } from '@helpers/editor/pageData/constants';
import type { CustomFields, CustomFieldsWithDefinition, FieldTypes } from '@typings/fields';
import { Fieldset } from './Fieldset';
import { FieldLabel } from './FieldLabel';
import { IconButton } from '@components/Button/IconButton';
import { FieldWrapper } from './FieldWrapper';
import { CustomAutoField } from './CustomAutoField';
import styled from '@emotion/styled';
import { Row } from '@hakit/components';
import { deepCopy } from 'deep-copy-ts';
import { Alert } from '@components/Alert';
import { useActiveBreakpoint } from '@hooks/useActiveBreakpoint';
import { CodeField } from '@components/Form/Fields/Code';
import { SwitchField } from '@components/Form/Fields/Switch';
import { EXCLUDE_FIELD_TYPES_FROM_TEMPLATES, TEMPLATE_PREFIX } from '@helpers/editor/pageData/constants';
import { useGlobalStore } from '@hooks/useGlobalStore';

// Create an object with keys based on the extracted type values
const ICON_MAP: { [key in FieldTypes]: ReactNode } = {
  slot: null,
  text: <Type size={16} />,
  imageUpload: <ImagePlus size={16} />,
  number: <Hash size={16} />,
  page: <ExternalLink size={16} />,
  pages: <ExternalLink size={16} />,
  array: <List size={16} />,
  object: <MoreVertical size={16} />,
  entity: <Server size={16} />,
  select: <ChevronDown size={16} />,
  service: <Volleyball size={16} />,
  radio: <CheckCircle size={16} />,
  textarea: <Type size={16} />,
  custom: <MoreVertical size={16} />,
  color: <Palette size={16} />,
  slider: <Hash size={16} />,
  grid: <TableCellsSplit size={16} />,
  code: <CodeXml size={16} />,
  divider: <Minus size={16} />,
  switch: <CheckCircle size={16} />,
  // not seen anyway
  hidden: <Hash size={16} />,
};

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

const StyledAlert = styled(Alert)`
  margin: 0;
`;

const RESPONSIVE_MODE_DEFAULT = true;

const usePuck = createUsePuck();

/**
 * Helper function to create custom fields (cf - custom field)
 */

type CustomFieldComponentProps<Props extends DefaultComponentProps> = {
  field: CustomFieldsWithDefinition<Props>['_field'];
  name: string;
  onChange: (value: Props) => void;
  value: Props;
  id: string;
  repositoryId?: string;
};

function CustomFieldComponentInner<Props extends DefaultComponentProps>({
  field,
  name,
  onChange: puckOnChange,
  value,
  id,
  repositoryId,
}: CustomFieldComponentProps<Props>) {
  const [breakpointMode, setBreakpointMode] = useState(false);
  const [isExpanded, toggleExpanded] = useState(field.collapseOptions ? (field.collapseOptions?.startExpanded ?? false) : true);
  const templatesEnabledByType = !EXCLUDE_FIELD_TYPES_FROM_TEMPLATES.includes(field.type);
  const templatesEnabledByField = field.templates?.enabled !== false;
  const allowTemplates = templatesEnabledByType && templatesEnabledByField;

  // detect if current value is a template
  const isTemplateValue = useMemo(() => typeof value === 'string' && (value as unknown as string).startsWith(TEMPLATE_PREFIX), [value]);

  const _icon = useMemo(() => field.icon ?? ICON_MAP[field.type], [field.icon, field.type]);
  const activeBreakpoint = useActiveBreakpoint();
  const getPuck = useGetPuck();
  const selectedItem = usePuck(s => s.selectedItem ?? s.appState.data.root);
  const selectedItemProps = useMemo(() => selectedItem?.props as Record<string, unknown> | undefined, [selectedItem]);

  // template map in store
  const templateFieldMap = useGlobalStore(s => s.templateFieldMap);
  const setTemplateFieldMap = useGlobalStore(s => s.setTemplateFieldMap);
  const componentIdForMap = typeof selectedItemProps?.id === 'string' ? (selectedItemProps.id as string) : 'root';

  // convert dot-notated name to slash path (prefix with repositoryId for root fields)
  const flatPath = useMemo(() => {
    const segs = name.split('.').filter(Boolean);
    const withRepo = repositoryId ? [repositoryId, ...segs] : segs;
    return withRepo.join('/');
  }, [name, repositoryId]);

  const templateMode = useMemo(() => {
    const paths = templateFieldMap[componentIdForMap] ?? [];
    return paths.includes(flatPath) || isTemplateValue;
  }, [templateFieldMap, componentIdForMap, flatPath, isTemplateValue]);

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
      const visibleData = selectedItemProps ? selectedItemProps : appState.data.root?.props;
      if (!visibleData) return;
      // when a repositoryId is available, we're a root component field and we need to only send a subset of data
      const data = repositoryId ? visibleData[repositoryId] : visibleData;
      return field.visible(data);
    }
    return field.visible ?? true;
  }, [selectedItemProps, getPuck, field, repositoryId]);

  const onToggleBreakpointMode = useCallback(() => {
    // TODO - Can't be achieved until https://github.com/puckeditor/puck/pull/1131 is merged and released
    // we need the nested name value to work properly with custom fields and currently it doesn't
    // once we have the name field populated, we can extract or update from the breakpoint map below
    // const { componentBreakpointMap, setComponentBreakpointMap } = useGlobalStore.getState();
    console.log('Toggling breakpoint mode for field', name);
    setBreakpointMode(prev => {
      const isBreakpointModeEnabled = !prev;
      if (!isBreakpointModeEnabled) {
        onChange(valueRef.current);
      }
      return isBreakpointModeEnabled;
    });
  }, [onChange, name]);

  const onToggleExpand = useCallback(() => {
    toggleExpanded(prev => !prev);
  }, []);

  const onFieldsetClick = useCallback(() => {
    if (typeof field.collapseOptions === 'object') {
      onToggleExpand();
    }
  }, [field.collapseOptions, onToggleExpand]);

  const handleTemplateToggle = useCallback(
    (enabled: boolean) => {
      // update map
      const { templateFieldMap: currentMap } = useGlobalStore.getState();
      const nextMap = { ...currentMap } as Record<string, string[]>;
      const arr = [...(nextMap[componentIdForMap] ?? [])];
      const idx = arr.indexOf(flatPath);
      if (enabled) {
        if (idx === -1) arr.push(flatPath);
      } else {
        if (idx !== -1) arr.splice(idx, 1);
      }
      nextMap[componentIdForMap] = arr;
      setTemplateFieldMap(nextMap);

      if (enabled) {
        // Reset to empty template marker so it is clearly a templated value
        onChange(TEMPLATE_PREFIX as unknown as Props);
      } else {
        // toggling OFF: revert to default
        // For fields with options when default is missing, choose first option
        // Otherwise if default is undefined, emit undefined to reset
        let nextValue: unknown = (field as unknown as { default?: unknown }).default;
        if (typeof nextValue === 'undefined') {
          const maybeOptions = (field as unknown as { options?: Array<{ value: unknown }> }).options;
          if (Array.isArray(maybeOptions) && maybeOptions.length > 0) {
            nextValue = maybeOptions[0]?.value;
          }
        }
        // If still undefined, emit undefined as requested
        onChange(nextValue as Props);
      }
    },
    [setTemplateFieldMap, componentIdForMap, flatPath, field, onChange]
  );

  if (!_icon) {
    return (
      <StyledAlert title='Invalid Configuration' severity='error'>
        Unsupported field type: <mark>{field.type}</mark>
      </StyledAlert>
    );
  }

  // if (!isVisible) {
  //   return null;
  // }

  return (
    <Fieldset
      style={{
        display: isVisible ? 'block' : 'none',
      }}
      id={id}
      className={`hakit-field ${field.className ?? ''} ${field.type ? `field-${field.type}` : ''} ${field.collapseOptions ? 'collapsible' : ''} ${
        breakpointMode && field.responsiveMode ? 'bp-mode-enabled' : ''
      }`}
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
        <FieldInput className='hakit-field-input'>
          {allowTemplates && templateMode ? (
            <CodeField
              value={typeof value === 'string' ? (value as unknown as string).replace(TEMPLATE_PREFIX, '') : ''}
              language='jinja2'
              onChange={val => onChange(`${TEMPLATE_PREFIX}${val}` as unknown as Props)}
            />
          ) : (
            <CustomAutoField<Props> field={field as CustomFields<Props>} value={value} name={name} onChange={onChange} />
          )}
        </FieldInput>
        {field.responsiveMode && (
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
      {breakpointMode && field.responsiveMode && (
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

const CustomFieldComponent = memo(CustomFieldComponentInner, (a, b) => {
  // Prevent re-rendering if the field, name, onChange, value, or id props haven't changed
  return a.name === b.name && a.onChange === b.onChange && a.value === b.value && a.id === b.id;
}) as <Props extends DefaultComponentProps>(props: CustomFieldComponentProps<Props>) => React.ReactElement;

export function createCustomField<Props extends DefaultComponentProps>(_field: CustomFields<Props>): CustomFieldsWithDefinition<Props> {
  if (_field.type !== 'slot') {
    // default values for the field
    _field.responsiveMode = EXCLUDE_FIELD_TYPES_FROM_RESPONSIVE_VALUES.includes(_field.type)
      ? false
      : (_field.responsiveMode ?? RESPONSIVE_MODE_DEFAULT);
  }
  const field = deepCopy(_field) as CustomFieldsWithDefinition<Props>['_field'];
  const repositoryId = 'repositoryId' in _field ? (_field.repositoryId as string) : undefined;
  return {
    type: 'custom',
    _field: field,
    render({ name, onChange: puckOnChange, value, id }) {
      return <CustomFieldComponent field={field} name={name} onChange={puckOnChange} value={value} id={id} repositoryId={repositoryId} />;
    },
  };
}

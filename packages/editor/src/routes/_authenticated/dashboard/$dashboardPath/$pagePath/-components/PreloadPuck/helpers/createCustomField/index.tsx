import { useMemo } from 'react';
import { AutoField, type DefaultComponentProps } from '@measured/puck';
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
} from 'lucide-react';
// custom fields
import { Color } from '@lib/components/Form/Fields/Color';
import { Slider } from '@lib/components/Form/Fields/Slider';
import { Entity } from '@lib/components/Form/Fields/Entity';
import { Service } from '@lib/components/Form/Fields/Service';
import { Page } from '@lib/components/Form/Fields/Page';
import { GridField } from '@lib/components/Form/Fields/Grid';
import { ImageUpload } from '@lib/components/Form/Fields/Image';
import { CodeField } from '@lib/components/Form/Fields/Code';
import { InputField } from '@lib/components/Form/Fields/Input';
import { SelectField as CustomSelectField } from '@lib/components/Form/Fields/Select';
import { RadioField as CustomRadioField } from '@lib/components/Form/Fields/Radio';
import { NumberField as CustomNumberField } from '@lib/components/Form/Fields/Number';
import { HassEntity } from 'home-assistant-js-websocket';
import { EXCLUDE_FIELD_TYPES_FROM_RESPONSIVE_VALUES } from '@client/src/routes/_authenticated/dashboard/$dashboardPath/$pagePath/-components/PreloadPuck/helpers/pageData/constants';
import type { CustomFields, CustomFieldsWithDefinition, FieldTypes } from '@typings/fields';

// Create an object with keys based on the extracted type values
const ICON_MAP: { [key in FieldTypes]: ReactNode } = {
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
  // not seen anyway
  hidden: <Hash size={16} />,
};

const BREAKPOINT_LOGIC_DEFAULT_DISABLED = false;

/**
 * Helper function to create custom fields (cf - custom field)
 */

export function createCustomField<Props extends DefaultComponentProps>(field: CustomFields<Props>): CustomFieldsWithDefinition<Props> {
  // default values for the field
  field.disableBreakpoints = EXCLUDE_FIELD_TYPES_FROM_RESPONSIVE_VALUES.includes(field.type)
    ? true
    : (field.disableBreakpoints ?? BREAKPOINT_LOGIC_DEFAULT_DISABLED);
  const _field = field as CustomFieldsWithDefinition<Props>['_field'];
  return {
    type: 'custom',
    _field,
    render({ name, onChange, value, id }) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const _icon = useMemo(() => field.icon ?? ICON_MAP[field.type], []);
      // const appState = usePuck(c => c.appState);
      // const selectedItem = usePuck(c => c.selectedItem);
      // // fine to use hooks here, eslint just doesn't know it's a component render, with a wrapping component it may cause more renders than necessary
      // const activeBreakpoint = useActiveBreakpoint();

      // const isVisible = useMemo(() => {
      //   if (typeof _field.visible === 'function') {
      //     // If there's no expected selectedItem, we can assume the root options should be shown
      //     const visibleData = selectedItem
      //       ? transformProps(selectedItem.props, activeBreakpoint)
      //       : appState.data.root?.props
      //         ? transformProps(appState.data.root.props, activeBreakpoint)
      //         : null;
      //     if (!visibleData) return;
      //     return _field.visible(visibleData);
      //   }
      //   return _field.visible ?? true;
      // }, [
      //   appState.data.root,
      //   // TODO test this visible logic, If this stopps working when values change, add the puckValue back in
      //   // puckValue,
      //   selectedItem,
      //   activeBreakpoint,
      // ]);

      // const valOrDefault = useMemo(() => {
      //   return (
      //     puckValue ??
      //     (field.disableBreakpoints
      //       ? field.default
      //       : {
      //           xlg: field.default,
      //         })
      //   );
      // }, [puckValue]);

      // const [breakpointMode, setBreakpointMode] = useState(multipleBreakpointsEnabled(valOrDefault));

      // // intentionally using any here as the value will be unknown in this context
      // // and we can't use unknown as the value properties expect the shape type of the CustomField
      // const value = useMemo(() => {
      //   return field.disableBreakpoints ? valOrDefault : getResolvedBreakpointValue<any>(valOrDefault, activeBreakpoint);
      // }, [valOrDefault, activeBreakpoint]);
      const commonAutoFieldProps = {
        name,
        id: field.id,
        readOnly: field.readOnly,
      };
      // const onChange = (value: unknown, uiState?: Partial<UiState>) => {
      //   if (typeof value === 'undefined') return;
      //   if (field.disableBreakpoints) {
      //     // @ts-expect-error - Types are wrong in internal types for puck, uiState is required
      //     puckOnChange(value as Props, uiState);
      //   } else if (typeof value !== 'undefined') {
      //     const xlg = 'xlg' as keyof AvailableQueries;
      //     const newValue = breakpointMode
      //       ? {
      //           ...valOrDefault,
      //           [activeBreakpoint]: value,
      //         }
      //       : ({
      //           [xlg]: value,
      //         } as Props);
      //     // send back the converted breakpoint value
      //     // @ts-expect-error - Types are wrong in internal types for puck, uiState is required
      //     puckOnChange(newValue, uiState);
      //   }
      // };

      // if (!isVisible) {
      //   return <></>;
      // }

      const activeBreakpoint = 'xs';
      const breakpointMode = false;

      if (field.type === 'hidden') {
        return <input type='hidden' value={value as unknown as string} />;
      }

      return (
        // <FieldWrapper
        //   key={id}
        //   disableBreakpoints={field.disableBreakpoints ?? BREAKPOINT_LOGIC_DEFAULT_DISABLED}
        //   activeBreakpoint={activeBreakpoint}
        //   // providedBreakpointValues={Object.entries(valOrDefault ?? {}).map(([key, val]) => [key, `${val}`])}
        //   providedBreakpointValues={Object.entries({}).map(([key, val]) => [key, `${val}`])}
        //   breakpointMode={breakpointMode}
        //   onToggleBreakpointMode={() => {
        //     // const isBreakpointModeEnabled = !breakpointMode;
        //     // because the onChange method is memoized, we need to call it here to ensure the value is updated
        //     // immediately when the breakpoint mode is toggled
        //     // if (!isBreakpointModeEnabled) {
        //     //   const xlg = 'xlg' as keyof AvailableQueries;
        //     //   const newValue = {
        //     //     [xlg]: valOrDefault[xlg] ?? value,
        //     //   } as Props;
        //     //   // send back the converted breakpoint value
        //     //   puckOnChange(newValue);
        //     // }
        //     // setBreakpointMode(!breakpointMode);
        //   }}
        //   description={field.description}
        //   icon={_icon}
        //   label={field.label ?? 'Unknown'}
        //   readOnly={field.readOnly}
        //   type={field.type}
        //   collapsible={field.collapsible}
        //   className={field.className}
        // >
        <>
          {field.type === 'imageUpload' && <ImageUpload value={value} onChange={onChange} />}

          {field.type === 'grid' && <GridField value={value} step={field.step} min={field.min} max={field.max} onChange={onChange} />}

          {field.type === 'page' && <Page value={value} label={field.label} muiltiSelect={false} onChange={onChange} />}
          {field.type === 'pages' && <Page value={value} label={field.label} muiltiSelect={true} onChange={onChange} />}
          {field.type === 'entity' && <Entity options={field.options as HassEntity[]} value={value} onChange={onChange} />}
          {field.type === 'service' && <Service value={value} onChange={onChange} />}
          {field.type === 'color' && <Color value={value} onChange={onChange} />}
          {field.type === 'slider' && <Slider value={value} min={field.min} max={field.max} step={field.step} onChange={onChange} />}
          {field.type === 'text' && (
            <InputField
              value={value || ''}
              onChange={e => onChange(e.target.value)}
              readOnly={field.readOnly}
              name={commonAutoFieldProps.name}
              id={commonAutoFieldProps.id}
            />
          )}
          {field.type === 'number' && (
            <CustomNumberField
              value={value}
              onChange={onChange}
              min={field.min}
              max={field.max}
              step={field.step}
              readOnly={field.readOnly}
              name={commonAutoFieldProps.name}
              id={commonAutoFieldProps.id}
            />
          )}
          {field.type === 'select' && (
            <CustomSelectField
              value={field.options.find(option => option.value === value)}
              options={[...field.options]}
              getOptionLabel={option => option?.label ?? '-'}
              onChange={e => {
                const selectedValue = e.target.value as { value: string; label: string } | null;
                // Find the original option to get the correct typed value
                const selectedOption = field.options.find(option => option.value === selectedValue?.value);
                if (selectedOption) {
                  onChange(selectedOption.value);
                }
              }}
              size='small'
              name={commonAutoFieldProps.name}
              id={commonAutoFieldProps.id}
              readOnly={field.readOnly}
            />
          )}
          {field.type === 'radio' && (
            <CustomRadioField
              value={value}
              options={[...field.options]}
              onChange={onChange}
              orientation='horizontal'
              name={commonAutoFieldProps.name}
              id={commonAutoFieldProps.id}
              readOnly={field.readOnly}
            />
          )}
          {field.type === 'textarea' && (
            <AutoField
              field={{
                type: field.type,
                label: field.label ?? 'Unknown',
                ...commonAutoFieldProps,
              }}
              onChange={onChange}
              value={value}
            />
          )}
          {field.type === 'array' && (
            <AutoField
              field={{
                type: field.type,
                label: field.label ?? 'Unknown',
                getItemSummary: (item: DefaultComponentProps[0], i: number) => {
                  if (field.getItemSummary) {
                    return field.getItemSummary(item, i);
                  }
                  return `Item ${i + 1}`;
                },
                defaultItemProps: field.defaultItemProps,
                arrayFields: field.arrayFields,
                min: field.min,
                max: field.max,
                ...commonAutoFieldProps,
              }}
              onChange={onChange}
              value={value}
            />
          )}
          {field.type === 'object' && (
            <AutoField
              field={{
                type: field.type,
                label: field.label ?? 'Unknown',
                objectFields: field.objectFields,
                ...commonAutoFieldProps,
              }}
              onChange={onChange}
              value={value}
            />
          )}
          {field.type === 'code' && <CodeField value={value} language={field.language} onValidate={field.onValidate} onChange={onChange} />}
          {field.type === 'divider' && (
            <div
              style={{
                width: '100%',
                height: '1px',
                backgroundColor: 'var(--color-border)',
                margin: 'var(--space-2) 0',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: 'var(--color-surface)',
                  padding: '0 var(--space-2)',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-muted)',
                  fontWeight: 'var(--font-weight-medium)',
                }}
              >
                {field.label}
              </div>
            </div>
          )}
        </>
      );
    },
  };
}

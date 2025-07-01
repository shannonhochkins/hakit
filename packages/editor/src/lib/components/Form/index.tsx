/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import { useMemo, useState } from 'react';
import {
  AutoField,
  type DefaultComponentProps,
  type TextField,
  type NumberField,
  type TextareaField,
  type SelectField,
  type RadioField,
  type BaseField as PuckBaseField,
  type ObjectField,
  type ArrayField,
  type UiState,
  type CustomField as PuckCustomField,
  createUsePuck,
} from '@measured/puck';
import { FieldWrapper } from './FieldWrapper';
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
import { transformProps, getResolvedBreakpointValue, multipleBreakpointsEnabled } from '@lib/helpers/breakpoints';
import { useActiveBreakpoint } from '@lib/hooks/useActiveBreakpoint';
import { AvailableQueries } from '@hakit/components';
// custom fields
import { Color } from './Fields/Color';
import { Slider } from './Fields/Slider';
import { Entity } from './Fields/Entity';
import { Service } from './Fields/Service';
import { Page } from './Fields/Page';
import { GridField } from './Fields/Grid';
import { ImageUpload } from './Fields/Image';
import { CodeField } from './Fields/Code';
import { InputField } from './Fields/Input';
import { SelectField as CustomSelectField } from './Fields/Select';
import { RadioField as CustomRadioField } from './Fields/Radio';
import { NumberField as CustomNumberField } from './Fields/Number';
import { DefaultPropsCallbackData } from '@typings';
import { HassEntity } from 'home-assistant-js-websocket';
import { OnValidate } from '@monaco-editor/react';

type BaseField = Omit<PuckBaseField, 'visible'>;

type ExtendedFieldTypes<DataShape = unknown> = {
  description?: string;
  icon?: ReactNode;
  readOnly?: boolean;
  className?: string;
  id?: string;
  /** If the field is required or not TODO - Test this */
  required?: boolean;
  /** The default value of the field if no value is saved or present */
  default: unknown;
  /** if enabled, the breakpoint wrapper logic will not be applied @default false */
  disableBreakpoints?: boolean;
  /** if provided, the field will be collapsible @default undefined */
  collapsible?: {
    open?: boolean;
  };
  label: string;
  /** used to determine if we want to show the current field either based on the current data or just a hard coded boolean value */
  visible?: boolean | ((data: DataShape) => boolean);
};

type EntityField<DataShape = unknown> = BaseField &
  Omit<ExtendedFieldTypes<DataShape>, 'default'> & {} & {
    type: 'entity';
    options: HassEntity[] | ((data: DefaultPropsCallbackData) => Promise<HassEntity[]> | HassEntity[]);
    default: (options: HassEntity[], data: DefaultPropsCallbackData) => Promise<string | undefined> | string | undefined;
  };

type ServiceField = BaseField & {
  type: 'service';
};

type ColorField = BaseField & {
  type: 'color';
};

type ImageUploadField = BaseField & {
  type: 'imageUpload';
};

type PageField = BaseField & {
  type: 'page';
};
type PagesField = BaseField & {
  type: 'pages';
  min?: number;
  max?: number;
};

export type CodeField = BaseField & {
  type: 'code';
  onValidate?: OnValidate;
  language?: 'yaml' | 'json' | 'javascript' | 'css' | 'html' | 'jinja2';
};

type SliderField = BaseField & {
  type: 'slider';
  min?: number;
  max?: number;
  step?: number;
};

type GridField = BaseField & {
  type: 'grid';
  min?: number;
  max?: number;
  step?: number;
};

type HiddenField = {
  type: 'hidden';
};

type DividerField = BaseField & {
  type: 'divider';
  label: string;
};

type CustomObjectField<
  Props extends DefaultComponentProps = DefaultComponentProps,
  E extends DefaultComponentProps = DefaultComponentProps,
  DataShape = unknown,
> = Omit<ObjectField<Props>, 'objectFields'> & {
  objectFields: Props extends unknown[]
    ? never
    : {
        [SubPropName in keyof Props]: CustomFields<Props[SubPropName], E, DataShape>;
      };
};

type CustomArrayField<
  Props extends DefaultComponentProps = DefaultComponentProps,
  E extends DefaultComponentProps = DefaultComponentProps,
  DataShape = unknown,
> = Omit<ArrayField<Props extends { [key: string]: any } ? Props : any>, 'arrayFields'> & {
  arrayFields: {
    [SubPropName in keyof Props[0]]: CustomFields<Props[0][SubPropName], E, DataShape>;
  };
};

type CustomField<
  Props extends DefaultComponentProps = DefaultComponentProps,
  E extends DefaultComponentProps = DefaultComponentProps,
> = BaseField &
  E & {
    type: 'custom';
    render: (props: {
      field: PuckCustomField<Props>;
      name: string;
      id: string;
      value: Props;
      onChange: (value: Props) => void;
      readOnly?: boolean;
    }) => React.ReactElement;
  };

export type CustomFields<
  Props extends DefaultComponentProps = DefaultComponentProps,
  E extends DefaultComponentProps = DefaultComponentProps,
  DataShape = unknown,
> =
  | (
      | (TextField & ExtendedFieldTypes<DataShape> & E)
      | (NumberField & ExtendedFieldTypes<DataShape> & E)
      | (TextareaField & ExtendedFieldTypes<DataShape> & E)
      | (SelectField & ExtendedFieldTypes<DataShape> & E)
      | (RadioField & ExtendedFieldTypes<DataShape> & E)
      | (PageField & ExtendedFieldTypes<DataShape> & E)
      | (PagesField & ExtendedFieldTypes<DataShape> & E)
      | (ServiceField & ExtendedFieldTypes<DataShape> & E)
      | (ColorField & ExtendedFieldTypes<DataShape> & E)
      | (CustomObjectField<Props, E, DataShape> & ExtendedFieldTypes<DataShape> & E)
      | (CustomArrayField<Props, E, DataShape> & ExtendedFieldTypes<DataShape> & E)
      | (ImageUploadField & ExtendedFieldTypes<DataShape> & E)
      | (SliderField & ExtendedFieldTypes<DataShape> & E)
      | (GridField & ExtendedFieldTypes<DataShape> & E)
      | (CodeField & ExtendedFieldTypes<DataShape> & E)
      | (DividerField & ExtendedFieldTypes<DataShape> & E)
      | CustomField<Props, E>
    )
  | (HiddenField & E)
  | (EntityField<DataShape> & E);

export type CustomFieldsWithDefinition<Props extends DefaultComponentProps, DataShape = unknown> = CustomField<
  Props,
  {
    _field: Props extends DefaultComponentProps[]
      ? {
          type: 'array';
          arrayFields: {
            [SubPropName in keyof Props[0]]: CustomFields<
              Props[0][SubPropName],
              CustomFieldsWithDefinition<Props[0][SubPropName], DataShape>,
              DataShape
            >;
          };
        } & ExtendedFieldTypes<DataShape>
      : Props extends { [key: string]: any }
        ? {
            type: 'object';
            objectFields: {
              [SubPropName in keyof Props]: CustomFields<
                Props[SubPropName],
                CustomFieldsWithDefinition<Props[SubPropName], DataShape>,
                DataShape
              >;
            };
          } & ExtendedFieldTypes<DataShape>
        : CustomFields<Props, object, DataShape>;
  }
>;

export type CustomFieldsConfiguration<
  ComponentProps extends DefaultComponentProps = DefaultComponentProps,
  WithField extends boolean = false,
  DataShape = unknown,
> = {
  [PropName in keyof Omit<ComponentProps, 'editMode'>]: WithField extends true
    ? CustomFieldsWithDefinition<ComponentProps[PropName], DataShape>
    : CustomFields<ComponentProps[PropName], object, DataShape>;
};

type FieldTypes = CustomFields extends { type: infer T } ? T : never;

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

const usePuck = createUsePuck();

/**
 * Helper function to create custom fields (cf - custom field)
 */
export function createCustomField<Props extends DefaultComponentProps = DefaultComponentProps>(
  field: CustomFields<Props>
): CustomFieldsWithDefinition<Props> {
  const automaticDisableBreakpointsForTypes: FieldTypes[] = ['object', 'array', 'divider'];
  // default values for the field
  field.disableBreakpoints = automaticDisableBreakpointsForTypes.includes(field.type)
    ? true
    : (field.disableBreakpoints ?? BREAKPOINT_LOGIC_DEFAULT_DISABLED);
  const _field = field as CustomFieldsWithDefinition<Props>['_field'];
  return {
    type: 'custom',
    _field,
    render({ name, onChange: puckOnChange, value: puckValue, id }) {
      const _icon = useMemo(() => field.icon ?? ICON_MAP[field.type], []);
      const appState = usePuck(c => c.appState);
      const selectedItem = usePuck(c => c.selectedItem);
      // fine to use hooks here, eslint just doesn't know it's a component render, with a wrapping component it may cause more renders than necessary
      const activeBreakpoint = useActiveBreakpoint();

      const isVisible = useMemo(() => {
        if (typeof _field.visible === 'function') {
          // If there's no expected selectedItem, we can assume the root options should be shown
          const visibleData = selectedItem
            ? transformProps(selectedItem.props, activeBreakpoint)
            : appState.data.root?.props
              ? transformProps(appState.data.root.props, activeBreakpoint)
              : null;
          if (!visibleData) return;
          return _field.visible(visibleData);
        }
        return _field.visible ?? true;
      }, [
        appState.data.root,
        // TODO test this visible logic, If this stopps working when values change, add the puckValue back in
        // puckValue,
        selectedItem,
        activeBreakpoint,
      ]);

      const valOrDefault = useMemo(() => {
        return (
          puckValue ??
          (field.disableBreakpoints
            ? field.default
            : {
                xlg: field.default,
              })
        );
      }, [puckValue]);

      const [breakpointMode, setBreakpointMode] = useState(multipleBreakpointsEnabled(valOrDefault));

      // intentionally using any here as the value will be unknown in this context
      // and we can't use unknown as the value properties expect the shape type of the CustomField
      const value = useMemo(() => {
        return field.disableBreakpoints ? valOrDefault : getResolvedBreakpointValue<any>(valOrDefault, activeBreakpoint);
      }, [valOrDefault, activeBreakpoint]);
      const commonAutoFieldProps = {
        name,
        id: field.id,
        readOnly: field.readOnly,
      };
      const onChange = (value: unknown, uiState?: Partial<UiState>) => {
        if (typeof value === 'undefined') return;
        if (field.disableBreakpoints) {
          // @ts-expect-error - Types are wrong in internal types for puck, uiState is required
          puckOnChange(value as Props, uiState);
        } else if (typeof value !== 'undefined') {
          const xlg = 'xlg' as keyof AvailableQueries;
          const newValue = breakpointMode
            ? {
                ...valOrDefault,
                [activeBreakpoint]: value,
              }
            : ({
                [xlg]: value,
              } as Props);
          // send back the converted breakpoint value
          // @ts-expect-error - Types are wrong in internal types for puck, uiState is required
          puckOnChange(newValue, uiState);
        }
      };

      if (!isVisible) {
        return <></>;
      }

      if (field.type === 'hidden') {
        return <input type='hidden' value={value as unknown as string} />;
      }

      return (
        <FieldWrapper
          key={id}
          disableBreakpoints={field.disableBreakpoints ?? BREAKPOINT_LOGIC_DEFAULT_DISABLED}
          activeBreakpoint={activeBreakpoint}
          providedBreakpointValues={Object.entries(valOrDefault ?? {}).map(([key, val]) => [key, `${val}`])}
          breakpointMode={breakpointMode}
          onToggleBreakpointMode={() => {
            const isBreakpointModeEnabled = !breakpointMode;
            // because the onChange method is memoized, we need to call it here to ensure the value is updated
            // immediately when the breakpoint mode is toggled
            if (!isBreakpointModeEnabled) {
              const xlg = 'xlg' as keyof AvailableQueries;
              const newValue = {
                [xlg]: valOrDefault[xlg] ?? value,
              } as Props;
              // send back the converted breakpoint value
              puckOnChange(newValue);
            }
            setBreakpointMode(!breakpointMode);
          }}
          description={field.description}
          icon={_icon}
          label={field.label ?? 'Unknown'}
          readOnly={field.readOnly}
          type={field.type}
          collapsible={field.collapsible}
          className={field.className}
        >
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
                console.log('selectedOption', selectedOption);
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
                    const actualItem = transformProps(item, activeBreakpoint);
                    return field.getItemSummary(actualItem, i);
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
        </FieldWrapper>
      );
    },
  };
}

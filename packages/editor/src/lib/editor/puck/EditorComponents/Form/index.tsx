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
  type BaseField,
  type ObjectField,
  type ArrayField,
  type UiState,
  type CustomField as PuckCustomField,
} from '@measured/puck';
import { FieldWrapper } from './FieldWrapper/index.js';
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
} from 'lucide-react';
import { getResolvedBreakpointValue, multipleBreakpointsEnabled } from '@editor/helpers/breakpoints';
import { useActiveBreakpoint } from '@editor/hooks/useActiveBreakpoint';
import { AvailableQueries } from '@hakit/components';
// custom fields
import { ColorPicker } from './CustomFields/color';
import { Slider } from './CustomFields/slider';
import { Entity } from './CustomFields/entity';
import { Service } from './CustomFields/service';
import { NavigateField } from './CustomFields/navigate';
import { GridField } from './CustomFields/grid.js';
import { ImageUpload } from './CustomFields/imageUpload';
import { DefaultPropsCallbackData } from '@typings';
import { HassEntity } from 'home-assistant-js-websocket';

type ExtendedFieldTypes = {
  description?: string;
  icon?: ReactNode;
  readOnly?: boolean;
  className?: string;
  id?: string;
  required?: boolean;
  hide?: boolean;
  default: unknown;
  /** if enabled, the breakpoint wrapper logic will not be applied @default false */
  disableBreakpoints?: boolean;
  /** if provided, the field will be collapsible @default undefined */
  collapsible?: {
    open?: boolean;
  };
  label: string;
};

type EntityField = BaseField &
  Omit<ExtendedFieldTypes, 'default'> & {} & {
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

type NavigateField = BaseField & {
  type: 'navigate';
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

type CustomObjectField<
  Props extends DefaultComponentProps = DefaultComponentProps,
  E extends DefaultComponentProps = DefaultComponentProps,
> = Omit<ObjectField<Props>, 'objectFields'> & {
  objectFields: Props extends unknown[]
    ? never
    : {
        [SubPropName in keyof Props]: CustomFields<Props[SubPropName], E>;
      };
};

type CustomArrayField<
  Props extends DefaultComponentProps = DefaultComponentProps,
  E extends DefaultComponentProps = DefaultComponentProps,
> = Omit<
  ArrayField<
    Props extends {
      [key: string]: any;
    }
      ? Props
      : any
  >,
  'arrayFields'
> & {
  arrayFields: {
    [SubPropName in keyof Props[0]]: CustomFields<Props[0][SubPropName], E>;
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
> =
  | ((
      | TextField
      | NumberField
      | TextareaField
      | SelectField
      | RadioField
      | NavigateField
      | ServiceField
      | ColorField
      | CustomObjectField<Props, E>
      | CustomArrayField<Props, E>
      | ImageUploadField
      | SliderField
      | GridField
      | CustomField<Props, E>
    ) &
      ExtendedFieldTypes &
      E)
  | (HiddenField & E)
  | (EntityField & E);


export type CustomFieldsWithDefinition<Props extends DefaultComponentProps> = CustomField<
  Props,
  {
    _field: Props extends DefaultComponentProps[]
      ? {
          type: 'array';
          arrayFields: {
            [SubPropName in keyof Props[0]]: CustomFields<Props[0][SubPropName], CustomFieldsWithDefinition<Props[0][SubPropName]>>;
          };
        } & ExtendedFieldTypes
      : Props extends { [key: string]: any }
        ? {
            type: 'object';
            objectFields: {
              [SubPropName in keyof Props]: CustomFields<Props[SubPropName], CustomFieldsWithDefinition<Props[SubPropName]>>;
            };
          } & ExtendedFieldTypes
        : CustomFields<Props>;
  }
>;

export type CustomFieldsConfiguration<
  ComponentProps extends DefaultComponentProps = DefaultComponentProps,
  WithField extends boolean = false,
> = {
  [PropName in keyof Omit<ComponentProps, 'editMode'>]: WithField extends true
    ? CustomFieldsWithDefinition<ComponentProps[PropName]>
    : CustomFields<ComponentProps[PropName]>;
};

type FieldTypes = CustomFields extends { type: infer T } ? T : never;

// Create an object with keys based on the extracted type values
const ICON_MAP: { [key in FieldTypes]: ReactNode } = {
  text: <Type size={16} />,
  imageUpload: <ImagePlus size={16} />,
  number: <Hash size={16} />,
  navigate: <ExternalLink size={16} />,
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
  // not seen anyway
  hidden: <Hash size={16} />,
};

const BREAKPOINT_LOGIC_DEFAULT_DISABLED = false;

/**
 * Helper function to create custom fields (cf - custom field)
 */
export function createCustomField<Props extends DefaultComponentProps = DefaultComponentProps>(
  field: CustomFields<Props>
): CustomField<Props> & {
  _field: CustomFields<Props>;
} {
  const automaticDisableBreakpointsForTypes = ['object', 'array'];
  // default values for the field
  field.disableBreakpoints = automaticDisableBreakpointsForTypes.includes(field.type)
    ? true
    : (field.disableBreakpoints ?? BREAKPOINT_LOGIC_DEFAULT_DISABLED);
  return {
    type: 'custom',
    _field: field,
    render({ name, onChange: puckOnChange, value: puckValue, id }) {
      const _icon = field.icon ?? ICON_MAP[field.type];

      const valOrDefault = useMemo(
        () =>
          puckValue ??
          (field.disableBreakpoints
            ? field.default
            : {
                xlg: field.default,
              }),
        [puckValue]
      );

      const [breakpointMode, setBreakpointMode] = useState(multipleBreakpointsEnabled(valOrDefault));
      // fine to use hooks here, eslint just doesn't know it's a component render, with a wrapping component it may cause more renders than necessary
      const activeBreakpoint = useActiveBreakpoint();
      // intentionally using any here as the value will be unknown in this context
      // and we can't use unknown as the value properties expect the shape type of the CustomField
      const value = field.disableBreakpoints ? valOrDefault : getResolvedBreakpointValue<any>(valOrDefault, activeBreakpoint);
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

      if (field.type === 'hidden') {
        return <input type='hidden' value={value as unknown as string} />;
      }

      // TODO - This is re-rendering when the sidebar is resizing, need to figure out why
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

          {field.type === 'navigate' && <NavigateField value={value} label={field.label} onChange={onChange} />}
          {field.type === 'entity' && <Entity options={field.options as HassEntity[]} value={value} onChange={onChange} />}
          {field.type === 'service' && <Service value={value} onChange={onChange} />}
          {field.type === 'color' && <ColorPicker value={value} onChange={onChange} />}
          {field.type === 'slider' && <Slider value={value} min={field.min} max={field.max} step={field.step} onChange={onChange} />}
          {field.type === 'text' && (
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
          {field.type === 'number' && (
            <AutoField
              field={{
                type: field.type,
                label: field.label ?? 'Unknown',
                min: field.min,
                max: field.max,
                step: field.step,
                ...commonAutoFieldProps,
              }}
              onChange={onChange}
              value={value}
            />
          )}
          {field.type === 'select' && (
            <AutoField
              field={{
                type: field.type,
                label: field.label ?? 'Unknown',
                options: field.options,
                ...commonAutoFieldProps,
              }}
              onChange={onChange}
              value={value}
            />
          )}
          {field.type === 'radio' && (
            <AutoField
              field={{
                type: field.type,
                label: field.label ?? 'Unknown',
                options: field.options,
                ...commonAutoFieldProps,
              }}
              onChange={onChange}
              value={value}
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
                getItemSummary: field.getItemSummary,
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
        </FieldWrapper>
      );
    },
  };
}

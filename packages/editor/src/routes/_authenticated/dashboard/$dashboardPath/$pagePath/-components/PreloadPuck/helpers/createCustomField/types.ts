/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  type DefaultComponentProps,
  type TextField,
  type NumberField,
  type TextareaField,
  type SelectField,
  type RadioField,
  type BaseField as PuckBaseField,
  type ObjectField,
  type ArrayField,
  type CustomField as PuckCustomField,
} from '@measured/puck';
import { ReactNode } from 'react';
// custom fields
import { DefaultPropsCallbackData } from '@typings/puck';
import { HassEntity } from 'home-assistant-js-websocket';
import { OnValidate } from '@monaco-editor/react';

type BaseField = Omit<PuckBaseField, 'visible'>;

export type ExtendedFieldTypes<DataShape = unknown> = {
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
  visible?: (data: DataShape) => boolean;
};

export type EntityField<DataShape = unknown> = BaseField &
  Omit<ExtendedFieldTypes<DataShape>, 'default'> & {} & {
    type: 'entity';
    options: HassEntity[] | ((data: DefaultPropsCallbackData) => Promise<HassEntity[]> | HassEntity[]);
    default: (options: HassEntity[], data: DefaultPropsCallbackData) => Promise<string | undefined> | string | undefined;
  };

export type ServiceField = BaseField & {
  type: 'service';
};

export type ColorField = BaseField & {
  type: 'color';
};

export type ImageUploadField = BaseField & {
  type: 'imageUpload';
};

export type PageField = BaseField & {
  type: 'page';
};
export type PagesField = BaseField & {
  type: 'pages';
  min?: number;
  max?: number;
};

export type CodeField = BaseField & {
  type: 'code';
  onValidate?: OnValidate;
  language?: 'yaml' | 'json' | 'javascript' | 'css' | 'html' | 'jinja2';
};

export type SliderField = BaseField & {
  type: 'slider';
  min?: number;
  max?: number;
  step?: number;
};

export type GridField = BaseField & {
  type: 'grid';
  min?: number;
  max?: number;
  step?: number;
};

export type HiddenField = Pick<ExtendedFieldTypes, 'default' | 'disableBreakpoints'> & {
  type: 'hidden';
};

export type DividerField = BaseField & {
  type: 'divider';
  label: string;
};

export type CustomObjectField<
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

export type CustomArrayField<
  Props extends DefaultComponentProps = DefaultComponentProps,
  E extends DefaultComponentProps = DefaultComponentProps,
  DataShape = unknown,
> = Omit<ArrayField<Props extends { [key: string]: any } ? Props : any>, 'arrayFields'> & {
  arrayFields: {
    [SubPropName in keyof Props[0]]: CustomFields<Props[0][SubPropName], E, DataShape>;
  };
};

export type CustomField<
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
// field keys that we are replacing with our own
type ExcludePuckKeys = keyof ExtendedFieldTypes;

export type CustomFields<
  Props extends DefaultComponentProps = DefaultComponentProps,
  E extends DefaultComponentProps = DefaultComponentProps,
  DataShape = unknown,
> =
  | (Omit<TextField, ExcludePuckKeys> & ExtendedFieldTypes<DataShape> & E)
  | (Omit<NumberField, ExcludePuckKeys> & ExtendedFieldTypes<DataShape> & E)
  | (Omit<TextareaField, ExcludePuckKeys> & ExtendedFieldTypes<DataShape> & E)
  | (Omit<SelectField, ExcludePuckKeys> & ExtendedFieldTypes<DataShape> & E)
  | (Omit<RadioField, ExcludePuckKeys> & ExtendedFieldTypes<DataShape> & E)
  | (Omit<PageField, ExcludePuckKeys> & ExtendedFieldTypes<DataShape> & E)
  | (Omit<PagesField, ExcludePuckKeys> & ExtendedFieldTypes<DataShape> & E)
  | (Omit<ServiceField, ExcludePuckKeys> & ExtendedFieldTypes<DataShape> & E)
  | (Omit<ColorField, ExcludePuckKeys> & ExtendedFieldTypes<DataShape> & E)
  | (Omit<ImageUploadField, ExcludePuckKeys> & ExtendedFieldTypes<DataShape> & E)
  | (Omit<SliderField, ExcludePuckKeys> & ExtendedFieldTypes<DataShape> & E)
  | (Omit<GridField, ExcludePuckKeys> & ExtendedFieldTypes<DataShape> & E)
  | (Omit<CodeField, ExcludePuckKeys> & ExtendedFieldTypes<DataShape> & E)
  | (Omit<DividerField, ExcludePuckKeys> & ExtendedFieldTypes<DataShape> & E)
  | (Omit<CustomArrayField<Props, E, DataShape>, ExcludePuckKeys> & ExtendedFieldTypes<DataShape> & E)
  | (Omit<CustomObjectField<Props, E, DataShape>, ExcludePuckKeys> & Omit<ExtendedFieldTypes<DataShape>, 'default'> & E)
  | CustomField<Props, E>
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

export type FieldTypes = CustomFields extends { type: infer T } ? T : never;

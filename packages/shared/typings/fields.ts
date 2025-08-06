/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  DefaultComponentProps,
  TextField,
  NumberField,
  TextareaField,
  SelectField,
  RadioField,
  BaseField as PuckBaseField,
  ObjectField,
  ArrayField,
  SlotField as PuckSlotField,
  CustomField as PuckCustomField,
} from '@measured/puck';
import type { ReactNode } from 'react';
import type { DefaultPropsCallbackData } from './puck';
import type { HassEntity } from 'home-assistant-js-websocket';
import type { OnValidate } from '@monaco-editor/react';

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
  /** if enabled, this field will be able to configure different values at different breakpoints @default true */
  responsiveMode?: boolean;
  /** Make the current field collapsible by providing this object, and a default state if desired @default undefined */
  collapseOptions?: {
    /** Should the collapsable area start expanded @default true */
    startExpanded?: boolean;
  };
  label: string;
  /** used to determine if we want to show the current field either based on the current data or just a hard coded boolean value */
  visible?: (data: Omit<DataShape, 'id'>) => boolean;
};

export type EntityField<DataShape = unknown> = BaseField &
  Omit<ExtendedFieldTypes<DataShape>, 'default'> & {
    type: 'entity';
    options: HassEntity[] | ((data: DefaultPropsCallbackData) => Promise<HassEntity[]> | HassEntity[]);
    default: (options: HassEntity[], data: DefaultPropsCallbackData) => Promise<string | undefined> | string | undefined;
  };

export type SlotField = Omit<PuckSlotField, keyof PuckBaseField>;

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

export type SwitchField = BaseField & {
  type: 'switch';
};

export type GridField = BaseField & {
  type: 'grid';
  min?: number;
  max?: number;
  step?: number;
};

export type HiddenField = Pick<ExtendedFieldTypes, 'default' | 'responsiveMode'> & {
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
  | (Omit<SwitchField, ExcludePuckKeys> & ExtendedFieldTypes<DataShape> & E)
  | (Omit<DividerField, ExcludePuckKeys> & ExtendedFieldTypes<DataShape> & E)
  | (Omit<CustomArrayField<Props, E, DataShape>, ExcludePuckKeys> & ExtendedFieldTypes<DataShape> & E)
  | (Omit<CustomObjectField<Props, E, DataShape>, ExcludePuckKeys> & Omit<ExtendedFieldTypes<DataShape>, 'default'> & E)
  | CustomField<Props, E>
  | SlotField
  | (HiddenField & E)
  | (EntityField<DataShape> & E);

export type CustomFieldsWithDefinition<Props extends DefaultComponentProps, DataShape = unknown> = CustomField<
  Props,
  {
    _field: (Props extends DefaultComponentProps[]
      ? Omit<ArrayField<Props extends { [key: string]: any } ? Props : any>, 'arrayFields' | 'visible'> & {
          arrayFields: {
            [SubPropName in keyof Props[0]]: CustomFields<
              Props[0][SubPropName],
              CustomFieldsWithDefinition<Props[0][SubPropName], DataShape>,
              DataShape
            >;
          };
        } & ExtendedFieldTypes<DataShape>
      : Props extends { [key: string]: any }
        ? Omit<ObjectField<Props>, 'objectFields' | 'visible'> & {
            objectFields: {
              [SubPropName in keyof Props]: CustomFields<
                Props[SubPropName],
                CustomFieldsWithDefinition<Props[SubPropName], DataShape>,
                DataShape
              >;
            };
          } & Omit<ExtendedFieldTypes<DataShape>, 'default'>
        : CustomFields<Props, object, DataShape>) & {
      repositoryId?: string;
    };
  }
>;

export type FieldConfiguration<ComponentProps extends DefaultComponentProps = DefaultComponentProps, DataShape = unknown> = {
  [PropName in keyof Omit<ComponentProps, 'editMode'>]: CustomFields<ComponentProps[PropName], object, DataShape>;
};

export type FieldConfigurationWithDefinition<ComponentProps extends DefaultComponentProps = DefaultComponentProps, DataShape = unknown> = {
  [PropName in keyof Omit<ComponentProps, 'editMode'>]: ComponentProps[PropName] extends { type: 'slot' }
    ? SlotField
    : CustomFieldsWithDefinition<ComponentProps[PropName], DataShape>;
};

export type FieldTypes = CustomFields extends { type: infer T } ? T : never;

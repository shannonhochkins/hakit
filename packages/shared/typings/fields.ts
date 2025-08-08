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
  ComponentData,
} from '@measured/puck';
import type { ReactNode } from 'react';
import type { DefaultPropsCallbackData, Slot } from './puck';
import type { HassEntity } from 'home-assistant-js-websocket';
import type { OnValidate } from '@monaco-editor/react';
import { AvailableQueries } from '@hakit/components';

type BaseField = Omit<PuckBaseField, 'visible'>;

// New: minimal base for output (definition) fields which excludes ExtendedFieldTypes props from the outer field
type OutputBaseField = Omit<BaseField, keyof ExtendedFieldTypes<any, any>>;

export type ExtendedFieldTypes<DataShape = unknown, Props = unknown> = {
  description?: string;
  icon?: ReactNode;
  readOnly?: boolean;
  className?: string;
  id?: string;
  /** If the field is required or not TODO - Test this */
  required?: boolean;
  /** The default value of the field if no value is saved or present */
  default: Props;
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

export type HiddenField<DataShape = unknown, Props = unknown> = Pick<ExtendedFieldTypes<DataShape, Props>, 'default' | 'responsiveMode'> & {
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

// New: A minimal custom field for output (definition) that does NOT require ExtendedFieldTypes on the outer field
export type CustomFieldWithDefinition<
  Props extends DefaultComponentProps = DefaultComponentProps,
  E extends DefaultComponentProps = DefaultComponentProps,
> = OutputBaseField &
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
  | (Omit<TextField, ExcludePuckKeys> & ExtendedFieldTypes<DataShape, Props> & E)
  | (Omit<NumberField, ExcludePuckKeys> & ExtendedFieldTypes<DataShape, Props> & E)
  | (Omit<TextareaField, ExcludePuckKeys> & ExtendedFieldTypes<DataShape, Props> & E)
  | (Omit<SelectField, ExcludePuckKeys> & ExtendedFieldTypes<DataShape, Props> & E)
  | (Omit<RadioField, ExcludePuckKeys> & ExtendedFieldTypes<DataShape, Props> & E)
  | (Omit<PageField, ExcludePuckKeys> & ExtendedFieldTypes<DataShape, Props> & E)
  | (Omit<PagesField, ExcludePuckKeys> & ExtendedFieldTypes<DataShape, Props> & E)
  | (Omit<ServiceField, ExcludePuckKeys> & ExtendedFieldTypes<DataShape, Props> & E)
  | (Omit<ColorField, ExcludePuckKeys> & ExtendedFieldTypes<DataShape, Props> & E)
  | (Omit<ImageUploadField, ExcludePuckKeys> & ExtendedFieldTypes<DataShape, Props> & E)
  | (Omit<SliderField, ExcludePuckKeys> & ExtendedFieldTypes<DataShape, Props> & E)
  | (Omit<GridField, ExcludePuckKeys> & ExtendedFieldTypes<DataShape, Props> & E)
  | (Omit<CodeField, ExcludePuckKeys> & ExtendedFieldTypes<DataShape, Props> & E)
  | (Omit<SwitchField, ExcludePuckKeys> & ExtendedFieldTypes<DataShape, Props> & E)
  | (Omit<DividerField, ExcludePuckKeys> & ExtendedFieldTypes<DataShape, Props> & E)
  | (Omit<CustomArrayField<Props, E, DataShape>, ExcludePuckKeys> & ExtendedFieldTypes<DataShape, Props> & E)
  | (Omit<CustomObjectField<Props, E, DataShape>, ExcludePuckKeys> & Omit<ExtendedFieldTypes<DataShape, Props>, 'default'> & E)
  | (CustomField<Props, E> & ExtendedFieldTypes<DataShape, Props>)
  | SlotField
  | (HiddenField<DataShape, Props> & E)
  | (EntityField<DataShape> & E);

export type CustomFieldsWithDefinition<Props extends DefaultComponentProps, DataShape = unknown> = CustomFieldWithDefinition<
  Props,
  {
    _field: (Props extends DefaultComponentProps[]
      ? Omit<ArrayField<Props extends { [key: string]: any } ? Props : any>, 'arrayFields' | 'visible'> & {
          arrayFields: {
            [SubPropName in keyof Props[0]]: CustomFieldsWithDefinition<Props[0][SubPropName], DataShape> | SlotField;
          };
        } & ExtendedFieldTypes<DataShape, Props>
      : Props extends { [key: string]: any }
        ? Omit<ObjectField<Props>, 'objectFields' | 'visible'> & {
            objectFields: {
              [SubPropName in keyof Props]: CustomFieldsWithDefinition<Props[SubPropName], DataShape> | SlotField;
            };
          } & Omit<ExtendedFieldTypes<DataShape, Props>, 'default'>
        : CustomFields<Props, object, DataShape>) & {
      repositoryId?: string;
    };
  }
>;

export type FieldConfiguration<
  ComponentProps extends DefaultComponentProps = DefaultComponentProps,
  DataShape = Omit<ComponentData<ComponentProps>, 'type'>['props'],
> = {
  [PropName in keyof Omit<ComponentProps, 'editMode'>]: CustomFields<ComponentProps[PropName], object, DataShape>;
};

export type FieldConfigurationWithDefinition<ComponentProps extends DefaultComponentProps = DefaultComponentProps, DataShape = unknown> = {
  [PropName in keyof Omit<ComponentProps, 'editMode'>]: ComponentProps[PropName] extends { type: 'slot' }
    ? SlotField
    : CustomFieldsWithDefinition<ComponentProps[PropName], DataShape>;
};

export type FieldTypes = CustomFields extends { type: infer T } ? T : never;

export interface InternalComponentFields {
  _activeBreakpoint: keyof AvailableQueries;
  styles: {
    css: string;
  };
}

export interface InternalRootComponentFields {
  content: Slot;
  _activeBreakpoint: keyof AvailableQueries;
  styles: {
    css: string;
  };
}

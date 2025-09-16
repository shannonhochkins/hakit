import type {
  DefaultComponentProps,
  ComponentData,
  SlotField as PuckSlotField,
  CustomField as PuckCustomField,
  NumberField,
  ArrayField,
  SelectField,
  TextareaField,
  RadioField,
  ObjectField,
  TextField,
} from '@measured/puck';
import type { ReactNode } from 'react';
import type { DefaultPropsCallbackData, Slot } from './puck';
import type { HassEntity } from 'home-assistant-js-websocket';
import { AvailableQueries } from '@hakit/components';
import type { OnValidate } from '@monaco-editor/react';

export type SlotField = PuckSlotField;

type ExcludedPuckKeys = 'visible';

// Omit Puck's BaseField.visible for all field variants to avoid clash with our ExtendedFieldTypes.visible
type WithoutPuckFields<F> = F extends unknown ? Omit<F, ExcludedPuckKeys> : never;

// Add field-type-specific extensions (for now: expose render on custom with correct Value)
type WithCustomAdditions<F, Value> = F extends { type: 'custom' } ? { render: PuckCustomField<Value>['render'] } : unknown;

// Compute which ExtendedFieldTypes keys to omit based on the concrete field kind
// - slot: omit all ExtendedFieldTypes (slot shouldn't have these extras)
// - object: omit only 'default' (object container itself has no default, its children do)
// - others: keep all ExtendedFieldTypes keys
type OmitKeysForField<F> = F extends { type: infer T extends PropertyKey }
  ? T extends keyof FieldTypeOmitMap
    ? FieldTypeOmitMap[T]
    : never
  : never;

// Strict augmentation that only augments the current field kind
type AugmentCurrentField<F, Value, DataShape> = WithoutPuckFields<F> &
  Omit<ExtendedFieldTypes<DataShape, Value>, OmitKeysForField<F>> &
  (F extends { type: 'custom' } ? { render: PuckCustomField<Value>['render'] } : unknown);

// Same mapping as FieldDefinition but with ExtendedFieldTypes applied (omitting per FieldTypeOmitMap)
// and with BaseField.visible removed to avoid intersection issues.
type AugmentedFieldDefinition = {
  [K in keyof FieldDefinition]: WithoutPuckFields<FieldDefinition[K]> &
    Omit<ExtendedFieldTypes<unknown, unknown>, OmitKeysForField<FieldDefinition[K]>> &
    WithCustomAdditions<FieldDefinition[K], unknown>;
};

// Recursive field shape for a given Value, using only our FieldDefinition kinds
type FieldFor<Value, DataShape> =
  // Slot passthrough when Value is a slot
  | (Value extends Slot ? SlotField : never)
  // Leaf user fields (non-container kinds)
  | AugmentCurrentField<AugmentedFieldDefinition[Exclude<keyof FieldDefinition, 'object' | 'array' | 'slot'>], Value, DataShape>
  // Object container: carry extras (e.g., collapseOptions) but replace Puck's objectFields typing with our own
  | (AugmentCurrentField<Omit<AugmentedFieldDefinition['object'], 'objectFields'>, Value, DataShape> & {
      objectFields: { [K in keyof Value]: FieldFor<Value[K], DataShape> };
    })
  // Array container (when Value is an array)
  | (Value extends (infer Item)[]
      ? AugmentCurrentField<Omit<AugmentedFieldDefinition['array'], 'arrayFields'>, Value, DataShape> & {
          arrayFields: { [K in keyof Item]: FieldFor<Item[K], DataShape> };
        }
      : never);

export type FieldConfiguration<
  ComponentProps extends DefaultComponentProps = DefaultComponentProps,
  DataShape = Omit<ComponentData<ComponentProps>, 'type'>['props'],
> = {
  [PropName in keyof Omit<ComponentProps, 'editMode'>]: FieldFor<ComponentProps[PropName], DataShape>;
};

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
  /** The label of the field */
  label: string;
  /** used to determine if we want to show the current field based on the current data */
  visible?: (data: Omit<DataShape, 'id'>) => boolean;
  /** Optional template configuration per field */
  templates?: {
    /** Whether templates are enabled for this field. Defaults to true when omitted. */
    enabled?: boolean;
  };
};

// Per-field-type overrides: omit certain ExtendedFieldTypes keys
// Extend this map as needed (example below shows how to omit templates on divider)
// if you omit something here, and add the same key to FieldDefinition, it'll use the type inside FieldDefinition
type FieldTypeOmitMap = {
  slot: keyof ExtendedFieldTypes;
  hidden: Exclude<keyof ExtendedFieldTypes, 'default' | 'visible'>;
  object: 'default';
  entity: 'default';
};

export type FieldDefinition = {
  custom: { type: 'custom' };
  switch: { type: 'switch' };
  text: TextField;
  number: NumberField;
  textarea: TextareaField;
  select: SelectField;
  radio: RadioField;
  page: { type: 'page' };
  pages: { type: 'pages' };
  service: { type: 'service' };
  color: { type: 'color' };
  imageUpload: { type: 'imageUpload' };
  slider: { type: 'slider'; min?: number; max?: number; step?: number };
  grid: { type: 'grid'; step?: number; min?: number; max?: number };
  code: { type: 'code'; language?: 'yaml' | 'json' | 'javascript' | 'css' | 'html' | 'jinja2'; onValidate?: OnValidate };
  divider: { type: 'divider' };
  entity: {
    type: 'entity';
    options: HassEntity[] | ((data: DefaultPropsCallbackData) => Promise<HassEntity[]> | HassEntity[]);
    default: (options: HassEntity[], data: DefaultPropsCallbackData) => Promise<string | undefined> | string | undefined;
  };
  hidden: { type: 'hidden' };
  slot: PuckSlotField;
  object: ObjectField & {
    /** Make the current field collapsible by providing this object, and a default state if desired @default undefined */
    collapseOptions?: {
      /** Should the collapsable area start expanded @default true */
      startExpanded?: boolean;
    };
  };
  array: ArrayField & {
    /** Make the current field collapsible by providing this object, and a default state if desired @default undefined */
    collapseOptions?: {
      /** Should the collapsable area start expanded @default true */
      startExpanded?: boolean;
    };
  };
};

export type FieldTypes = keyof FieldDefinition;

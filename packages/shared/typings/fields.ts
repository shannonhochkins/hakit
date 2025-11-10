import type {
  DefaultComponentProps,
  ComponentData,
  SlotField as PuckSlotField,
  CustomField as PuckCustomField,
  NumberField,
  ArrayField,
  TextareaField,
  RadioField,
  ObjectField,
  TextField,
  SelectField as PuckSelectField,
} from '@measured/puck';
import type { ReactNode } from 'react';
import type { Slot } from './puck';
import type { HassEntity } from 'home-assistant-js-websocket';
import type { OnValidate } from '@monaco-editor/react';
import type { DomainService, EntityName, ServiceData, SnakeOrCamelDomains } from '@hakit/core';
import { icons } from 'lucide-react';

export const units = ['auto', 'px', 'em', 'rem', 'vh', 'vw', '%'] as const;
export type Unit = (typeof units)[number];

export type UnitFieldValueSingle = `${number}${Unit}`;

export type UnitFieldValueAllCorners = `${number}${Unit} ${number}${Unit} ${number}${Unit} ${number}${Unit}`;

export type UnitFieldValue = UnitFieldValueSingle | UnitFieldValueAllCorners | 'auto';

export type PageValue = {
  dashboardId: string;
  pageId: string;
};

export type SlotField = PuckSlotField;

// Unified FieldOption shape.
export interface FieldOption {
  label: string;
  value: string | number | boolean | undefined | null | object;
  // Arbitrary metadata; consumers can store cssVar tokens, custom flags, etc.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta?: Record<string, any>;
}
// some puck types can clash with our own custom ones, so we need to exclude them
type ExcludedPuckKeys = 'visible';

// Omit Puck's BaseField.visible for all field variants to avoid clash with our ExtendedFieldTypes.visible
type WithoutPuckFields<F> = F extends unknown ? Omit<F, ExcludedPuckKeys> : never;

type Kind = keyof FieldDefinition;
type LeafKinds = Exclude<Kind, 'object' | 'array' | 'slot'>;

type ExtKeysForKind<K extends Kind> = K extends keyof FieldTypeOmitMap ? FieldTypeOmitMap[K] : never;

type BaseForKind<K extends Kind> = WithoutPuckFields<FieldDefinition[K]>;
type ExtrasForKind<K extends Kind, Value> = K extends 'custom' ? { render: PuckCustomField<Value>['render'] } : unknown;
type WithExtended<K extends Kind, Value, DataShape> = Omit<ExtendedFieldTypes<DataShape, Value>, ExtKeysForKind<K>>;

type FieldNode<K extends Kind, Value, DataShape> = BaseForKind<K> & WithExtended<K, Value, DataShape> & ExtrasForKind<K, Value>;

// Narrowing helper: ignore optionality when checking compatibility
type BaseV<V> = Exclude<V, undefined | null>;

// BROAD compatibility (boolean prop can use 'switch' OR 'select'/'radio', etc.)
type CompatibleLeafKinds<V> = {
  [K in LeafKinds]: BaseV<V> extends FieldValueByKind[K] ? K : never;
}[LeafKinds];

type LeafField<Value, DataShape> = {
  [K in CompatibleLeafKinds<Value>]: FieldNode<K, Value, DataShape>;
}[CompatibleLeafKinds<Value>];

// Containers stay as before
export type ObjectFieldNode<Value, DataShape> = Omit<FieldNode<'object', Value, DataShape>, 'objectFields'> & {
  objectFields: { [K in keyof Value]: FieldFor<Value[K], DataShape> };
};

type ArrayFieldNode<Value, DataShape> = Value extends (infer Item)[]
  ? Omit<FieldNode<'array', Value, DataShape>, 'arrayFields'> & {
      arrayFields: { [K in keyof Item]: FieldFor<Item[K], DataShape> };
    }
  : never;

// Final recursive shape
type FieldFor<Value, DataShape> =
  | (Value extends Slot ? SlotField : never)
  | LeafField<Value, DataShape>
  | ObjectFieldNode<Value, DataShape>
  | ArrayFieldNode<Value, DataShape>;

export type FieldConfiguration<
  ComponentProps extends DefaultComponentProps = DefaultComponentProps,
  DataShape = Omit<ComponentData<ComponentProps>, 'type'>['props'],
> = {
  [PropName in keyof Omit<ComponentProps, 'editMode'>]: FieldFor<ComponentProps[PropName], DataShape>;
};

export type Navigate = {
  type: 'navigate';
  page: PageValue;
};
export type CallService = {
  type: 'callService';
  callService: {
    entity: EntityName | undefined;
    service: DomainService<SnakeOrCamelDomains> | undefined;
    serviceData: ServiceData<SnakeOrCamelDomains, DomainService<SnakeOrCamelDomains>> | object | undefined;
  };
};
export type Popup = {
  type: 'popup';
  popupId: string;
};
export type None = {
  type: 'none';
};
export type External = {
  type: 'external';
  url: string;
  target: '_blank' | '_self' | '_parent' | '_top';
};

export type Actions = Navigate | CallService | None | External | Popup;

export type ActionTypes = Actions['type'];

export type ThemeFields = {
  override: boolean;
  colors: {
    primary: string;
    surface: string;
    lightMode: boolean;
    tonalityMix: number;
    semantics: {
      success: string;
      warning: string;
      danger: string;
      info: string;
    };
  };
};
export interface InternalComponentFields {
  interactions: {
    tap: Actions;
    hold: Actions & { holdDelay?: number };
    doubleTap: Actions & { doubleTapDelay?: number };
  };
  styles: {
    css: string;
  };
  theme: ThemeFields;
}

export interface InternalRootComponentFields {
  content: Slot;
  popupContent: Slot;
  theme: ThemeFields;
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
  /** The id of the addon that the field belongs to */
  addonId?: string;
  /** The label of the field */
  label: string;
  /** used to determine if we want to show the current field based on the current data */
  visible?: (data: Omit<DataShape, 'id'>) => boolean;
  /** Optional template configuration per field */
  templates?: {
    /** Whether templates are enabled for this field. Defaults to true when omitted. */
    enabled?: boolean;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
};

// Per-field-type overrides: omit certain ExtendedFieldTypes keys
// Extend this map as needed (example below shows how to omit templates on divider)
// if you omit something here, and add the same key to FieldDefinition, it'll use the type inside FieldDefinition
type FieldTypeOmitMap = {
  slot: keyof ExtendedFieldTypes;
  hidden: Exclude<keyof ExtendedFieldTypes, 'default' | 'visible'>;
  object: 'default';
  entity: 'default';
  unit: 'default';
  icon: 'default';
  page: 'default';
  pages: 'default';
  service: 'default';
  select: 'options';
  color: 'default';
};

type ColorGroup = 'primary' | 'surface' | 'info' | 'success' | 'warning' | 'danger';
type ColorStep = '0' | '10' | '20' | '30' | '40' | '50' | '60' | '80' | '90';

// Build all combinations inside var()
type KnownColorVars = `var(--clr-${ColorGroup}-a${ColorStep})`;

// Allow known values with IntelliSense + custom ones if needed
export type ColorVar = KnownColorVars | (string & {}) | undefined;

// What each field actually stores/returns
export type FieldValueByKind = {
  custom: unknown;
  imageUpload: string;
  color: string;
  code: string;
  icon: string;

  page: PageValue;
  pages: PageValue[];

  entity: EntityName;
  service: DomainService<SnakeOrCamelDomains>;

  slider: number;

  text: string;
  number: number;
  select: string | number | boolean;
  radio: string | number | boolean | null;
  switch: boolean;
  textarea: string;

  // containers / special
  object: object;
  array: unknown[];
  hidden: unknown;
  slot: Slot;
  unit: UnitFieldValue;
};

export type FieldDefinition = {
  custom: { type: 'custom' };
  switch: { type: 'switch' };
  icon: { type: 'icon'; default: keyof typeof icons | '' | undefined };
  text: TextField;
  number: NumberField;
  textarea: TextareaField;
  select: Omit<PuckSelectField, 'options'> & {
    options: FieldOption[];
    renderOption?: (option: FieldOption) => string;
    renderValue?: (option: FieldOption) => string;
  };
  radio: RadioField;
  page: { type: 'page'; default: PageValue };
  pages: { type: 'pages'; default: PageValue[] };
  service: { type: 'service'; domain: SnakeOrCamelDomains; default: DomainService<SnakeOrCamelDomains> };
  color: { type: 'color'; hideControls?: boolean; default: ColorVar };
  imageUpload: { type: 'imageUpload' };
  unit: { type: 'unit'; min?: number; max?: number; step?: number; default: UnitFieldValue; supportsAllCorners?: boolean };
  slider: { type: 'slider'; min?: number; max?: number; step?: number };
  code: { type: 'code'; language?: 'yaml' | 'json' | 'javascript' | 'css' | 'html' | 'jinja2'; onValidate?: OnValidate };
  entity: {
    type: 'entity';
    filterOptions?: (entities: HassEntity[]) => HassEntity[];
    default: (options: HassEntity[]) => Promise<EntityName | undefined | string> | EntityName | undefined | string;
  };
  hidden: { type: 'hidden' };
  slot: PuckSlotField;
  object: ObjectField & {
    /** Make the current field collapsible by providing this object, and a default state if desired @default undefined */
    section?: {
      /** Should the collapsable area start expanded @default true */
      expanded?: boolean;
    };
  };
  array: ArrayField & {
    /** Make the current field collapsible by providing this object, and a default state if desired @default undefined */
    section?: {
      /** Should the collapsable area start expanded @default true */
      expanded?: boolean;
    };
  };
};

export type FieldTypes = keyof FieldDefinition;

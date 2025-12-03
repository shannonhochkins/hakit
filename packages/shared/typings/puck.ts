import {
  type DefaultComponentProps,
  type PuckComponent,
  type ComponentConfig,
  type Data,
  type Slot as InternalSlot,
  Config,
} from '@measured/puck';
import { type HassEntities, type HassServices } from 'home-assistant-js-websocket';
import type { Dashboard } from '@typings/hono';
import type {
  FieldConfiguration,
  FieldDefinition,
  FieldFor,
  InternalComponentFields,
  InternalRootComponentFields,
  ObjectFieldNode,
} from '@typings/fields';
import { SerializedStyles } from '@emotion/react';
import type { DeepPartial, SimplifyUnitFieldValue } from '@typings/utils';

// Helper type to remove index signatures from DefaultComponentProps
// This prevents the [key: string]: any from polluting the DataShape
type RemoveIndexSignature<T> = {
  [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K];
};

export type DefaultPropsCallbackData = {
  entities: HassEntities;
  services: HassServices | null;
};

export type InternalRootData = {
  _remoteAddonId?: string; // Optional remote name for tracking
};

// Just for readability, this shouldn't ever change
// this tells typescript to give us the access to the _field type
// type WithField = true;

export type AdditionalRenderProps = {
  /** Unique identifier for the component instance */
  id: string;
  /**
   * Emotion CSS-in-JS styles object containing all styles for the component.
   * Includes styles from the component's `styles` function, style overrides, and internal styles.
   * Automatically applied to all valid React elements except portals (unless `autoWrapComponent` is `false`).
   *
   * @example
   * ```tsx
   * import { css } from '@emotion/react';
   *
   * render(props) {
   *   return <div css={css`${props.css}`}>Content</div>;
   * }
   * ```
   *
   * @remarks Only needed for advanced use cases, such as returning a portal from the render function.
   */
  css?: SerializedStyles;
  /** Indicates whether the component is currently being rendered in edit mode */
  _editMode: boolean;
  /** HAKIT dashboard context containing additional information passed to each component render */
  _dashboard: Dashboard | null;
  /** Drag reference callback function for enabling drag-and-drop functionality in the editor.
   * Automatically assigned to all valid React elements except portals (unless `autoWrapComponent` is `false`).
   */
  _dragRef: ((element: Element | null) => void) | null;
  /** Editor-related references, only available when rendering inside the editor */
  _editor?: {
    /** Document reference for the editor iframe */
    document: Document | null;
    /** Window reference for the editor iframe */
    window: Window | null;
    /** HTML iframe element reference for the editor */
    iframe: HTMLIFrameElement | null;
  };
};

export type IgnorePuckConfigurableOptions =
  | 'resolveFields'
  | 'defaultProps'
  | 'resolveFields'
  | 'resolvePermissions'
  | 'inline'
  | 'category'; // category is handled internally

// Utility types for internalFields configuration

// Recursive type to represent nested omit paths
// e.g., { $interactions: true } or { $appearance: { $typography: { fontFamily: true } } }
// Use `true` to omit a field, `false` to explicitly not omit it (useful when overriding), or a nested object for sub-fields
export type OmitPaths<T> = {
  [K in keyof T]?: T[K] extends object ? true | false | OmitPaths<T[K]> : true | false;
};

// Recursive type to represent nested extend paths (partial FieldConfiguration)
// Allows extending internal fields with new FieldConfiguration fields at any path
// This is used as a fallback when ExtendedInternalFields is not provided
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ExtendPaths<InternalFields = any> = {
  [K in keyof InternalFields]?: InternalFields[K] extends object
    ? ExtendPaths<InternalFields[K]> | Record<string, unknown>
    : Record<string, unknown>;
} & Record<string, unknown>;

// Recursive type to create FieldConfiguration for nested ExtendedInternalFields
// This ensures type safety - all extended fields must be valid FieldConfiguration entries
// The structure matches what applyExtendToFields expects: nested objects with FieldConfiguration at leaf levels
// For object types, it recursively creates NestedFieldConfiguration OR accepts an ObjectFieldNode directly
// (allowing users to provide { type: 'object', objectFields: {...} } directly)
// For primitive types, it uses FieldFor to ensure valid field definitions
export type NestedFieldConfiguration<T, DataShape> = {
  [K in keyof T]: T[K] extends object
    ? NestedFieldConfiguration<T[K], DataShape> | ObjectFieldNode<T[K], DataShape>
    : FieldFor<T[K], DataShape>;
};

// Recursive type to represent nested default value overrides
// e.g., { $appearance: { $typography: { fontFamily: 'system' } } }
export type DefaultPaths<T> = {
  [K in keyof T]?: T[K] extends object ? DefaultPaths<T[K]> : T[K];
};

// Base configuration type for internalFields
type BaseInternalFieldsConfig<InternalFields> = {
  /**
   * Configuration for omitting fields from the component.
   * Use `true` to omit a field, or provide a nested object to omit sub-fields.
   * Set to `false` to disable omitting entirely (useful for overriding parent configurations).
   *
   * @example
   * ```ts
   * omit: {
   *   $appearance: {
   *     background: true, // Omit the entire background section
   *     typography: {
   *       fontFamily: true // Omit only fontFamily from typography
   *     }
   *   }
   * }
   * ```
   */
  omit?: OmitPaths<InternalFields> | false;
  /**
   * Default value overrides for internal fields.
   * Use the same structure as the internal fields with new default values.
   *
   * @example
   * ```ts
   * defaults: {
   *   $appearance: {
   *     design: {
   *       borderEnabled: true // Override borderEnabled default to true
   *     }
   *   }
   * }
   * ```
   */
  defaults?: DefaultPaths<InternalFields>;
};

// Configuration type for internalFields when ExtendedInternalFields is provided
export type InternalFieldsConfigWithExtended<
  InternalFields,
  ExtendedInternalFields extends object,
  DataShape,
> = BaseInternalFieldsConfig<InternalFields> & {
  /**
   * Configuration for extending internal fields with new fields.
   * Extended fields are added at the start (before existing fields) to ensure they appear first in the UI.
   * You can extend at any path in the internal fields structure, or add completely new top-level fields.
   *
   * @remarks
   * When `ExtendedInternalFields` is provided, `extend` is required and must match
   * `NestedFieldConfiguration<ExtendedInternalFields>`. This ensures type safety.
   *
   * @example
   * ```ts
   * extend: {
   *   $appearance: {
   *     design: {
   *       customField: {
   *         type: 'text',
   *         label: 'Custom Field',
   *         default: 'value'
   *       }
   *     }
   *   }
   * }
   * ```
   */
  extend: NestedFieldConfiguration<ExtendedInternalFields, DataShape>;
};

// Configuration type for internalFields when ExtendedInternalFields is not provided
export type InternalFieldsConfigWithoutExtended<InternalFields> = BaseInternalFieldsConfig<InternalFields> & {
  /**
   * Configuration for extending internal fields with new fields.
   * Extended fields are added at the start (before existing fields) to ensure they appear first in the UI.
   * You can extend at any path in the internal fields structure, or add completely new top-level fields.
   *
   * @example
   * ```ts
   * extend: {
   *   $appearance: {
   *     design: {
   *       customField: {
   *         type: 'text',
   *         label: 'Custom Field',
   *         default: 'value'
   *       }
   *     }
   *   }
   * }
   * ```
   */
  extend?: ExtendPaths<InternalFields>;
};

// Main configuration type - conditionally requires extend when ExtendedInternalFields is provided
export type InternalFieldsConfig<
  InternalFields,
  ExtendedInternalFields extends object | undefined = undefined,
  DataShape = unknown,
> = ExtendedInternalFields extends object
  ? InternalFieldsConfigWithExtended<InternalFields, ExtendedInternalFields, DataShape>
  : InternalFieldsConfigWithoutExtended<InternalFields>;

/**
 * Helper type to infer InternalFields based on rootConfiguration
 */
type InferInternalFields<IsRoot extends boolean | undefined> = IsRoot extends true ? InternalRootComponentFields : InternalComponentFields;

/**
 * This type, is so we can override puck values in certain scenarios
 * This type will also be used for external component definitions for users when defining custom components
 * NOTE: Any time this type or related types are updated, the `@hakit/addon` package should be updated to ensure compatibility
 */
// Helper type to merge extended internal fields with base internal fields
// Extended fields are merged with base fields, with base fields taking priority
type MergedInternalFields<
  BaseInternalFields,
  ExtendedInternalFields extends object | undefined = undefined,
> = ExtendedInternalFields extends object ? DeepPartial<ExtendedInternalFields> & BaseInternalFields : BaseInternalFields;

export type CustomComponentConfig<
  Props extends DefaultComponentProps = DefaultComponentProps,
  ExtendedInternalFields extends object | undefined = undefined,
  IsRoot extends boolean | undefined = undefined,
> = Omit<
  ComponentConfig<{
    props: Props;
    fields: FieldDefinition;
  }>,
  IgnorePuckConfigurableOptions | 'render' | 'label' | 'fields'
> & {
  /** Component label displayed in the editor UI */
  label: string;
  /** Indicates whether this configuration is for a dashboard-level (root) component */
  rootConfiguration?: IsRoot;

  /**
   * Controls whether HAKIT automatically applies CSS and drag ref to the returned element.
   *
   * @default `true`
   *
   * @remarks
   * Set to `false` when your component needs to return a fragment, portal, or function component.
   * This should only be used in advanced use cases.
   *
   * @warning
   * When `false`, you must manually apply `_dragRef` to the top-level element returned by your component.
   * Otherwise, drag-and-drop functionality in the editor will not work correctly.
   *
   * @example
   * ```tsx
   * render(props) {
   *   return <div ref={props._dragRef} css={props.css}>My Component</div>;
   * }
   * ```
   */
  autoWrapComponent?: boolean;
  fields: FieldConfiguration<
    Props,
    SimplifyUnitFieldValue<RemoveIndexSignature<Props>> &
      DeepPartial<MergedInternalFields<InferInternalFields<IsRoot>, ExtendedInternalFields>>
  >;
  /**
   * Configuration for internal fields (appearance, interactions, styles, etc.).
   * Allows you to omit, extend, or override default values for internal fields.
   *
   * @example
   * ```ts
   * internalFields: {
   *   omit: { $appearance: { background: true } },
   *   defaults: { $appearance: { design: { borderEnabled: true } } },
   *   extend: { $appearance: { design: { customField: { ... } } } }
   * }
   * ```
   */
  internalFields?: InternalFieldsConfig<
    InferInternalFields<IsRoot>,
    ExtendedInternalFields,
    SimplifyUnitFieldValue<RemoveIndexSignature<Props>> &
      DeepPartial<MergedInternalFields<InferInternalFields<IsRoot>, ExtendedInternalFields>>
  >;
  /** Component render function that receives props and returns a React element */
  render: PuckComponent<
    SimplifyUnitFieldValue<Props> &
      DeepPartial<MergedInternalFields<InferInternalFields<IsRoot>, ExtendedInternalFields>> &
      AdditionalRenderProps
  >;
  /**
   * Optional styles function that returns CSS for component-scoped styling.
   * Can return either a CSS string or an Emotion SerializedStyles object.
   *
   * @param props - Component props including internal fields and additional render props
   * @returns CSS string or Emotion SerializedStyles object
   *
   * @example
   * ```ts
   * styles(props) {
   *   return `background: ${props.backgroundColor}; padding: 1rem;`;
   * }
   * ```
   */
  styles?: (
    props: SimplifyUnitFieldValue<Props> &
      DeepPartial<MergedInternalFields<InferInternalFields<IsRoot>, ExtendedInternalFields>> &
      AdditionalRenderProps
  ) => string | SerializedStyles;
  // Note: defaultProps is intentionally omitted - defaults are handled via individual field definitions
};

export type CustomRootComponentConfig<
  Props extends DefaultComponentProps = DefaultComponentProps,
  ExtendedInternalFields extends object | undefined = undefined,
> = CustomComponentConfig<Props, ExtendedInternalFields, true>;

export type CustomPuckComponentConfig<
  Props extends DefaultComponentProps = DefaultComponentProps,
  ExtendedInternalFields extends object | undefined = undefined,
  IsRoot extends boolean | undefined = undefined,
> = CustomComponentConfig<Props, ExtendedInternalFields, IsRoot> & {
  defaultProps: Props;
};

export type ComponentFactoryData = {
  getAllEntities: () => HassEntities;
  getAllServices: () => Promise<HassServices | null>;
};

export type PuckPageData = Data<DefaultComponentProps, DefaultComponentProps>;

export type CustomConfig<
  Props extends DefaultComponentProps = DefaultComponentProps,
  RootProps extends DefaultComponentProps = DefaultComponentProps,
  IsRoot extends boolean | undefined = undefined,
> = Omit<
  Config<{
    components: Props;
    fields: FieldDefinition;
  }>,
  'components' | 'root' | 'fields' | 'resolveData'
> & {
  components: {
    [ComponentName in keyof Props]: Omit<CustomComponentConfig<Props[ComponentName], undefined, IsRoot>, 'type'>;
  };
  fields?: FieldConfiguration<
    Props,
    SimplifyUnitFieldValue<RemoveIndexSignature<Props>> & DeepPartial<MergedInternalFields<InferInternalFields<IsRoot>, undefined>>
  >;
  root?: Partial<CustomComponentConfig<RootProps, undefined, IsRoot>>;
};

export type CustomPuckConfig<
  Props extends DefaultComponentProps = DefaultComponentProps,
  RootProps extends DefaultComponentProps = DefaultComponentProps,
  IsRoot extends boolean | undefined = undefined,
> = Omit<CustomConfig<Props, RootProps>, 'root' | 'components'> & {
  components: {
    [ComponentName in keyof Props]: Omit<CustomPuckComponentConfig<Props[ComponentName], undefined, IsRoot>, 'type'>;
  };
  root: Partial<CustomPuckComponentConfig<RootProps, undefined, IsRoot>> & {
    defaultProps: RootProps;
  };
};

export type Slot = InternalSlot;

// render function type that matches exactly what CustomComponentConfig expects
export type RenderFn<
  T extends DefaultComponentProps,
  ExtendedInternalFields extends object | undefined = undefined,
  IsRoot extends boolean | undefined = undefined,
> = CustomComponentConfig<T, ExtendedInternalFields, IsRoot>['render'];

// props type for typing the props parameter in render functions
// This type accounts for IsRoot - internal fields are DeepPartial to account for omitted fields
export type RenderProps<
  T extends DefaultComponentProps,
  ExtendedInternalFields extends object | undefined = undefined,
  IsRoot extends boolean | undefined = undefined,
> = Parameters<RenderFn<T, ExtendedInternalFields, IsRoot>>[0];

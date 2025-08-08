import {
  type DefaultComponentProps,
  type PuckComponent,
  type ComponentConfig,
  type ComponentData,
  type Data,
  type Config,
  type Slot as InternalSlot,
  AsFieldProps,
  RootData,
} from '@measured/puck';
import { type HassEntities, type HassServices } from 'home-assistant-js-websocket';
import type { Dashboard } from './hono';
import type { FieldConfiguration, FieldConfigurationWithDefinition, InternalComponentFields } from './fields';

export type DefaultPropsCallbackData = {
  entities: HassEntities;
  services: HassServices | null;
};

export type InternalRootData = {
  _remoteRepositoryId?: string; // Optional remote name for tracking
};

// Just for readability, this shouldn't ever change
// this tells typescript to give us the access to the _field type
// type WithField = true;

export type AdditionalRenderProps = {
  _id: string; // Unique ID for the component instance
  _editMode: boolean; // Whether the component is being rendered in edit mode
  /** the hakit context, this houses additional information to send to each render of each component */
  _dashboard: Dashboard | null;
  _editor?: {
    document: Document | null;
    window: Window | null;
    iframe: HTMLIFrameElement | null;
  };
};

export type IgnorePuckConfigurableOptions =
  | 'resolveFields'
  | 'defaultProps'
  | 'resolveFields'
  | 'resolveData'
  | 'resolvePermissions'
  | 'inline'
  | 'category'; // category is handled internally

/**
 * This type, is so we can override puck values in certain scenarios
 * This type will also be used for external component definitions for users when defining custom components
 * NOTE: Any time this type or related types are updated, the `@hakit/addon` package should be updated to ensure compatibility
 */
export type CustomComponentConfig<
  Props extends DefaultComponentProps = DefaultComponentProps,
  FieldProps extends DefaultComponentProps = Props,
  DataShape = Omit<ComponentData<FieldProps>, 'type'>,
> = Omit<ComponentConfig<Props, FieldProps, DataShape>, IgnorePuckConfigurableOptions | 'fields' | 'render' | 'label'> & {
  // Label is required
  label: string;
  // Custom fields configuration instead of Puck's Fields
  fields: FieldConfiguration<Props, Omit<ComponentData<FieldProps>, 'type'>['props']>;
  render: PuckComponent<Props & InternalComponentFields & AdditionalRenderProps>;
  // Optional styles function that returns CSS string for component-scoped styling
  styles?: (props: Props & InternalComponentFields & AdditionalRenderProps) => string;
  // defaultProps is intentionally omitted, we handle this on individual field definitions
};

export type CustomComponentConfigWithDefinition<
  Props extends DefaultComponentProps = DefaultComponentProps,
  FieldProps extends DefaultComponentProps = Props,
  DataShape = Omit<ComponentData<FieldProps>, 'type'>,
> = Omit<ComponentConfig<Props, FieldProps, DataShape>, IgnorePuckConfigurableOptions | 'fields' | 'render' | 'label'> & {
  // Label is required
  label: string;
  // Custom fields configuration instead of Puck's Fields
  fields: FieldConfigurationWithDefinition<Props, Omit<ComponentData<FieldProps>, 'type'>['props']>;
  render: PuckComponent<Props & InternalComponentFields & AdditionalRenderProps>;
  // Optional styles function that returns CSS string for component-scoped styling
  styles?: (props: Props & InternalComponentFields & AdditionalRenderProps) => string;
  // defaultProps is intentionally omitted, we handle this on individual field definitions
};

export type ComponentFactoryData = {
  getAllEntities: () => HassEntities;
  getAllServices: () => Promise<HassServices | null>;
};

export type PuckPageData = Data<DefaultComponentProps, DefaultComponentProps>;

export type CustomRootConfig<RootProps extends DefaultComponentProps = DefaultComponentProps> = Partial<
  CustomComponentConfig<RootProps, AsFieldProps<RootProps>, RootData<AsFieldProps<RootProps>>>
>;

export type CustomRootConfigWithDefinition<RootProps extends DefaultComponentProps = DefaultComponentProps> = Partial<
  CustomComponentConfigWithDefinition<RootProps, AsFieldProps<RootProps>, RootData<AsFieldProps<RootProps>>>
>;

export type CustomConfigWithDefinition<
  Props extends DefaultComponentProps = DefaultComponentProps,
  RootProps extends DefaultComponentProps = DefaultComponentProps,
  CategoryName extends string = string,
> = Omit<Config<Props, RootProps, CategoryName>, 'components' | 'root' | 'fields'> & {
  components: {
    [ComponentName in keyof Props]: Omit<CustomComponentConfigWithDefinition<Props[ComponentName], Props[ComponentName]>, 'type'>;
  };
  fields?: FieldConfigurationWithDefinition<Props, true>;
  root?: CustomRootConfigWithDefinition<RootProps>;
};

export type Slot = InternalSlot;

// render function type that matches exactly what CustomComponentConfig expects
export type RenderFn<T extends DefaultComponentProps> = CustomComponentConfig<T>['render'];

// props type for typing the props parameter in render functions
export type RenderProps<T extends DefaultComponentProps> = Parameters<RenderFn<T>>[0];

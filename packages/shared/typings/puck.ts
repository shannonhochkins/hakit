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
import type { FieldConfiguration, FieldDefinition, InternalComponentFields } from '@typings/fields';
import { SerializedStyles } from '@emotion/react';

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
  /**  Unique ID for the component instance */
  id: string;
  /**
   * This value is the "styles" value provided by the "styles" function in the component configuration, this is automatically assigned to all valid react elements aside from react portals.
   * Emotion css object to use with emotion/react @example import { css } from '@emotion/react'; add this prop to your element if need be, css={css`${props.css}`}
   * @hint You will only need this if you're doing something advanced, for example, returning a portal from the Render function of your component
   * */
  css?: SerializedStyles;
  /** Whether the component is being rendered in edit mode */
  _editMode: boolean;
  /** the hakit context, this houses additional information to send to each render of each component */
  _dashboard: Dashboard | null;
  /** The drag ref element, this is automatically assigned by default to all valid elements except for react-portals */
  _dragRef: ((element: Element | null) => void) | null;
  /** Editor related references, only available when rendering inside the editor */
  _editor?: {
    /** Reference to the iframe/window/document when rendering inside the editor */
    document: Document | null;
    window: Window | null;
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

/**
 * This type, is so we can override puck values in certain scenarios
 * This type will also be used for external component definitions for users when defining custom components
 * NOTE: Any time this type or related types are updated, the `@hakit/addon` package should be updated to ensure compatibility
 */
export type CustomComponentConfig<Props extends DefaultComponentProps = DefaultComponentProps> = Omit<
  ComponentConfig<{
    props: Props;
    fields: FieldDefinition;
  }>,
  IgnorePuckConfigurableOptions | 'render' | 'label' | 'fields'
> & {
  // Label is required
  label: string;
  /** If this configuration is a dashboard level configuration */
  rootConfiguration?: boolean;
  fields: FieldConfiguration<Props>;
  render: PuckComponent<Props & InternalComponentFields & AdditionalRenderProps>;
  // Optional styles function that returns CSS string for component-scoped styling
  styles?: (props: Props & InternalComponentFields & AdditionalRenderProps) => string | SerializedStyles;
  // defaultProps is intentionally omitted, we handle this on individual field definitions
};

export type CustomPuckComponentConfig<Props extends DefaultComponentProps = DefaultComponentProps> = CustomComponentConfig<Props> & {
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
> = Omit<
  Config<{
    components: Props;
    fields: FieldDefinition;
  }>,
  'components' | 'root' | 'fields' | 'resolveData'
> & {
  components: {
    [ComponentName in keyof Props]: Omit<CustomComponentConfig<Props[ComponentName]>, 'type'>;
  };
  fields?: FieldConfiguration<Props>;
  root?: Partial<CustomComponentConfig<RootProps>>;
};

export type CustomPuckConfig<
  Props extends DefaultComponentProps = DefaultComponentProps,
  RootProps extends DefaultComponentProps = DefaultComponentProps,
> = Omit<CustomConfig<Props, RootProps>, 'root' | 'components'> & {
  components: {
    [ComponentName in keyof Props]: Omit<CustomPuckComponentConfig<Props[ComponentName]>, 'type'>;
  };
  root: Partial<CustomPuckComponentConfig<RootProps>> & {
    defaultProps: RootProps;
  };
};

export type Slot = InternalSlot;

// render function type that matches exactly what CustomComponentConfig expects
export type RenderFn<T extends DefaultComponentProps> = CustomComponentConfig<T>['render'];

// props type for typing the props parameter in render functions
export type RenderProps<T extends DefaultComponentProps> = Parameters<RenderFn<T>>[0];

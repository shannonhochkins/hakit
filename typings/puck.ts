import {
  type DefaultComponentProps,
  type PuckComponent,
  type ComponentConfig,
  type ComponentData,
  type Data,
  type Config,
  type AsFieldProps,
  type RootData,
} from '@measured/puck';
import { type AvailableQueries } from '@hakit/components';
import { type HassEntities, type HassServices } from 'home-assistant-js-websocket';
import type { DashboardPageWithoutData } from './dashboard';
import type { CustomFieldsConfiguration } from './fields';

export type InternalFields = {
  // breakpoint is not saved in the db, this is calculated on the fly
  breakpoint: keyof AvailableQueries;
};

export type DefaultPropsCallbackData = {
  entities: HassEntities;
  services: HassServices | null;
};

// Just for readability, this shouldn't ever change
// this tells typescript to give us the access to the _field type
// type WithField = true;

export type AdditionalRenderProps = {
  /** the hakit context, this houses additional information to send to each render of each component */
  _activeBreakpoint: keyof AvailableQueries;
  _dashboard: DashboardPageWithoutData | null;
  _editor?: {
    document: Document | null;
    window: Window | null;
    iframe: HTMLIFrameElement | null;
  };
};

/**
 * This gross type, is so we can override puck values in certain scenarios
 * This type will also be used for external component definitions for users when defining custom components
 */
export type CustomComponentConfig<
  Props extends DefaultComponentProps = DefaultComponentProps,
  FieldProps extends DefaultComponentProps = Props,
  DataShape = Omit<ComponentData<FieldProps>, 'type'>,
> = Omit<
  ComponentConfig<Props, FieldProps, DataShape>,
  'resolveFields' | 'fields' | 'render' | 'defaultProps' | 'label' | 'resolveFields' | 'resolveData' | 'resolvePermissions'
> & {
  // Label is required
  label: string;
  // Custom fields configuration instead of Puck's Fields
  fields: CustomFieldsConfiguration<Props, false, Omit<ComponentData<FieldProps>, 'type'>['props']>;
  // Enhanced resolveFields with custom field configuration
  // resolveFields?: (
  //   data: DeepPartial<DataShape>,
  //   params: {
  //     changed: Partial<Record<keyof FieldProps, boolean>>;
  //     fields: CustomFieldsConfiguration<FieldProps, WithField>;
  //     lastFields: CustomFieldsConfiguration<FieldProps, WithField>;
  //     lastData: DataShape | null;
  //     appState: AppState;
  //     parent: ComponentData | null;
  //   }
  // ) => Promise<CustomFieldsConfiguration<FieldProps, WithField>> | CustomFieldsConfiguration<FieldProps, WithField>;
  // // Enhanced resolveData with additional context
  // resolveData?: (
  //   data: DeepPartial<DataShape>,
  //   params: {
  //     // Additional context we can provide
  //     entities: HassEntities;
  //     services: HassServices | null;
  //     // puck stuff
  //     changed: Partial<
  //       Record<keyof FieldProps, boolean> & {
  //         id: string;
  //       }
  //     >;
  //     lastData: DataShape | null;
  //     metadata: Metadata;
  //     trigger: ResolveDataTrigger;
  //   }
  // ) => Promise<DeepPartial<DataShape>> | DeepPartial<DataShape>;
  render: PuckComponent<Props & AdditionalRenderProps>;
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

export type CustomConfig<
  Props extends DefaultComponentProps = DefaultComponentProps,
  RootProps extends DefaultComponentProps = DefaultComponentProps,
  CategoryName extends string = string,
> = Omit<Config<Props, RootProps, CategoryName>, 'components' | 'root'> & {
  components: {
    [ComponentName in keyof Props]: Omit<CustomComponentConfig<Props[ComponentName], Props[ComponentName]>, 'type'>;
  };
  root?: CustomRootConfig<RootProps>;
};

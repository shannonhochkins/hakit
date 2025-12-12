/**
 * Main export file for @hakit/addon
 * This file exports types and utilities that can be used by consumers
 * IMPORTANT - Only export types in this file - export utilities and components under the hakit-addon-shared, hakit-addon-utils files inside the editor, then rebuild the addon
 * which will copy the files into the addon package, and then the addon package will be able to use the shared components and utils.
 */
export type Dashboard = {
  path: string;
  id: string;
  name: string;
  thumbnail: string | null;
  createdAt: string;
  updatedAt: string;
  dashboardId: string;
};
import type { DefaultComponentProps } from '@measured/puck';
import type { CustomComponentConfig, CustomRootComponentConfig } from '@typings/puck';

export type { RenderFn, RenderProps } from '@typings/puck';

export type { Slot } from '@typings/puck';
export type { SlotComponent } from '@measured/puck';
import type { FieldConfiguration as InternalFieldConfiguration } from '@typings/fields';

// field configuration object if wanting to define fields separately for shared use
export type FieldConfiguration<T extends DefaultComponentProps> = InternalFieldConfiguration<T>;

// the component definition type
export type ComponentConfig<
  T extends DefaultComponentProps,
  ExtendedInternalFields extends object | undefined = undefined,
> = CustomComponentConfig<T, ExtendedInternalFields>;

export type RootComponentConfig<
  T extends DefaultComponentProps,
  ExtendedInternalFields extends object | undefined = undefined,
> = CustomRootComponentConfig<T, ExtendedInternalFields>;

export type { PageValue, UnitFieldValue, ColorVar } from '@typings/fields';

export type { DashboardPage, DashboardPageWithoutData } from './types/shims/hono-shim';

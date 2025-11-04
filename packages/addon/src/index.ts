/**
 * Main export file for @hakit/addon
 * This file exports types and utilities that can be used by consumers
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
import { type ComponentData, type DefaultComponentProps } from '@measured/puck';
import type { CustomComponentConfig } from '@typings/puck';

export type { RenderFn, RenderProps } from '@typings/puck';

export type { Slot } from '@typings/puck';
import type { FieldConfiguration as InternalFieldConfiguration } from '@typings/fields';

// field configuration object if wanting to define fields separately for shared use
export type FieldConfiguration<T extends DefaultComponentProps> = InternalFieldConfiguration<T, Omit<ComponentData<T>, 'type'>['props']>;

// the component definition type
export type ComponentConfig<T extends DefaultComponentProps> = CustomComponentConfig<T>;

export type { PageValue, UnitFieldValue } from '@typings/fields';

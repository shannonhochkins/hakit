/**
 * Main export file for @hakit/addon
 * This file exports types and utilities that can be used by consumers
 */
import { type ComponentData, type DefaultComponentProps } from '@measured/puck';
import type { CustomComponentConfig } from '@typings/puck';
import type { FieldConfiguration as InternalFieldConfiguration } from '@typings/fields';

// field configuration object if wanting to define fields separately for shared use
export type FieldConfiguration<T extends DefaultComponentProps> = InternalFieldConfiguration<T, Omit<ComponentData<T>, 'type'>['props']>;

// the component definition type
export type ComponentConfig<T extends DefaultComponentProps> = CustomComponentConfig<T>;

// render function type that matches exactly what CustomComponentConfig expects
export type RenderFn<T extends DefaultComponentProps> = ComponentConfig<T>['render'];

// props type for typing the props parameter in render functions
export type RenderProps<T extends DefaultComponentProps> = Parameters<RenderFn<T>>[0];

/**
 * Main export file for @hakit/create-editor
 * This file exports types and utilities that can be used by consumers
 */
import { type ComponentData } from '@measured/puck';
import type { CustomComponentConfig, ComponentProps } from '@typings/puck';
import type { FieldConfiguration as InternalFieldConfiguration } from '@typings/fields';
import type React from 'react';

// field configuration object if wanting to define fields separately for shared use
export type FieldConfiguration<T extends ComponentProps> = InternalFieldConfiguration<T, Omit<ComponentData<T>, 'type'>['props']>;

// the component definition type
export type ComponentConfig<T extends ComponentProps> = Omit<CustomComponentConfig<T>, 'render'> & {
  /**
   * optional render function, or you can export the render function separately
   *
   * @example
   * import { RenderProps } from '@hakit/create-editor';
   * export function Render(props: RenderProps<T>) {
   *   return <div>{props.label}</div>;
   * }
   */

  render?: (props: RenderProps<T>) => React.ReactNode;
};
// generic prop to use for an external render function - matches the render function parameter
export type RenderProps<T extends ComponentProps> = Parameters<CustomComponentConfig<T>['render']>[0];

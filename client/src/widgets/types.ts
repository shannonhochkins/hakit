import { ReactNode } from 'react';
import type { Layout } from 'react-grid-layout';
import widgets from './';
import { PageWidget } from '../store';
import { UiSchema } from '@rjsf/utils';
import { HassEntity } from 'home-assistant-js-websocket';

type BlacklistedProps = 'i' | 'moved' | 'w' | 'h' | 'y' | 'x';

interface AutoEntityOptions {
  // @example ['light', 'switch', 'media_player'] - include only all entities with these domains
  domainWhitelist?: string[];
  // @example ['light', 'switch', 'media_player'] - exclude all entities with these domains
  domainBlacklist?: string[];
  // @example ['time'] - include only all entities with time in the name
  entityWhitelist?: string[];
  // @example ['time'] - exclude all entities with time in the name
  entityBlacklist?: string[];
}
interface EntityPickerOptions {
  /** @example ['light'] - include domains from the entity picker options */
  domainWhitelist?: string[];
  /** @example ['light'] - exclude domains from the entity picker options */
  domainBlacklist?: string[];
  // These options will be provided to the entity picker to filter the list based on the card/component in the schema when adding a new widget
  autoEntityOptions?: AutoEntityOptions;
}

interface PreviewOptions {
  /**
   * the default width of the preview card in pixels when editing/adding this card @default 300
   * Note: This is automatically translated into column widths based on the current layout
   * */
  width?: number;
  /**
   * the default height of the preview card in pixels when editing/adding this card @default 300
   * Note: This is automatically translated into column widths based on the current layout
   * */
  height?: number;
  /**
   * The preview widget will be scaled by this amount @default 1.5
   * */
  scale?: number;
  /**
   * This will disable the fixed size of the preview card allowing it to resize fluidly, enable this
   * if the component has a property that resizes it from the options panel
   */
  noDefaultSize?: boolean;
}

interface ServicePickerOptions {
  domain: string;
}
export interface Widget<T extends object = Record<string, unknown>> {
  /** By default, the entity picker is included, set this to false if it should not be shown, you can also provide additional options on how this entity picker should be displayed
   * @example { domainWhitelist: ['light', 'switch', 'media_player'] } <- will only show entities with these domains
   */
  entityPicker?: EntityPickerOptions | false;
  /** hide or show the service picker @default false */
  servicePicker?: ServicePickerOptions | false;
  previewOptions?: PreviewOptions;
  /** the default layout properties of the card
   * @example if you want the card to be 10 columns wide and 4 columns high
   * layout: {
   *    w: 10,
   *    h: 4,
   * }
   */
  layout?: Partial<Omit<Layout, BlacklistedProps>>;
  /** any changes to the ui schema for reactjs forms @see https://rjsf-team.github.io/react-jsonschema-form/docs/api-reference/uiSchema */
  uiSchema?: UiSchema;
  /** The default props to render with the widget */
  defaultProps?: (entities: HassEntity[]) => T;
  /** @internal use only */
  props?: T,
  /** this function is called internally to render, however you can style/format however you like based on the props picked or based on the other data provided */
  renderer: (props: T, widget?: PageWidget) => ReactNode;
}

export type AvailableWidgets = keyof typeof widgets;

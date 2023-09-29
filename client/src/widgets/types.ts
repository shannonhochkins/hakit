import { ReactNode } from 'react';
import type { Layout } from 'react-grid-layout';
import widgets from './';

type BlacklistedProps = 'i' | 'moved';

export interface Widget<T extends object> {
  layout?: Partial<Omit<Layout, BlacklistedProps>>;
  props: T;
  renderer: (props: T) => ReactNode;
}

export type AvailableWidgets = keyof typeof widgets;

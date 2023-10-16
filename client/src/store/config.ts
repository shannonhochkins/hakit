import type { Layout } from 'react-grid-layout';
import type { PageConfig, Config } from '.';

export const DEFAULT_COLUMNS = 48; // 48 columns
export const DEFAULT_WIDGET_SIZE = 300; // 300px

export const DEFAULT_LAYOUT_PROPS: Partial<Layout> = {
  minW: 1,
  maxW: DEFAULT_COLUMNS,
  static: false,
};

export const DEFAULT_PAGE_CONFIG: PageConfig[] = [{
  id: '1',
  name: 'Mobile',
  icon: 'mdi:cellphone',
  maxWidth: 600,
  enabled: true,
  preventCollision: false,
  allowOverlap: false,
  compactType: 'horizontal',
  widgets: [],
  margin: [10, 10],
  containerPadding: [10, 10],
}, {
  id: '2',
  name: 'Tablet',
  icon: 'mdi:tablet',
  maxWidth: 1280,
  enabled: true,
  preventCollision: false,
  allowOverlap: false,
  compactType: 'horizontal',
  widgets: [],
  margin: [10, 10],
  containerPadding: [10, 10],
}, {
  id: '3',
  name: 'Desktop',
  icon: 'mdi:desktop-windows',
  maxWidth: 1400,
  enabled: true,
  preventCollision: false,
  allowOverlap: false,
  compactType: 'horizontal',
  widgets: [],
  margin: [10, 10],
  containerPadding: [10, 10],
}];

export const DEFAULT_CONFIG: Config = {
  theme: {

  },
  views: [{
    id: '1',
    name: 'Dashboard',
    url: '/',
    pages: DEFAULT_PAGE_CONFIG,
  }],
}

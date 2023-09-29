import type { PageConfig } from '.';

export const DEFAULT_PAGE_CONFIG: PageConfig[] = [{
  id: '1',
  name: 'Mobile',
  icon: 'mdi:cellphone',
  maxWidth: 600,
  enabled: true,
  widgets: [],
  margin: [10, 10],
  containerPadding: [10, 10],
}, {
  id: '2',
  name: 'Tablet',
  icon: 'mdi:tablet',
  maxWidth: 1024,
  enabled: true,
  widgets: [],
  margin: [10, 10],
  containerPadding: [10, 10],
}, {
  id: '3',
  name: 'Desktop',
  icon: 'mdi:desktop-windows',
  maxWidth: 1400,
  enabled: true,
  widgets: [],
  margin: [10, 10],
  containerPadding: [10, 10],
}];

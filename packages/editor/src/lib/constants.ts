import type { BreakpointItem } from '@typings/breakpoints';
export const DEFAULT_DROPZONE_NAME = 'default-zone';
export const SIDEBAR_PANEL_WIDTH = 460;

export const DEFAULT_MAX_BREAKPOINT_SIZE = 1024;

export const DEFAULT_BREAKPOINTS: Required<BreakpointItem[]> = [
  {
    id: 'xxs',
    title: 'Small Mobile',
    width: 320,
    disabled: true,
    editable: true,
  },
  {
    id: 'xs',
    title: 'Mobile',
    width: 480,
    disabled: false,
    editable: true,
  },
  {
    id: 'sm',
    title: 'Large Mobile',
    width: 620,
    disabled: true,
    editable: true,
  },
  {
    id: 'md',
    title: 'Small Tablet',
    width: 768,
    disabled: true,
    editable: true,
  },
  {
    id: 'lg',
    title: 'Tablet',
    width: DEFAULT_MAX_BREAKPOINT_SIZE,
    disabled: false,
    editable: true,
  },
  {
    id: 'xlg',
    title: 'Desktop',
    width: DEFAULT_MAX_BREAKPOINT_SIZE + 1,
    disabled: false,
    editable: false,
  },
];
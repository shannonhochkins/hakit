import type { BreakpointItem } from '@typings/breakpoints';
import {
  TabletSmartphone,
  Smartphone,
  Tablet,
  Monitor,
  Laptop,
  Tv,
  Watch,
  MonitorSpeaker,
  ScreenShare,
  Car,
  Gamepad2,
  Camera,
  Speaker,
} from 'lucide-react';

export const DEFAULT_DROPZONE_NAME = 'default-zone';

export const SIDEBAR_PANEL_WIDTH = 460;

export const DEFAULT_MAX_BREAKPOINT_SIZE = 1024;

// Icon map for breakpoint selection
export const BREAKPOINT_ICONS = {
  'tablet-smartphone': { component: TabletSmartphone, label: 'Tablet/Phone' },
  smartphone: { component: Smartphone, label: 'Smartphone' },
  tablet: { component: Tablet, label: 'Tablet' },
  monitor: { component: Monitor, label: 'Monitor' },
  laptop: { component: Laptop, label: 'Laptop' },
  tv: { component: Tv, label: 'TV' },
  watch: { component: Watch, label: 'Watch' },
  'monitor-speaker': { component: MonitorSpeaker, label: 'Monitor with Speaker' },
  'screen-share': { component: ScreenShare, label: 'Screen Share' },
  car: { component: Car, label: 'Car Display' },
  gamepad: { component: Gamepad2, label: 'Gaming Device' },
  camera: { component: Camera, label: 'Camera' },
  speaker: { component: Speaker, label: 'Speaker' },
} as const;

export const DEFAULT_BREAKPOINTS: Required<BreakpointItem[]> = [
  {
    id: 'xxs',
    title: 'Small Mobile',
    width: 320,
    disabled: true,
    editable: true,
    icon: 'smartphone',
  },
  {
    id: 'xs',
    title: 'Mobile',
    width: 480,
    disabled: false,
    editable: true,
    icon: 'smartphone',
  },
  {
    id: 'sm',
    title: 'Large Mobile',
    width: 620,
    disabled: true,
    editable: true,
    icon: 'tablet-smartphone',
  },
  {
    id: 'md',
    title: 'Small Tablet',
    width: 768,
    disabled: true,
    editable: true,
    icon: 'tablet',
  },
  {
    id: 'lg',
    title: 'Tablet',
    width: DEFAULT_MAX_BREAKPOINT_SIZE,
    disabled: false,
    editable: true,
    icon: 'tablet',
  },
  {
    id: 'xlg',
    title: 'Desktop',
    width: DEFAULT_MAX_BREAKPOINT_SIZE + 1,
    disabled: false,
    editable: false,
    icon: 'monitor',
  },
];

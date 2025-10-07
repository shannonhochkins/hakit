import type { BreakPoint } from '@hakit/components';
import type { BREAKPOINT_ICONS } from '../../editor/src/constants';

export type IconKey = keyof typeof BREAKPOINT_ICONS;

export type BreakpointItem = {
  id: BreakPoint;
  title: string;
  width: number;
  disabled: boolean;
  editable: boolean;
  icon?: IconKey;
};

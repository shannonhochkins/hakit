import type { BreakPoint } from '@hakit/components';

export type BreakpointItem = {
  id: BreakPoint;
  title: string;
  width: number;
  disabled: boolean;
  editable: boolean;
};
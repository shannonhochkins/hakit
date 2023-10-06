import WIDGETS from '@client/widgets';
import type { Widget } from '@client/widgets/types';

export function useWidget() {
  // @ts-expect-error - cannot guarantee the types at this level
  return <T extends keyof typeof WIDGETS>(widgetName: T): Widget => WIDGETS[widgetName] ?? null;
}

export function useWidgets(): Record<string, Widget> {
  // @ts-expect-error - cannot guarantee the types at this level
  return WIDGETS;
}

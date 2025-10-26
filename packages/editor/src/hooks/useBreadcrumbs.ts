import { createUsePuck } from '@measured/puck';
import { useMemo } from 'react';

const usePuck = createUsePuck();

type ItemSelector = {
  index: number;
  zone?: string;
};

type Breadcrumb = {
  id: string;
  label: string;
  isFirst: boolean;
  isLast: boolean;
  selector: ItemSelector | null;
};

type PuckNode = { type: string; props: Record<string, unknown> };

function getNodeId(node: PuckNode | null | undefined): string | undefined {
  const id = node?.props?.['id'];
  return typeof id === 'string' ? id : undefined;
}

export function useBreadcrumbs(renderCount?: number): Breadcrumb[] {
  const selectedItem = usePuck(c => c.appState.ui.itemSelector);
  const config = usePuck(c => c.config);
  const getItemBySelector = usePuck(c => c.getItemBySelector);
  const getSelectorForId = usePuck(c => c.getSelectorForId);
  const selectedNode = selectedItem ? getItemBySelector(selectedItem) : null;
  return useMemo<Breadcrumb[]>(() => {
    const base: Breadcrumb[] = [
      {
        label: 'Dashboard',
        isFirst: true,
        isLast: false,
        selector: null,
        id: 'root',
      },
    ];

    if (!selectedItem || !selectedNode) {
      base[0].isLast = true;
      return typeof renderCount === 'number' && renderCount > 0 ? base.slice(-renderCount) : base;
    }

    const labelFor = (node: PuckNode | null | undefined): string => {
      if (!node) return 'Component';
      const cfg = (config as unknown as { components?: Record<string, { label?: string }> })?.components;
      return cfg?.[node.type]?.label ?? node.type ?? 'Component';
    };

    // Collect ancestors by walking up via selectors (id -> selector -> parent id)
    const pathIds: string[] = [];
    let currentId = getNodeId(selectedNode);
    let safety = 0;
    while (currentId && currentId !== 'root' && safety < 200) {
      pathIds.push(currentId);
      const sel = getSelectorForId(currentId);
      if (!sel?.zone) break;
      const zoneStr = sel.zone;
      const colon = zoneStr.lastIndexOf(':');
      if (colon <= 0) break;
      const parentId = zoneStr.slice(0, colon);
      if (!parentId || parentId === currentId) break; // prevent loops
      currentId = parentId;
      safety++;
    }

    // Reverse to go from highest ancestor (closest to root) down to selected node
    pathIds.reverse();

    for (let i = 0; i < pathIds.length; i++) {
      const id = pathIds[i];
      const sel = getSelectorForId(id) || null;
      const node = sel ? getItemBySelector(sel) : null;
      base.push({
        label: labelFor(node as PuckNode),
        selector: sel,
        isFirst: false,
        isLast: false,
        id,
      });
    }

    // Mark last breadcrumb correctly
    if (base.length > 0) {
      base[base.length - 1].isLast = true;
    }

    const finalCrumbs = typeof renderCount === 'number' && renderCount > 0 ? base.slice(-renderCount) : base;
    return finalCrumbs;
  }, [selectedItem, selectedNode, getSelectorForId, getItemBySelector, config, renderCount]);
}

import { createUsePuck, Data, Slot, WithSlotProps } from '@measured/puck';
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

type DeepPageData = {
  content: Slot;
};
type FakePuckPageData = Data<DeepPageData, DeepPageData>;

function isComponentNode(v: unknown): v is PuckNode {
  return v !== null && typeof v === 'object' && 'type' in v && typeof v.type === 'string' && 'props' in v && typeof v.props === 'object';
}

/**
 * Pull out all "slots" from a node by scanning props for arrays of component nodes.
 * We don't assume slot names; we infer them, so it works for any component config.
 */
function getSlots(node: { props?: Record<string, unknown> }): Array<{ name: string; items: PuckNode[] }> {
  const props = node?.props ?? {};
  const slots: Array<{ name: string; items: PuckNode[] }> = [];
  for (const [key, value] of Object.entries(props)) {
    if (Array.isArray(value) && value.length > 0 && value.every(isComponentNode)) {
      slots.push({ name: key, items: value as PuckNode[] });
    }
  }
  return slots;
}

function getNodeId(node: PuckNode | null | undefined): string | undefined {
  const id = node?.props?.['id'];
  return typeof id === 'string' ? id : undefined;
}

export function useBreadcrumbs(renderCount?: number): Breadcrumb[] {
  const selectedItem = usePuck(c => c.appState.ui.itemSelector);
  const config = usePuck(c => c.config);
  const data = usePuck(c => c.appState.data) as WithSlotProps<FakePuckPageData>;

  return useMemo<Breadcrumb[]>(() => {
    // Start with the default Dashboard crumb once
    const crumbs: Breadcrumb[] = [
      {
        label: 'Dashboard',
        isFirst: true,
        isLast: false,
        selector: null,
        id: 'root',
      },
    ];

    if (!selectedItem) {
      // When nothing is selected, only show the default crumb
      crumbs[0].isLast = true;
      const finalCrumbs = typeof renderCount === 'number' && renderCount > 0 ? crumbs.slice(-renderCount) : crumbs;
      return finalCrumbs;
    }

    const rootContent: PuckNode[] = Array.isArray(data?.root?.props?.content) ? (data.root.props.content as PuckNode[]) : [];

    const zoneStr = selectedItem.zone ?? '';
    const colon = zoneStr.lastIndexOf(':');
    if (colon <= 0) {
      // ⬅️ previously returned [{ label: 'Page', selector: null }]
      return [];
    }
    const componentId = zoneStr.slice(0, colon);
    const slotName = zoneStr.slice(colon + 1);

    const labelFor = (node: PuckNode | null | undefined): string => {
      if (!node) return 'Component';
      const cfg = (config as unknown as { components?: Record<string, { label?: string }> })?.components;
      return cfg?.[node.type]?.label ?? node.type ?? 'Component';
    };

    type StackEntry = {
      node: PuckNode;
      parentId: string;
      parentSlot: string;
      indexInParent: number;
    };

    const path: StackEntry[] = [];
    let found = false;

    const pushAndRecurse = (current: PuckNode, parentId: string, parentSlot: string, indexInParent: number): boolean => {
      path.push({ node: current, parentId, parentSlot, indexInParent });

      if (getNodeId(current) === componentId) {
        return true;
      }

      for (const slot of getSlots(current)) {
        for (let i = 0; i < slot.items.length; i++) {
          const child = slot.items[i];
          if (pushAndRecurse(child, getNodeId(current) ?? 'root', slot.name, i)) {
            return true;
          }
        }
      }

      path.pop();
      return false;
    };

    if (componentId !== 'root') {
      for (let i = 0; i < rootContent.length && !found; i++) {
        const child = rootContent[i];
        if (isComponentNode(child)) {
          found = pushAndRecurse(child, 'root', 'content', i);
        }
      }
    } else {
      found = true;
    }

    if (!found) return crumbs;

    if (componentId !== 'root') {
      for (const entry of path) {
        const { node, parentId, parentSlot, indexInParent } = entry;
        const zone = `${parentId}:${parentSlot}`;
        crumbs.push({
          label: labelFor(node),
          selector: { index: indexInParent, zone },
          isFirst: false,
          isLast: false,
          id: getNodeId(node) ?? 'root',
        });
      }
    }

    const idx = selectedItem.index ?? -1;

    let containerId = componentId;
    let containerSlot: PuckNode[] = [];

    if (componentId === 'root') {
      containerId = 'root';
      containerSlot = rootContent;
    } else {
      const container = path[path.length - 1]?.node;
      containerId = getNodeId(container) ?? componentId;
      const rawSlot = container?.props ? container.props[slotName as keyof typeof container.props] : undefined;
      if (Array.isArray(rawSlot) && rawSlot.every(isComponentNode)) {
        containerSlot = rawSlot as PuckNode[];
      } else {
        containerSlot = [];
      }
    }

    const validIndex = idx >= 0 && idx < containerSlot.length;

    if (validIndex) {
      const child = containerSlot[idx];
      const zone = `${containerId}:${slotName}`;
      crumbs.push({
        label: labelFor(child),
        selector: { index: idx, zone },
        isFirst: false,
        isLast: true,
        id: `${containerId}:${slotName}`,
      });
    } else if (containerSlot.length > 0) {
      const safeIndex = Math.max(0, Math.min(idx, containerSlot.length - 1));
      crumbs.push({
        label: 'Item',
        selector: { index: safeIndex, zone: `${containerId}:${slotName}` },
        isFirst: false,
        isLast: true,
        id: `${containerId}:${slotName}`,
      });
    }

    const finalCrumbs = typeof renderCount === 'number' && renderCount > 0 ? crumbs.slice(-renderCount) : crumbs;

    return finalCrumbs;
  }, [data, config, selectedItem, renderCount]);
}

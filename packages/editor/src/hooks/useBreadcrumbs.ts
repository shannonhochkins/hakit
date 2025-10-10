import { createUsePuck, Data, Slot, WithSlotProps } from '@measured/puck';
import { useMemo } from 'react';

const usePuck = createUsePuck();

type ItemSelector = {
  index: number;
  zone?: string;
};

type Breadcrumb = {
  label: string;
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

export function useBreadcrumbs(): Breadcrumb[] {
  const selectedItem = usePuck(c => c.appState.ui.itemSelector);
  const config = usePuck(c => c.config);
  const data = usePuck(c => c.appState.data) as WithSlotProps<FakePuckPageData>;

  console.log('selectedItem', selectedItem);

  return useMemo<Breadcrumb[]>(() => {
    if (!selectedItem) return [];

    const rootContent: PuckNode[] = Array.isArray(data?.root?.props?.content) ? (data.root.props.content as PuckNode[]) : [];

    const zoneStr = selectedItem.zone ?? '';
    const colon = zoneStr.lastIndexOf(':');
    if (colon <= 0) {
      return [{ label: 'Page', selector: null }];
    }
    const componentId = zoneStr.slice(0, colon);
    const slotName = zoneStr.slice(colon + 1);

    const labelFor = (node: PuckNode | null | undefined): string => {
      if (!node) return 'Component';
      return (config?.components as any)?.[node.type]?.label ?? node.type ?? 'Component';
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

      if ((current?.props as any)?.id === componentId) {
        return true;
      }

      for (const slot of getSlots(current)) {
        for (let i = 0; i < slot.items.length; i++) {
          const child = slot.items[i];
          if (pushAndRecurse(child, ((current?.props as any)?.id as string) ?? 'root', slot.name, i)) {
            return true;
          }
        }
      }

      path.pop();
      return false;
    };

    // 🔧 SPECIAL-CASE: when zone is "root:<slot>", we’re selecting within the virtual root.
    if (componentId !== 'root') {
      for (let i = 0; i < rootContent.length && !found; i++) {
        const child = rootContent[i];
        if (isComponentNode(child)) {
          found = pushAndRecurse(child, 'root', 'content', i);
        }
      }
    } else {
      // Pretend we "found" the container; its slot is the top-level content.
      found = true;
    }

    const crumbs: Breadcrumb[] = [{ label: 'Page', selector: null }];

    if (!found) return crumbs;

    // If not root-container, add crumbs for each ancestor (including the container).
    if (componentId !== 'root') {
      for (const entry of path) {
        const { node, parentId, parentSlot, indexInParent } = entry;
        const zone = `${parentId}:${parentSlot}`;
        crumbs.push({
          label: labelFor(node),
          selector: { index: indexInParent, zone },
        });
      }
    }

    // Now add the selected child inside the container’s slot
    const idx = selectedItem.index ?? -1;

    let containerId = componentId;
    let containerSlot: PuckNode[] = [];

    if (componentId === 'root') {
      // 🔧 use the top-level content as the slot
      containerId = 'root';
      containerSlot = rootContent;
    } else {
      const container = path[path.length - 1]?.node; // node with props.id === componentId
      containerId = ((container?.props as any)?.id as string) ?? componentId;
      containerSlot = Array.isArray((container?.props as any)?.[slotName])
        ? ((container?.props as any)[slotName] as unknown[] as PuckNode[])
        : [];
    }

    const validIndex = idx >= 0 && idx < containerSlot.length;

    if (validIndex) {
      const child = containerSlot[idx];
      const zone = `${containerId}:${slotName}`;
      crumbs.push({
        label: labelFor(child),
        selector: { index: idx, zone },
      });
    } else if (containerSlot.length > 0) {
      // Fallback to a safe index if out of bounds
      const safeIndex = Math.max(0, Math.min(idx, containerSlot.length - 1));
      crumbs.push({
        label: 'Item',
        selector: { index: safeIndex, zone: `${containerId}:${slotName}` },
      });
    }

    return crumbs;
  }, [data, config, selectedItem]);
}

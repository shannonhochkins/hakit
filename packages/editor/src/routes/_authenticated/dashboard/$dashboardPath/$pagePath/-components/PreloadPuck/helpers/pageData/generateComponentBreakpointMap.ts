import { ComponentBreakpointModeMap } from '@lib/hooks/useGlobalStore';
import { PuckPageData } from '@typings/puck';
import { multipleBreakpointsEnabled } from './multipleBreakpointsEnabled';

/**
 * Generates a ComponentBreakpointModeMap from PuckPageData by analyzing which fields have multiple breakpoint values.
 *
 * This function traverses the entire page data structure (root props and content components) to identify
 * fields that have multiple breakpoint configurations enabled. It uses the existing `multipleBreakpointsEnabled`
 * helper to determine if a field value contains more than one breakpoint definition.
 *
 * The resulting map is used to track which component fields have breakpoint functionality enabled,
 * allowing the editor to show/hide breakpoint controls appropriately.
 *
 * @param databaseValue - The PuckPageData containing breakpoint-structured values from the database
 * @returns A map of component IDs to their field paths and breakpoint enablement status
 *
 * @example
 * ```typescript
 * const pageData = {
 *   root: {
 *     props: {
 *       backgroundColor: { $xlg: '#fff', $md: '#f5f5f5' }, // multiple breakpoints -> true
 *       padding: { $xlg: 24 } // single breakpoint -> false
 *     }
 *   },
 *   content: [
 *     {
 *       type: 'HeadingBlock',
 *       props: {
 *         id: 'heading-1',
 *         title: { $xlg: 'Desktop Title', $sm: 'Mobile Title' }, // multiple -> true
 *         style: {
 *           fontSize: { $xlg: '2rem', $md: '1.5rem' } // multiple -> true
 *         }
 *       }
 *     }
 *   ]
 * };
 *
 * const result = generateComponentBreakpointMap(pageData);
 * // Returns:
 * // {
 * //   'root': {
 * //     'backgroundColor': true,
 * //     'padding': false
 * //   },
 * //   'heading-1': {
 * //     'title': true,
 * //     'style.fontSize': true
 * //   }
 * // }
 * ```
 */
export function generateComponentBreakpointMap(databaseValue: PuckPageData): ComponentBreakpointModeMap {
  const breakpointMap: ComponentBreakpointModeMap = {};

  /**
   * Recursively traverses an object to find breakpoint-enabled fields.
   * Only creates entries for actual field values, not intermediate container objects.
   * @param obj - The object to traverse
   * @param basePath - The dot-notated path to the current object
   * @param componentId - The ID of the component being processed
   */
  const traverseObject = (obj: unknown, basePath: string = '', componentId: string): void => {
    if (!obj || typeof obj !== 'object') return;

    // Handle arrays - check the array itself, then traverse items
    if (Array.isArray(obj)) {
      // Only record the array field if we have a path for it
      if (basePath) {
        if (!breakpointMap[componentId]) {
          breakpointMap[componentId] = {};
        }
        breakpointMap[componentId][basePath] = multipleBreakpointsEnabled(obj);
      }

      // Traverse array items (but don't create paths for indices)
      obj.forEach(item => {
        if (item && typeof item === 'object') {
          traverseObject(item, basePath, componentId);
        }
      });
      return;
    }

    // Handle regular objects
    const objectRecord = obj as Record<string, unknown>;

    // Check if this object is a breakpoint object (has $ keys)
    const isBreakpointObj = Object.keys(objectRecord).some(k => k.startsWith('$'));

    if (isBreakpointObj) {
      // This is a breakpoint object - record it and don't traverse further
      if (basePath) {
        if (!breakpointMap[componentId]) {
          breakpointMap[componentId] = {};
        }

        const hasMultiple = multipleBreakpointsEnabled(obj);
        // If this field path already exists and has multiple breakpoints, keep true
        // Otherwise, set to the current result
        if (breakpointMap[componentId][basePath] !== true) {
          breakpointMap[componentId][basePath] = hasMultiple;
        }
      }
      return;
    }

    // This is a regular object - traverse its properties
    for (const [key, value] of Object.entries(objectRecord)) {
      // Skip excluded keys (like 'id', 'type', etc.)
      if (key === 'id' || key === 'type' || key === 'puck' || key === 'editMode' || key === 'children') {
        continue;
      }

      const fieldPath = basePath ? `${basePath}.${key}` : key;

      if (value && typeof value === 'object') {
        // Recursively process objects and arrays
        traverseObject(value, fieldPath, componentId);
      } else {
        // This is a primitive value - record it
        if (!breakpointMap[componentId]) {
          breakpointMap[componentId] = {};
        }

        const hasMultiple = multipleBreakpointsEnabled(value);
        // If this field path already exists and has multiple breakpoints, keep true
        if (breakpointMap[componentId][fieldPath] !== true) {
          breakpointMap[componentId][fieldPath] = hasMultiple;
        }
      }
    }
  };

  // Process root props
  if (databaseValue.root?.props) {
    traverseObject(databaseValue.root.props, '', 'root');
  }

  // Process content components
  if (databaseValue.content && Array.isArray(databaseValue.content)) {
    databaseValue.content.forEach(component => {
      if (component && typeof component === 'object' && 'props' in component) {
        const componentProps = component.props as Record<string, unknown>;
        const componentId = componentProps.id as string;

        if (componentId && componentProps) {
          traverseObject(componentProps, '', componentId);
        }
      }
    });
  }

  // Process zones if they exist
  if (databaseValue.zones && typeof databaseValue.zones === 'object') {
    Object.values(databaseValue.zones).forEach(zoneComponents => {
      if (Array.isArray(zoneComponents)) {
        zoneComponents.forEach(component => {
          if (component && typeof component === 'object' && 'props' in component) {
            const componentProps = component.props as Record<string, unknown>;
            const componentId = componentProps.id as string;

            if (componentId && componentProps) {
              traverseObject(componentProps, '', componentId);
            }
          }
        });
      }
    });
  }

  return breakpointMap;
}

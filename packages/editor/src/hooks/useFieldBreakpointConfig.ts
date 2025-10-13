import { useMemo, useCallback } from 'react';
import { useGlobalStore } from './useGlobalStore';
import { useGetPuck } from '@measured/puck';
import { FieldConfiguration } from '@typings/fields';

const RESPONSIVE_MODE_DEFAULT = true;

export function useFieldBreakpointConfig(
  field: Exclude<FieldConfiguration[string], { type: 'slot' | 'hidden' | 'object' | 'array' | 'hidden' }>,
  name: string
) {
  // Get componentBreakpointMap from store
  const componentBreakpointMap = useGlobalStore(state => state.componentBreakpointMap);
  const getPuck = useGetPuck();
  const { selectedItem, appState } = getPuck();
  const itemOrRoot = selectedItem ?? appState.data.root;
  const selectedItemOrRootProps = useMemo(() => itemOrRoot?.props, [itemOrRoot]);

  // Get addonId from field
  const addonId = 'addonId' in field ? (field.addonId as string) : undefined;

  // Calculate responsive mode based on field configuration
  const responsiveMode = useMemo(() => {
    if ('responsiveMode' in field) {
      return field.responsiveMode ?? RESPONSIVE_MODE_DEFAULT;
    }
    return RESPONSIVE_MODE_DEFAULT;
  }, [field]);

  // Get the current field's breakpoint mode from the map
  const isBreakpointModeEnabled = useMemo(() => {
    const componentId = typeof selectedItemOrRootProps?.id === 'string' ? selectedItemOrRootProps.id : 'root';
    const fieldPath = addonId && !name?.includes(addonId) ? `${addonId}.${name}` : name;
    return componentBreakpointMap[componentId]?.[fieldPath] ?? false;
  }, [componentBreakpointMap, selectedItemOrRootProps?.id, addonId, name]);

  // Function to toggle breakpoint mode
  const toggleBreakpointMode = useCallback((): boolean => {
    const { componentBreakpointMap, setComponentBreakpointMap } = useGlobalStore.getState();
    const componentId = typeof selectedItemOrRootProps?.id === 'string' ? selectedItemOrRootProps.id : 'root';
    const fieldPath = addonId ? `${addonId}.${name}` : name;

    const newValue = !isBreakpointModeEnabled;

    // Update the componentBreakpointMap in the store
    const updatedMap = { ...componentBreakpointMap };
    if (!updatedMap[componentId]) {
      updatedMap[componentId] = {};
    }
    updatedMap[componentId][fieldPath] = newValue;
    setComponentBreakpointMap(updatedMap);
    return newValue;
  }, [selectedItemOrRootProps, addonId, name, isBreakpointModeEnabled]);

  return {
    responsiveMode,
    isBreakpointModeEnabled,
    toggleBreakpointMode,
  };
}

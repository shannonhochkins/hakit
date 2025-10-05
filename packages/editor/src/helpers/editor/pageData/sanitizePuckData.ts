import type { CustomPuckConfig, PuckPageData } from '@typings/puck';
import type { DefaultComponentProps } from '@measured/puck';
import type { AvailableQueries } from '@hakit/components';
import { dbValueToPuck } from './dbValueToPuck';
import { extendPuckDataWithDefaults, trimPuckDataToConfig } from './trimPuckDataToConfig';

export function sanitizePuckData(
  data: PuckPageData,
  userConfig: CustomPuckConfig<DefaultComponentProps>,
  activeBreakpoint: keyof AvailableQueries
) {
  // First trim to only include valid fields
  const trimmedData = trimPuckDataToConfig(data, userConfig);
  if (trimmedData) {
    // Convert to Puck format (removes breakpoint keys)
    const puckValue = dbValueToPuck(trimmedData, activeBreakpoint);
    // Then extend with missing default properties (after breakpoint keys are removed)
    const extendedPuckValue = extendPuckDataWithDefaults(puckValue, userConfig);
    if (extendedPuckValue) {
      return extendedPuckValue;
    }
  }
  return null;
}

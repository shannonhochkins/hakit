import type { CustomPuckConfig, PuckPageData } from '@typings/puck';
import type { DefaultComponentProps } from '@measured/puck';
import type { AvailableQueries } from '@hakit/components';
import { dbValueToPuck } from './dbValueToPuck';
import { extendPuckDataWithDefaults, trimPuckDataToConfig } from './trimPuckDataToConfig';

export interface SanitizePuckDataOptions<
  Props extends DefaultComponentProps = DefaultComponentProps,
  RootProps extends DefaultComponentProps = DefaultComponentProps,
> {
  data: PuckPageData;
  userConfig: CustomPuckConfig<Props, RootProps>;
  activeBreakpoint: keyof AvailableQueries;
  removeBreakpoints?: boolean;
}

export function sanitizePuckData<
  Props extends DefaultComponentProps = DefaultComponentProps,
  RootProps extends DefaultComponentProps = DefaultComponentProps,
>(options: SanitizePuckDataOptions<Props, RootProps>) {
  const { data, userConfig, activeBreakpoint, removeBreakpoints = false } = options;

  // First trim to only include valid fields
  const trimmedData = trimPuckDataToConfig(data, userConfig);
  if (trimmedData) {
    let dataToExtend: PuckPageData;

    if (removeBreakpoints) {
      // Convert to Puck format (removes breakpoint keys)
      // dataToExtend = dbValueToPuck(trimmedData, activeBreakpoint);
      dataToExtend = trimmedData;
    } else {
      // Use trimmed data directly without removing breakpoints
      dataToExtend = trimmedData;
    }

    // Then extend with missing default properties
    const extendedPuckValue = extendPuckDataWithDefaults(dataToExtend, userConfig);
    if (extendedPuckValue) {
      return extendedPuckValue;
    }
  }
  return null;
}

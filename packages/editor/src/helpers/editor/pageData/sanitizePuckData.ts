import type { CustomPuckConfig, PuckPageData } from '@typings/puck';
import type { DefaultComponentProps } from '@measured/puck';
import { trimPuckDataToConfig } from './trimPuckDataToConfig';
import { extendPuckDataWithDefaults } from './extendPuckDataWithDefaults';

export interface SanitizePuckDataOptions<
  Props extends DefaultComponentProps = DefaultComponentProps,
  RootProps extends DefaultComponentProps = DefaultComponentProps,
> {
  data: PuckPageData;
  userConfig: CustomPuckConfig<Props, RootProps>;
}

export function sanitizePuckData<
  Props extends DefaultComponentProps = DefaultComponentProps,
  RootProps extends DefaultComponentProps = DefaultComponentProps,
>(options: SanitizePuckDataOptions<Props, RootProps>) {
  const { data, userConfig } = options;

  // First trim to only include valid fields
  const trimmedData = trimPuckDataToConfig(data, userConfig);
  if (trimmedData) {
    // Then extend with missing default properties
    const extendedPuckValue = extendPuckDataWithDefaults(trimmedData, userConfig);
    if (extendedPuckValue) {
      return extendedPuckValue;
    }
  }
  return null;
}

import { type Data, type Config, type DefaultComponentProps } from '@measured/puck';
import { type RootProps } from '../client/components/Root/index.js';

// intentionally using default props instead of component definitions as there's a custom fields function
export type Props = DefaultComponentProps;

export type PuckPageData = Data<Props, RootProps>;
export type PageConfiguration = {
  config: PuckPageData;
  id: string;
};

export type FullConfiguration = {
  pageConfigurations: PageConfiguration[];
  // all root props configured on any page are stored here, and NOT in pageConfigurations
  config: NonNullable<PuckPageData['root']['props']>;
};

export type PuckCategories = 'Misc' | 'Layout' | 'Cards' | 'other';

export type UserConfig = Config<Props, RootProps, PuckCategories>;

import { EntitiesCard, EntitiesCardProps } from "@hakit/components";
import { Widget } from '../types';
import { EntityName } from '@hakit/core';

export default {
  previewOptions: {
    width: 450,
    height: 240,
  },
  defaultProps: (entities) => ({
    entities: [
      {
        entity: entities[0].entity_id as EntityName,
      },
      {
        entity: entities[1].entity_id as EntityName,
      },
      {
        entity: entities[2].entity_id as EntityName,
      },
    ]
  }),
  uiSchema: {
    entities: {
      items: {
        entity: {
          'ui:widget': 'entityAutocomplete',
        },
      },
    },
  },
  renderer(props) {
    return <EntitiesCard {...props} />;
  }
} satisfies Widget<EntitiesCardProps>;

interface EntityItem {
  /** The name of the entity to render */
  entity: string;
  /** the icon name to use, defaults to entity_icon */
  icon?: string;
  /** the name of the entity, defaults to friendly_name */
  name?: string;
  /** include last updated time @default false */
  includeLastUpdated?: boolean;
}
export interface Schema {
  /** The names of your entities */
  entities?: EntityItem[];
  /** include the last updated time, will apply to every row unless specified on an individual EntityItem @default false */
  includeLastUpdated?: boolean;
}

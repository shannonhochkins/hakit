import { FabCard, FabCardProps } from "@hakit/components";
import type { EntityName } from '@hakit/core';
import { Widget } from '../types';

export default {
  entityPicker: {
    autoEntityOptions: {
      domainWhitelist: ['light', 'switch', 'cover', 'media_player']
    }
  },
  previewOptions: {
    width: 50,
    height: 50,
    noDefaultWidth: true,
    noDefaultHeight: true,
  },
  defaultProps: (entities) => ({
    entity: entities[0].entity_id as EntityName,
  }),
  renderer(props) {
    return <FabCard {...props} />;
  }
} satisfies Widget<FabCardProps<EntityName>>;

type WhitelistProps = 'size'
| 'icon'
| 'iconColor'
| 'noIcon'
| 'service'
| 'serviceData'
| 'entity'
| 'title'
| 'tooltipPlacement'
| 'disabled'
| 'preventPropagation'

export type Schema = Pick<FabCardProps<EntityName>, WhitelistProps>

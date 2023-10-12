import { MediaPlayerCard, MediaPlayerCardProps } from "@hakit/components";
import { MotionProps } from 'framer-motion';
import { Widget } from '../types';

export default {
  entityPicker: {
    domainWhitelist: ["media_player"],
    autoEntityOptions: {
      domainWhitelist: ["media_player"],
    }
  },
  servicePicker: false,
  previewOptions: {
    width: 400,
    height: 150,
  },
  uiSchema: {
    groupMembers: {
      items: {
        entity: {
          'ui:widget': 'entityAutocomplete',
        },
      },
    },
  },
  defaultProps: (entities) => ({
    layout: 'slim',
    volumeLayout: 'slider',
    entity: entities[0].entity_id as `media_player.${string}`,
  }),
  renderer(props) {
    return <MediaPlayerCard {...props} />;
  }
} satisfies Widget<MediaPlayerCardProps>;

type OmitProperties = Omit<React.ComponentProps<"div">, "ref"> & Omit<MotionProps, "layout">;

export type Schema = Omit<MediaPlayerCardProps, 'marqueeProps' | keyof OmitProperties>;

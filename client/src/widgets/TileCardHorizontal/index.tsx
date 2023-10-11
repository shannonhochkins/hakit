import { ButtonCard, ButtonCardProps } from "@hakit/components";
import type { EntityName } from '@hakit/core';
import { MotionProps } from 'framer-motion';
import { Widget } from '../types';

export default {
  entityPicker: {
    autoEntityOptions: {
      domainWhitelist: ['light', 'switch', 'cover', 'media_player']
    }
  },
  previewOptions: {
    width: 300,
    height: 140,
  },
  defaultProps: (entities) => ({
    entity: entities[0].entity_id as EntityName,
  }),
  renderer(props) {
    return <ButtonCard defaultLayout="slim" {...props} />;
  }
} satisfies Widget<ButtonCardProps<EntityName>>;

type OmitProperties = Omit<React.ComponentProps<"button">, "title" | "onClick" | "ref"> & MotionProps;

export type Schema = Omit<ButtonCardProps<EntityName>, 'onClick' | 'active' | 'defaultLayout' | keyof OmitProperties>

import { TriggerCard, TriggerCardProps } from "@hakit/components";
import type { EntityName } from '@hakit/core';
import { MotionProps } from 'framer-motion';
import { Widget } from '../types';

export default {
  entityPicker: {
    autoEntityOptions: {
      domainWhitelist: ["scene", "automation", "script", "switch", 'light'],
    }
  },
  previewOptions: {
    width: 450,
    height: 220,
  },
  defaultProps: (entities) => ({
    entity: entities[0].entity_id as EntityName,
  }),
  renderer(props) {
    return <TriggerCard {...props} />;
  }
} satisfies Widget<TriggerCardProps<EntityName>>;

type OmitProperties = MotionProps & Omit<React.ComponentPropsWithoutRef<"button">, "title" | "onClick">;

export type Schema = Omit<TriggerCardProps<EntityName>, 'onClick' | keyof OmitProperties>

import { SensorCard, SensorCardProps } from "@hakit/components";
import type { EntityName } from '@hakit/core';
import { MotionProps } from 'framer-motion';
import { Widget } from '../types';

export default {
  entityPicker: {
    domainWhitelist: ["counter", "input_number", "number", "sensor"],
    autoEntityOptions: {
      domainWhitelist: ["counter", "input_number", "number", "sensor"],
      entityBlacklist: ['time', 'date'],
    }
  },
  servicePicker: false,
  previewOptions: {
    width: 450,
    height: 220,
  },
  defaultProps: (entities) => ({
    entity: entities[0].entity_id as EntityName,
  }),
  renderer(props) {
    return <SensorCard {...props} />;
  }
} satisfies Widget<SensorCardProps<EntityName>>;

type OmitProperties = MotionProps & Omit<React.ComponentPropsWithoutRef<"button">, "title" | "onClick">;

export type Schema = Omit<SensorCardProps<EntityName>, 'onClick' | keyof OmitProperties>

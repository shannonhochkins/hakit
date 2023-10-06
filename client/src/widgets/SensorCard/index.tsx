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
  previewOptions: {
    width: 300,
    height: 200,
  },
  props: {
    entity: '' as EntityName,
  },
  renderer(props) {
    return <SensorCard {...props} />;
  }
} satisfies Widget<SensorCardProps<EntityName>>;

type Extendable = MotionProps & Omit<React.ComponentPropsWithoutRef<"button">, "title" | "onClick">;

export type Schema = Omit<SensorCardProps<EntityName>, 'onClick' | keyof Extendable>

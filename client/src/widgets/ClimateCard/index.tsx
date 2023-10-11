import { ClimateCard, ClimateCardProps } from "@hakit/components";
import { MotionProps } from 'framer-motion';
import { Widget } from '../types';


export default {
  entityPicker: {
    domainWhitelist: ["climate"],
    autoEntityOptions: {
      domainWhitelist: ["climate"],
    }
  },
  previewOptions: {
    width: 450,
    height: 220,
  },
  defaultProps: (entities) => ({
    entity: entities[0].entity_id as `climate.${string}`,
  }),
  renderer(props) {
    return <ClimateCard {...props} />;
  }
} satisfies Widget<ClimateCardProps>;

type OmitProperties = MotionProps & Omit<React.ComponentPropsWithoutRef<"button">, "onClick">;

export type Schema = Omit<ClimateCardProps, 'onClick' | keyof OmitProperties>

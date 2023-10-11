import { WeatherCard, WeatherCardProps } from "@hakit/components";
import { MotionProps } from 'framer-motion';
import { Widget } from '../types';

export default {
  entityPicker: {
    domainWhitelist: ["weather"],
    autoEntityOptions: {
      domainWhitelist: ["weather"],
    }
  },
  servicePicker: false,
  previewOptions: {
    width: 450,
    height: 220,
  },
  defaultProps: (entities) => ({
    entity: entities[0].entity_id as `weather.${string}`,
  }),
  renderer(props) {
    return <WeatherCard {...props} />;
  }
} satisfies Widget<WeatherCardProps>;

type OmitProperties = MotionProps & React.ComponentPropsWithoutRef<"div">;
// TODO - support details entity picker
export type Schema = Omit<WeatherCardProps, 'details' | keyof OmitProperties>

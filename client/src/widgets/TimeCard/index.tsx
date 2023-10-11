import { TimeCard, TimeCardProps } from "@hakit/components";
import { MotionProps } from 'framer-motion';
import { Widget } from '../types';

export default {
  entityPicker: false,
  previewOptions: {
    width: 300,
    height: 120,
  },
  servicePicker: false,
  defaultProps: () => ({}),
  renderer(props) {
    return <TimeCard {...props} />;
  }
} satisfies Widget<TimeCardProps>;

type OmitProperties = MotionProps & React.ComponentPropsWithoutRef<"div">;

export type Schema = Omit<TimeCardProps, keyof OmitProperties>

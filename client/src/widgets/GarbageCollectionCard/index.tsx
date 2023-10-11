import { GarbageCollectionCard, GarbageCollectionCardProps } from "@hakit/components";
import { Widget } from '../types';

export default {
  entityPicker: {
    autoEntityOptions: {
      domainWhitelist: ['light', 'switch', 'cover', 'media_player']
    }
  },
  previewOptions: {
    width: 450,
    height: 220,
  },
  defaultProps: () => ({
    schedules: []
  }),
  renderer(props) {
    return <GarbageCollectionCard {...props} />;
  }
} satisfies Widget<GarbageCollectionCardProps>;

type BinColor = string;
type WeekConfig = BinColor[];
type Day = "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
interface Schedule {
  /** optional title to appear in each schedule */
  title?: string;
  /** on what day does your garbage get collected */
  day: Day;
  /** as there's (usually) 4 weeks in a month, provide a config for each week, if you only have your garbage collected once a month, on a tuesday, specify null for the weeks that aren't relevant */
  weeks: [WeekConfig, WeekConfig, WeekConfig, WeekConfig];
  /** how often is your garbage collected */
  frequency: "weekly" | "fortnightly" | "monthly";
  /** hide the next collection time @default false */
  hideNextCollection?: boolean;
}
export interface Schema {
  /** The title of the card @default "Garbage Collection" */
  title?: string;
  /** The description of the card */
  description?: string;
  /** the schedule(s) for your garbage collection */
  schedules: Schedule[];
}

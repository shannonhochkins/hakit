import { Group, GroupProps } from "@hakit/components";
import { Widget } from '../types';

export default {
  entityPicker: false,
  servicePicker: false,
  previewOptions: {
    width: 600,
    noDefaultHeight: true,
  },
  acceptsWidgets: {
    filterOptions: {
      blacklist: ['GroupCard']
    }
  },
  defaultProps: () => ({
    title: 'Group Title',
    children: [],
  }),
  renderer(props, _widget, renderer) {
    return (<Group {...props}>
      {renderer}
    </Group>);
  }
} satisfies Widget<GroupProps>;

type OmitProperties = Omit<React.ComponentProps<"div">, "title">;
export type Schema = Omit<GroupProps, keyof OmitProperties>;

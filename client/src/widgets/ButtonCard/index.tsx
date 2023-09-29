import { ButtonCard, ButtonCardProps } from "@hakit/components";
import type { EntityName } from '@hakit/core';
import { Widget } from '../types';

export default {
  layout: {
    resizeHandles: undefined,
    isDraggable: true,
    isResizable: true,
    w: 6,
    h: 6
  },
  props: {
    title: 'Default Title',
  },
  renderer(props) {
    return <ButtonCard {...props} />;
  }
} satisfies Widget<ButtonCardProps<EntityName>>;

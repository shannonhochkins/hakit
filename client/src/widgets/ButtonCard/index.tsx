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
    width: 200,
    height: 200,
  },
  props: {},
  renderer(props) {
    return <ButtonCard {...props} />;
  }
} satisfies Widget<ButtonCardProps<EntityName>>;

type Extendable = Omit<React.ComponentProps<"button">, "title" | "onClick" | "ref"> & MotionProps;

export type Schema = Omit<ButtonCardProps<EntityName>, 'onClick' | 'active' | 'iconColor' | keyof Extendable>

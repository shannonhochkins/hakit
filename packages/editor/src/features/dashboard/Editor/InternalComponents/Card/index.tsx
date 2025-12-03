import { CustomComponentConfig, RenderProps } from '@typings/puck';
import { Slot } from '@measured/puck';

/** =========================
 * Types & helpers
 * ======================= */
export type CardProps = {
  content: Slot;
};

/** =========================
 * Component Config
 * ======================= */
export const cardComponentConfig: CustomComponentConfig<CardProps> = {
  label: 'Card',
  fields: {
    content: {
      type: 'slot',
      label: 'Content',
    },
  },
  internalFields: {
    defaults: {
      $appearance: {
        design: {
          backgroundColor: 'color-mix(in srgb, var(--clr-surface-a0) 90%, transparent 10%)',
          borderColor: 'var(--clr-surface-a50)',
          boxShadowEnabled: false,
          borderEnabled: true,
          borderRadius: '1rem',
        },
        sizeAndSpacing: {
          padding: '1rem',
        },
      },
    },
  },

  render: Render,
};

function Render(props: RenderProps<CardProps>) {
  const { content: Content } = props;

  return (
    <div className='Card'>
      <Content className='Card-content' />
    </div>
  );
}

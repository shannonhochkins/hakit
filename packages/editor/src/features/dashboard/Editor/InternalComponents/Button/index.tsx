import { CustomComponentConfig, RenderProps } from '@typings/puck';
import { UnitFieldValue } from '@typings/fields';
import { PrimaryButton, SecondaryButton } from '@components/Button';
import { TooltipProps } from '@components/Tooltip';
import { Slot } from '@measured/puck';

/** =========================
 * Types & helpers
 * ======================= */
export type ButtonProps = {
  content: {
    useSlot: boolean;
    slot: Slot;
    label: string;
    tooltip: string;
    tooltipPlacement: TooltipProps['placement'];
  };
};

type BackgroundType = 'color' | 'primary' | 'secondary' | 'danger' | 'success' | 'transparent' | 'glass' | 'liquid-glass';

type InternalFieldOverrides = {
  $appearance: {
    design: {
      backgroundType: BackgroundType;
      backgroundColor?: string;
      size: 'xs' | 'sm' | 'md' | 'lg';
      startIcon?: string;
      startIconSize?: UnitFieldValue;
      startIconColor?: string;
      endIcon?: string;
      endIconSize?: UnitFieldValue;
      endIconColor?: string;
      showBadge: boolean;
      badgeIcon?: string;
      badgeIconSize?: UnitFieldValue;
      badgeIconColor?: string;
    };
    sizeAndSpacing: {
      fullHeight: boolean;
      fullWidth: boolean;
    };
  };
};

/** =========================
 * Component Config
 * ======================= */
export const buttonComponentConfig: CustomComponentConfig<ButtonProps, InternalFieldOverrides> = {
  label: 'Button',
  autoWrapComponent: false,
  internalFields: {
    omit: {
      $appearance: {
        design: {
          backgroundType: true,
          backgroundColor: true,
        },
        sizeAndSpacing: {
          width: true,
          height: true,
          margin: true,
          padding: true,
        },
      },
    },
    extend: {
      $appearance: {
        design: {
          type: 'object',
          label: 'Design',
          objectFields: {
            backgroundType: {
              type: 'select',
              label: 'Background Type',
              description: 'The type of background to display',
              default: 'primary',
              options: [
                { label: 'Primary', value: 'primary' },
                { label: 'Secondary', value: 'secondary' },
                { label: 'Color', value: 'color' },
                { label: 'Glass', value: 'glass' },
                { label: 'Liquid Glass', value: 'liquid-glass' },
              ],
            },
            backgroundColor: {
              type: 'color',
              label: 'Background Color',
              description: 'Base color for the background.',
              default: 'var(--clr-primary-a10)',
              visible(props) {
                return props.$appearance?.design?.backgroundType === 'color';
              },
            },
            startIcon: {
              type: 'icon',
              label: 'Start Icon',
              description: 'Icon to display before the button label',
              default: undefined,
            },
            startIconSize: {
              type: 'unit',
              label: 'Start Icon Size',
              description: 'The size of the start icon',
              default: '1.25rem',
              visible(data) {
                return data.$appearance?.design?.startIcon !== undefined;
              },
            },
            startIconColor: {
              type: 'color',
              label: 'Start Icon Color',
              description: 'The color of the start icon, inherits by default',
              default: undefined,
              visible(data) {
                return data.$appearance?.design?.startIcon !== undefined;
              },
            },
            endIcon: {
              type: 'icon',
              label: 'End Icon',
              description: 'Icon to display after the button label',
              default: undefined,
            },
            endIconSize: {
              type: 'unit',
              label: 'End Icon Size',
              description: 'The size of the end icon',
              default: '1.25rem',
              visible(data) {
                return data.$appearance?.design?.endIcon !== undefined;
              },
            },
            endIconColor: {
              type: 'color',
              label: 'End Icon Color',
              description: 'The color of the end icon, inherits by default',
              default: undefined,
              visible(data) {
                return data.$appearance?.design?.endIcon !== undefined;
              },
            },
            size: {
              type: 'select',
              label: 'Size',
              description: 'The size of the button',
              default: 'md',
              options: [
                { label: 'Extra Small', value: 'xs' },
                { label: 'Small', value: 'sm' },
                { label: 'Medium', value: 'md' },
                { label: 'Large', value: 'lg' },
              ],
            },
            showBadge: {
              type: 'switch',
              label: 'Show Badge',
              description: 'Whether to display a badge on the button',
              default: false,
            },
            badgeIcon: {
              type: 'icon',
              label: 'Badge Icon',
              description: 'Icon to display inside the badge',
              default: undefined,
              visible(data) {
                return data.$appearance?.design?.showBadge === true;
              },
            },
            badgeIconSize: {
              type: 'unit',
              label: 'Badge Icon Size',
              description: 'The size of the badge icon',
              default: '0.75rem',
              visible(data) {
                return data.$appearance?.design?.badgeIcon !== undefined && data.$appearance?.design?.showBadge === true;
              },
            },
            badgeIconColor: {
              type: 'color',
              label: 'Badge Icon Color',
              description: 'The color of the badge icon, inherits by default',
              default: undefined,
              visible(data) {
                return data.$appearance?.design?.badgeIcon !== undefined && data.$appearance?.design?.showBadge === true;
              },
            },
          },
        },

        sizeAndSpacing: {
          fullHeight: {
            type: 'switch',
            label: 'Full Height',
            description: 'Whether to make the button take up the full height of its container',
            default: false,
          },
          fullWidth: {
            type: 'switch',
            label: 'Full Width',
            description: 'Whether to make the button take up the full width of its container',
            default: false,
          },
        },
      },
    },
  },
  fields: {
    content: {
      type: 'object',
      label: 'Content',
      objectFields: {
        useSlot: {
          type: 'switch',
          label: 'Use Slot',
          description: 'Whether to use a slot for the button content',
          default: false,
        },
        slot: {
          type: 'slot',
          label: 'Content Slot',
        },
        label: {
          type: 'text',
          label: 'Label',
          description: 'The text to display inside the button',
          default: 'Click Me',
          visible(data) {
            return !data.content?.useSlot;
          },
        },
        tooltip: {
          type: 'text',
          label: 'Tooltip',
          description: 'The tooltip text to display on hover (tooltip will not show in editor mode)',
          default: '',
        },
        tooltipPlacement: {
          type: 'select',
          label: 'Tooltip Placement',
          description: 'The placement of the tooltip',
          default: 'top',
          options: [
            { value: 'top', label: 'Top' },
            { value: 'top-start', label: 'Top Start' },
            { value: 'top-end', label: 'Top End' },
            { value: 'right', label: 'Right' },
            { value: 'right-start', label: 'Right Start' },
            { value: 'right-end', label: 'Right End' },
            { value: 'bottom', label: 'Bottom' },
            { value: 'bottom-start', label: 'Bottom Start' },
            { value: 'bottom-end', label: 'Bottom End' },
            { value: 'left', label: 'Left' },
            { value: 'left-start', label: 'Left Start' },
            { value: 'left-end', label: 'Left End' },
          ],
        },
      },
    },
  },
  styles(props) {
    return `
       .button-slot-${props.id} {
          width: 100%;
          height: 100%;          
       }
    `;
  },
  render: Render,
};

function Render(props: RenderProps<ButtonProps, InternalFieldOverrides>) {
  const { content } = props;
  const { slot: Slot, useSlot } = content;
  const backgroundType = props.$appearance?.design?.backgroundType as BackgroundType;

  if (backgroundType === 'secondary' || backgroundType === 'danger' || backgroundType === 'success' || backgroundType === 'transparent') {
    return (
      <SecondaryButton
        ref={props._dragRef}
        buttonProps={{
          css: props.css,
        }}
        variant={backgroundType}
        aria-label={content.tooltip}
        size={props.$appearance?.design?.size}
        startIcon={props.$appearance?.design?.startIcon}
        startIconProps={{
          size: props.$appearance?.design?.startIconSize,
          color: props.$appearance?.design?.startIconColor,
        }}
        endIcon={props.$appearance?.design?.endIcon}
        endIconProps={{
          size: props.$appearance?.design?.endIconSize,
          color: props.$appearance?.design?.endIconColor,
        }}
        fullHeight={props.$appearance?.sizeAndSpacing?.fullHeight}
        fullWidth={props.$appearance?.sizeAndSpacing?.fullWidth}
        badge={props.$appearance?.design?.showBadge ? props.$appearance?.design?.badgeIcon : undefined}
        badgeIconProps={{
          size: props.$appearance?.design?.badgeIconSize,
          color: props.$appearance?.design?.badgeIconColor,
        }}
      >
        {useSlot ? <Slot minEmptyHeight={32} className={`button-slot-${props.id}`} /> : content.label}
      </SecondaryButton>
    );
  }

  return (
    <PrimaryButton
      ref={props._dragRef}
      buttonProps={{
        css: props.css,
      }}
      variant={backgroundType}
      aria-label={content.tooltip}
      size={props.$appearance?.design?.size}
      startIcon={props.$appearance?.design?.startIcon}
      startIconProps={{
        size: props.$appearance?.design?.startIconSize,
        color: props.$appearance?.design?.startIconColor,
      }}
      endIcon={props.$appearance?.design?.endIcon}
      endIconProps={{
        size: props.$appearance?.design?.endIconSize,
        color: props.$appearance?.design?.endIconColor,
      }}
      fullHeight={props.$appearance?.sizeAndSpacing?.fullHeight}
      fullWidth={props.$appearance?.sizeAndSpacing?.fullWidth}
      badge={props.$appearance?.design?.showBadge ? props.$appearance?.design?.badgeIcon : undefined}
      badgeIconProps={{
        size: props.$appearance?.design?.badgeIconSize,
        color: props.$appearance?.design?.badgeIconColor,
      }}
    >
      {useSlot ? <Slot minEmptyHeight={32} className={`button-slot-${props.id}`} /> : content.label}
    </PrimaryButton>
  );
}

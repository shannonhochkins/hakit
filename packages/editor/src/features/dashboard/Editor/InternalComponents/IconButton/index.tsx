import { CustomComponentConfig, RenderProps } from '@typings/puck';
import { UnitFieldValue } from '@typings/fields';
import { Fab } from '@components/Button';
import { TooltipProps } from '@components/Tooltip';

/** =========================
 * Types & helpers
 * ======================= */
export type IconButtonProps = {
  content: {
    label: string;
    tooltip: string;
    tooltipPlacement: TooltipProps['placement'];
  };
};

type InternalFieldOverrides = {
  $appearance: {
    design: {
      backgroundType: 'secondary' | 'danger' | 'success' | 'transparent' | 'primary' | 'glass' | 'liquid-glass' | 'color';
      backgroundColor?: string;
      size: 'xs' | 'sm' | 'md' | 'lg';
      icon?: string;
      iconSize?: UnitFieldValue;
      iconColor?: string;
      showBadge: boolean;
      badgeIcon?: string;
      badgeIconSize?: UnitFieldValue;
      badgeIconColor?: string;
    };
  };
};

/** =========================
 * Component Config
 * ======================= */
export const iconButtonComponentConfig: CustomComponentConfig<IconButtonProps, InternalFieldOverrides> = {
  label: 'IconButton',
  autoWrapComponent: false,
  internalFields: {
    omit: {
      $appearance: {
        design: {
          backgroundType: true,
          backgroundColor: true,
        },
        sizeAndSpacing: true,
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
              description: 'The background type for the icon button',
              default: 'secondary',
              options: [
                { label: 'Default', value: 'secondary' },
                { label: 'Primary', value: 'primary' },
                { label: 'Success', value: 'success' },
                { label: 'Danger', value: 'danger' },
                { label: 'Transparent', value: 'transparent' },
                { label: 'Glass', value: 'glass' },
                { label: 'Liquid Glass', value: 'liquid-glass' },
                { label: 'Color', value: 'color' },
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
            icon: {
              type: 'icon',
              label: 'Icon',
              description: 'Icon to display inside the button',
              default: 'Plus',
            },
            iconSize: {
              type: 'unit',
              label: 'Icon Size',
              description: 'The size of the icon',
              default: '1.25rem',
              visible(data) {
                return data.$appearance?.design?.icon !== undefined;
              },
            },
            iconColor: {
              type: 'color',
              label: 'Icon Color',
              description: 'The color of the icon, inherits by default',
              default: undefined,
              visible(data) {
                return data.$appearance?.design?.icon !== undefined;
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
      },
    },
  },
  fields: {
    content: {
      type: 'object',
      label: 'Content',
      objectFields: {
        label: {
          type: 'text',
          label: 'Label',
          description: 'The text to display beneath the button',
          default: '',
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
  render: Render,
};

function Render(props: RenderProps<IconButtonProps, InternalFieldOverrides>) {
  const { content } = props;
  console.log('props.css', props.css);
  return (
    <Fab
      ref={props._dragRef}
      css={props.css}
      label={content.label}
      variant={props.$appearance?.design?.backgroundType}
      aria-label={content.tooltip}
      size={props.$appearance?.design?.size}
      icon={props.$appearance?.design?.icon}
      iconProps={{
        size: props.$appearance?.design?.iconSize,
        color: props.$appearance?.design?.iconColor,
      }}
      badge={props.$appearance?.design?.showBadge ? props.$appearance?.design?.badgeIcon : undefined}
      badgeIconProps={{
        size: props.$appearance?.design?.badgeIconSize,
        color: props.$appearance?.design?.badgeIconColor,
      }}
    />
  );
}

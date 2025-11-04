import { CustomComponentConfig, RenderProps } from '@typings/puck';
import { UnitFieldValue } from '@typings/fields';
import { Fab } from '@components/Button';
import { TooltipProps } from '@components/Tooltip';
import { Column } from '@components/Layout';

/** =========================
 * Types & helpers
 * ======================= */
export type IconButtonProps = {
  appearance: {
    variant?: 'secondary' | 'error' | 'success' | 'transparent' | 'primary';
    size: 'xs' | 'sm' | 'md' | 'lg';
    icon?: string;
    iconSize?: UnitFieldValue;
    iconColor?: string;
    showBadge: boolean;
    badgeIcon?: string;
    badgeIconSize?: UnitFieldValue;
    badgeIconColor?: string;
  };
  content: {
    label: string;
    tooltip: string;
    tooltipPlacement: TooltipProps['placement'];
  };
};

/** =========================
 * Component Config
 * ======================= */
export const iconButtonComponentConfig: CustomComponentConfig<IconButtonProps> = {
  label: 'IconButton',
  autoWrapComponent: false,
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
    appearance: {
      type: 'object',
      label: 'Appearance',
      objectFields: {
        variant: {
          type: 'select',
          label: 'Secondary Variant',
          description: 'The variant style for the secondary button',
          default: 'secondary',
          options: [
            { label: 'Default', value: 'secondary' },
            { label: 'Primary', value: 'primary' },
            { label: 'Success', value: 'success' },
            { label: 'Error', value: 'error' },
            { label: 'Transparent', value: 'transparent' },
          ],
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
            return data.appearance.icon !== undefined;
          },
        },
        iconColor: {
          type: 'color',
          label: 'Icon Color',
          description: 'The color of the icon, inherits by default',
          default: undefined,
          visible(data) {
            return data.appearance.icon !== undefined;
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
            return data.appearance.showBadge;
          },
        },
        badgeIconSize: {
          type: 'unit',
          label: 'Badge Icon Size',
          description: 'The size of the badge icon',
          default: '0.75rem',
          visible(data) {
            return data.appearance.badgeIcon !== undefined && data.appearance.showBadge;
          },
        },
        badgeIconColor: {
          type: 'color',
          label: 'Badge Icon Color',
          description: 'The color of the badge icon, inherits by default',
          default: undefined,
          visible(data) {
            return data.appearance.badgeIcon !== undefined && data.appearance.showBadge;
          },
        },
      },
    },
  },
  styles(props) {
    return `
       .icon-button-label-${props.id} {
          font-size: 1rem;
          color: var(--color-text-primary);
       } 
    `;
  },
  render: Render,
};

function Render(props: RenderProps<IconButtonProps>) {
  const { content } = props;

  return (
    <Column ref={props._dragRef} css={props.css}>
      <Fab
        variant={props.appearance.variant}
        aria-label={content.tooltip}
        size={props.appearance.size}
        icon={props.appearance.icon}
        iconProps={{
          size: props.appearance.iconSize,
          color: props.appearance.iconColor,
        }}
        badge={props.appearance.showBadge ? props.appearance.badgeIcon : undefined}
        badgeIconProps={{
          size: props.appearance.badgeIconSize,
          color: props.appearance.badgeIconColor,
        }}
      />
      {content.label && <span className={`icon-button-label-${props.id}`}>{content.label} </span>}
    </Column>
  );
}

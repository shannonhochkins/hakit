import { CustomComponentConfig, RenderProps } from '@typings/puck';
import { UnitFieldValue } from '@typings/fields';
import { PrimaryButton, SecondaryButton } from '@components/Button';
import { TooltipProps } from '@components/Tooltip';
import { Slot } from '@measured/puck';

/** =========================
 * Types & helpers
 * ======================= */
export type ButtonProps = {
  appearance: {
    type: 'primary' | 'secondary';
    primaryVariant?: 'primary' | 'success' | 'error';
    secondaryVariant?: 'secondary' | 'error' | 'success' | 'transparent';
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
    fullWidth: boolean;
    fullHeight: boolean;
  };
  content: {
    useSlot: boolean;
    slot: Slot;
    label: string;
    tooltip: string;
    tooltipPlacement: TooltipProps['placement'];
  };
};

/** =========================
 * Component Config
 * ======================= */
export const buttonComponentConfig: CustomComponentConfig<ButtonProps> = {
  label: 'Button',
  autoWrapComponent: false,
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
        type: {
          type: 'select',
          label: 'Type',
          description: 'The style of button to display',
          default: 'primary',
          options: [
            { label: 'Primary', value: 'primary' },
            { label: 'Secondary', value: 'secondary' },
          ],
        },
        primaryVariant: {
          type: 'select',
          label: 'Primary Variant',
          description: 'The variant style for the primary button',
          default: 'primary',
          options: [
            { label: 'Default', value: 'primary' },
            { label: 'Success', value: 'success' },
            { label: 'Error', value: 'error' },
          ],
          visible(data) {
            return data.appearance.type === 'primary';
          },
        },
        secondaryVariant: {
          type: 'select',
          label: 'Secondary Variant',
          description: 'The variant style for the secondary button',
          default: 'secondary',
          options: [
            { label: 'Default', value: 'secondary' },
            { label: 'Success', value: 'success' },
            { label: 'Error', value: 'error' },
            { label: 'Transparent', value: 'transparent' },
          ],
          visible(data) {
            return data.appearance.type === 'secondary';
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
            return data.appearance.startIcon !== undefined;
          },
        },
        startIconColor: {
          type: 'color',
          label: 'Start Icon Color',
          description: 'The color of the start icon, inherits by default',
          default: undefined,
          visible(data) {
            return data.appearance.startIcon !== undefined;
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
            return data.appearance.endIcon !== undefined;
          },
        },
        endIconColor: {
          type: 'color',
          label: 'End Icon Color',
          description: 'The color of the end icon, inherits by default',
          default: undefined,
          visible(data) {
            return data.appearance.endIcon !== undefined;
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
        fullWidth: {
          type: 'switch',
          label: 'Full Width',
          description: 'Whether the button should take up the full width of its container',
          default: false,
        },
        fullHeight: {
          type: 'switch',
          label: 'Full Height',
          description: 'Whether the button should take up the full height of its container',
          default: false,
        },
      },
    },
  },
  styles(props) {
    return `
       .button-slot-${props.id} {
          width: 100%;
          height: 100%;
          &[style*="--min-empty-height"] {
            width: 100%;
            min-width: 128px;
          }
       }
    `;
  },
  render: Render,
};

function Render(props: RenderProps<ButtonProps>) {
  const { content } = props;
  const { slot: Slot, useSlot } = content;

  if (props.appearance.type === 'secondary') {
    return (
      <SecondaryButton
        ref={props._dragRef}
        css={props.css}
        variant={props.appearance.secondaryVariant}
        aria-label={content.tooltip}
        size={props.appearance.size}
        startIcon={props.appearance.startIcon}
        startIconProps={{
          size: props.appearance.startIconSize,
          color: props.appearance.startIconColor,
        }}
        endIcon={props.appearance.endIcon}
        endIconProps={{
          size: props.appearance.endIconSize,
          color: props.appearance.endIconColor,
        }}
        fullHeight={props.appearance.fullHeight}
        fullWidth={props.appearance.fullWidth}
        badge={props.appearance.showBadge ? props.appearance.badgeIcon : undefined}
        badgeIconProps={{
          size: props.appearance.badgeIconSize,
          color: props.appearance.badgeIconColor,
        }}
      >
        {useSlot ? <Slot minEmptyHeight={32} className={`button-slot-${props.id}`} /> : content.label}
      </SecondaryButton>
    );
  }

  return (
    <PrimaryButton
      ref={props._dragRef}
      css={props.css}
      variant={props.appearance.primaryVariant}
      aria-label={content.tooltip}
      size={props.appearance.size}
      startIcon={props.appearance.startIcon}
      startIconProps={{
        size: props.appearance.startIconSize,
        color: props.appearance.startIconColor,
      }}
      endIcon={props.appearance.endIcon}
      endIconProps={{
        size: props.appearance.endIconSize,
        color: props.appearance.endIconColor,
      }}
      fullHeight={props.appearance.fullHeight}
      fullWidth={props.appearance.fullWidth}
      badge={props.appearance.showBadge ? props.appearance.badgeIcon : undefined}
      badgeIconProps={{
        size: props.appearance.badgeIconSize,
        color: props.appearance.badgeIconColor,
      }}
    >
      {useSlot ? <Slot minEmptyHeight={32} className={`button-slot-${props.id}`} /> : content.label}
    </PrimaryButton>
  );
}

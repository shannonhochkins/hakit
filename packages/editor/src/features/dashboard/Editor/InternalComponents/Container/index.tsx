import React from 'react';
import { CustomComponentConfig, RenderProps } from '@typings/puck';
import { Slot } from '@measured/puck';
import {
  AlignStartVertical,
  AlignEndVertical,
  AlignHorizontalJustifyCenter,
  AlignHorizontalSpaceAround,
  AlignHorizontalSpaceBetween,
  AlignEndHorizontal,
  ArrowRightLeft,
  ListChevronsDownUp,
  UnfoldVertical,
  AlignVerticalSpaceAround,
  AlignVerticalSpaceBetween,
  UnfoldHorizontal,
  AlignVerticalJustifyCenter,
  Columns3,
  Rows3,
  AlignStartHorizontal,
} from 'lucide-react';
import { UnitFieldValue } from '@typings/fields';
import { SelectField } from '@components/Form/Field/Select';
import { Column, Row } from '@components/Layout';

/** =========================
 * Types & helpers
 * ======================= */
export type ContainerProps = {
  flex: {
    direction: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    alignItems: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
    justifyContent: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  };
  flexWrap: 'nowrap' | 'wrap' | 'wrap-reverse';
  gap: UnitFieldValue;
  additionalLayout: {
    grow: boolean; // grow to fill available space
    shrink: boolean; // allow shrinking smaller than content
  };
  width: UnitFieldValue;
  height: UnitFieldValue;
  backgroundColor?: string;
  padding: UnitFieldValue; // supports corners
  margin: UnitFieldValue; // supports corners
  /** Location for sub components */
  content: Slot;
};

const directionOptions = [
  { label: 'Row', value: 'row' },
  { label: 'Column', value: 'column' },
  { label: 'Row Reverse', value: 'row-reverse' },
  { label: 'Column Reverse', value: 'column-reverse' },
] as const;

const SIMPLE_POS: Array<'flex-start' | 'center' | 'flex-end'> = ['flex-start', 'center', 'flex-end'];

function isSpaceValue(v: unknown): v is 'space-between' | 'space-around' | 'space-evenly' {
  return v === 'space-between' || v === 'space-around' || v === 'space-evenly';
}

/** =========================
 * Option sets (dynamic per-axis)
 * ======================= */
const MAIN_AXIS_OPTIONS = [
  { label: 'Start', value: 'flex-start' as const },
  { label: 'Center', value: 'center' as const },
  { label: 'End', value: 'flex-end' as const },
  { label: 'Space Between', value: 'space-between' as const },
  { label: 'Space Around', value: 'space-around' as const },
  { label: 'Space Evenly', value: 'space-evenly' as const },
];

const CROSS_AXIS_OPTIONS = [
  { label: 'Start', value: 'flex-start' as const },
  { label: 'Center', value: 'center' as const },
  { label: 'End', value: 'flex-end' as const },
  { label: 'Stretch', value: 'stretch' as const },
  { label: 'Baseline', value: 'baseline' as const },
];

const FLEX_WRAP_OPTIONS = [
  { label: 'No Wrap', value: 'nowrap' as const },
  { label: 'Wrap', value: 'wrap' as const },
  { label: 'Wrap Reverse', value: 'wrap-reverse' as const },
];

type Axis = 'h' | 'v';

// Dense icon map per axis + value. We reuse existing lucide icons and flip them when helpful.
const ICON_MAP: Record<Axis, Record<string, (props?: { size?: number; style?: React.CSSProperties }) => React.ReactNode>> = {
  h: {
    'flex-start': ({ size = 16 } = {}) => <AlignStartVertical size={size} />,
    center: ({ size = 16 } = {}) => <AlignHorizontalJustifyCenter size={size} />,
    'flex-end': ({ size = 16 } = {}) => <AlignEndVertical size={size} />,
    'space-between': ({ size = 16 } = {}) => <AlignHorizontalSpaceBetween size={size} />,
    'space-around': ({ size = 16 } = {}) => <AlignHorizontalSpaceAround size={size} />,
    'space-evenly': ({ size = 16 } = {}) => <Columns3 size={size} />,
    stretch: ({ size = 16 } = {}) => <UnfoldHorizontal size={size} />,
    baseline: ({ size = 16 } = {}) => <ListChevronsDownUp size={size} />, // cross-only
  },
  v: {
    'flex-start': ({ size = 16 } = {}) => <AlignStartHorizontal size={size} />,
    center: ({ size = 16 } = {}) => <AlignVerticalJustifyCenter size={size} />,
    'flex-end': ({ size = 16 } = {}) => <AlignEndHorizontal size={size} />,
    'space-between': ({ size = 16 } = {}) => <AlignVerticalSpaceBetween size={size} />,
    'space-around': ({ size = 16 } = {}) => <AlignVerticalSpaceAround size={size} />,
    'space-evenly': ({ size = 16 } = {}) => <Rows3 size={size} />,
    stretch: ({ size = 16 } = {}) => <UnfoldVertical size={size} />, // natural vertical stretch icon
    baseline: ({ size = 16 } = {}) => <ListChevronsDownUp size={size} />, // represents baseline-ish
  },
};

// eslint-disable-next-line react/display-name
const renderOptionFactory = (axis: Axis) => (option: { label: string; value: string }) => (
  <Row gap='var(--space-2)' alignItems='center'>
    {ICON_MAP[axis][option.value]?.({})}
    <span>{option.label}</span>
  </Row>
);

/** =========================
 * Component Config
 * ======================= */
export const containerComponentConfig: CustomComponentConfig<ContainerProps> = {
  label: 'Container',
  fields: {
    flex: {
      type: 'custom',
      label: 'Container Alignment',
      default: {
        direction: 'row',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
      },
      render({ value, onChange, id }) {
        const isColumn = value.direction === 'column';

        // Map X/Y controls to the proper CSS props based on direction
        const xIsMain = !isColumn; // row => X is main (justifyContent); column => X is cross (alignItems)
        const yIsMain = isColumn; // row => Y is cross; column => Y is main

        const xOptions = xIsMain ? MAIN_AXIS_OPTIONS : CROSS_AXIS_OPTIONS;
        const yOptions = yIsMain ? MAIN_AXIS_OPTIONS : CROSS_AXIS_OPTIONS;

        const xValue = xIsMain ? value.justifyContent : value.alignItems;
        const yValue = yIsMain ? value.justifyContent : value.alignItems;

        return (
          <Column gap='var(--space-5)' alignItems='flex-start' justifyContent='flex-start'>
            <SelectField
              id={id + '-direction'}
              name={id + '-direction'}
              label='Direction'
              icon={<ArrowRightLeft size={16} />}
              value={directionOptions.find(o => o.value === value.direction) ?? directionOptions[0]}
              options={directionOptions}
              helperText='Direction of content layout'
              onChange={option => {
                if (option.value === value.direction) return;
                const nextDirection = option.value;
                let { alignItems, justifyContent } = value;
                const isSimpleAI = SIMPLE_POS.includes(alignItems);
                const isSimpleJC = SIMPLE_POS.includes(justifyContent);
                // Swap only when both are simple (avoid trashing space-* or stretch/baseline)
                if (isSimpleAI && isSimpleJC) {
                  const tmp = alignItems;
                  alignItems = justifyContent as typeof alignItems;
                  justifyContent = tmp as typeof justifyContent;
                }
                onChange({ ...value, direction: nextDirection, alignItems, justifyContent });
              }}
            />

            {/* Horizontal (X) alignment selector */}
            <SelectField
              id={id + '-x'}
              name={id + '-x'}
              label='Horizontal'
              icon={ICON_MAP.h.center({})}
              value={xOptions.find(o => o.value === xValue) ?? xOptions[0]}
              options={xOptions}
              helperText={xIsMain ? 'Main axis (justify-content)' : 'Cross axis (align-items)'}
              renderOption={renderOptionFactory('h')}
              onChange={option => {
                const v = option.value;
                if (xIsMain) {
                  // justify-content accepts simple + space-*
                  if (v === 'stretch' || v === 'baseline') return; // guard
                  onChange({ ...value, justifyContent: v });
                } else {
                  // align-items accepts simple + stretch/baseline
                  if (isSpaceValue(v)) return; // guard
                  onChange({ ...value, alignItems: v });
                }
              }}
            />

            {/* Vertical (Y) alignment selector */}
            <SelectField
              id={id + '-y'}
              name={id + '-y'}
              label='Vertical'
              icon={ICON_MAP.v.center({})}
              value={yOptions.find(o => o.value === yValue) ?? yOptions[0]}
              options={yOptions}
              helperText={yIsMain ? 'Main axis (justify-content)' : 'Cross axis (align-items)'}
              renderOption={renderOptionFactory('v')}
              onChange={option => {
                const v = option.value;
                if (yIsMain) {
                  if (v === 'stretch' || v === 'baseline') return;
                  onChange({ ...value, justifyContent: v });
                } else {
                  if (isSpaceValue(v)) return;
                  onChange({ ...value, alignItems: v });
                }
              }}
            />
          </Column>
        );
      },
    },
    flexWrap: {
      type: 'custom',
      label: 'Wrap Options',
      default: 'nowrap',
      description: 'Wrap behavior for container items',
      render({ value, onChange, id }) {
        return (
          <SelectField
            id={id}
            name={id}
            label='Flex Wrap'
            icon={<ListChevronsDownUp size={16} />}
            value={FLEX_WRAP_OPTIONS.find(o => o.value === value) ?? FLEX_WRAP_OPTIONS[0]}
            options={FLEX_WRAP_OPTIONS}
            helperText='Wrap behavior for container items'
            onChange={option => {
              onChange(option.value);
            }}
          />
        );
      },
    },
    gap: {
      type: 'unit',
      label: 'Gap',
      description: 'Gap between items inside the container',
      default: '0.5rem',
    },
    additionalLayout: {
      type: 'object',
      label: 'Additional Layout',
      collapseOptions: { startExpanded: false },
      objectFields: {
        grow: {
          type: 'switch',
          label: 'Allow grow',
          default: true,
          description: 'When enabled, the container will allow growing to fill available space.',
        },
        shrink: {
          type: 'switch',
          label: 'Allow Shrink',
          default: true,
          description: 'When enabled, the container can shrink smaller than its content if needed.',
        },
      },
    },

    backgroundColor: {
      type: 'color',
      label: 'Background Color',
      description: 'Background color or gradient of the container',
      default: 'transparent',
    },

    width: {
      type: 'unit',
      label: 'Width',
      description: 'Width of the container',
      default: 'auto',
    },

    height: {
      type: 'unit',
      label: 'Height',
      description: 'Height of the container',
      default: 'auto',
    },

    padding: {
      type: 'unit',
      label: 'Padding',
      description: 'Padding inside the container around the content area',
      default: '1rem',
      supportsAllCorners: true,
    },

    margin: {
      type: 'unit',
      label: 'Margin',
      description: 'Margin outside the container',
      default: '0rem',
      supportsAllCorners: true,
    },

    content: {
      type: 'slot',
      label: 'Content',
    },
  },

  permissions: {
    drag: false,
    duplicate: false,
  },

  styles(props) {
    return `
      padding: ${props.padding};
      margin: ${props.margin};
      width: ${props.width};
      height: ${props.height};
      max-width: 100%;
      min-width: 0px;
      position: relative;
      background: ${props.backgroundColor ?? 'transparent'};
      
      > .Container-content {
        display: flex;
        min-width: 0;
        max-width: 100%;
        gap: ${props.gap};
        flex-direction: ${props.flex.direction};
        align-items: ${props.flex.alignItems};
        justify-content: ${props.flex.justifyContent};
        flex-wrap: ${props.flexWrap};
        flex-shrink: ${props.additionalLayout?.shrink ? 1 : 0};
        flex-grow: ${props.additionalLayout?.grow ? 1 : 0};
        ${props.additionalLayout?.grow ? 'flex-grow: 1; place-self: stretch;' : ''}
      }
    `;
  },
  render: Render,
};

function Render(props: RenderProps<ContainerProps>) {
  const { content: Content } = props;
  return (
    <div className='Container'>
      <Content className='Container-content' />
    </div>
  );
}

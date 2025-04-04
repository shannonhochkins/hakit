import { useMemo } from 'react';
import { useBreakpoint, Row, type BreakPoint, type AvailableQueries, type BreakPoints } from '@hakit/components';
import { Ruler } from './components/Ruler';
import styled from '@emotion/styled';
import { getCssVariableValue, setSidebarWidth } from '../Sidebar/helpers';
import { Tooltip } from '../Tooltip';

const BreakpointIndicator = styled.div`
  position: absolute;
  height: 100%;
  flex-shrink: 0;
  flex-grow: 0;
  display: flex;
  align-items: center;
  border-bottom: 3px solid var(--puck-color-grey-06);
  border-right: 2px solid var(--puck-color-grey-06);
  cursor: pointer;
  user-select: none;
  > div {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  span {
    display: flex;
    color: var(--puck-color-grey-05);
  }
  &:hover,
  &:focus {
    background-color: rgba(255, 255, 255, 0.025);
    span {
      color: var(--puck-color-grey-04);
    }
  }
  &.bp-xlg {
    > div {
      justify-content: flex-start;
    }
    span {
      padding-left: 24px;
    }
  }
  &.active {
    background-color: rgba(255, 255, 255, 0.05);
    border-bottom-color: var(--puck-color-grey-05);
    span {
      color: var(--puck-color-grey-01);
    }
  }
`;

const StyledViewportControls = styled(Row)`
  min-height: var(--header-height);
  max-height: var(--header-height);
  overflow: hidden;
`;

export type ViewportItem = {
  label: string;
  width: number;
  disabled: boolean;
};

const defaultViewports: Required<ViewportItem[]> = [
  // Extra small devices (phones, 368px and down)
  {
    label: 'xxs',
    width: 368,
    disabled: false,
  },
  // Small devices (phones, 480px and down)
  {
    label: 'xs',
    width: 480,
    disabled: true,
  },
  // Tablets, 768px and down
  {
    label: 'sm',
    width: 768,
    disabled: false,
  },
  // Laptops, 1279px and down
  {
    label: 'md',
    width: 1279,
    disabled: false,
  },
  // Desktops, 1600px and down
  {
    label: 'lg',
    width: 1600,
    disabled: false,
  },
];

function toBreakpoints(viewports: ViewportItem[]): BreakPoints {
  return viewports.reduce(
    (acc, viewport) => ({
      ...acc,
      [viewport.label as keyof AvailableQueries]: viewport.width,
    }),
    {} as BreakPoints
  );
}


export const ViewportControls = () => {
  const breakpoints = useMemo(() => toBreakpoints(defaultViewports), [defaultViewports]);
  const sortedBreakpoints = useMemo(() => {
    const clone: Record<BreakPoint, number> = { ...breakpoints, xlg: breakpoints['lg'] + 1 };
    return Object.entries(clone).map((entry, index, array) => {
      const [name, width] = entry;
      const previousWidth = array[index - 1] ? array[index - 1][1] : 0;
      return {
        name,
        previousPos: previousWidth,
        value: name === 'xlg' ? previousWidth : width,
        width: name === 'xlg' ? 100 : width - previousWidth,
      };
    });
  }, [breakpoints]);

  const activeViewport = useBreakpoint();

  return (
    <StyledViewportControls alignItems='flex-start' justifyContent='flex-start' fullWidth wrap='nowrap'>
      <Row
        fullWidth
        fullHeight
        wrap='nowrap'
        style={{
          position: 'relative',
        }}
        alignItems='flex-start'
        justifyContent='flex-start'
      >
        <svg width='100%' height='64px'>
          {/* Define the repeating pattern */}
          <Ruler
            patternId={'ruler'}
            patternHeight={64}
            distanceBetweenMainTicks={100}
            orientation='bottom'
            ticks={{
              every: 10,
              main: {
                length: 15,
                thickness: 2,
                color: 'var(--puck-color-grey-09)',
                cap: 'round',
              },
              sub: {
                length: 5,
                color: 'var(--puck-color-grey-09)',
                thickness: 1,
                cap: 'round',
              },
            }}
          />

          {/* Draw a full-width rectangle that uses the pattern */}
          <rect x={0} y={0} width='100%' height='80' fill={`url(#ruler)`} />
        </svg>
        {sortedBreakpoints.map(({ name, previousPos, width, value }, index) => (
          <BreakpointIndicator
            key={name}
            className={`${activeViewport[name as keyof typeof activeViewport] ? 'active' : ''} bp-${name}`}
            style={{
              left: `${previousPos}px`,
              width: name === 'xlg' ? '100%' : `${width}px`,
            }}
            onClick={() => {
              const previewMargin = getCssVariableValue('--puck-space-px', 16);
              if (name === 'xlg') {
                const previousWidth = sortedBreakpoints[index - 1].width;
                setSidebarWidth(window.innerWidth - (value + previousWidth - 1));
              } else {
                setSidebarWidth(window.innerWidth - (value - 1) - previewMargin * 2);
              }
            }}
          >
            <Tooltip title={`View ${name} breakpoint`} placement='bottom'>
              <span>{name}</span>
            </Tooltip>
          </BreakpointIndicator>
        ))}
      </Row>
    </StyledViewportControls>
  );
};

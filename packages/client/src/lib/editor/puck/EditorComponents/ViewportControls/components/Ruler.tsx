import { memo } from 'react';

interface Tick {
  thickness: number;
  length: number;
  color: string;
  cap: 'round' | 'butt' | 'square';
  shapeRendering?: 'auto' | 'crispEdges' | 'geometricPrecision';
}

export interface RulerPatternProps {
  /** An ID to use for the <pattern> element */
  patternId: string;

  /**
   * The pixel distance between consecutive "main" ticks in the repeating pattern.
   * Default example: 50px
   */
  distanceBetweenMainTicks?: number;

  /** The total height of the pattern box (in px). */
  patternHeight: number;

  /** Where the ticks originate: "top" => downward; "bottom" => upward */
  orientation?: 'top' | 'bottom';

  /**
   * Ticks configuration. We only need:
   *   - every: number of "sub" ticks between main ticks
   *   - main / sub: partial Tick definitions
   */
  ticks: {
    every: number; // default 4 => 4 sub-ticks between main ticks
    main: Tick;
    sub: Tick;
  };

  /**
   * Optional mask ID if you want to mask the pattern.
   */
  mask?: string | null;
}

function RulerPatternComponent({
  patternId,
  distanceBetweenMainTicks = 50, // If you want a default
  patternHeight,
  orientation = 'top',
  ticks,
  mask = null,
}: RulerPatternProps) {
  // Merge user partials
  const { every, main, sub } = ticks;

  // We only need "every + 1" ticks in one pattern tile:
  //   - i=0 => main
  //   - i=1..(every-1) => sub
  //   - i=every => main
  const count = every + 1;

  return (
    <defs>
      <pattern id={patternId} x={0} y={0} width={distanceBetweenMainTicks} height={patternHeight} patternUnits='userSpaceOnUse'>
        <g mask={mask ? `url(#${mask})` : undefined}>
          {Array.from({ length: count }, (_, i) => {
            const isMain = i === 0 || i === every;
            const { thickness, length, color, cap, shapeRendering = 'auto' } = isMain ? main : sub;

            // fraction = i / every => from 0..1
            const fraction = i / every;
            const x = fraction * distanceBetweenMainTicks;

            // If you see 1px misalignment for odd stroke widths, you can do:
            // if (thickness % 2 === 1) x = Math.floor(x) + 0.5;
            // else x = Math.round(x);

            return orientation === 'top' ? (
              <line
                key={i}
                x1={x}
                y1={0}
                x2={x}
                y2={length}
                stroke={color}
                strokeWidth={thickness}
                strokeLinecap={cap}
                shapeRendering={shapeRendering}
              />
            ) : (
              <line
                key={i}
                x1={x}
                y1={patternHeight}
                x2={x}
                y2={patternHeight - length}
                stroke={color}
                strokeWidth={thickness}
                strokeLinecap={cap}
                shapeRendering={shapeRendering}
              />
            );
          })}
        </g>
      </pattern>
    </defs>
  );
}

export const Ruler = memo(RulerPatternComponent);

import type { ReactNode } from 'react';
import styles from './Spinner.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
import { AlertCircleIcon } from 'lucide-react';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
  thickness?: number;
  absolute?: boolean;
  text?: ReactNode;
  error?: boolean;
}

const getClassName = getClassNameFactory('Spinner', styles);

export function Spinner({ size = 20, thickness = 3, absolute = false, text = '', style, className, error = false, ...rest }: SpinnerProps) {
  const computed = getClassName({ absolute, hasText: !!text, Spinner: true }, className);
  const center = size + thickness;
  const viewBoxSize = center * 2;

  // Calculate scaling factor based on default size (radius 20)
  const defaultRadius = 20;
  const scale = size / defaultRadius;

  // Scale the original static values proportionally
  const smallDash = 1 * scale;
  const fullCircle = 150 * scale;
  const largeDash = 90 * scale;
  const midOffset = -35 * scale;
  const endOffset = -124 * scale;

  return (
    <div
      className={computed}
      style={
        {
          ...style,
          '--small-dash': smallDash,
          '--full-circle': fullCircle,
          '--large-dash': largeDash,
          '--mid-offset': midOffset,
          '--end-offset': endOffset,
        } as React.CSSProperties
      }
      {...rest}
    >
      {!error && (
        <svg className={getClassName('spinner')} viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} width={viewBoxSize} height={viewBoxSize}>
          <circle className={getClassName('spinnerTrack')} cx={center} cy={center} r={size} fill='none' strokeWidth={thickness} />
          <circle className={getClassName('spinnerPath')} cx={center} cy={center} r={size} fill='none' strokeWidth={thickness} />
        </svg>
      )}
      {error && (
        <AlertCircleIcon
          size={`${size * 3}px`}
          style={{
            fill: 'color-mix(in srgb, var(--color-error-500) 10%, transparent)',
            stroke: 'var(--color-error-700)',
          }}
        />
      )}
      {text && <div className={getClassName('spinnerText')}>{text}</div>}
    </div>
  );
}

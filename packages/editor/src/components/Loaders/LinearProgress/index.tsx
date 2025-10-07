import React from 'react';
import styles from './LinearProgress.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';

type LinearColor = 'primary' | 'secondary' | 'error' | 'success';
type LinearThickness = 'thin' | 'normal' | 'thick';
type LinearVariant = 'determinate' | 'indeterminate';

export interface LinearProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number; // 0-100
  color?: LinearColor;
  thickness?: LinearThickness;
  rounded?: boolean;
  variant?: LinearVariant;
}

const getClassName = getClassNameFactory('LinearProgress', styles);

export function LinearProgress({
  value = 0,
  color = 'primary',
  thickness = 'normal',
  rounded = false,
  variant = 'determinate',
  className,
  style,
  ...rest
}: LinearProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const computed = getClassName(
    {
      LinearProgress: true,
      colorSecondary: color === 'secondary',
      colorError: color === 'error',
      colorSuccess: color === 'success',
      thin: thickness === 'thin',
      thick: thickness === 'thick',
      rounded,
      indeterminate: variant === 'indeterminate',
    },
    className
  );
  const mergedStyle = { ...(style || {}), ['--progress' as unknown as string]: `${clamped}%` } as React.CSSProperties;
  return (
    <div
      className={computed}
      style={mergedStyle}
      role='progressbar'
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      {...rest}
    >
      <div className={styles.bar} />
      {variant === 'indeterminate' && <div className={styles.bar2} />}
      <div className={styles.buffer} />
    </div>
  );
}

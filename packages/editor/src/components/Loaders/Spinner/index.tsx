import type { ReactNode } from 'react';
import styles from './Spinner.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: string;
  absolute?: boolean;
  dark?: boolean;
  text?: ReactNode;
}

const getClassName = getClassNameFactory('Spinner', styles);

export function Spinner({ size = '2rem', absolute = false, dark = false, text = '', style, className, ...rest }: SpinnerProps) {
  const computed = getClassName({ absolute, dark, hasText: !!text }, className);
  const mergedStyle = { ...(style || {}), ['--spinner-size' as unknown as string]: size } as React.CSSProperties;
  return (
    <div className={computed} style={mergedStyle} {...rest}>
      <span></span>
      {text && <div>{text}</div>}
    </div>
  );
}

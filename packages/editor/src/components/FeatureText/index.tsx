import type { ReactNode } from 'react';
import styles from './FeatureText.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';

const getClassName = getClassNameFactory('FeatureText', styles);
interface FeatureTextProps {
  primary?: ReactNode;
  secondary?: ReactNode;
  className?: string;
}

export function FeatureText({ primary, secondary, className }: FeatureTextProps) {
  return (
    <>
      {primary && <span className={getClassName({ FeatureText: true }, className)}>{primary}</span>}
      {secondary && <span className={getClassName({ FeatureText: true, secondary: true }, className)}>{secondary}</span>}
    </>
  );
}

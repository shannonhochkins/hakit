import React, { ButtonHTMLAttributes } from 'react';
import styles from './Table.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
import { ChevronDown, ChevronRight } from 'lucide-react';

const getClassName = getClassNameFactory('ExpandButton', styles);

export interface ExpandButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Whether the button represents an expanded state */
  expanded: boolean;
}

export const ExpandButton = ({ expanded, onClick, className, ...props }: ExpandButtonProps) => {
  return (
    <button
      className={getClassName({}, className)}
      onClick={e => {
        e.stopPropagation();
        onClick?.(e);
      }}
      type='button'
      {...props}
    >
      {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
    </button>
  );
};

// Helper component for expand/collapse icon (matches old API)
export interface ExpandIconProps {
  expanded: boolean;
  onClick?: (event: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

export const ExpandIcon: React.FC<ExpandIconProps> = ({ expanded, onClick, style }) => {
  return <ExpandButton expanded={expanded} onClick={onClick} style={style} />;
};

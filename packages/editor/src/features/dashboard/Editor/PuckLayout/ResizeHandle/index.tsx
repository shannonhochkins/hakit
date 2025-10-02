import { GripVertical } from 'lucide-react';
import React from 'react';
import styles from './ResizeHandle.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';

const getClassName = getClassNameFactory('ResizeHandle', styles);

interface BaseHandleProps extends React.HTMLAttributes<HTMLDivElement> {
  direction: 'vertical' | 'horizontal';
  children?: React.ReactNode;
  position?: string;
}

export const ResizeHandleIcon = ({ direction, position, children, className, ...rest }: BaseHandleProps) => {
  return (
    <div
      className={getClassName('ResizeHandle', className)}
      data-testid={`${direction}ResizeHandle${position ? `-${position}` : ''}`}
      {...rest}
    >
      {children ? (
        // Render custom handle content if provided
        children
      ) : (
        // Default handle content
        <GripVertical className={getClassName('defaultHandle')} size={16} />
      )}
    </div>
  );
};

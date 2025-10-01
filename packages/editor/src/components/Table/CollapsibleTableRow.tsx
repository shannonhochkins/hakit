import React, { HTMLAttributes } from 'react';
import styles from './Table.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';

const getClassName = getClassNameFactory('CollapsibleTableRow', styles);

export interface CollapsibleTableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
  /** Whether the row is expanded */
  expanded?: boolean;
}

export const CollapsibleTableRow = ({ children, expanded, onClick, className, ...props }: CollapsibleTableRowProps) => {
  return (
    <tr
      className={getClassName(
        {
          expanded: !!expanded,
          clickable: !!onClick,
        },
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </tr>
  );
};

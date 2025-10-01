import React, { HTMLAttributes } from 'react';
import styles from './Table.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';

const getClassName = getClassNameFactory('TableRow', styles);

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
  /** Whether the row should have hover effects (default: true) */
  hover?: boolean;
}

export const TableRow = ({ children, hover = true, onClick, className, ...props }: TableRowProps) => {
  return (
    <tr
      className={getClassName(
        {
          TableRow: true,
          clickable: !!onClick,
          hover: hover !== false,
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

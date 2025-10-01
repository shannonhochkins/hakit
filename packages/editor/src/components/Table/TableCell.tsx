import React, { TdHTMLAttributes, CSSProperties } from 'react';
import styles from './Table.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';

const getClassName = getClassNameFactory('TableCell', styles);

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode;
  /** Hide cell below specified breakpoint */
  hiddenBelow?: 'md' | 'lg';
  /** Width for the cell */
  width?: string;
  /** Min width for the cell */
  minWidth?: string;
}

export const TableCell = ({ children, hiddenBelow, width, minWidth, className, style, ...props }: TableCellProps) => {
  const inlineStyle: CSSProperties = {
    ...style,
    ...(width && { width }),
    ...(minWidth && { minWidth }),
  };

  return (
    <td
      className={getClassName(
        {
          hiddenBelowMd: hiddenBelow === 'md',
          hiddenBelowLg: hiddenBelow === 'lg',
        },
        className
      )}
      style={inlineStyle}
      {...props}
    >
      {children}
    </td>
  );
};

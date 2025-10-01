import React, { ThHTMLAttributes, CSSProperties } from 'react';
import styles from './Table.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';

const getClassName = getClassNameFactory('TableHeaderCell', styles);

export interface TableHeaderCellProps extends ThHTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode;
  /** Hide cell below specified breakpoint */
  hiddenBelow?: 'md' | 'lg';
  /** Width for the cell */
  width?: string;
  /** Min width for the cell */
  minWidth?: string;
  /** Whether the header is sortable */
  sortable?: boolean;
}

export const TableHeaderCell = ({ children, hiddenBelow, width, minWidth, sortable, className, style, ...props }: TableHeaderCellProps) => {
  const inlineStyle: CSSProperties = {
    ...style,
    ...(width && { width }),
    ...(minWidth && { minWidth }),
  };

  return (
    <th
      className={getClassName(
        {
          TableHeaderCell: true,
          hiddenBelowMd: hiddenBelow === 'md',
          hiddenBelowLg: hiddenBelow === 'lg',
          sortable: !!sortable,
        },
        className
      )}
      style={inlineStyle}
      {...props}
    >
      {children}
    </th>
  );
};

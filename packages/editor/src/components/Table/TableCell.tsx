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
  /** Whether to right-align the last column (default: true) */
  rightAlignLast?: boolean;
}

export const TableCell = ({
  children,
  hiddenBelow,
  width,
  minWidth,
  rightAlignLast = true,
  className,
  style,
  ...props
}: TableCellProps) => {
  const inlineStyle: CSSProperties = {
    ...style,
    ...(width && { width }),
    ...(minWidth && { minWidth }),
  };

  return (
    <td
      className={getClassName(
        {
          TableCell: true,
          hiddenBelowMd: hiddenBelow === 'md',
          hiddenBelowLg: hiddenBelow === 'lg',
          rightAlignLast: rightAlignLast,
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

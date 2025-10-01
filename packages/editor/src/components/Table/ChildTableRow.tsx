import React, { HTMLAttributes } from 'react';
import styles from './Table.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';

const getClassName = getClassNameFactory('ChildTableRow', styles);

export interface ChildTableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
}

export const ChildTableRow = ({ children, className, ...props }: ChildTableRowProps) => {
  return (
    <tr className={getClassName({}, className)} {...props}>
      {children}
    </tr>
  );
};

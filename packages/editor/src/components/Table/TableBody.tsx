import React, { HTMLAttributes } from 'react';
import styles from './Table.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';

const getClassName = getClassNameFactory('TableBody', styles);

export interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export const TableBody = ({ children, className, ...props }: TableBodyProps) => {
  return (
    <tbody className={getClassName({}, className)} {...props}>
      {children}
    </tbody>
  );
};

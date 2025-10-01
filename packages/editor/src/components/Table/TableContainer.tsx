import React, { HTMLAttributes } from 'react';
import styles from './Table.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';

const getClassName = getClassNameFactory('TableContainer', styles);

export interface TableContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const TableContainer = ({ children, className, ...props }: TableContainerProps) => {
  return (
    <div className={getClassName({}, className)} {...props}>
      {children}
    </div>
  );
};

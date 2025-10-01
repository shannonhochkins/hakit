import React, { TableHTMLAttributes } from 'react';
import styles from './Table.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';

const getClassName = getClassNameFactory('Table', styles);

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export const Table = ({ children, className, ...props }: TableProps) => {
  return (
    <table className={getClassName({}, className)} {...props}>
      {children}
    </table>
  );
};

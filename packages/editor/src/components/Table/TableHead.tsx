import React, { HTMLAttributes } from 'react';
import styles from './Table.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';

const getClassName = getClassNameFactory('TableHead', styles);

export interface TableHeadProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export const TableHead = ({ children, className, ...props }: TableHeadProps) => {
  return (
    <thead className={getClassName({ TableHead: true }, className)} {...props}>
      {children}
    </thead>
  );
};

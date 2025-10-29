import React from 'react';
import styles from './EmptyState.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';

const getClassName = getClassNameFactory('EmptyState', styles);

// React Component
interface EmptyStateProps extends React.ComponentPropsWithoutRef<'div'> {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actions?: React.ReactNode;
  leftAligned?: boolean;
}

export function EmptyState({ icon, title, description, actions, leftAligned, className, ...rest }: EmptyStateProps) {
  return (
    <div className={getClassName({ EmptyState: true, leftAligned }, className)} {...rest}>
      {icon && <div className={getClassName('icon')}>{icon}</div>}
      <h2 className={getClassName('title')}>{title}</h2>
      <p className={getClassName('description')}>{description}</p>
      {actions && <div className={getClassName('actions')}>{actions}</div>}
    </div>
  );
}

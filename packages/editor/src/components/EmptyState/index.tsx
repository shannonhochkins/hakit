import React from 'react';
import styles from './EmptyState.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';

const getClassName = getClassNameFactory('EmptyState', styles);

// React Component
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actions?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, actions, className }: EmptyStateProps) {
  return (
    <div className={getClassName({ EmptyState: true }, className)}>
      {icon && <div className={getClassName('icon')}>{icon}</div>}
      <h2 className={getClassName('title')}>{title}</h2>
      <p className={getClassName('description')}>{description}</p>
      {actions && <div className={getClassName('actions')}>{actions}</div>}
    </div>
  );
}

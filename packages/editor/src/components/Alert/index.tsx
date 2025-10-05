import React from 'react';
import { Info, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import styles from './Alert.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';

const getClassName = getClassNameFactory('Alert', styles);

type AlertSeverity = 'info' | 'warning' | 'success' | 'error';

interface AlertProps {
  children: React.ReactNode;
  severity?: AlertSeverity;
  title?: string;
  className?: string;
  onClick?: () => void;
  ref?: React.Ref<HTMLDivElement>;
  style?: React.CSSProperties;
}

const ICON_SIZE = 20;

const getSeverityIcon = (severity: AlertSeverity) => {
  const iconProps = {
    size: ICON_SIZE,
    'aria-hidden': true,
    className: 'shrink-0 mt-1',
  };

  switch (severity) {
    case 'info':
      return <Info {...iconProps} />;
    case 'warning':
      return <AlertTriangle {...iconProps} />;
    case 'success':
      return <CheckCircle {...iconProps} />;
    case 'error':
      return <AlertCircle {...iconProps} />;
    default:
      return <Info {...iconProps} />;
  }
};

// CSS Modules equivalents handled via getClassName

export function Alert({ children, severity = 'info', title, className, onClick, style, ref }: AlertProps) {
  return (
    <div
      className={getClassName(
        {
          Alert: true,
          severityInfo: severity === 'info',
          severityWarning: severity === 'warning',
          severitySuccess: severity === 'success',
          severityError: severity === 'error',
        },
        className
      )}
      onClick={onClick}
      ref={ref}
      style={style}
    >
      <div className={getClassName('content')}>
        <div className={getClassName('icon')}>{getSeverityIcon(severity)}</div>
        <div className={getClassName('body')}>
          {title && <h3 className={getClassName('title')}>{title}</h3>}
          {children && <div className={getClassName('message')}>{children}</div>}
        </div>
      </div>
    </div>
  );
}

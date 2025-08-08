import React from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { Info, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

type AlertSeverity = 'info' | 'warning' | 'success' | 'error';

interface AlertProps {
  children: React.ReactNode;
  severity?: AlertSeverity;
  title?: string;
  className?: string;
  onClick?: () => void;
  ref?: React.Ref<HTMLDivElement>;
}

const ICON_SIZE = 20;

const getSeverityStyles = (severity: AlertSeverity) => {
  switch (severity) {
    case 'info':
      return css`
        background-color: rgba(59, 130, 246, 0.1);
        border-color: rgba(59, 130, 246, 0.2);
      `;
    case 'warning':
      return css`
        background-color: rgba(245, 158, 11, 0.1);
        border-color: rgba(245, 158, 11, 0.2);
      `;
    case 'success':
      return css`
        background-color: rgba(34, 197, 94, 0.1);
        border-color: rgba(34, 197, 94, 0.2);
      `;
    case 'error':
      return css`
        background-color: rgba(239, 68, 68, 0.1);
        border-color: rgba(239, 68, 68, 0.2);
      `;
    default:
      return css`
        background-color: rgba(59, 130, 246, 0.1);
        border-color: rgba(59, 130, 246, 0.2);
      `;
  }
};

const getSeverityColorStyles = (severity: AlertSeverity) => {
  switch (severity) {
    case 'info':
      return css`
        color: var(--color-primary-400);
      `;
    case 'warning':
      return css`
        color: var(--color-warning-400);
      `;
    case 'success':
      return css`
        color: var(--color-success-400);
      `;
    case 'error':
      return css`
        color: var(--color-error-400);
      `;
    default:
      return css`
        color: var(--color-primary-400);
      `;
  }
};

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

const AlertContainer = styled.div<{ severity: AlertSeverity }>`
  padding: var(--space-3);
  border-radius: var(--radius-lg);
  border: 1px solid;
  margin-bottom: var(--space-8);
  opacity: 1 !important;
  ${props => getSeverityStyles(props.severity)}
`;

const AlertContent = styled.div`
  display: flex;
  gap: var(--space-3);
  position: relative;
  padding-left: calc(${ICON_SIZE + 'px'} + var(--space-2));
`;

const AlertIcon = styled.div<{ severity: AlertSeverity }>`
  position: absolute;
  top: 2px;
  left: 0;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  ${props => getSeverityColorStyles(props.severity)}
`;

const AlertBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  flex-grow: 1;
  gap: var(--space-1);
  min-width: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
`;

const AlertTitle = styled.h3<{ severity: AlertSeverity }>`
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-md);
  margin: 0;
  padding: 0;
  ${props => getSeverityColorStyles(props.severity)}

  &:only-child {
    margin-bottom: 0;
  }
`;

const AlertMessage = styled.div<{ severity: AlertSeverity }>`
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);

  /* Style mark elements based on severity */
  mark {
    padding: var(--space-1);
    border-radius: var(--radius-sm);
    font-weight: var(--font-weight-medium);
    ${props => {
      switch (props.severity) {
        case 'info':
          return css`
            background-color: rgba(59, 130, 246, 0.2);
            color: var(--color-primary-300);
          `;
        case 'warning':
          return css`
            background-color: rgba(245, 158, 11, 0.2);
            color: var(--color-warning-300);
          `;
        case 'success':
          return css`
            background-color: rgba(34, 197, 94, 0.2);
            color: var(--color-success-300);
          `;
        case 'error':
          return css`
            background-color: rgba(239, 68, 68, 0.2);
            color: var(--color-error-300);
          `;
        default:
          return css`
            background-color: rgba(59, 130, 246, 0.2);
            color: var(--color-primary-300);
          `;
      }
    }}
  }

  /* Style code elements based on severity */
  code {
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-sm);
    font-family: var(--font-family-monospace, 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    ${props => {
      switch (props.severity) {
        case 'info':
          return css`
            background-color: rgba(59, 130, 246, 0.2);
            color: var(--color-primary-300);
          `;
        case 'warning':
          return css`
            background-color: rgba(245, 158, 11, 0.2);
            color: var(--color-warning-300);
          `;
        case 'success':
          return css`
            background-color: rgba(34, 197, 94, 0.2);
            color: var(--color-success-300);
          `;
        case 'error':
          return css`
            background-color: rgba(239, 68, 68, 0.2);
            color: var(--color-error-300);
          `;
        default:
          return css`
            background-color: rgba(59, 130, 246, 0.2);
            color: var(--color-primary-300);
          `;
      }
    }}
  }
`;

export function Alert({ children, severity = 'info', title, className, onClick, ref }: AlertProps) {
  return (
    <AlertContainer severity={severity} className={className} onClick={onClick} ref={ref}>
      <AlertContent>
        <AlertIcon severity={severity}>{getSeverityIcon(severity)}</AlertIcon>
        <AlertBody>
          {title && <AlertTitle severity={severity}>{title}</AlertTitle>}
          {children && <AlertMessage severity={severity}>{children}</AlertMessage>}
        </AlertBody>
      </AlertContent>
    </AlertContainer>
  );
}

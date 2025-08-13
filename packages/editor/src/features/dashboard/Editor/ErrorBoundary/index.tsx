import { type ReactNode } from 'react';
import { Alert } from '@components/Alert';
import { ErrorBoundary, ErrorBoundaryProps } from 'react-error-boundary';
import { PrimaryButton } from '@components/Button/Primary';

interface Fallback {
  prefix: string;
  ref?: ((element: Element | null) => void) | null;
}

export const fallback = ({ prefix, ref }: Fallback): ErrorBoundaryProps => ({
  fallbackRender({ error, resetErrorBoundary }) {
    return (
      <Alert ref={ref} className={`error-boundary-alert`} title={prefix} severity='error' onClick={() => resetErrorBoundary()}>
        {error.message ? error.message : 'An error occurred while rendering this component'}
        <div style={{ marginTop: '0.5rem' }}>
          <PrimaryButton
            aria-label='Retry render'
            variant='error'
            size='sm'
            onClick={e => {
              e.stopPropagation();
              resetErrorBoundary();
            }}
          >
            Retry
          </PrimaryButton>
        </div>
      </Alert>
    );
  },
});

type ComponentRenderErrorBoundaryProps = {
  children: ReactNode;
  ref?: ((element: Element | null) => void) | null;
} & Fallback;

export function ComponentRenderErrorBoundary({ children, prefix, ref }: ComponentRenderErrorBoundaryProps) {
  return (
    <ErrorBoundary
      {...fallback({ prefix, ref })}
      onError={(error, errorInfo) => {
        console.error('HAKIT: Error rendering component:', prefix, error, errorInfo);
        // Log detailed error information for developers (only in development)
        if (process.env.NODE_ENV === 'development') {
          console.group(`🚨 HAKIT Component Error: ${prefix}`);
          console.error('Error:', error);
          console.error('Component Stack:', errorInfo.componentStack);
          console.error('Error Stack:', error.stack);
          console.groupEnd();
        } else {
          // Simplified logging for production
          console.error(`HAKIT: ${prefix} component failed to render:`, error.message);
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

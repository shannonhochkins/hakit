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
        {error.message ? error.message : 'An error occurred while rendering this dashboard.'}
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

type RenderErrorBoundaryProps = {
  children: ReactNode;
  ref?: ((element: Element | null) => void) | null;
} & Fallback;

export function RenderErrorBoundary({ children, prefix, ref }: RenderErrorBoundaryProps) {
  return (
    <ErrorBoundary
      {...fallback({ prefix, ref })}
      onError={(error, errorInfo) => {
        console.error('HAKIT: Error rendering:', prefix, error, errorInfo);
        // Log detailed error information for developers (only in development)
        if (process.env.NODE_ENV === 'development') {
          console.group(`🚨 HAKIT Error: ${prefix}`);
          console.error('Error:', error);
          console.error('Component Stack:', errorInfo.componentStack);
          console.error('Error Stack:', error.stack);
          console.groupEnd();
        } else {
          // Simplified logging for production
          console.error(`HAKIT: "${prefix}" failed to render:`, error.message);
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

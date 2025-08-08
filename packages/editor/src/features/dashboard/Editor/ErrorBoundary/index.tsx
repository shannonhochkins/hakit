import { type ReactNode } from 'react';
import { Alert } from '@components/Alert';
import { ErrorBoundary, ErrorBoundaryProps } from 'react-error-boundary';
import { useGlobalStore } from '@hooks/useGlobalStore';

interface Fallback {
  prefix: string;
  ref?: ((element: Element | null) => void) | null;
}

export const fallback = ({ prefix, ref }: Fallback): ErrorBoundaryProps => ({
  fallbackRender({ error, resetErrorBoundary }) {
    return (
      <Alert ref={ref} className={`error-boundary-alert`} title={prefix} severity='error' onClick={() => resetErrorBoundary()}>
        {error.message ? error.message : 'An error occurred while rendering this component'}
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
        useGlobalStore.getState().setComponentError({
          title: prefix,
          message: error.message ? error.message : 'An error occurred while rendering this component',
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

import type { DefaultComponentProps } from '@measured/puck';
import type { CustomComponentConfig } from '@typings/puck';
import { Component, type ReactNode } from 'react';
import { Alert } from '@components/Alert';

export class ComponentRenderErrorBoundary<P extends DefaultComponentProps> extends Component<
  {
    children: ReactNode;
    componentConfig?: CustomComponentConfig<P>;
    dragRef?: ((element: Element | null) => void) | null;
  },
  { hasError: boolean; error?: Error }
> {
  constructor(props: {
    children: ReactNode;
    componentConfig?: CustomComponentConfig<P>;
    dragRef?: ((element: Element | null) => void) | null;
  }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('HAKIT: Component render error:', error, errorInfo);
    console.error('HAKIT: Component type:', this.props.componentConfig?.label);
  }

  componentDidUpdate(prevProps: { children: ReactNode; componentConfig?: CustomComponentConfig<P> }) {
    // Reset error state if the component type changes (new component being rendered)
    if (prevProps.componentConfig?.label !== this.props.componentConfig?.label && this.state.hasError) {
      this.setState({ hasError: false, error: undefined });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div ref={this.props.dragRef} style={{ position: 'relative', width: '100%' }}>
          <Alert
            title={`Component Render Error${this.props.componentConfig?.label ? ` (${this.props.componentConfig?.label})` : ''}`}
            severity='error'
          >
            <p style={{ margin: '0 0 var(--space-2) 0' }}>
              {this.state.error?.message || 'An error occurred while rendering this component'}
            </p>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

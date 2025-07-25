import { AvailableQueries } from '@hakit/components';
import { getDefaultPropsFromFields } from '@helpers/editor/pageData/getDefaultPropsFromFields';
import { transformFields } from '@helpers/editor/pageData/transformFields';
import { useActiveBreakpoint } from '@hooks/useActiveBreakpoint';
import { useGlobalStore } from '@hooks/useGlobalStore';
import { usePuckIframeElements } from '@hooks/usePuckIframeElements';
import { ComponentConfig, CustomField, DefaultComponentProps, Fields } from '@measured/puck';
import { AdditionalRenderProps, ComponentFactoryData, CustomComponentConfig, InternalFields } from '@typings/puck';
import { useEffect, Component, ReactNode } from 'react';
import { Alert } from '@components/Alert';

// Error boundary component to catch rendering errors
class ComponentRenderErrorBoundary<P extends DefaultComponentProps> extends Component<
  { children: ReactNode; componentConfig?: CustomComponentConfig<P>; dragRef?: ((element: Element | null) => void) | null },
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

/**
 * Takes an existing CustomComponentConfig and returns a new config
 * whose render method is wrapped so we can pass `activeBreakpoint`.
 */
export function createComponent<P extends DefaultComponentProps>(
  config: CustomComponentConfig<P>
): (data: ComponentFactoryData) => Promise<ComponentConfig<P>> {
  return async function (data: ComponentFactoryData) {
    const fields = config.fields;
    const entities = data.getAllEntities();
    const services = await data.getAllServices();
    // get all the default prop values from the field definition
    const defaultProps = await getDefaultPropsFromFields(fields, {
      entities,
      services,
    });
    // convert the input field structure to custom field definitions
    const transformedFields = transformFields(fields);
    // include a local breakpoint field that we can use automatically to determine the current breakpoint
    const breakpointField: CustomField<InternalFields['breakpoint']> = {
      type: 'custom',
      render({ onChange }) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const breakpoint = useActiveBreakpoint();
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          onChange(breakpoint);
        }, [onChange, breakpoint]);
        return <input name='_activeBreakpoint' type='hidden' value={breakpoint} />;
      },
    };
    // attach internal breakpoint field
    // @ts-expect-error - we know it doesn't exist, we're adding it intentionally
    transformedFields._activeBreakpoint = breakpointField;

    return {
      ...config,
      // replace the default props
      defaultProps,
      render(props) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const editorElements = usePuckIframeElements();

        // eslint-disable-next-line react-hooks/rules-of-hooks
        const dashboard = useGlobalStore(state => state.dashboardWithoutData);
        // Extract the correct type for renderProps from the config's render function
        const renderProps: AdditionalRenderProps = {
          _activeBreakpoint: props._activeBreakpoint as keyof AvailableQueries,
          _editor: editorElements,
          _dashboard: dashboard,
        };

        // Wrap the config.render call in an error boundary to catch rendering errors
        return (
          <ComponentRenderErrorBoundary<P> componentConfig={config} dragRef={props.puck.dragRef}>
            {config.render({
              ...props,
              ...renderProps,
            } as Parameters<typeof config.render>[0])}
          </ComponentRenderErrorBoundary>
        );
      },
      // This is just to make puck happy on the consumer side, Fields aren't actually the correct type here
      fields: Object.keys(fields).length === 0 ? ({} as Fields<P>) : (transformedFields as Fields<P>),
    } as ComponentConfig<P>;
  };
}

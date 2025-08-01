import { AvailableQueries } from '@hakit/components';
import { getDefaultPropsFromFields } from '@helpers/editor/pageData/getDefaultPropsFromFields';
import { transformFields } from '@helpers/editor/pageData/transformFields';
import { useActiveBreakpoint } from '@hooks/useActiveBreakpoint';
import { useGlobalStore } from '@hooks/useGlobalStore';
import { usePuckIframeElements } from '@hooks/usePuckIframeElements';
import { ComponentConfig, CustomField, DefaultComponentProps, Fields } from '@measured/puck';
import { AdditionalRenderProps, ComponentFactoryData, CustomComponentConfig, InternalFields } from '@typings/puck';
import { useEffect, useMemo } from 'react';
import { attachDragRefToElement } from './attachDragRefToElement';
import { useEmotionCss, type StyleStrings } from './generateEmotionCss';
import { FieldConfiguration } from '@typings/fields';
import { ComponentRenderErrorBoundary } from '@features/dashboard/Editor/ErrorBoundary';

/**
 * Takes an existing CustomComponentConfig and returns a new config
 * whose render method is wrapped so we can pass `activeBreakpoint`.
 */
export function createComponent<
  P extends DefaultComponentProps & {
    _styleOverrides?: {
      style: string;
    };
  },
>(config: CustomComponentConfig<P>): (data: ComponentFactoryData) => Promise<ComponentConfig<P>> {
  return async function (data: ComponentFactoryData) {
    const fields = config.fields;
    const entities = data.getAllEntities();
    const services = await data.getAllServices();

    // get all the default prop values from the field definition
    const defaultProps = await getDefaultPropsFromFields(fields, {
      entities,
      services,
    });
    const isRootComponent = config.label === 'Root';
    const styleField: FieldConfiguration<{
      _styleOverrides: {
        style: string;
      };
    }> = {
      _styleOverrides: {
        type: 'object',
        label: isRootComponent ? 'Global styles' : 'Style Overrides',
        collapseOptions: {
          startExpanded: false,
        },
        description: isRootComponent
          ? 'Provide global CSS styles for the entire dashboard'
          : 'Provide css updates to override the default styles of this component',
        objectFields: {
          style: {
            type: 'code',
            language: 'css',
            label: 'CSS Styles',
            description: isRootComponent
              ? 'Provide global CSS styles for the entire dashboard'
              : 'Provide css updates to override the default styles of this component',
            default: '',
          },
        },
      },
    };
    const actualField = styleField._styleOverrides;
    // @ts-expect-error - we know it doesn't exist, we're adding it intentionally
    fields._styleOverrides = actualField;
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
      // All components are inline by default for automatic dragRef attachment
      inline: true,
      render({ _styleOverrides, ...props }) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const editorElements = usePuckIframeElements();

        // eslint-disable-next-line react-hooks/rules-of-hooks
        const dashboard = useGlobalStore(state => state.dashboardWithoutData);
        // Extract the correct type for renderProps from the config's render function
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const fullProps = useMemo(() => {
          const renderProps: AdditionalRenderProps = {
            _activeBreakpoint: props._activeBreakpoint as keyof AvailableQueries,
            _editor: editorElements,
            _dashboard: dashboard,
          };

          return {
            ...props,
            ...renderProps,
          } as Parameters<typeof config.render>[0];
        }, [props, editorElements, dashboard]);

        // Generate style strings for emotion CSS processing in iframe context
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const styleStrings = useMemo(() => {
          try {
            const componentStyles = config.styles ? config.styles(fullProps) : '';
            const overrideStyles = _styleOverrides?.style ?? '';
            return {
              componentStyles,
              overrideStyles,
            } satisfies StyleStrings;
          } catch (error) {
            console.error('HAKIT: Error generating styles for component:', config.label, error);
            return {
              componentStyles: '',
              overrideStyles: '',
            } satisfies StyleStrings;
          }
        }, [fullProps, _styleOverrides]);

        // Generate emotion CSS in iframe context where correct cache is active
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const emotionCss = useEmotionCss(styleStrings);

        // Wrap the config.render call in an error boundary to catch rendering errors
        return (
          <ComponentRenderErrorBoundary<P> componentConfig={config} dragRef={props?.puck?.dragRef}>
            {(() => {
              const renderedElement = config.render(fullProps);
              // Automatically attach dragRef to the top-level element with emotion CSS
              return attachDragRefToElement(renderedElement, props.puck.dragRef, config.label, emotionCss);
            })()}
          </ComponentRenderErrorBoundary>
        );
      },
      // This is just to make puck happy on the consumer side, Fields aren't actually the correct type here
      fields: Object.keys(fields).length === 0 ? ({} as Fields<P>) : (transformedFields as Fields<P>),
    } as ComponentConfig<P>;
  };
}

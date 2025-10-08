import { getDefaultPropsFromFields } from '@helpers/editor/pageData/getDefaultPropsFromFields';
import { useGlobalStore } from '@hooks/useGlobalStore';
import { usePuckIframeElements } from '@hooks/usePuckIframeElements';
import {
  AdditionalRenderProps,
  ComponentFactoryData,
  CustomComponentConfig,
  // CustomComponentConfigWithDefinition,
  RenderProps,
} from '@typings/puck';
import { useMemo } from 'react';
import { attachDragRefToElement } from './attachDragRefToElement';
import { useEmotionCss, type StyleStrings } from './generateEmotionCss';
import { FieldConfiguration, InternalComponentFields } from '@typings/fields';
import { RenderErrorBoundary } from '@features/dashboard/Editor/RenderErrorBoundary';
import { internalComponentFields, internalRootComponentFields } from '@features/dashboard/Editor/internalFields';
import { dbValueToPuck } from '@helpers/editor/pageData/dbValueToPuck';

/**
 * Takes an existing CustomComponentConfig and returns a new config
 * whose render method is wrapped so we can pass `activeBreakpoint`.
 */

type CustomComponentConfigurationWithDefinitionAndPuck<P extends object> = CustomComponentConfig<P> & {
  defaultProps: P;
  inline: boolean;
};

export function createComponent<P extends object>(
  config: CustomComponentConfig<P>,
  isRootComponent = false
  // intentionally only resolving component fields instead of root fields here as this createComponent is used as a starting factory, and then updated
  // later for root components with createRootComponent
): (data: ComponentFactoryData) => Promise<CustomComponentConfigurationWithDefinitionAndPuck<P & InternalComponentFields>> {
  return async function (data: ComponentFactoryData) {
    // Merge the field configurations - type assertion is necessary due to mapped type limitations
    const fields = isRootComponent
      ? ({
          ...config.fields,
          ...internalRootComponentFields,
        } as FieldConfiguration<P & InternalComponentFields>)
      : ({
          ...config.fields,
          ...internalComponentFields,
        } as FieldConfiguration<P & InternalComponentFields>);
    const entities = data.getAllEntities();
    const services = await data.getAllServices();

    // get all the default prop values from the field definition
    const defaultProps = await getDefaultPropsFromFields(fields, {
      entities,
      services,
    });

    // this is the config that will be used for puck
    return {
      ...config,
      // replace the default props
      defaultProps,
      // All components are inline by default for automatic dragRef attachment
      inline: true,
      // this render function is ONLY used for components, rootComponents redefine the render function
      // which is why here we only provide InternalComponentFields
      render(renderProps: RenderProps<P & InternalComponentFields>) {
        return (
          <RenderErrorBoundary prefix={config.label} ref={renderProps?.puck?.dragRef}>
            <Render {...renderProps} internalComponentConfig={config} />
          </RenderErrorBoundary>
        );
      },
      // This is just to make puck happy on the consumer side, Fields aren't actually the correct type here
      fields,
    };
  };
}

function Render<P extends object>(
  originalProps: RenderProps<P & InternalComponentFields> & {
    internalComponentConfig: CustomComponentConfig<P>;
  }
) {
  const activeBreakpoint = useGlobalStore(state => state.activeBreakpoint);

  // now, as the data has all the breakpoint data, we need to convert it to the active breakpoint
  // this will flatten the breakpoint data to only contain the active breakpoint data
  const renderProps = useMemo(() => {
    return dbValueToPuck(originalProps, activeBreakpoint ?? 'xlg') as typeof originalProps;
  }, [originalProps, activeBreakpoint]);

  const { styles, editMode = false, puck, id, internalComponentConfig: config, ...props } = renderProps;
  const editorElements = usePuckIframeElements();
  const dashboard = useGlobalStore(state => state.dashboardWithoutData);
  // Extract the correct type for renderProps from the config's render function
  // eslint-disable-next-ine react-hooks/rules-of-hooks
  const fullProps = useMemo(() => {
    const renderProps: AdditionalRenderProps = {
      _id: id,
      _editMode: editMode ?? puck.isEditing, // Ensure editMode is always defined
      _editor: editorElements,
      _dashboard: dashboard,
    };

    const obj = {
      ...props,
      ...renderProps,
    } as P & InternalComponentFields & AdditionalRenderProps;
    return obj;
  }, [props, id, puck, editMode, editorElements, dashboard]);

  // Generate style strings for emotion CSS processing in iframe context
  const styleStrings = useMemo(() => {
    try {
      const componentStyles = config.styles ? config.styles(fullProps) : '';
      const overrideStyles = styles?.css ?? '';
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
  }, [fullProps, styles, config]);

  // Generate emotion CSS in iframe context where correct cache is active
  const emotionCss = useEmotionCss(styleStrings);

  // Generate the rendered element outside the error boundary to ensure proper error catching
  const renderedElement = useMemo(() => {
    try {
      // @ts-expect-error - Puck's complex WithDeepSlots type is difficult to satisfy with generics
      return config.render(fullProps);
    } catch (error) {
      console.error('HAKIT: Error in config.render for component:', config.label, error);
      throw error; // Re-throw to be caught by error boundary
    }
  }, [fullProps, config]);

  // Wrap the rendered element with error boundary to catch rendering errors
  return attachDragRefToElement(renderedElement, puck?.dragRef, config.label, emotionCss);
}

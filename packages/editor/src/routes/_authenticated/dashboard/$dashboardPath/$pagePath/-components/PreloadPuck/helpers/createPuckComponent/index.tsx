import { AvailableQueries } from '@hakit/components';
import { getDefaultPropsFromFields } from '@client/src/routes/_authenticated/dashboard/$dashboardPath/$pagePath/-components/PreloadPuck/helpers/pageData/getDefaultPropsFromFields';
import { transformFields } from '@client/src/routes/_authenticated/dashboard/$dashboardPath/$pagePath/-components/PreloadPuck/helpers/pageData/transformFields';
import { useActiveBreakpoint } from '@lib/hooks/useActiveBreakpoint';
import { useGlobalStore } from '@lib/hooks/useGlobalStore';
import { usePuckIframeElements } from '@lib/hooks/usePuckIframeElements';
import { ComponentConfig, CustomField, DefaultComponentProps, Fields } from '@measured/puck';
import { AdditionalRenderProps, ComponentFactoryData, CustomComponentConfig, InternalFields } from '@typings/puck';
import { useEffect } from 'react';

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
        // we cast here intentionally to ensure that the renderProps match the expected type
        return config.render({
          ...props,
          ...renderProps,
        } as Parameters<typeof config.render>[0]);
      },
      // This is just to make puck happy on the consumer side, Fields aren't actually the correct type here
      fields: Object.keys(fields).length === 0 ? ({} as Fields<P>) : (transformedFields as Fields<P>),
    } as ComponentConfig<P>;
  };
}

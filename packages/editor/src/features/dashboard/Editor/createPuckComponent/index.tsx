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
import { useEffect, useMemo } from 'react';
import { attachPropsToElement } from './attachPropsToElement';
import { generateEmotionCss } from './generateEmotionCss';
import { FieldConfiguration, InternalComponentFields } from '@typings/fields';
import { RenderErrorBoundary } from '@features/dashboard/Editor/RenderErrorBoundary';
import { internalComponentFields, internalRootComponentFields } from '@features/dashboard/Editor/internalFields';
import { dbValueToPuck } from '@helpers/editor/pageData/dbValueToPuck';
import { useResolvedJinjaTemplate } from '@hooks/useResolvedJinjaTemplate';
import { usePressGestures } from '@hooks/usePressGestures';
import puckComponentStyles from './puckComponent.module.css';
import { router } from '../../../../router';
import { useStore, SnakeOrCamelDomains, computeDomain, DomainService } from '@hakit/core';
import { callService as _callService } from 'home-assistant-js-websocket';
import { toSnakeCase } from '@helpers/string/toSnakeCase';
import { usePopupStore } from '@hooks/usePopupStore';
import { css } from '@emotion/react';
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
      resolveData(data, changed) {
        // NOTE: We do NOT need to process templates at this level, as all components are added to the root content block
        // this means we resolve all tempaltes in the createRootComponent, and all props will be resolved to the child
        if (config.resolveData) {
          return config.resolveData(data, changed) as unknown as P & InternalComponentFields;
        }
        return data as unknown as P & InternalComponentFields;
      },
      // this render function is ONLY used for components, rootComponents redefine the render function
      // which is why here we only provide InternalComponentFields
      render(renderProps: RenderProps<P & InternalComponentFields>) {
        console.log('Rendering Inner');
        return (
          <RenderErrorBoundary prefix={config.label} ref={renderProps?.puck?.dragRef}>
            <TemplateSubscriber props={renderProps} internalComponentConfig={config} />
          </RenderErrorBoundary>
        );
      },
      // This is just to make puck happy on the consumer side, Fields aren't actually the correct type here
      fields,
    };
  };
}

function TemplateSubscriber<P extends object>({
  props,
  internalComponentConfig,
}: {
  props: RenderProps<P & InternalComponentFields>;
  internalComponentConfig: CustomComponentConfig<P>;
}) {
  const { data, loading, error } = useResolvedJinjaTemplate(props);
  if (error) {
    throw error;
  }
  // whilst loading, just return null to avoid having to "flicker" the content
  return <>{loading || !data ? null : <Render {...data} internalComponentConfig={internalComponentConfig} />}</>;
}

const callService = async ({
  domain,
  service,
  serviceData,
  target: _target,
}: {
  domain: SnakeOrCamelDomains;
  service: string;
  serviceData: object;
  target: string | string[] | { entity_id: string | string[] };
}): Promise<unknown> => {
  const { connection, ready } = useStore.getState();
  const target =
    typeof _target === 'string' || Array.isArray(_target)
      ? {
          entity_id: _target,
        }
      : _target;
  if (typeof service !== 'string') {
    throw new Error('service must be a string');
  }
  if (connection && ready) {
    try {
      await _callService(
        connection,
        toSnakeCase(domain),
        toSnakeCase(service),
        // purposely cast here as we know it's correct
        serviceData as object,
        target,
        false // don't return the response
      );
      // TODO - As this request can potentially fail silently, we might want to either
      // 1. Provide a "hey, we did what you asked for" notification
      // 2. Provide a "hey, we did what you asked for, but it failed" notification
      // Otherwise, return void
      return undefined;
    } catch (e) {
      // TODO - raise error to client here
      console.error('Error calling service:', e);
    }
  }
  return undefined;
};

async function processInteractions(interaction: InternalComponentFields['interactions'][keyof InternalComponentFields['interactions']]) {
  if (interaction.type === 'none') return undefined;
  if (interaction.type === 'popup') {
    usePopupStore.getState().openPopup(interaction.popupId);
    return;
  }
  if (interaction.type === 'external') {
    // we've received an external url action, we should trigger it
    // target can be "_blank" | "_self" | "_parent" | "_top"
    const target = interaction.target;
    const url = interaction.url;
    // now we need to handle the actions based on the provided information
    if (target === '_blank') {
      window.open(url, '_blank');
    } else if (target === '_self') {
      window.open(url, '_self');
    } else if (target === '_parent') {
      window.open(url, '_parent');
    } else if (target === '_top') {
      window.open(url, '_top');
    }
    return undefined;
  }
  if (interaction.type === 'navigate') {
    const dashboards = useGlobalStore.getState().dashboards;
    const dashboard = dashboards?.find(dashboard => dashboard.id === interaction.page.dashboardId);
    const page = dashboard?.pages.find(page => page.id === interaction.page.pageId);
    if (!page || !dashboard) {
      console.error('No page or dashboard found to navigate to, has this page been deleted?', interaction.page);
      return;
    }
    router.navigate({
      to: '/dashboard/$dashboardPath/$pagePath',
      reloadDocument: false,
      params: {
        dashboardPath: dashboard.path,
        pagePath: page.path,
      },
    });
    return;
  }
  if (interaction.type === 'callService') {
    const entities = useStore.getState().entities;
    const callServiceData = interaction.callService;
    const entity = callServiceData.entity;
    const service = callServiceData.service as unknown as DomainService<'light'>;
    if (!entity) {
      console.error('No entity found to control, has this entity been deleted?', callServiceData);
      return;
    }
    if (!entities[entity]) {
      console.error('No entity found to control, has this entity been deleted?', callServiceData);
      return;
    }
    if (!service) {
      console.error('No service found to call, has this service been deleted?', callServiceData);
      return;
    }
    const domain = computeDomain(entity) as SnakeOrCamelDomains;

    await callService({
      domain,
      service: service,
      serviceData: callServiceData.serviceData ?? {},
      target: {
        entity_id: entity,
      },
    });
    return;
  }
  return undefined;
}

function Render<P extends object>(
  originalProps: RenderProps<P & InternalComponentFields> & { internalComponentConfig: CustomComponentConfig<P> }
) {
  const activeBreakpoint = useGlobalStore(state => state.activeBreakpoint);
  const { interactions } = originalProps;
  const hasTap = interactions?.tap?.type !== 'none' && interactions?.tap;
  const hasDoubleTap = interactions?.doubleTap?.type !== 'none' && interactions?.doubleTap;
  const hasHold = interactions?.hold?.type !== 'none' && interactions?.hold;
  const { bindWithProps } = usePressGestures(
    {
      onTap: hasTap ? () => processInteractions(interactions?.tap) : undefined,
      onDoubleTap: hasDoubleTap ? () => processInteractions(interactions?.doubleTap) : undefined,
      onHold: hasHold ? () => processInteractions(interactions?.hold) : undefined,
    },
    {
      holdDelay: interactions?.hold?.holdDelay,
      doubleTapDelay: interactions?.doubleTap?.doubleTapDelay,
      disabled: originalProps.puck.isEditing,
    }
  );

  // now, as the data has all the breakpoint data, we need to convert it to the active breakpoint
  // this will flatten the breakpoint data to only contain the active breakpoint data
  const currentBreakpointProps = useMemo(() => {
    return dbValueToPuck(originalProps, activeBreakpoint ?? 'xlg') as typeof originalProps;
  }, [originalProps, activeBreakpoint]);

  const { editMode = false, puck, id, internalComponentConfig: config, ...props } = currentBreakpointProps;
  const editorElements = usePuckIframeElements();

  // Extract the correct type for renderProps from the config's render function
  // eslint-disable-next-ine react-hooks/rules-of-hooks
  const fullProps = useMemo(() => {
    const dashboard = useGlobalStore.getState().dashboardWithoutData;
    const renderProps: AdditionalRenderProps = {
      id,
      _editMode: editMode ?? puck.isEditing, // Ensure editMode is always defined
      _editor: editorElements,
      _dashboard: dashboard,
      _dragRef: puck.dragRef,
    };
    const obj = {
      ...props,
      ...renderProps,
    } as P & InternalComponentFields & AdditionalRenderProps;
    // Generate style strings for emotion CSS processing in iframe context
    const componentStyles = config.styles ? config.styles(obj) : '';
    const overrideStyles = props.styles?.css ?? '';

    // Generate emotion CSS in iframe context where correct cache is active
    const emotionCss = generateEmotionCss({
      componentStyles,
      overrideStyles,
    });
    if (emotionCss) {
      obj.css = emotionCss;
    }
    return obj;
  }, [props, id, puck, editMode, config, editorElements]);

  // @ts-expect-error - puck expects a very specific type, which we can not satisfy here
  const renderedElement = config.render(fullProps);

  // Wrap the rendered element with error boundary to catch rendering errors
  return attachPropsToElement({
    element: renderedElement,
    ref: puck.dragRef,
    componentLabel: config.label,
    updateProps: userProps => {
      return bindWithProps({
        ...userProps,
        ...(fullProps.css
          ? {
              css: css`
                ${fullProps.css}
              `,
            }
          : {}),
        className: [puckComponentStyles.pressable, userProps.className].filter(Boolean).join(' '),
      });
    },
  });
}

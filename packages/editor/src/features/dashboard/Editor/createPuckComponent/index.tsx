import { getDefaultPropsFromFields } from '@helpers/editor/pageData/getDefaultPropsFromFields';
import { useGlobalStore } from '@hooks/useGlobalStore';
import { usePuckIframeElements } from '@hooks/usePuckIframeElements';
import { AdditionalRenderProps, ComponentFactoryData, CustomComponentConfig, RenderProps } from '@typings/puck';
import { useMemo, memo } from 'react';
import { attachPropsToElement } from './helpers/attachPropsToElement';
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
import { processComponentStyles } from '@features/dashboard/Editor/createPuckComponent/helpers/processComponentStyles';
import isEqual from '@guanghechen/fast-deep-equal';
import { DeepPartial } from '@typings/utils';
import { processInternalFields } from './helpers/processInternalFields';
import { Typography } from '../Typography';
import { LiquidGlass } from '@components/LiquidGlass';
import { defaultStyles } from './helpers/generateEmotionCss';

/**
 * Takes an existing CustomComponentConfig and returns a new config
 * whose render method is wrapped so we can pass `activeBreakpoint`.
 */

type CustomComponentConfigurationWithDefinitionAndPuck<
  P extends object,
  ExtendedInternalFields extends object | undefined = undefined,
  IsRoot extends boolean | undefined = undefined,
> = CustomComponentConfig<P, ExtendedInternalFields, IsRoot> & {
  defaultProps: P;
  inline: boolean;
};

// Define explicit props type to help retain generics through memo
type CommonRenderProps<
  P extends object,
  ExtendedInternalFields extends object | undefined = undefined,
  IsRoot extends boolean | undefined = undefined,
> = {
  renderProps: Omit<RenderProps<P & DeepPartial<InternalComponentFields>>, 'puck'>;
  dragRef: ((element: Element | null) => void) | null;
  isEditing: boolean;
  internalComponentConfig: CustomComponentConfig<P, ExtendedInternalFields, IsRoot>;
};

function arePropsEqual<
  P extends object,
  ExtendedInternalFields extends object | undefined = undefined,
  IsRoot extends boolean | undefined = undefined,
>(prev: CommonRenderProps<P, ExtendedInternalFields, IsRoot>, next: CommonRenderProps<P, ExtendedInternalFields, IsRoot>) {
  // intentionally ignoring props.internalComponentConfig as it's static
  if (!isEqual(prev.renderProps, next.renderProps)) return false;
  if (prev.dragRef !== next.dragRef) return false;
  if (prev.isEditing !== next.isEditing) return false;
  // ignore everything else, let it render
  return true;
}

// Cast back to the original generic function type so <TemplateSubscriber<P>> works
// Provide a helper generic wrapper to preserve type inference with memo
type TemplateSubscriberComponent = <
  P extends object,
  ExtendedInternalFields extends object | undefined = undefined,
  IsRoot extends boolean | undefined = undefined,
>(
  props: CommonRenderProps<P, ExtendedInternalFields, IsRoot>
) => React.ReactElement | null;

function withGenericTemplateSubscriber(component: TemplateSubscriberComponent) {
  return memo(component, (prev, next) => {
    return arePropsEqual(prev, next);
  }) as TemplateSubscriberComponent;
}

const TemplateSubscriber = withGenericTemplateSubscriber(TemplateSubscriberInner);

export function createComponent<
  P extends object,
  ExtendedInternalFields extends object | undefined = undefined,
  IsRoot extends boolean | undefined = undefined,
>(
  config: CustomComponentConfig<P, ExtendedInternalFields, IsRoot>,
  isRootComponent = false
  // intentionally only resolving component fields instead of root fields here as this createComponent is used as a starting factory, and then updated
  // later for root components with createRootComponent
): (
  data: ComponentFactoryData
) => Promise<CustomComponentConfigurationWithDefinitionAndPuck<P & DeepPartial<InternalComponentFields>, ExtendedInternalFields, IsRoot>> {
  return async function (data: ComponentFactoryData) {
    // Get base internal fields
    const baseInternalFields = isRootComponent ? internalRootComponentFields : internalComponentFields;

    // Process internalFields configuration if provided
    // Merge the field configurations - type assertion is necessary due to mapped type limitations
    const fields = processInternalFields(
      {
        ...config.fields,
        ...baseInternalFields,
      } as FieldConfiguration<P & DeepPartial<InternalComponentFields>>,
      // @ts-expect-error - Complex type compatibility between InternalFieldsConfig variants, convered with tests
      config.internalFields
    ) as FieldConfiguration<P & DeepPartial<InternalComponentFields>>;

    const entities = data.getAllEntities();
    const services = await data.getAllServices();

    // get all the default prop values from the field definition
    const defaultProps = await getDefaultPropsFromFields(fields, {
      entities,
      services,
    });

    // this is the config that will be used for puck
    const result: CustomComponentConfigurationWithDefinitionAndPuck<
      P & DeepPartial<InternalComponentFields>,
      ExtendedInternalFields,
      IsRoot
    > = {
      ...config,
      // replace the default props
      defaultProps,
      // provide the updated fields
      // @ts-expect-error - Complex type compatibility between FieldConfiguration variants after refactoring
      fields,
      // All components are inline by default for automatic dragRef attachment
      inline: true,
      resolveData(data, changed) {
        // NOTE: We do NOT need to process templates at this level, as all components are added to the root content block
        // this means we resolve all tempaltes in the createRootComponent, and all props will be resolved to the child
        if (config.resolveData) {
          return config.resolveData(data, changed) as unknown as P & DeepPartial<InternalComponentFields>;
        }
        return data as unknown as P & DeepPartial<InternalComponentFields>;
      },
      // this render function is ONLY used for components, rootComponents redefine the render function
      // which is why here we only provide InternalComponentFields
      render({ puck, ...renderProps }: RenderProps<P & DeepPartial<InternalComponentFields>>) {
        const { dragRef, isEditing } = puck;

        return (
          <RenderErrorBoundary prefix={config.label} ref={dragRef}>
            <TemplateSubscriber
              renderProps={renderProps}
              internalComponentConfig={config as CustomComponentConfig<P, undefined, undefined>}
              dragRef={dragRef}
              isEditing={isEditing}
            />
          </RenderErrorBoundary>
        );
      },
    };
    return result;
  };
}

function TemplateSubscriberInner<
  P extends object,
  ExtendedInternalFields extends object | undefined = undefined,
  IsRoot extends boolean | undefined = undefined,
>({ renderProps, internalComponentConfig, dragRef, isEditing }: CommonRenderProps<P, ExtendedInternalFields, IsRoot>) {
  const { data, loading, error } = useResolvedJinjaTemplate(renderProps);
  if (error) {
    throw error;
  }
  if (loading || !data) return null;
  // Pass processed template data as props object, keep internal config separate
  return <Render renderProps={data} internalComponentConfig={internalComponentConfig} isEditing={isEditing} dragRef={dragRef} />;
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
      // maybe, this is an opt in setting
      return undefined;
    } catch (e) {
      // TODO - raise error to client here
      console.error('Error calling service:', e);
    }
  }
  return undefined;
};

async function processInteractions(interaction: InternalComponentFields['$interactions'][keyof InternalComponentFields['$interactions']]) {
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

function Render<
  P extends object,
  ExtendedInternalFields extends object | undefined = undefined,
  IsRoot extends boolean | undefined = undefined,
>({ renderProps, internalComponentConfig: config, dragRef, isEditing }: CommonRenderProps<P, ExtendedInternalFields, IsRoot>) {
  const activeBreakpoint = useGlobalStore(state => state.activeBreakpoint);

  // now, as the data has all the breakpoint data, we need to convert it to the active breakpoint
  // this will flatten the breakpoint data to only contain the active breakpoint data
  const currentBreakpointProps = useMemo(() => {
    return dbValueToPuck(renderProps, activeBreakpoint ?? 'xlg') as typeof renderProps;
  }, [renderProps, activeBreakpoint]);

  const { id, ...props } = currentBreakpointProps;

  // - Omit is handled in processInternalFields (fields are removed from config)
  // - Defaults are handled in processInternalFields (default values updated in field config)
  // - getDefaultPropsFromFields already uses the processed field configuration
  // So props already have the correct structure and defaults applied

  // Handle interactions (may be omitted)
  const interactions =
    // eslint-disable-next-line react/prop-types
    '$interactions' in props ? (props as { $interactions?: InternalComponentFields['$interactions'] }).$interactions : undefined;
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
      disabled: isEditing || (!hasTap && !hasDoubleTap && !hasHold),
    }
  );

  const editorElements = usePuckIframeElements();

  // Extract the correct type for renderProps from the config's render function
  // eslint-disable-next-ine react-hooks/rules-of-hooks
  const fullProps = useMemo(() => {
    const dashboard = useGlobalStore.getState().dashboardWithoutData;
    const renderProps: AdditionalRenderProps = {
      id,
      _editMode: isEditing, // Ensure editMode is always defined
      _editor: editorElements,
      _dashboard: dashboard,
      _dragRef: dragRef,
    };
    const obj = {
      ...props,
      ...renderProps,
    };

    // Get component-specific styles if provided
    // The styles function receives simplified types (UnitFieldValue -> string) to avoid union explosion
    // Cast obj to match the expected type signature of config.styles (via unknown to avoid type checking issues)
    const componentStyles = config.styles ? config.styles(obj as unknown as Parameters<typeof config.styles>[0]) : undefined;
    // eslint-disable-next-line react/prop-types -- $styles is a TypeScript-typed internal field
    const overrideStyles = typeof props.$styles?.css === 'string' ? props.$styles.css : undefined;

    // Process all styles using unified helper
    const styles = processComponentStyles({
      props: obj,
      type: 'component',
      componentStyles,
      overrideStyles,
    });

    if (styles) {
      // Attach serialized styles under a dedicated key
      // @ts-expect-error - styles is SerializedStyles which is compatible but TypeScript can't infer the complex union type
      obj.css = styles;
    }
    return obj;
  }, [props, id, dragRef, isEditing, config, editorElements]);

  // @ts-expect-error - puck expects a very specific type, which we can not satisfy here
  const renderedElement = config.render(fullProps);

  const isLiquidGlassBackground = fullProps.$appearance?.design?.backgroundType === 'liquid-glass';

  if (config.autoWrapComponent === false) {
    if (isLiquidGlassBackground) {
      const { glassDisplacementScale, glassSpecularOpacity, glassSpecularSaturation, glassBlur } = fullProps.$appearance?.design ?? {};
      return (
        <LiquidGlass
          filterId={`liquid-glass-${id}`}
          className='liquid-glass-wrapper auto-wrapped'
          ref={dragRef}
          displacementScale={glassDisplacementScale}
          specularOpacity={glassSpecularOpacity}
          specularSaturation={glassSpecularSaturation}
          blur={glassBlur}
          style={{
            ...defaultStyles,
          }}
        >
          {renderedElement}
        </LiquidGlass>
      );
    }
    return (
      <>
        <Typography typography={fullProps.$appearance?.typography} type='component' />
        {renderedElement}
      </>
    );
  }

  // Prepare LiquidGlass wrapper if needed
  let liquidGlassWrapper: React.ReactElement | undefined;
  if (isLiquidGlassBackground) {
    const { glassDisplacementScale, glassSpecularOpacity, glassSpecularSaturation, glassBlur } = fullProps.$appearance?.design ?? {};

    // Create LiquidGlass wrapper with base props
    // updateProps will merge user props, css, className, etc. onto this
    liquidGlassWrapper = (
      <LiquidGlass
        filterId={`liquid-glass-${id}`}
        className='liquid-glass-wrapper standard'
        displacementScale={glassDisplacementScale}
        specularOpacity={glassSpecularOpacity}
        specularSaturation={glassSpecularSaturation}
        blur={glassBlur}
        style={{
          ...defaultStyles,
        }}
      />
    );
  }

  const newElement = attachPropsToElement({
    element: renderedElement,
    ref: dragRef,
    componentLabel: config.label,
    wrapper: liquidGlassWrapper,
    updateProps: wrapperProps => {
      // updateProps receives the wrapper's props (LiquidGlass props in this case)
      // Merge css, className, and interactions onto the wrapper
      // wrapperProps already contains the LiquidGlass-specific props (glassBgColor, etc.)
      return bindWithProps({
        ...wrapperProps,
        ...(fullProps.css ? { css: fullProps.css } : {}),
        className: [wrapperProps.className, puckComponentStyles.pressable].filter(Boolean).join(' '),
      });
    },
  });

  return (
    <>
      <Typography typography={fullProps.$appearance?.typography} type='component' />
      {newElement}
    </>
  );
}

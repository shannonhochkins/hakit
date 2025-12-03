import type { AdditionalRenderProps, ComponentFactoryData, InternalRootData } from '@typings/puck';
import { Fragment, useMemo, memo } from 'react';
import type { CustomRootConfigWithRemote } from '@features/dashboard/PuckDynamicConfiguration';
import { createComponent } from '@features/dashboard/Editor/createPuckComponent';
import { defaultRootConfig, type InternalFieldsBackgroundProps } from '@features/dashboard/Editor/createRootComponent/defaultRoot';
import { type DefaultComponentProps } from '@measured/puck';
import { css, Global } from '@emotion/react';
import { type FieldConfiguration, InternalRootComponentFields } from '@typings/fields';
import { useGlobalStore } from '@hooks/useGlobalStore';
import { usePuckIframeElements } from '@hooks/usePuckIframeElements';
import { RenderErrorBoundary } from '@features/dashboard/Editor/RenderErrorBoundary';
import { getDefaultPropsFromFields } from '@helpers/editor/pageData/getDefaultPropsFromFields';
import { attachAddonReference } from '@helpers/editor/pageData/attachAddonReference';
import { dbValueToPuck } from '@helpers/editor/pageData/dbValueToPuck';
import { useResolvedJinjaTemplate } from '@hooks/useResolvedJinjaTemplate';
import isEqual from '@guanghechen/fast-deep-equal';
import { processComponentStyles } from '@features/dashboard/Editor/createPuckComponent/helpers/processComponentStyles';

// Define explicit props type to help retain generics through memo
// For root components, we use InternalRootComponentFields (no $interactions)
type RootRenderProps = Parameters<CustomRootConfigWithRemote<InternalRootData & InternalRootComponentFields, undefined>['render']>[0];

type CommonRenderProps<P extends DefaultComponentProps, ExtendedInternalFields extends object | undefined = undefined> = {
  renderProps: Omit<RootRenderProps, 'content' | 'popupContent' | 'puck'>;
  remoteKeys: Set<string>;
  isEditing: boolean;
  processedConfigs: CustomRootConfigWithRemote<P, ExtendedInternalFields>[];
};

function arePropsEqual<P extends DefaultComponentProps, ExtendedInternalFields extends object | undefined = undefined>(
  prev: CommonRenderProps<P, ExtendedInternalFields>,
  next: CommonRenderProps<P, ExtendedInternalFields>
) {
  // intentionally ignoring props.processedConfigs/props.remoteKeys as it's static
  if (!isEqual(prev.renderProps, next.renderProps)) return false;
  if (prev.isEditing !== next.isEditing) return false;
  // ignore everything else, let it render
  return true;
}

// Cast back to the original generic function type so <TemplateSubscriber<P, ExtendedInternalFields>> works
// Provide a helper generic wrapper to preserve type inference with memo
type TemplateSubscriberComponent = <P extends DefaultComponentProps, ExtendedInternalFields extends object | undefined = undefined>(
  props: CommonRenderProps<P, ExtendedInternalFields>
) => React.ReactElement | null;

function withGenericTemplateSubscriber(component: TemplateSubscriberComponent) {
  const equality = <P extends DefaultComponentProps, ExtendedInternalFields extends object | undefined = undefined>(
    prev: CommonRenderProps<P, ExtendedInternalFields>,
    next: CommonRenderProps<P, ExtendedInternalFields>
  ): boolean => arePropsEqual(prev, next);
  return memo(component, equality) as TemplateSubscriberComponent;
}

const TemplateSubscriber = withGenericTemplateSubscriber(TemplateSubscriberInner);

export async function createRootComponent<P extends DefaultComponentProps, ExtendedInternalFields extends object | undefined = undefined>(
  rootConfigs: CustomRootConfigWithRemote<P, ExtendedInternalFields>[],
  data: ComponentFactoryData
) {
  let mergedFields: Record<string, FieldConfiguration[string]> = {};
  const remoteKeys = new Set<string>();
  const processedConfigs: CustomRootConfigWithRemote<P, ExtendedInternalFields>[] = [];

  // casting here as types are correct on the defaultRootConfig value
  // we have our own root config which is available to all dashboards
  // we omit default props here as they're computed further down
  const defaultConfig: Omit<CustomRootConfigWithRemote<DefaultComponentProps, InternalFieldsBackgroundProps>, 'defaultProps'> = {
    ...defaultRootConfig,
    _remoteAddonId: '@hakit/default-root', // this is the default root config
    _remoteAddonName: '@hakit/editor', // this is the default root config
  };

  // Always include the default config first
  // the object above is typed, so okay to cast here as the rest of the values in this array are unknown values/types
  processedConfigs.push(defaultConfig as unknown as CustomRootConfigWithRemote<P, ExtendedInternalFields>);
  remoteKeys.add(defaultConfig._remoteAddonId);

  // Process provided root configs, ignoring duplicates
  rootConfigs.forEach(rootConfig => {
    if (!remoteKeys.has(rootConfig._remoteAddonId)) {
      processedConfigs.push(rootConfig);
      remoteKeys.add(rootConfig._remoteAddonId);
    } else {
      console.warn(`Duplicate root config addon ID detected: ${rootConfig._remoteAddonId}. Ignoring duplicate.`);
    }
  });

  processedConfigs.forEach(rootConfig => {
    // @ts-expect-error - This is fine, for root configs, spacing doesn't make sense
    rootConfig.internalFields = {
      ...rootConfig.internalFields,
      omit: {
        $appearance: {
          sizeAndSpacing: true,
        },
      },
    };
    if (rootConfig._remoteAddonId === '@hakit/default-root') {
      mergedFields = {
        ...mergedFields,
        ...rootConfig.fields,
      };
    } else {
      // scope external root configurations to avoid conflicts
      mergedFields[rootConfig._remoteAddonId] = {
        type: 'object',
        label: rootConfig._remoteAddonName || rootConfig.label,
        section: {
          expanded: false, // by default, we collapse all objects
        },
        // @ts-expect-error - impossible to type this correctly as it is a dynamic object
        objectFields: {
          ...attachAddonReference(rootConfig.fields, rootConfig._remoteAddonId),
        },
        addonId: rootConfig._remoteAddonId,
      };
    }
  });

  const baseConfig = processedConfigs[0];
  if (!baseConfig) {
    throw new Error('No root configurations provided');
  }

  /// now we have the merged structure, we can now create the dynamic configurations

  // Get default props from the merged fields
  const entities = data.getAllEntities();
  const services = await data.getAllServices();
  const defaultProps = await getDefaultPropsFromFields(mergedFields, {
    entities,
    services,
  });

  // create the puck definitions
  // For root components, IsRoot should be true, ExtendedInternalFields is undefined by default
  const componentFactory = await createComponent<P, undefined, true>(
    {
      // Merge other properties from base config (excluding render and fields)
      ...baseConfig,
      // Set the merged fields
      // @ts-expect-error - this will never match the root data as it's dynamically created above
      fields: mergedFields,
      defaultProps,
      // this is updated later with our custom render function
      render() {
        return <></>;
      },
    },
    true
  );
  // use our component factory to convert out component structure to a puck component
  const updatedRootConfig = await componentFactory(data);

  const finalRootConfig: CustomRootConfigWithRemote<InternalRootData & InternalRootComponentFields, undefined> = {
    ...updatedRootConfig,
    // @ts-expect-error - objects are typed above, they just can't be combined here
    fields: updatedRootConfig.fields,
    inline: true,
    // Create a render function that calls all root render functions
    // The render function signature matches what CustomRootConfigWithRemote expects (IsRoot = true, so InternalRootComponentFields)
    render(props: Parameters<CustomRootConfigWithRemote<InternalRootData & InternalRootComponentFields, undefined>['render']>[0]) {
      const {
        content: Content,
        popupContent: PopupContent,
        puck,
        // @ts-expect-error - does exist, just not in the types internally, this is a puck value we intentionally don't render as we have custom slots for the root zone
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        children: _children,
        ...renderProps
      } = props;
      return (
        <RenderErrorBoundary prefix='Root'>
          <TemplateSubscriber
            renderProps={renderProps}
            remoteKeys={remoteKeys}
            processedConfigs={processedConfigs}
            isEditing={puck.isEditing}
          />
          {/* the root dropzone */}
          <Content className='Root-content' />
          {/* slot that houses all popup portals, intentionally hiding this zone so users can't drag into it */}
          <PopupContent style={{ display: 'none' }} />
        </RenderErrorBoundary>
      );
    },
  };
  // @ts-expect-error - side effect of dodgeyness, but it does exist so we should remove it
  delete finalRootConfig._remoteAddonId; // Remove renderProps as it's not needed in the final config
  return finalRootConfig;
}

function TemplateSubscriberInner<P extends DefaultComponentProps, ExtendedInternalFields extends object | undefined = undefined>({
  renderProps,
  remoteKeys,
  processedConfigs,
  isEditing,
}: CommonRenderProps<P, ExtendedInternalFields>) {
  const { data, loading, error } = useResolvedJinjaTemplate(renderProps);
  if (error) {
    throw error;
  }
  return (
    <>
      {loading || !data ? null : (
        <Render renderProps={data} remoteKeys={remoteKeys} processedConfigs={processedConfigs} isEditing={isEditing} />
      )}
    </>
  );
}

function getPropsForRoot<P extends DefaultComponentProps, ExtendedInternalFields extends object | undefined = undefined>(
  rootConfig: CustomRootConfigWithRemote<P, ExtendedInternalFields>,
  props: Record<string, unknown>,
  additionalProps: Omit<AdditionalRenderProps, '_dragRef'>,
  remoteKeys: Set<string>
) {
  // Create a new props object without any remote keys
  // trim off any remote objects that do not match the current rootConfig
  const baseProps = Object.fromEntries(Object.entries(props).filter(([key]) => !remoteKeys.has(key)));
  // Get the current remote's props and spread them at the top level
  const currentRemoteProps = props[rootConfig._remoteAddonId] || {};
  // Combine base props with current remote's props and style overrides
  const propsForThisRoot = {
    ...baseProps, // Override with filtered base props (without other remotes)
    ...(typeof currentRemoteProps === 'object' && currentRemoteProps !== null ? currentRemoteProps : {}),
    ...additionalProps,
  };

  return propsForThisRoot;
}

function Render<P extends DefaultComponentProps, ExtendedInternalFields extends object | undefined = undefined>({
  renderProps,
  processedConfigs,
  remoteKeys,
  isEditing,
}: CommonRenderProps<P, ExtendedInternalFields> & {
  processedConfigs: CustomRootConfigWithRemote<P, ExtendedInternalFields>[];
  remoteKeys: Set<string>;
}) {
  const activeBreakpoint = useGlobalStore(state => state.activeBreakpoint);
  // now, as the data has all the breakpoint data, we need to convert it to the active breakpoint
  // this will flatten the breakpoint data to only contain the active breakpoint data
  const currentBreakpointProps = useMemo(() => {
    return dbValueToPuck(renderProps, activeBreakpoint ?? 'xlg') as typeof renderProps;
  }, [renderProps, activeBreakpoint]);

  const editorElements = usePuckIframeElements();
  const processedProps = currentBreakpointProps;
  const { id, $styles } = processedProps;

  const dashboard = useGlobalStore(state => state.dashboardWithoutData);

  // gather all root config styles to apply globally
  const allCustomStyles = processedConfigs.map(rootConfig => {
    const additionalProps: Omit<AdditionalRenderProps, '_dragRef'> = {
      id,
      _editMode: isEditing,
      _editor: editorElements,
      _dashboard: dashboard,
    };
    const propsForThisRoot = getPropsForRoot(rootConfig, processedProps, additionalProps, remoteKeys);

    // Get component-specific styles if provided
    const componentStyles = rootConfig.styles
      ? // @ts-expect-error - this is fine, internal styles can't consume the `P` generic at this level
        rootConfig.styles(propsForThisRoot)
      : undefined;

    // Process all styles using unified helper
    const styles = processComponentStyles({
      props: propsForThisRoot,
      type: 'root',
      componentStyles: componentStyles,
    });

    return styles || '';
  });

  const propsForRootMap = useMemo(() => {
    const map = new Map<string, Record<string, unknown>>();
    for (const rootConfig of processedConfigs) {
      const additionalProps: Omit<AdditionalRenderProps, '_dragRef'> = {
        id,
        _editMode: isEditing,
        _editor: editorElements,
        _dashboard: dashboard,
      };
      const propsForThisRoot = getPropsForRoot(rootConfig, processedProps, additionalProps, remoteKeys);
      map.set(rootConfig._remoteAddonId, propsForThisRoot);
    }
    return map;
  }, [processedConfigs, id, isEditing, editorElements, dashboard, processedProps, remoteKeys]);

  return (
    <>
      {processedConfigs.map((rootConfig, index) => {
        if (rootConfig?.render) {
          const propsForThisRoot = propsForRootMap.get(rootConfig._remoteAddonId)!;
          return (
            <Fragment key={index}>{rootConfig.render(propsForThisRoot as Parameters<CustomRootConfigWithRemote<P>['render']>[0])}</Fragment>
          );
        }
        return null;
      })}

      <Global
        styles={css`
          /* Global styles for the dashboard */
          ${allCustomStyles ?? ''}
          /* Style overrides for the root component */
          ${$styles?.css ?? ''}
        `}
      />
    </>
  );
}

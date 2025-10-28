import type { AdditionalRenderProps, ComponentFactoryData, RenderProps, InternalRootData } from '@typings/puck';
import { Fragment, useMemo } from 'react';
import type { CustomRootConfigWithRemote } from '@features/dashboard/PuckDynamicConfiguration';
import { createComponent } from '@features/dashboard/Editor/createPuckComponent';
import { defaultRootConfig, type DefaultRootProps } from '@features/dashboard/Editor/createRootComponent/defaultRoot';
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

export async function createRootComponent<P extends DefaultComponentProps>(
  rootConfigs: CustomRootConfigWithRemote<P>[],
  data: ComponentFactoryData
) {
  const mergedFields: Record<string, FieldConfiguration[string]> = {};
  const remoteKeys = new Set<string>();
  const processedConfigs: CustomRootConfigWithRemote<P>[] = [];

  // casting here as types are correct on the defaultRootConfig value
  // we have our own root config which is available to all dashboards
  // we omit default props here as they're computed further down
  const defaultConfig: Omit<CustomRootConfigWithRemote<DefaultRootProps>, 'defaultProps'> = {
    ...defaultRootConfig,
    _remoteAddonId: '@hakit/default-root', // this is the default root config
    _remoteAddonName: '@hakit/editor', // this is the default root config
  };

  // Always include the default config first
  // the object above is typed, so okay to cast here as the rest of the values in this array are unknown values/types
  processedConfigs.push(defaultConfig as unknown as CustomRootConfigWithRemote<P>);
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
    mergedFields[rootConfig._remoteAddonId] = {
      type: 'object',
      label: rootConfig._remoteAddonName || rootConfig.label,
      collapseOptions: {
        startExpanded: true,
      },
      // @ts-expect-error - impossible to type this correctly as it is a dynamic object
      objectFields: {
        ...attachAddonReference(rootConfig.fields, rootConfig._remoteAddonId),
      },
      addonId: rootConfig._remoteAddonId,
    };
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
  const componentFactory = await createComponent<P>(
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

  console.log('defaultProps', JSON.stringify(updatedRootConfig.defaultProps, null, 2));

  const finalRootConfig: CustomRootConfigWithRemote<InternalRootData & InternalRootComponentFields> = {
    ...updatedRootConfig,
    // @ts-expect-error - objects are typed above, they just can't be combined here
    fields: updatedRootConfig.fields,
    inline: false,
    // Create a render function that calls all root render functions
    render(renderProps: RenderProps<InternalRootData & InternalRootComponentFields>) {
      return (
        <RenderErrorBoundary prefix='Root'>
          <TemplateSubscriber props={renderProps} remoteKeys={remoteKeys} processedConfigs={processedConfigs} />
        </RenderErrorBoundary>
      );
    },
  };
  // @ts-expect-error - side effect of dodgeyness, but it does exist so we should remove it
  delete finalRootConfig._remoteAddonId; // Remove renderProps as it's not needed in the final config
  return finalRootConfig;
}

function TemplateSubscriber<P extends DefaultComponentProps>({
  props,
  remoteKeys,
  processedConfigs,
}: {
  props: RenderProps<InternalRootData & InternalRootComponentFields>;
  remoteKeys: Set<string>;
  processedConfigs: CustomRootConfigWithRemote<P>[];
}) {
  const { data, loading, error } = useResolvedJinjaTemplate(props);
  if (error) {
    throw error;
  }
  return <>{loading || !data ? null : <Render {...data} remoteKeys={remoteKeys} processedConfigs={processedConfigs} />}</>;
}

function getPropsForRoot<P extends DefaultComponentProps>(
  rootConfig: CustomRootConfigWithRemote<P>,
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

function Render<P extends DefaultComponentProps>({
  puck,
  processedConfigs,
  remoteKeys,
  ...renderProps
}: RenderProps<InternalRootData & InternalRootComponentFields> & {
  processedConfigs: CustomRootConfigWithRemote<P>[];
  remoteKeys: Set<string>;
}) {
  const activeBreakpoint = useGlobalStore(state => state.activeBreakpoint);
  // now, as the data has all the breakpoint data, we need to convert it to the active breakpoint
  // this will flatten the breakpoint data to only contain the active breakpoint data
  const currentBreakpointProps = dbValueToPuck(renderProps, activeBreakpoint) as RenderProps<
    InternalRootData & InternalRootComponentFields
  >;
  const editorElements = usePuckIframeElements();
  const processedProps = currentBreakpointProps;
  const { id, styles, editMode = false, content: Content, popupContent: PopupContent } = processedProps;

  const dashboard = useGlobalStore(state => state.dashboardWithoutData);

  // gather all root config styles to apply globally
  const allCustomStyles = processedConfigs
    .map(rootConfig => {
      const additionalProps: Omit<AdditionalRenderProps, '_dragRef'> = {
        id,
        _editMode: editMode ?? puck.isEditing,
        _editor: editorElements,
        _dashboard: dashboard,
      };
      const propsForThisRoot = getPropsForRoot(rootConfig, processedProps, additionalProps, remoteKeys);
      if (rootConfig.styles) {
        // @ts-expect-error - this is fine, internal styles can't consume the `P` generic at this level
        return rootConfig.styles(propsForThisRoot);
      }
      return '';
    })
    .join('\n');

  const propsForRootMap = useMemo(() => {
    const map = new Map<string, Record<string, unknown>>();
    for (const rootConfig of processedConfigs) {
      const additionalProps: Omit<AdditionalRenderProps, '_dragRef'> = {
        id,
        _editMode: editMode ?? puck.isEditing,
        _editor: editorElements,
        _dashboard: dashboard,
      };
      const propsForThisRoot = getPropsForRoot(rootConfig, processedProps, additionalProps, remoteKeys);
      map.set(rootConfig._remoteAddonId, propsForThisRoot);
    }
    return map;
  }, [processedConfigs, id, editMode, puck.isEditing, editorElements, dashboard, processedProps, remoteKeys]);

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
      {/* the root dropzone */}
      <Content />
      {/* slot that houses all popup portals, intentionally hiding this zone so users can't drag into it */}
      <PopupContent style={{ display: 'none' }} />

      <Global
        styles={css`
          /* Global styles for the dashboard */
          ${allCustomStyles ?? ''}
          /* Style overrides for the root component */
          ${styles?.css ?? ''}
        `}
      />
    </>
  );
}

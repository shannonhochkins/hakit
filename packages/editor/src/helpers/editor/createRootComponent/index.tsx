import {
  AdditionalRenderProps,
  ComponentFactoryData,
  CustomComponentConfig,
  CustomRootConfig,
  IgnorePuckConfigurableOptions,
  RenderProps,
} from '@typings/puck';
import { CustomRootConfigWithRemote, RootData } from '../../../features/dashboard/PuckDynamicConfiguration';
import { createComponent } from '@helpers/editor/createPuckComponent';
import { defaultRootConfig } from '@helpers/editor/createRootComponent/defaultRoot';
import { DefaultComponentProps, WithChildren } from '@measured/puck';
import { Fragment } from 'react';
import { css, Global } from '@emotion/react';
import { FieldConfiguration } from '@typings/fields';
import { useGlobalStore } from '@hooks/useGlobalStore';
import { usePuckIframeElements } from '@hooks/usePuckIframeElements';
import { AvailableQueries } from '@hakit/components';
import { attachRepositoryReference } from '../pageData/transformFields';

export async function createRootComponent(rootConfigs: CustomRootConfigWithRemote[], data: ComponentFactoryData) {
  const mergedFields: FieldConfiguration<RootData> = {};
  const remoteKeys = new Set<string>();
  const processedConfigs: CustomRootConfigWithRemote[] = [];

  // casting here as types are correct on the defaultRootConfig value
  // we have our own root config which is available to all dashboards
  const defaultConfig: CustomRootConfigWithRemote<DefaultComponentProps> = {
    ...(defaultRootConfig as unknown as CustomComponentConfig<DefaultComponentProps>),
    _remoteRepositoryId: '@hakit/default-root', // this is the default root config
    _remoteRepositoryName: '@hakit/editor', // this is the default root config
  };

  // Always include the default config first
  processedConfigs.push(defaultConfig);
  remoteKeys.add(defaultConfig._remoteRepositoryId);

  // Process provided root configs, ignoring duplicates
  rootConfigs.forEach(rootConfig => {
    if (!remoteKeys.has(rootConfig._remoteRepositoryId)) {
      processedConfigs.push(rootConfig);
      remoteKeys.add(rootConfig._remoteRepositoryId);
    } else {
      console.warn(`Duplicate root config repository ID detected: ${rootConfig._remoteRepositoryId}. Ignoring duplicate.`);
    }
  });

  processedConfigs.forEach(rootConfig => {
    mergedFields[rootConfig._remoteRepositoryId] = {
      type: 'object',
      label: rootConfig._remoteRepositoryName || rootConfig.label,
      collapseOptions: {
        startExpanded: true,
      },
      objectFields: {
        ...attachRepositoryReference(rootConfig.fields, false, rootConfig._remoteRepositoryId),
      },
      // @ts-expect-error - this is intentionally not typed as we don't want to expose it
      repositoryId: rootConfig._remoteRepositoryId,
    };
  });

  const baseConfig = processedConfigs[0];
  if (!baseConfig) {
    throw new Error('No root configurations provided');
  }

  /// now we have the merged structure, we can now create the dynamic configurations

  const mergedRoot: CustomComponentConfig = {
    // Merge other properties from base config (excluding render and fields)
    ...baseConfig,
    // Set the merged fields
    fields: mergedFields,
    // @ts-expect-error - intentionally empty, we're going to be updating this later with the component factory
    defaultProps: {},
    render() {
      return <></>;
    },
  };

  // create the puck definitions
  const componentFactory = await createComponent(mergedRoot);
  // use our component factory to convert out component structure to a puck component
  const updatedRootConfig = await componentFactory(data);

  function getPropsForRoot(rootConfig: CustomRootConfigWithRemote, props: Record<string, unknown>, additionalProps: AdditionalRenderProps) {
    // Create a new props object without any remote keys
    // trim off any remote objects that do not match the current rootConfig
    const baseProps = Object.fromEntries(Object.entries(props).filter(([key]) => !remoteKeys.has(key)));
    // Get the current remote's props and spread them at the top level
    const currentRemoteProps = props[rootConfig._remoteRepositoryId] || {};
    // Combine base props with current remote's props and style overrides
    const propsForThisRoot = {
      // ...props, // Start with all original props to ensure required props are present
      ...baseProps, // Override with filtered base props (without other remotes)
      ...(typeof currentRemoteProps === 'object' && currentRemoteProps !== null ? currentRemoteProps : {}),
      ...additionalProps,
    };
    return propsForThisRoot as RenderProps<WithChildren<RootData>>;
  }
  const finalRootConfig: Omit<CustomRootConfig<RootData>, IgnorePuckConfigurableOptions> = {
    ...updatedRootConfig,
    fields: {
      ...updatedRootConfig.fields,
      content: {
        type: 'slot',
      },
    },
    // Create a render function that calls all root render functions
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    render({ _styleOverrides, content: Content, puck, editMode = false, id, children, ...props }) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const editorElements = usePuckIframeElements();
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const dashboard = useGlobalStore(state => state.dashboardWithoutData);
      // TODO - Test this with a remote config to ensure it's receiveing everything
      const allCustomStyles = processedConfigs
        .map(rootConfig => {
          const additionalProps: AdditionalRenderProps = {
            _id: id,
            _editMode: editMode ?? puck.isEditing,
            _activeBreakpoint: props._activeBreakpoint as keyof AvailableQueries,
            _editor: editorElements,
            _dashboard: dashboard,
          };
          const propsForThisRoot = getPropsForRoot(rootConfig, props, additionalProps);
          if (rootConfig.styles) {
            // @ts-expect-error - this is fine, internal styles can't consume the `P` generic at this level
            return rootConfig.styles(propsForThisRoot);
          }
          return '';
        })
        .join('\n');

      return (
        <>
          {processedConfigs.map((rootConfig, index) => {
            if (rootConfig?.render) {
              const additionalProps: AdditionalRenderProps = {
                _id: id,
                _editMode: editMode,
                _activeBreakpoint: props._activeBreakpoint as keyof AvailableQueries,
                _editor: editorElements,
                _dashboard: dashboard,
              };
              const propsForThisRoot = getPropsForRoot(rootConfig, props, additionalProps);
              // TODO TODO rootConfig.styles(propsForThisRoot);
              return <Fragment key={rootConfig._remoteRepositoryId || index}>{rootConfig.render(propsForThisRoot)}</Fragment>;
            }
            return null;
          })}
          {/* the root dropzone */}
          <Content />

          <Global
            styles={css`
              /* Global styles for the dashboard */
              ${allCustomStyles ?? ''}
              /* Style overrides for the root component */
              ${_styleOverrides?.style ?? ''}
            `}
          />
        </>
      );
    },
  };
  // @ts-expect-error - side effect of dodgeyness, but it does exist so we should remove it
  delete finalRootConfig._remoteRepositoryId; // Remove renderProps as it's not needed in the final config
  return finalRootConfig;
}

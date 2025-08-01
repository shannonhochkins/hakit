import { ComponentFactoryData, CustomComponentConfig, CustomRootConfig, IgnorePuckConfigurableOptions, RenderProps } from '@typings/puck';
import { CustomRootConfigWithRemote, RootData } from '.';
import { createComponent } from '@helpers/editor/createPuckComponent';
import { defaultRootConfig } from './defaultRoot';
import { WithChildren } from '@measured/puck';
import { Fragment } from 'react';
import { css, Global } from '@emotion/react';
import { FieldConfiguration } from '@typings/fields';

// CustomRootConfig<RootData>['fields']

export async function processRootConfigurations(rootConfigs: CustomRootConfigWithRemote[], data: ComponentFactoryData) {
  const mergedFields: FieldConfiguration<RootData> = {};
  const remoteKeys = new Set<string>();

  // casting here as types are correct on the defaultRootConfig value
  // we have our own root config which is available to all dashboards
  rootConfigs.push({
    ...(defaultRootConfig as unknown as CustomRootConfigWithRemote),
    _remoteRepositoryId: '@hakit/default-root', // this is the default root config
    _remoteRepositoryName: '@hakit/editor', // this is the default root config
  });

  rootConfigs.forEach(rootConfig => {
    remoteKeys.add(rootConfig._remoteRepositoryId);
    mergedFields[rootConfig._remoteRepositoryId] = {
      type: 'object',
      label: rootConfig._remoteRepositoryName || rootConfig.label,
      collapseOptions: {
        startExpanded: true,
      },
      // @ts-expect-error - we know typescript, this is a dodgey hack
      objectFields: {
        ...rootConfig.fields,
      },
    };
  });

  const baseConfig = rootConfigs[0];
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

  const finalRootConfig: Omit<CustomRootConfig<RootData>, IgnorePuckConfigurableOptions> = {
    ...updatedRootConfig,
    fields: {
      ...updatedRootConfig.fields,
      content: {
        type: 'slot',
      },
    },
    // Create a render function that calls all root render functions
    render({ _styleOverrides, content: Content, ...props }) {
      console.log('Rendering merged root with style overrides:', _styleOverrides, props);
      return (
        <>
          {rootConfigs.map((rootConfig, index) => {
            if (rootConfig?.render) {
              // Create a new props object without any remote keys
              const propsAsRecord = props as Record<string, unknown>;
              // trim off any remote objects that do not match the current rootConfig
              const baseProps = Object.fromEntries(Object.entries(propsAsRecord).filter(([key]) => !remoteKeys.has(key)));
              // Get the current remote's props and spread them at the top level
              const currentRemoteProps = propsAsRecord[rootConfig._remoteRepositoryId] || {};
              // Combine base props with current remote's props and style overrides
              const propsForThisRoot = {
                // ...props, // Start with all original props to ensure required props are present
                ...baseProps, // Override with filtered base props (without other remotes)
                ...(typeof currentRemoteProps === 'object' && currentRemoteProps !== null ? currentRemoteProps : {}),
                _styleOverrides,
              };
              return (
                <Fragment key={rootConfig._remoteRepositoryId || index}>
                  {
                    // we purposely cast the props here as we're intentionally changing them to support multiple remotes
                    rootConfig.render(propsForThisRoot as RenderProps<WithChildren<RootData>>)
                  }
                </Fragment>
              );
            }
            return null;
          })}
          {/* the root dropzone */}
          <Content />

          {_styleOverrides?.style && (
            <Global
              styles={css`
                /* Global styles for the dashboard */
                ${_styleOverrides.style}
              `}
            />
          )}
        </>
      );
    },
  };
  // @ts-expect-error - side effect of dodgeyness, but it does exist so we should remove it
  delete finalRootConfig._remoteRepositoryId; // Remove renderProps as it's not needed in the final config
  return finalRootConfig;
}

import {
  AdditionalRenderProps,
  ComponentFactoryData,
  CustomRootConfigWithDefinition,
  IgnorePuckConfigurableOptions,
  RenderProps,
  InternalRootData,
} from '@typings/puck';
import { Fragment } from 'react';
import { CustomRootConfigWithRemote } from '../../../features/dashboard/PuckDynamicConfiguration';
import { createComponent } from '@helpers/editor/createPuckComponent';
import { defaultRootConfig, DefaultRootProps } from '@helpers/editor/createRootComponent/defaultRoot';
import { DefaultComponentProps } from '@measured/puck';
import { css, Global } from '@emotion/react';
import { CustomFields, InternalRootComponentFields } from '@typings/fields';
import { useGlobalStore } from '@hooks/useGlobalStore';
import { usePuckIframeElements } from '@hooks/usePuckIframeElements';
import { attachRepositoryReference } from '../pageData/transformFields';
import { ComponentRenderErrorBoundary } from '@features/dashboard/Editor/ErrorBoundary';

export async function createRootComponent<P extends DefaultComponentProps>(
  rootConfigs: CustomRootConfigWithRemote<P>[],
  data: ComponentFactoryData
) {
  const mergedFields: Record<string, CustomFields<P>> = {};
  const remoteKeys = new Set<string>();
  const processedConfigs: CustomRootConfigWithRemote<P>[] = [];

  // casting here as types are correct on the defaultRootConfig value
  // we have our own root config which is available to all dashboards
  const defaultConfig: CustomRootConfigWithRemote<DefaultRootProps> = {
    ...defaultRootConfig,
    _remoteRepositoryId: '@hakit/default-root', // this is the default root config
    _remoteRepositoryName: '@hakit/editor', // this is the default root config
  };

  // Always include the default config first
  // the object above is typed, so okay to cast here as the rest of the values in this array are unknown values/types
  processedConfigs.push(defaultConfig as unknown as CustomRootConfigWithRemote<P>);
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
      // @ts-expect-error - impossible to type this correctly as it is a dynamic object
      objectFields: {
        ...attachRepositoryReference(rootConfig.fields, rootConfig._remoteRepositoryId),
      },
      repositoryId: rootConfig._remoteRepositoryId,
    };
  });

  const baseConfig = processedConfigs[0];
  if (!baseConfig) {
    throw new Error('No root configurations provided');
  }

  /// now we have the merged structure, we can now create the dynamic configurations

  // create the puck definitions
  const componentFactory = await createComponent<P>(
    {
      // Merge other properties from base config (excluding render and fields)
      ...baseConfig,
      // Set the merged fields
      // @ts-expect-error - this will never match the root data as it's dynamically created above
      fields: mergedFields,
      defaultProps: {},
      render() {
        return <></>;
      },
    },
    true
  );
  // use our component factory to convert out component structure to a puck component
  const updatedRootConfig = await componentFactory(data);

  const finalRootConfig: Omit<
    CustomRootConfigWithDefinition<InternalRootData & InternalRootComponentFields>,
    IgnorePuckConfigurableOptions
  > = {
    ...updatedRootConfig,
    // @ts-expect-error - objects are typed above, they just can't be combined here
    fields: updatedRootConfig.fields,
    // Create a render function that calls all root render functions
    render(renderProps: RenderProps<InternalRootData & InternalRootComponentFields>) {
      return (
        <ComponentRenderErrorBoundary prefix='Root'>
          <Render {...renderProps} remoteKeys={remoteKeys} processedConfigs={processedConfigs} />
        </ComponentRenderErrorBoundary>
      );
    },
  };
  // @ts-expect-error - side effect of dodgeyness, but it does exist so we should remove it
  delete finalRootConfig._remoteRepositoryId; // Remove renderProps as it's not needed in the final config
  return finalRootConfig;
}

function getPropsForRoot<P extends DefaultComponentProps>(
  rootConfig: CustomRootConfigWithRemote<P>,
  props: Record<string, unknown>,
  additionalProps: AdditionalRenderProps,
  remoteKeys: Set<string>
) {
  // Create a new props object without any remote keys
  // trim off any remote objects that do not match the current rootConfig
  const baseProps = Object.fromEntries(Object.entries(props).filter(([key]) => !remoteKeys.has(key)));
  // Get the current remote's props and spread them at the top level
  const currentRemoteProps = props[rootConfig._remoteRepositoryId] || {};
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
  ...props
}: RenderProps<InternalRootData & InternalRootComponentFields> & {
  processedConfigs: CustomRootConfigWithRemote<P>[];
  remoteKeys: Set<string>;
}) {
  const editorElements = usePuckIframeElements();
  const { id, styles, editMode = false, content: Content } = props;

  const dashboard = useGlobalStore(state => state.dashboardWithoutData);

  // gather all root config styles to apply globally
  const allCustomStyles = processedConfigs
    .map(rootConfig => {
      const additionalProps: AdditionalRenderProps = {
        _id: id,
        _editMode: editMode ?? puck.isEditing,
        _editor: editorElements,
        _dashboard: dashboard,
      };
      const propsForThisRoot = getPropsForRoot(rootConfig, props, additionalProps, remoteKeys);
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
            _editor: editorElements,
            _dashboard: dashboard,
          };
          const propsForThisRoot = getPropsForRoot(rootConfig, props, additionalProps, remoteKeys);
          // @ts-expect-error - don't want to type this out, we'd have to cast anyway */
          return <Fragment key={index}>{rootConfig.render(propsForThisRoot)}</Fragment>;
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
          ${styles?.css ?? ''}
        `}
      />
    </>
  );
}

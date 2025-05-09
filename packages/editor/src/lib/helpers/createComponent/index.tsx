import type {
  DefaultComponentProps,
  PuckComponent,
  ComponentConfig,
  ComponentData,
  CustomField,
  AppState,
  WithId,
  WithPuckProps,
  Fields,
  PuckContext,
} from '@measured/puck';
import { useEffect, useMemo } from 'react';
import { useActiveBreakpoint } from '@lib/hooks/useActiveBreakpoint';
import { type CustomFieldsConfiguration } from '@lib/components/Form';
import { getDefaultPropsFromFields, transformFields, wrapDefaults, transformProps } from '@lib/helpers/breakpoints';
import { AvailableQueries } from '@hakit/components';
import { type HassEntities, type HassServices } from 'home-assistant-js-websocket';
import { type PuckCategories } from '@typings/puck';
import { usePuckFrame } from '@lib/hooks/usePuckFrame';
import { useTransformedPuckData } from '@lib/hooks/useTransformedPuckData';
import { deepCopy } from 'deep-copy-ts';
import { DropZone } from '@measured/puck';


// Automatic extensions
// import { type Actions, getActionFields, resolveActionFields } from '@lib/puck/EditorComponents/form/definitions/actions';
// import { type SizeOptions, getSizeFields, resolveSizeFields } from '@lib/puck/EditorComponents/form/definitions/size';
import { DeepPartial } from '@typings';
import { merge } from 'ts-deepmerge';
import { useGlobalStore } from '@lib/hooks/useGlobalStore';

type InternalFields = {
  // breakpoint is not saved in the db, this is calculated on the fly
  breakpoint: keyof AvailableQueries;
};

// Just for readability, this shouldn't ever change
type WithField = true;

export type CustomComponentConfig<
  Props extends DefaultComponentProps = DefaultComponentProps,
  FieldProps extends DefaultComponentProps = Props,
  DataShape = Omit<ComponentData<FieldProps>, 'type'>,
> = Omit<ComponentConfig<Props, FieldProps, DataShape>, 'resolveFields' | 'fields' | 'render' | 'defaultProps' | 'label'> & {
  label: string;
  category: PuckCategories;
  fields: CustomFieldsConfiguration<Props, false, Omit<ComponentData<FieldProps>, 'type'>['props']>;
  resolveFields?: (
    data: DeepPartial<DataShape>,
    params: {
      changed: Partial<Record<keyof FieldProps, boolean>>;
      fields: CustomFieldsConfiguration<FieldProps, WithField>;
      lastFields: CustomFieldsConfiguration<FieldProps, WithField>;
      lastData: (DataShape) | null;
      appState: AppState;
      parent: ComponentData | null;
    }
  ) => Promise<CustomFieldsConfiguration<FieldProps, WithField>> | CustomFieldsConfiguration<FieldProps, WithField>;
  render: PuckComponent<
    Props & {
      activeBreakpoint?: string;
      editorFrame?: HTMLIFrameElement;
      dragRef: PuckContext['dragRef'];
    }
  >;
};

export type ComponentFactoryData = {
  getAllEntities: () => HassEntities;
  getAllServices: () => Promise<HassServices | null>;
};


/**
 * Takes an existing CustomComponentConfig and returns a new config
 * whose render method is wrapped so we can pass `activeBreakpoint`.
 */
export function createComponent<
  P extends DefaultComponentProps
>(config: CustomComponentConfig<P>): (data: ComponentFactoryData) => Promise<ComponentConfig<P>> {
  return async function (data: ComponentFactoryData) {
    const _config = deepCopy(config);
    const fields = _config.fields;
    const entities = data.getAllEntities();
    const services = await data.getAllServices();
    // if (config.withActions) {
    //   const { actions } = await getActionFields(data);
    //   // @ts-expect-error - This is fine, internal factory can't determine the types
    //   fields.actions = actions;
    // }
    // if (config.withSizeOptions) {
    //   const { sizeOptions } = await getSizeFields();
    //   // @ts-expect-error - This is fine, internal factory can't determine the types
    //   fields.sizeOptions = sizeOptions;
    // }
    const defaultProps = await getDefaultPropsFromFields(fields, {
      entities,
      services,
    });
    const transformedFields = transformFields(fields);
    // 1. Wrap defaultProps so each key is { xlg: value }
    const newDefaultProps = wrapDefaults(transformedFields, defaultProps);

    const breakpointField: CustomField<InternalFields['breakpoint']> = {
      type: 'custom',
      render({ onChange }) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const breakpoint = useActiveBreakpoint();
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          onChange(breakpoint);
        }, [onChange, breakpoint]);
        return <input type='hidden' value={breakpoint} />;
      },
    };
    // attach internal breakpoint field
    // @ts-expect-error - This is fine, internal factory can't determine the types
    transformedFields.breakpoint = breakpointField;

    return {
      ...config,
      defaultProps: newDefaultProps as ComponentConfig<P>['defaultProps'],
      // This is just to make puck happy on the consumer side, Fields aren't actually the correct type here
      fields: Object.keys(fields).length === 0 ? {} as Fields<P> : transformedFields as Fields<P>,
      resolveFields: async (data, params) => {
        const activeBreakpoint = data.props.breakpoint ?? 'xlg';
        const newProps = merge.withOptions({
          mergeArrays: false,
        }, newDefaultProps, data.props) as WithId<P>;
        data.props = newProps;
        const transformedProps = transformProps(data, activeBreakpoint);
        // if (config.withActions) {
        //   // @ts-expect-error - This is fine, internal factory can't determine the types
        //   await resolveActionFields(transformedProps, params.fields);
        // }
        // if (config.withSizeOptions) {
        //   // @ts-expect-error - This is fine, internal factory can't determine the types
        //   await resolveSizeFields(transformedProps, params.fields);
        // }
        if (!config.resolveFields) {
          return params.fields;
        }
        const fields = await config.resolveFields(
          // @ts-expect-error - This is fine, internal factory can't determine the types
          transformedProps,
          params
        );
        return fields;
      },
      render(props) {
        const data = useTransformedPuckData();
        const editorFrame = usePuckFrame();
        const dashboard = useGlobalStore(state => state.dashboard);
        // get active breakpoint
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const activeBreakpoint = useActiveBreakpoint();
        // Shallowly transform the props, converting all breakpoint objects to single values by the active breakpoint
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const resolvedProps = useMemo(() => {
          const withDefaults = merge.withOptions({
            mergeArrays: false,
          }, newDefaultProps, props) as WithId<WithPuckProps<P>>;
          return transformProps(withDefaults, activeBreakpoint);
        }, [props, activeBreakpoint]);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const finalProps = useMemo(() => {
          const { puck, ...rest } = resolvedProps;
          return {
            ...rest,
            dragRef: puck.dragRef,
            DropZone,
            hakit: {
              data,
              editorFrame,
              dashboard,
              activeBreakpoint
            }
          };
        }, [resolvedProps, activeBreakpoint, data, editorFrame, dashboard]);
        // Call the original render with the final single-value props
        // plus any additional props provided in the CustomComponentConfig type
        // @ts-expect-error - This is fine, fix later
        return config.render(finalProps);
      },
    };
  };
}

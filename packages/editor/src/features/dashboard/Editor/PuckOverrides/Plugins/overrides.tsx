import { Config, Plugin, FieldRenderFunctions } from '@measured/puck';
import { DrawerItem } from '../DrawerItem';
import { FieldDefinition } from '@typings/fields';
import { StandardFieldWrapper, type StandardFieldComponentProps } from '@helpers/editor/FieldContainer/Standard';
import { CollapsibleFieldWrapper, type CollapsibleFieldComponentProps } from '@helpers/editor/FieldContainer/Collapsible';
import { RenderErrorBoundary } from '../../RenderErrorBoundary';

type AllFieldRenderers = FieldRenderFunctions<
  Config<{
    fields: FieldDefinition;
  }>
>;

// Props accepted by any field renderer in fieldTypes (union of all variants)
type FieldWrapperProps = Parameters<AllFieldRenderers[keyof AllFieldRenderers]>[0];

const FieldWrapper = ({ field, name, onChange, value, id }: FieldWrapperProps) => {
  if (field.type === 'object' || field.type === 'array' || field.type === 'pages') {
    return (
      <CollapsibleFieldWrapper
        field={field as CollapsibleFieldComponentProps['field']}
        name={name}
        onChange={onChange}
        value={value}
        id={id ?? name}
      />
    );
  }
  return (
    <StandardFieldWrapper
      field={field as StandardFieldComponentProps['field']}
      name={name}
      onChange={onChange}
      value={value}
      id={id ?? name}
    />
  );
};

export const createPuckOverridesPlugin = (): Plugin<
  Config<{
    fields: FieldDefinition;
  }>
> => {
  return {
    overrides: {
      drawerItem: DrawerItem,
      fieldLabel: ({ children }) => <>{children}</>,
      fields: ({ children }) => {
        return (
          <RenderErrorBoundary prefix={`Error Rendering Fields for this component`} styles={{ margin: '1rem', width: 'auto' }}>
            {children}
          </RenderErrorBoundary>
        );
      },
      fieldTypes: {
        switch: FieldWrapper,
        radio: FieldWrapper,
        select: FieldWrapper,
        number: FieldWrapper,
        text: FieldWrapper,
        textarea: FieldWrapper,
        imageUpload: FieldWrapper,
        page: FieldWrapper,
        pages: FieldWrapper,
        entity: FieldWrapper,
        service: FieldWrapper,
        slider: FieldWrapper,
        color: FieldWrapper,
        code: FieldWrapper,
        object: ({ children, ...props }) => {
          if (props.field.metadata?.override === true) {
            return children;
          }
          return <FieldWrapper {...props}>{children}</FieldWrapper>;
        },
        array: ({ children, ...props }) => {
          if (props.field.metadata?.override === true) {
            return children;
          }
          return <FieldWrapper {...props}>{children}</FieldWrapper>;
        },
        hidden: FieldWrapper,
        slot: FieldWrapper,
        divider: FieldWrapper,
        // custom: FieldWrapper,
      },
    },
  };
};

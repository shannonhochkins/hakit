import { Config, Plugin, FieldRenderFunctions } from '@measured/puck';
import { memo } from 'react';
import { DrawerItem } from '../Components/DrawerItem';
import { FieldDefinition } from '@typings/fields';
import { StandardFieldWrapper, type StandardFieldComponentProps } from '@features/dashboard/Editor/FieldContainer/Standard';
import { CollapsibleFieldWrapper, type CollapsibleFieldComponentProps } from '@features/dashboard/Editor/FieldContainer/Collapsible';
import { RenderErrorBoundary } from '../../RenderErrorBoundary';
import isEqual from '@guanghechen/fast-deep-equal';
import { ActionBar } from '../ActionBar';
import { Components } from '../Components';

type AllFieldRenderers = FieldRenderFunctions<
  Config<{
    fields: FieldDefinition;
  }>
>;

// Props accepted by any field renderer in fieldTypes (union of all variants)
type FieldWrapperProps = Parameters<AllFieldRenderers[keyof AllFieldRenderers]>[0];

const FieldWrapperInner = ({ field, name, onChange, value, id }: FieldWrapperProps) => {
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

const MemoFieldWrapperInner = memo(FieldWrapperInner, (prevProps, nextProps) => {
  // Allow re-render if field type changes (ensures correct wrapper)
  if (prevProps.field.type !== nextProps.field.type) return false;
  // Re-render when handler identity changes
  if (prevProps.onChange !== nextProps.onChange) return false;
  // Re-render when value changes deeply
  if (!isEqual(prevProps.value, nextProps.value)) return false;
  // Ignore other prop changes (name, id, etc.) for performance
  return true;
});
MemoFieldWrapperInner.displayName = 'FieldWrapper';

// Preserve function renderer shape expected by Puck
const FieldWrapper = (props: FieldWrapperProps) => <MemoFieldWrapperInner {...props} />;

export const createPuckOverridesPlugin = (): Plugin<
  Config<{
    fields: FieldDefinition;
  }>
> => {
  return {
    overrides: {
      actionBar: ActionBar,
      fieldLabel: ({ children }) => <>{children}</>,
      fields: ({ children }) => {
        return (
          <RenderErrorBoundary prefix={`Error Rendering Fields for this component`} styles={{ margin: '1rem', width: 'auto' }}>
            {children}
          </RenderErrorBoundary>
        );
      },
      components: Components,
      drawerItem: DrawerItem,
      fieldTypes: {
        unit: FieldWrapper,
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
        icon: FieldWrapper,
      },
    },
  };
};

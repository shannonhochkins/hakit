import { Config, Plugin, FieldRenderFunctions, AutoField } from '@measured/puck';
import { DrawerItem } from '../DrawerItem';
import { FieldConfiguration, FieldDefinition } from '@typings/fields';
import { ImageUpload } from '@components/Form/Fields/Image';
import { Color } from '@components/Form/Fields/Color';
import { CodeField } from '@components/Form/Fields/Code';
import { Page } from '@components/Form/Fields/Page';
import { Entity } from '@components/Form/Fields/Entity';
import { HassEntity } from 'home-assistant-js-websocket';
import { StandardFieldWrapper } from '@helpers/editor/FieldContainer/Standard';
import { CollapsibleFieldWrapper } from '@helpers/editor/FieldContainer/Collapsible';
import { SwitchField } from '@components/Form/Fields/Switch';
import { RadioField } from '@components/Form/Fields/Radio';
import { GridField } from '@components/Form/Fields/Grid';
import { Service } from '@components/Form/Fields/Service';
import { Slider } from '@components/Form/Fields/Slider';
import { InputField } from '@components/Form/Fields/Input';
import { NumberField } from '@components/Form/Fields/Number';
import { SelectField } from '@components/Form/Fields/Select';

type AllFieldRenderers = FieldRenderFunctions<
  Config<{
    fields: FieldDefinition;
  }>
>;

// Props accepted by any field renderer in fieldTypes (union of all variants)
type FieldWrapperProps = Parameters<AllFieldRenderers[keyof AllFieldRenderers]>[0];

const FieldWrapper = ({ field, name, onChange, value, id, children }: FieldWrapperProps) => {
  console.log('fieldWrapper', field, name, onChange, value, id, children);
  return children;
  if (field.type === 'object' || field.type === 'array') {
    return (
      <CollapsibleFieldWrapper field={field} name={name} onChange={onChange} value={value} id={id ?? name}>
        {children}
      </CollapsibleFieldWrapper>
    );
  }
  return (
    <StandardFieldWrapper field={field} name={name} onChange={onChange} value={value} id={id ?? name}>
      {children}
    </StandardFieldWrapper>
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
        // TODO - Error boundary here
        // if (!_icon) {
        //   return (
        //     <StyledAlert title='Invalid Configuration' severity='error'>
        //       Unsupported field type: <mark>{field.type}</mark>
        //     </StyledAlert>
        //   );
        // }
        return <>{children}</>;
      },
      fieldTypes: {
        switch: props => (
          <FieldWrapper {...props}>
            <SwitchField
              checked={typeof props.value === 'boolean' ? props.value : false}
              onChange={e => {
                const checked = (e.target as HTMLInputElement).checked;
                props.onChange(checked);
              }}
              name={props.name}
              id={props.id}
              readOnly={props.readOnly}
            />
          </FieldWrapper>
        ),
        radio: props => (
          <FieldWrapper {...props}>
            <RadioField
              value={props.value}
              options={props.field.options}
              onChange={props.onChange}
              orientation='horizontal'
              name={props.name}
              id={props.id}
              readOnly={props.readOnly}
            />
          </FieldWrapper>
        ),
        color: props => (
          <FieldWrapper {...props}>
            <Color value={props.value} onChange={props.onChange} />
          </FieldWrapper>
        ),
        code: props => (
          <FieldWrapper {...props}>
            <CodeField
              value={typeof props.value === 'string' ? props.value : ''}
              language={props.field.language}
              onValidate={props.field.onValidate}
              onChange={props.onChange}
            />
          </FieldWrapper>
        ),
        hidden: props => <input type='hidden' value={props.value} />,
        imageUpload: props => (
          <FieldWrapper {...props}>
            <ImageUpload id={props.id ?? props.name} value={typeof props.value === 'string' ? props.value : ''} onChange={props.onChange} />
          </FieldWrapper>
        ),
        grid: props => (
          <FieldWrapper {...props}>
            <GridField value={props.value} step={props.field.step} min={props.field.min} max={props.field.max} onChange={props.onChange} />
          </FieldWrapper>
        ),
        page: props => (
          <FieldWrapper {...props}>
            <Page value={props.value} label={props.field.label} muiltiSelect={false} onChange={props.onChange} />
          </FieldWrapper>
        ),
        pages: props => (
          <FieldWrapper {...props}>
            <Page value={props.value} label={props.field.label} muiltiSelect={true} onChange={props.onChange} />
          </FieldWrapper>
        ),
        entity: props => (
          <FieldWrapper {...props}>
            <Entity options={(props.field.options || []) as HassEntity[]} value={props.value} onChange={props.onChange} />
          </FieldWrapper>
        ),
        service: props => (
          <FieldWrapper {...props}>
            <Service value={typeof props.value === 'string' ? props.value : undefined} onChange={props.onChange} />
          </FieldWrapper>
        ),
        slider: props => (
          <FieldWrapper {...props}>
            <Slider value={props.value} step={props.field.step} min={props.field.min} max={props.field.max} onChange={props.onChange} />
          </FieldWrapper>
        ),
        text: props => (
          <FieldWrapper {...props}>
            <InputField
              value={typeof props.value === 'string' ? props.value : undefined}
              onChange={props.onChange}
              id={props.id}
              readOnly={props.readOnly}
              name={props.name}
            />
          </FieldWrapper>
        ),
        number: props => (
          <FieldWrapper {...props}>
            <NumberField
              value={typeof props.value === 'number' ? props.value : undefined}
              onChange={props.onChange}
              id={props.id}
              readOnly={props.readOnly}
              name={props.name}
            />
          </FieldWrapper>
        ),
        // textarea: ({ children, ...props}) => (
        //   <FieldWrapper {...props}>
        //     <AutoField
        //       field={{
        //         ...props.field,
        //         name: props.name,
        //         id: props.id,
        //         readOnly: props.readOnly,
        //         default: props.field.default,
        //       }}
        //       onChange={props.onChange}
        //       value={typeof props.value === 'string' ? props.value : false}
        //     />
        //   </FieldWrapper>
        // ),
        select: props => (
          <FieldWrapper {...props}>
            <SelectField
              value={props.field.options.find(option => option.value === props.value)}
              options={props.field.options}
              getOptionLabel={option => option?.label ?? '-'}
              onChange={e => {
                const selectedValue = e.target.value as { value: string; label: string } | null;
                // Find the original option to get the correct typed value
                const selectedOption = props.field.options.find(option => option.value === selectedValue?.value);
                if (selectedOption) {
                  props.onChange(selectedOption.value);
                }
              }}
              size='small'
              name={props.name}
              id={props.id}
              readOnly={props.readOnly}
            />
          </FieldWrapper>
        ),
        array: ({ children, ...props }) => {
          if (props.field.metadata?.override === true) {
            return children;
          }
          return (
            <FieldWrapper {...props}>
              <AutoField
                field={{
                  ...props.field,
                  name: props.name,
                  id: props.id,
                  readOnly: props.readOnly,
                  metadata: {
                    ...props.field.metadata,
                    override: true,
                  },
                }}
                onChange={props.onChange}
                value={props.value}
              />
            </FieldWrapper>
          );
        },
        object: ({ children, ...props }) => {
          if (props.field.metadata?.override === true) {
            return children;
          }
          return (
            <FieldWrapper {...props}>
              <AutoField
                field={{
                  ...props.field,
                  name: props.name,
                  id: props.id,
                  readOnly: props.readOnly,
                  metadata: {
                    ...props.field.metadata,
                    override: true,
                  },
                }}
                value={props.value}
                onChange={props.onChange}
              />
            </FieldWrapper>
          );
        },
      },
    },
  };
};

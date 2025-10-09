import { AutoField, DefaultComponentProps } from '@measured/puck';
import { FieldConfiguration, FieldValueByKind } from '@typings/fields';
import { ColorField } from '@components/Form/Field/Color';
import { SliderField } from '@components/Form/Field/Slider';
import { Entity } from '@components/Form/Field/Entity';
import { ServiceField } from '@components/Form/Field/Service';
import { PageField } from '@components/Form/Field/Page';
import { ImageField } from '@components/Form/Field/Image';
import { CodeField } from '@components/Form/Field/Code';
import { InputField } from '@components/Form/Field/Input';
import { SelectField } from '@components/Form/Field/Select';
import { RadioField, type RadioOption } from '@components/Form/Field/Radio';
import { Alert } from '@components/Alert';
import { SwitchField } from '@components/Form/Field/Switch';
import { UnitField } from '@components/Form/Field/Unit';
import { validateBoolean, validateNumber, validateString, validateStringArray } from './valueValidation';

type CustomAutoFieldProps<Props> = {
  field: FieldConfiguration[string];
  value: Props;
  onChange: (value: Props) => void;
} & CommonProps;

type CommonProps = {
  name: string;
  fieldLabel: React.ReactNode;
  icon?: React.ReactNode;
  id: string;
};

export function CustomAutoField<Props extends DefaultComponentProps>({
  field,
  fieldLabel,
  value,
  onChange,
  name,
  icon,
  id,
}: CustomAutoFieldProps<Props>) {
  // Let the *call* infer T from `field` and enforce `value`/`onChange` via the generic function
  return renderField({
    type: field.type,
    field: field as never, // we don't care here, it's just a wrapper call to get the type
    value: value as never,
    onChange: onChange as never,
    name,
    fieldLabel,
    icon,
    id,
  });
}

type FieldKind = keyof FieldValueByKind;
type AnyFieldConfig = FieldConfiguration[string];

// Create a discriminated union that ties the top-level `type` to the corresponding
// `value` and `onChange` types. This allows switch/case on `field.type` to
// correctly narrow `value` to e.g. FieldValueByKind['unit'].
type RenderFieldProps = {
  [K in FieldKind]: {
    type: K;
    field: Extract<AnyFieldConfig, { type: K }>;
    value: FieldValueByKind[K];
    onChange: (value: FieldValueByKind[K]) => void;
  } & CommonProps;
}[FieldKind];

export function renderField(props: RenderFieldProps) {
  // keep only a-z, replace all other chars with nothing
  const id = props.id.replace(/[^a-zA-Z]/g, '').toLowerCase();

  switch (props.type) {
    case 'slot':
      return null;
    case 'hidden':
      return <input type='hidden' value={validateString(props.value as string, '')} name={props.name} id={id} />;
    case 'custom':
      return props.field.render({
        field: {
          type: 'custom',
          render: props.field.render,
        },
        name: props.name,
        id: id,
        value: props.value,
        onChange: props.onChange,
      });
    case 'unit':
      return (
        <UnitField
          // cast as true to satisfy the type as the internal discriminated union won't be happy with the "boolean" type here
          supportsAllCorners={props.field.supportsAllCorners as true}
          min={props.field.min}
          max={props.field.max}
          step={props.field.step}
          value={validateString(props.value, undefined)}
          onChange={props.onChange}
          label={props.fieldLabel}
          icon={props.icon}
          helperText={props.field.description}
          readOnly={props.field.readOnly}
          id={id}
          name={props.name}
        />
      );
    case 'imageUpload':
      return (
        <ImageField
          label={props.fieldLabel}
          icon={props.icon}
          helperText={props.field.description}
          readOnly={props.field.readOnly}
          id={id}
          name={props.name}
          value={validateString(props.value, '')}
          onChange={props.onChange}
        />
      );
    case 'color':
      return (
        <ColorField
          label={props.fieldLabel}
          icon={props.icon}
          helperText={props.field.description}
          readOnly={props.field.readOnly}
          id={id}
          name={props.name}
          value={validateString(props.value, '')}
          onChange={props.onChange}
        />
      );
    case 'code':
      return (
        <CodeField
          label={props.fieldLabel}
          icon={props.icon}
          helperText={props.field.description}
          readOnly={props.field.readOnly}
          id={id}
          name={props.name}
          value={validateString(props.value, '')}
          language={props.field.language}
          onValidate={props.field.onValidate}
          onChange={props.onChange}
        />
      );
    case 'page':
      return (
        <PageField
          value={validateString(props.value, '')}
          label={props.fieldLabel}
          icon={props.icon}
          multiple={false}
          onChange={e => props.onChange(e.id)}
          id={id}
          name={props.name}
          helperText={props.field.description}
          readOnly={props.field.readOnly}
        />
      );
    case 'pages':
      return (
        <PageField
          value={validateStringArray(props.value, [])}
          label={props.fieldLabel}
          icon={props.icon}
          multiple={true}
          onChange={e => props.onChange(e.map(page => page.id))}
          id={id}
          name={props.name}
          helperText={props.field.description}
          readOnly={props.field.readOnly}
        />
      );
    case 'entity':
      return (
        <Entity
          filterOptions={props.field.filterOptions}
          value={validateString(props.value, undefined)}
          label={props.fieldLabel}
          icon={props.icon}
          onChange={props.onChange}
          id={id}
          name={props.name}
          helperText={props.field.description}
          readOnly={props.field.readOnly}
        />
      );
    case 'service':
      return (
        <ServiceField
          value={validateString(props.value, undefined)}
          onChange={props.onChange}
          label={props.fieldLabel}
          icon={props.icon}
          id={id}
          name={props.name}
          helperText={props.field.description}
          readOnly={props.field.readOnly}
        />
      );
    case 'slider':
      return (
        <SliderField
          value={validateNumber(props.value, undefined)}
          id={id}
          label={props.fieldLabel}
          icon={props.icon}
          readOnly={props.field.readOnly}
          name={props.name}
          min={props.field.min}
          max={props.field.max}
          helperText={props.field.description}
          step={props.field.step}
          onChange={props.onChange}
        />
      );
    case 'text':
      return (
        <InputField
          label={props.fieldLabel}
          icon={props.icon}
          readOnly={props.field.readOnly}
          value={validateString(props.value, undefined)}
          onChange={e => props.onChange(e.target.value)}
          helperText={props.field.description}
          name={props.name}
          id={id}
        />
      );
    case 'number':
      return (
        <InputField
          type='number'
          label={props.fieldLabel}
          icon={props.icon}
          readOnly={props.field.readOnly}
          value={validateNumber(props.value, undefined)}
          onChange={e => props.onChange(Number(e.target.value))}
          min={props.field.min}
          max={props.field.max}
          step={props.field.step}
          helperText={props.field.description}
          name={props.name}
          id={id}
        />
      );
    case 'select':
      return (
        <SelectField
          label={props.fieldLabel}
          icon={props.icon}
          readOnly={props.field.readOnly}
          renderOption={props.field.renderOption}
          value={props.field.options.find(option => option.value === props.value)}
          options={[...props.field.options]}
          renderValue={props.field.renderValue}
          onChange={selectedOption => {
            if (
              selectedOption &&
              (typeof selectedOption.value === 'string' ||
                typeof selectedOption.value === 'number' ||
                typeof selectedOption.value === 'boolean')
            ) {
              props.onChange(selectedOption.value);
            }
          }}
          name={props.name}
          id={id}
          helperText={props.field.description}
        />
      );
    case 'radio':
      return (
        <RadioField
          value={
            props.value === null
              ? null
              : validateString(props.value, undefined) || validateNumber(props.value, undefined) || validateBoolean(props.value, undefined)
          }
          options={[...props.field.options.map(option => ({ value: option.value, label: option.label }) satisfies RadioOption)]}
          onChange={e => {
            if (typeof e === 'string' || typeof e === 'number' || typeof e === 'boolean' || e === null) {
              props.onChange(e);
            }
          }}
          label={props.fieldLabel}
          icon={props.icon}
          readOnly={props.field.readOnly}
          horizontal
          name={props.name}
          id={id}
          helperText={props.field.description}
        />
      );
    case 'switch':
      return (
        <SwitchField
          checked={validateBoolean(props.value, false)}
          name={props.name}
          label={props.fieldLabel}
          icon={props.icon}
          readOnly={props.field.readOnly}
          helperText={props.field.description}
          id={id}
          onChange={e => {
            const checked = (e.target as HTMLInputElement).checked;
            props.onChange(checked);
          }}
        />
      );
    case 'textarea':
      return (
        <InputField
          id={id}
          name={props.name}
          label={props.fieldLabel}
          icon={props.icon}
          readOnly={props.field.readOnly}
          type='multiline'
          value={validateString(props.value, undefined)}
          onChange={e => props.onChange(e.target.value)}
          rows={3}
          placeholder='Enter your message'
          helperText={props.field.description}
        />
      );

    case 'object':
      return (
        <AutoField
          field={{
            type: 'object',
            objectFields: props.field.objectFields,
            readOnly: props.field.readOnly,
            label: props.fieldLabel,
            icon: props.icon,
            name: props.name,
            id,
            metadata: {
              ...props.field.metadata,
              override: true,
            },
          }}
          value={props.value}
          onChange={props.onChange}
        />
      );
    case 'array':
      return (
        <AutoField
          field={{
            type: props.field.type,
            label: props.fieldLabel,
            icon: props.icon,
            readOnly: props.field.readOnly,
            getItemSummary: (item: DefaultComponentProps[0], i: number) => {
              if (props.field.getItemSummary) {
                return props.field.getItemSummary(item, i);
              }
              return `Item ${i + 1}`;
            },
            defaultItemProps: props.field.defaultItemProps,
            arrayFields: props.field.arrayFields,
            min: props.field.min,
            max: props.field.max,
            name: props.name,
            id: props.field.id,
            metadata: {
              ...props.field.metadata,
              override: true,
            },
          }}
          onChange={props.onChange}
          value={props.value}
        />
      );
    default:
      // Helper function for exhaustive type checking for invalid use of field types
      return (
        <Alert severity='error'>
          Unsupported field type: &quot;{(props as { field: { type?: string } }).field.type ?? 'unknown'}&quot;
        </Alert>
      );
  }
}

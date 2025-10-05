import { AutoField, DefaultComponentProps } from '@measured/puck';
import { FieldConfiguration } from '@typings/fields';
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
import { UnitField, UnitFieldValue } from '@components/Form/Field/Unit';

interface CustomAutoFieldProps<Props extends DefaultComponentProps> {
  field: FieldConfiguration[string];
  value: Props;
  name: string;
  icon?: React.ReactNode;
  id: string;
  onChange: (value: Props) => void;
  children?: React.ReactNode;
}

export function CustomAutoField<Props extends DefaultComponentProps>({
  field,
  name,
  value,
  onChange,
  icon,
  id: _id,
  children,
}: CustomAutoFieldProps<Props>) {
  // we cast as any here intentionally, we can't narrow the types at this level
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const _value = value as any;
  // similar to the above, onChange also can 't be narrowed at this level
  const _onChange = onChange as unknown as (value: string | number | boolean | string[] | number[] | boolean[] | UnitFieldValue) => void;
  // split on weird » character, replace any underscores/whitespace and periods with nothing
  const [, id] = _id.replace(/[_ .]/g, '').split('»');
  if (field.type === 'slot') {
    return null;
  }

  if (field.type === 'hidden') {
    return <input type='hidden' value={_value} />;
  }

  const { description } = field;
  if (field.type === 'custom') {
    return field.render({
      field: {
        type: 'custom',
        render: field.render,
      },
      name,
      id: id,
      value: _value,
      onChange: _onChange,
    });
  }
  if (field.type === 'unit') {
    return (
      <UnitField
        value={typeof _value === 'object' ? _value : ''}
        onChange={_onChange}
        label={field.label}
        icon={icon}
        helperText={description}
        readOnly={field.readOnly}
        id={id}
        name={name}
      />
    );
  }

  if (field.type === 'imageUpload') {
    return (
      <ImageField
        label={field.label}
        icon={icon}
        helperText={description}
        readOnly={field.readOnly}
        id={id}
        name={name}
        value={typeof _value === 'string' ? _value : ''}
        onChange={_onChange}
      />
    );
  }
  if (field.type === 'color') {
    return (
      <ColorField
        label={field.label}
        icon={icon}
        readOnly={field.readOnly}
        helperText={description}
        value={_value}
        onChange={_onChange}
        id={id}
        name={name}
      />
    );
  }
  if (field.type === 'code') {
    return (
      <CodeField
        label={field.label}
        icon={icon}
        helperText={description}
        readOnly={field.readOnly}
        id={id}
        name={name}
        value={typeof _value === 'string' ? _value : ''}
        language={field.language}
        onValidate={field.onValidate}
        onChange={_onChange}
      />
    );
  }
  if (field.type === 'page') {
    return (
      <PageField
        value={_value}
        label={field.label ?? 'Page'}
        icon={icon}
        multiple={false}
        onChange={e => _onChange(e.id)}
        id={id}
        name={name}
        helperText={description}
        readOnly={field.readOnly}
      />
    );
  }
  if (field.type === 'pages') {
    return (
      <PageField
        value={_value}
        label={field.label ?? 'Pages'}
        icon={icon}
        multiple={true}
        onChange={e => _onChange(e.map(page => page.id))}
        id={id}
        name={name}
        helperText={description}
        readOnly={field.readOnly}
      />
    );
  }
  if (field.type === 'entity') {
    return (
      <Entity
        filterOptions={field.filterOptions}
        value={_value}
        label={field.label ?? 'Unknown'}
        icon={icon}
        onChange={_onChange}
        id={id}
        name={name}
        helperText={description}
        readOnly={field.readOnly}
      />
    );
  }
  if (field.type === 'service') {
    return (
      <ServiceField
        value={typeof _value === 'string' ? _value : undefined}
        onChange={_onChange}
        label={field.label ?? 'Service'}
        icon={icon}
        id={id}
        name={name}
        helperText={description}
        readOnly={field.readOnly}
      />
    );
  }
  if (field.type === 'slider') {
    return (
      <SliderField
        value={typeof _value === 'number' ? _value : undefined}
        id={id}
        label={field.label ?? 'Slider'}
        icon={icon}
        readOnly={field.readOnly}
        name={name}
        min={field.min}
        max={field.max}
        helperText={description}
        step={field.step}
        onChange={_onChange}
      />
    );
  }
  if (field.type === 'text') {
    return (
      <InputField
        label={field.label ?? 'Text'}
        icon={icon}
        readOnly={field.readOnly}
        value={typeof _value === 'string' ? _value : undefined}
        onChange={e => _onChange(e.target.value)}
        helperText={description}
        name={name}
        id={id}
      />
    );
  }
  if (field.type === 'number') {
    console.log('_value', _value);
    return (
      <InputField
        type='number'
        label={field.label ?? 'Number'}
        icon={icon}
        readOnly={field.readOnly}
        value={typeof _value === 'number' ? _value : undefined}
        onChange={e => _onChange(Number(e.target.value))}
        min={field.min}
        max={field.max}
        step={field.step}
        helperText={description}
        name={name}
        id={id}
      />
    );
  }

  if (field.type === 'select') {
    console.log('field', field.label, field, _value);
    return (
      <SelectField
        label={field.label ?? 'Select'}
        icon={icon}
        readOnly={field.readOnly}
        renderOption={field.renderOption}
        value={field.options.find(option => option.value === _value)}
        options={[...field.options]}
        renderValue={field.renderValue}
        onChange={selectedOption => {
          if (
            selectedOption &&
            (typeof selectedOption.value === 'string' ||
              typeof selectedOption.value === 'number' ||
              typeof selectedOption.value === 'boolean')
          ) {
            _onChange(selectedOption.value);
          }
        }}
        name={name}
        id={id}
        helperText={description}
      />
    );
  }
  if (field.type === 'radio') {
    return (
      <RadioField
        value={typeof _value === 'string' || typeof _value === 'number' || typeof _value === 'boolean' ? _value : undefined}
        options={[...field.options.map(option => ({ value: option.value, label: option.label }) satisfies RadioOption)]}
        onChange={e => {
          if (e && (typeof e === 'string' || typeof e === 'number' || typeof e === 'boolean')) {
            _onChange(e);
          }
        }}
        label={field.label ?? 'Radio'}
        icon={icon}
        readOnly={field.readOnly}
        horizontal
        name={name}
        id={id}
        helperText={description}
      />
    );
  }
  if (field.type === 'switch') {
    return (
      <SwitchField
        checked={typeof _value === 'boolean' ? _value : false}
        name={name}
        label={field.label ?? 'Switch'}
        icon={icon}
        readOnly={field.readOnly}
        helperText={description}
        id={id}
        onChange={e => {
          const checked = (e.target as HTMLInputElement).checked;
          _onChange(checked);
        }}
      />
    );
  }
  if (field.type === 'textarea') {
    return (
      <InputField
        id={id}
        name={name}
        label={field.label ?? 'Textarea'}
        icon={icon}
        readOnly={field.readOnly}
        type='multiline'
        value={typeof _value === 'string' ? _value : undefined}
        onChange={e => _onChange(e.target.value)}
        rows={3}
        placeholder='Enter your message'
        helperText={description}
      />
    );
  }
  if (field.type === 'object') {
    if (field.metadata?.override === true) {
      return children;
    }
    return (
      <AutoField
        field={{
          type: 'object',
          objectFields: field.objectFields,
          readOnly: field.readOnly,
          label: field.label ?? 'Object',
          icon,
          name,
          id,
          metadata: {
            ...field.metadata,
            override: true,
          },
        }}
        value={_value}
        onChange={_onChange}
      />
    );
  }
  if (field.type === 'array') {
    return (
      <AutoField
        field={{
          type: field.type,
          label: field.label ?? 'Array',
          icon,
          readOnly: field.readOnly,
          getItemSummary: (item: DefaultComponentProps[0], i: number) => {
            if (field.getItemSummary) {
              return field.getItemSummary(item, i);
            }
            return `Item ${i + 1}`;
          },
          defaultItemProps: field.defaultItemProps,
          arrayFields: field.arrayFields,
          min: field.min,
          max: field.max,
          name,
          id: field.id,
          metadata: {
            ...field.metadata,
            override: true,
          },
        }}
        onChange={_onChange}
        value={_value}
      />
    );
  }
  if (field.type === 'divider') {
    return (
      <div
        style={{
          width: '100%',
          height: '1px',
          backgroundColor: 'var(--color-border)',
          margin: 'var(--space-2) 0',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'var(--color-surface)',
            padding: '0 var(--space-2)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-muted)',
            fontWeight: 'var(--font-weight-medium)',
          }}
        >
          {field.label}
        </div>
      </div>
    );
  }
  // Helper function for exhaustive type checking
  return <Alert severity='error'>Unsupported field type: &quot;{(field as { type?: string }).type ?? 'unknown'}&quot;</Alert>;
}

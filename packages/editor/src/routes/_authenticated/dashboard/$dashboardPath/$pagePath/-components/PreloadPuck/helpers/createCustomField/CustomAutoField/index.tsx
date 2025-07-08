import { AutoField, DefaultComponentProps } from '@measured/puck';
import { CustomFields } from '@typings/fields';
import { Color } from '@lib/components/Form/Fields/Color';
import { Slider } from '@lib/components/Form/Fields/Slider';
import { Entity } from '@lib/components/Form/Fields/Entity';
import { Service } from '@lib/components/Form/Fields/Service';
import { Page } from '@lib/components/Form/Fields/Page';
import { GridField } from '@lib/components/Form/Fields/Grid';
import { ImageUpload } from '@lib/components/Form/Fields/Image';
import { CodeField } from '@lib/components/Form/Fields/Code';
import { InputField } from '@lib/components/Form/Fields/Input';
import { SelectField as CustomSelectField } from '@lib/components/Form/Fields/Select';
import { RadioField as CustomRadioField } from '@lib/components/Form/Fields/Radio';
import { NumberField as CustomNumberField } from '@lib/components/Form/Fields/Number';
import { HassEntity } from 'home-assistant-js-websocket';
import { Alert } from '@lib/components/Alert';
import styled from '@emotion/styled';

const StyledAlert = styled(Alert)`
  margin: 0;
`;

interface CustomAutoFieldProps<Props extends DefaultComponentProps> {
  field: CustomFields<Props>;
  value: Props;
  name: string;
  onChange: (value: Props) => void;
}

export function CustomAutoField<Props extends DefaultComponentProps>({ field, name, value, onChange }: CustomAutoFieldProps<Props>) {
  // we cast as any here intentionally, we can't narrow the types at this level
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const _value = value as any;
  // similar to the above, onChange also can 't be narrowed at this level
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const _onChange = onChange as any;

  if (field.type === 'hidden') {
    return <input type='hidden' value={_value} />;
  }

  if (field.type === 'imageUpload') {
    return <ImageUpload value={_value} onChange={_onChange} />;
  }
  if (field.type === 'grid') {
    return <GridField value={_value} step={field.step} min={field.min} max={field.max} onChange={_onChange} />;
  }
  if (field.type === 'color') {
    return <Color value={_value} onChange={_onChange} />;
  }
  if (field.type === 'code') {
    return <CodeField value={_value} language={field.language} onValidate={field.onValidate} onChange={_onChange} />;
  }
  if (field.type === 'page') {
    return <Page value={_value} label={field.label} muiltiSelect={false} onChange={_onChange} />;
  }
  if (field.type === 'pages') {
    return <Page value={_value} label={field.label} muiltiSelect={true} onChange={_onChange} />;
  }
  if (field.type === 'entity') {
    return <Entity options={field.options as HassEntity[]} value={_value} onChange={_onChange} />;
  }
  if (field.type === 'service') {
    return <Service value={_value} onChange={_onChange} />;
  }
  if (field.type === 'slider') {
    return <Slider value={_value} min={field.min} max={field.max} step={field.step} onChange={_onChange} />;
  }
  if (field.type === 'text') {
    return (
      <InputField
        value={_value || ''}
        onChange={e => _onChange(e.target.value)}
        readOnly={field.readOnly}
        name={field.name}
        id={field.id}
      />
    );
  }
  if (field.type === 'number') {
    return (
      <CustomNumberField
        value={_value}
        onChange={_onChange}
        min={field.min}
        max={field.max}
        step={field.step}
        readOnly={field.readOnly}
        name={field.name}
        id={field.id}
      />
    );
  }

  if (field.type === 'select') {
    return (
      <CustomSelectField
        value={field.options.find(option => option.value === _value)}
        options={[...field.options]}
        getOptionLabel={option => option?.label ?? '-'}
        onChange={e => {
          const selectedValue = e.target.value as { value: string; label: string } | null;
          // Find the original option to get the correct typed value
          const selectedOption = field.options.find(option => option.value === selectedValue?.value);
          if (selectedOption) {
            _onChange(selectedOption.value);
          }
        }}
        size='small'
        name={field.name}
        id={field.id}
        readOnly={field.readOnly}
      />
    );
  }
  if (field.type === 'radio') {
    return (
      <CustomRadioField
        value={_value}
        options={[...field.options]}
        onChange={_onChange}
        orientation='horizontal'
        name={field.name}
        id={field.id}
        readOnly={field.readOnly}
      />
    );
  }
  if (field.type === 'textarea') {
    return (
      <AutoField
        field={{
          type: field.type,
          label: field.label ?? 'Unknown',
          name,
          id: field.id,
          readOnly: field.readOnly,
          default: field.default,
        }}
        onChange={_onChange}
        value={_value}
      />
    );
  }
  if (field.type === 'object') {
    return (
      <AutoField
        field={{
          type: field.type,
          label: field.label ?? 'Unknown',
          objectFields: field.objectFields,
          name,
          id: field.id,
          readOnly: field.readOnly,
        }}
        onChange={_onChange}
        value={_value}
      />
    );
  }
  if (field.type === 'array') {
    return (
      <AutoField
        field={{
          type: field.type,
          label: field.label ?? 'Unknown',
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
          readOnly: field.readOnly,
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

  return <StyledAlert severity='error'>Unsupported field type: &quot;{field.type}&quot;</StyledAlert>;
}

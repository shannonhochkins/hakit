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
import styled from '@emotion/styled';
import { SwitchField } from '@components/Form/Field/Switch';
import { validateString, validateNumber, validateBoolean } from './valueValidation';
import type { HassEntity } from 'home-assistant-js-websocket';
import type { DashboardPageWithoutData } from '@typings/hono';
import type { EntityName } from '@hakit/core';

const StyledAlert = styled(Alert)`
  margin: 0;
`;

type CommonBaseProps = {
  name: string;
  icon?: React.ReactNode;
  id: string;
  children?: React.ReactNode;
};

type CAFImage = CommonBaseProps & {
  field: FieldConfiguration[string] & { type: 'imageUpload' };
  value?: string;
  onChange: (value: string) => void;
};

type CAFColor = CommonBaseProps & {
  field: FieldConfiguration[string] & { type: 'color' };
  value?: string;
  onChange: (value: string) => void;
};

type CAFCode = CommonBaseProps & {
  field: FieldConfiguration[string] & { type: 'code' };
  value?: string;
  onChange: (value: string) => void;
};

type CAFText = CommonBaseProps & {
  field: FieldConfiguration[string] & { type: 'text' | 'textarea' };
  value?: string;
  onChange: (value: string) => void;
};

type CAFService = CommonBaseProps & {
  field: FieldConfiguration[string] & { type: 'service' };
  value?: string;
  onChange: (value: string) => void;
};

type CAFSlider = CommonBaseProps & {
  field: FieldConfiguration[string] & { type: 'slider' };
  value?: number;
  onChange: (value: number) => void;
};

type CAFNumber = CommonBaseProps & {
  field: FieldConfiguration[string] & { type: 'number' };
  value?: number;
  onChange: (value: number) => void;
};

type CAFSelect = CommonBaseProps & {
  field: FieldConfiguration[string] & { type: 'select' };
  value?: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
};

type CAFRadio = CommonBaseProps & {
  field: FieldConfiguration[string] & { type: 'radio' };
  value?: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
};

type CAFSwitch = CommonBaseProps & {
  field: FieldConfiguration[string] & { type: 'switch' };
  value?: boolean;
  onChange: (value: boolean) => void;
};

type CAFPage = CommonBaseProps & {
  field: FieldConfiguration[string] & { type: 'page' };
  value?: DashboardPageWithoutData;
  onChange: (value: DashboardPageWithoutData) => void;
};

type CAFPages = CommonBaseProps & {
  field: FieldConfiguration[string] & { type: 'pages' };
  value?: DashboardPageWithoutData[];
  onChange: (value: DashboardPageWithoutData[]) => void;
};

type CAFEntity = CommonBaseProps & {
  field: FieldConfiguration[string] & { type: 'entity' };
  value?: EntityName;
  onChange: (value: EntityName, entity: HassEntity) => void;
};

type CAFHidden = CommonBaseProps & {
  field: FieldConfiguration[string] & { type: 'hidden' };
  value?: unknown;
  onChange: (value: never) => void;
};

type CAFObject = CommonBaseProps & {
  field: FieldConfiguration[string] & { type: 'object' };
  value: DefaultComponentProps;
  onChange: (value: DefaultComponentProps, uiState?: unknown) => void;
};

type CAFArray = CommonBaseProps & {
  field: FieldConfiguration[string] & { type: 'array' };
  value: DefaultComponentProps[];
  onChange: (value: DefaultComponentProps[], uiState?: unknown) => void;
};

type CAFCustom = CommonBaseProps & {
  field: FieldConfiguration[string] & { type: 'custom'; render: any };
  value: unknown;
  onChange: (value: unknown) => void;
};

type CustomAutoFieldProps =
  | CAFImage
  | CAFColor
  | CAFCode
  | CAFText
  | CAFService
  | CAFSlider
  | CAFNumber
  | CAFSelect
  | CAFRadio
  | CAFSwitch
  | CAFPage
  | CAFPages
  | CAFEntity
  | CAFHidden
  | CAFObject
  | CAFArray
  | CAFCustom;

export function CustomAutoField(props: CustomAutoFieldProps) {
  const { field, name, value, onChange, icon, id: _id, children } = props as CustomAutoFieldProps;
  const _value = value;
  const [, id] = _id.replace(/[_ .]/g, '').split('»');

  if (field.type === 'hidden') {
    return <input type='hidden' value={(typeof _value === 'string' ? _value : '') as string} />;
  }

  const { description } = field;
  if (field.type === 'custom') {
    return field.render({
      field: {
        type: 'custom',
        render: (field as CAFCustom['field']).render,
      },
      name,
      id: id,
      value: _value,
      onChange,
    });
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
        value={validateString(_value) ?? ''}
        onChange={onChange}
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
        value={_value as string | undefined}
        onChange={onChange as CAFColor['onChange']}
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
        value={validateString(_value) ?? ''}
        language={field.language}
        onValidate={field.onValidate}
        onChange={onChange as CAFCode['onChange']}
      />
    );
  }
  if (field.type === 'page') {
    return (
      <PageField
        value={_value as DashboardPageWithoutData | undefined}
        label={field.label ?? 'Page'}
        icon={icon}
        muiltiSelect={false}
        onChange={onChange as CAFPage['onChange']}
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
        value={_value as DashboardPageWithoutData[] | undefined}
        label={field.label ?? 'Pages'}
        icon={icon}
        muiltiSelect={true}
        onChange={onChange as CAFPages['onChange']}
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
        value={_value as EntityName | undefined}
        label={field.label ?? 'Unknown'}
        icon={icon}
        onChange={onChange as CAFEntity['onChange']}
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
        onChange={onChange as CAFService['onChange']}
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
        onChange={onChange as CAFSlider['onChange']}
      />
    );
  }
  if (field.type === 'text') {
    return (
      <InputField
        label={field.label ?? 'Text'}
        icon={icon}
        readOnly={field.readOnly}
        value={validateString(_value)}
        onChange={e => (onChange as CAFText['onChange'])(e.target.value)}
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
        value={validateNumber(_value)}
        onChange={e => (onChange as CAFNumber['onChange'])(Number(e.target.value))}
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
            (onChange as CAFSelect['onChange'])(selectedOption.value);
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
            (onChange as CAFRadio['onChange'])(e);
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
        checked={validateBoolean(_value) ?? false}
        name={name}
        label={field.label ?? 'Switch'}
        icon={icon}
        readOnly={field.readOnly}
        helperText={description}
        id={id}
        onChange={e => {
          const checked = (e.target as HTMLInputElement).checked;
          (onChange as CAFSwitch['onChange'])(checked);
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
        value={validateString(_value)}
        onChange={e => (onChange as CAFText['onChange'])(e.target.value)}
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
        onChange={onChange}
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
        onChange={onChange}
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
  return <StyledAlert severity='error'>Unsupported field type: &quot;{(field as { type?: string }).type ?? 'unknown'}&quot;</StyledAlert>;
}

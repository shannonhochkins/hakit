import React, { useMemo, useEffect } from 'react';
import { computeDomain, EntityName } from '@hakit/core';
import { Row, Column } from '@components/Layout';
import { useGlobalStore } from '@hooks/useGlobalStore';
import { getDefaultServiceByEntity } from '@helpers/editor/services';
import { AutocompleteField } from '../Autocomplete';
import { createUsePuck } from '@measured/puck';

const usePuck = createUsePuck();

interface Option {
  value: string;
  label?: string;
  description?: string;
}

const Label = (props: React.HTMLAttributes<HTMLDivElement>) => <div {...props} style={{ fontSize: '0.9rem', whiteSpace: 'nowrap' }} />;
const Value = (props: React.HTMLAttributes<HTMLSpanElement>) => (
  <span {...props} style={{ fontSize: '0.8rem', opacity: 0.7, whiteSpace: 'nowrap' }} />
);

function RenderOption({ option, ...props }: { option: Option }) {
  return (
    <li {...props}>
      <Row fullWidth justifyContent='flex-start' wrap='nowrap' gap='1rem'>
        <Column fullWidth alignItems='flex-start'>
          <Label>{option.label}</Label>
          <Value>{option.description}</Value>
        </Column>
      </Row>
    </li>
  );
}

interface ServiceFieldProps {
  id: string;
  name: string;
  value?: string;
  readOnly?: boolean;
  label?: React.ReactNode;
  onChange: (value: string) => void;
  helperText?: string;
  icon?: React.ReactNode;
}

export function ServiceField({ id, name, value, onChange, readOnly, helperText, label, icon }: ServiceFieldProps) {
  const selectedItem = usePuck(c => c.selectedItem);
  const valueFromSelected = selectedItem?.props?.options?.entity;
  const entity = valueFromSelected || 'sun.sun';
  const services = useGlobalStore(store => store.services);
  const defaultService = getDefaultServiceByEntity(entity, services);

  const serviceOptions = useMemo(() => {
    if (!services) {
      return [];
    }
    const domain = computeDomain(entity as EntityName);
    const domainServices = services[domain];
    if (!domainServices) {
      return [];
    }

    return Object.entries(domainServices).map(([service, value]) => ({
      value: `${service}`,
      description: value.description,
      label: value.name,
    }));
  }, [services, entity]);

  const matchedValue = useMemo(() => {
    return serviceOptions.find(option => option.value === value);
  }, [serviceOptions, value]);

  useEffect(() => {
    const hasNoValue = !value;
    const valueNotInOptions = !serviceOptions.find(option => option.value === value);
    if ((valueNotInOptions || hasNoValue) && defaultService) {
      onChange(defaultService);
    }
  }, [value, defaultService, serviceOptions, onChange]);

  if (!valueFromSelected) {
    return <p>No entity found for the selected component, entity must be a field under the `options` object</p>;
  }

  return (
    <AutocompleteField<Option>
      id={id}
      name={name}
      readOnly={readOnly}
      icon={icon}
      label={label}
      placeholder='Select a service...'
      options={serviceOptions}
      value={matchedValue}
      onChange={opt => {
        if (opt?.value) onChange(opt.value);
      }}
      renderValue={opt => `${opt.label ?? opt.value}`}
      renderOption={opt => <RenderOption option={opt} />}
      isOptionEqualToValue={(opt, selected) => opt.value === (selected as Option).value}
      error={!matchedValue}
      helperText={!matchedValue ? 'No services found for the selected entity' : helperText}
    />
  );
}

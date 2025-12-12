import React, { useMemo, useEffect } from 'react';
import { DomainService, SnakeOrCamelDomains, useIcon, useIconByDomain, useHass } from '@hakit/core';
import { useGlobalStore } from '@hooks/useGlobalStore';
import { getDefaultServiceByDomain } from '@helpers/editor/services';
import { AutocompleteField } from '../Autocomplete';
import { toSnakeCase } from '@helpers/string/toSnakeCase';
import { getServices as _getServices } from 'home-assistant-js-websocket';
import styles from './ServiceField.module.css';

interface Option {
  value: string;
  label?: string;
  description?: string;
}

function ServiceRenderOption({ option, domain }: { option: Option; domain: SnakeOrCamelDomains }) {
  const domainIcon = useIconByDomain(domain);
  const icon = useIcon(domainIcon?.props?.icon ?? 'mdi:info', {
    style: {
      fontSize: '24px',
      display: 'flex',
      flexShrink: 0,
      width: '24px',
    },
  });

  return (
    <div className={styles.optionRow}>
      <div className={styles.icon}>{icon}</div>
      <div className={styles.details}>
        <div className={styles.name}>{option.label}</div>
        <span className={styles.id}>{option.description}</span>
      </div>
    </div>
  );
}

export interface ServiceFieldProps<T extends SnakeOrCamelDomains> {
  id: string;
  domain: T;
  name: string;
  value?: DomainService<T>;
  readOnly?: boolean;
  label?: React.ReactNode;
  onChange: (value: DomainService<T>) => void;
  helperText?: string;
  icon?: React.ReactNode;
}
export function ServiceField<T extends SnakeOrCamelDomains>({
  id,
  domain,
  name,
  value,
  onChange,
  readOnly,
  helperText,
  label,
  icon,
}: ServiceFieldProps<T>) {
  const services = useGlobalStore(store => store.services);
  const defaultService = getDefaultServiceByDomain(domain, services);
  const serviceOptions = useMemo(() => {
    if (!services) {
      return [];
    }
    const snakeDomain = toSnakeCase(domain);
    const domainServices = services[snakeDomain];
    if (!domainServices) {
      return [];
    }

    return Object.entries(domainServices).map(([service, value]) => ({
      value: `${service}`,
      description: value.description,
      label: value.name,
    }));
  }, [services, domain]);

  useEffect(() => {
    if (services === null) {
      const connection = useHass.getState().connection;
      if (connection) {
        _getServices(connection).then(services => {
          useGlobalStore.getState().setServices(services ?? []);
        });
      }
    }
  }, [services]);

  const matchedValue = useMemo(() => {
    return serviceOptions.find(option => option.value === value);
  }, [serviceOptions, value]);

  useEffect(() => {
    const hasNoValue = !value;
    const valueNotInOptions = !serviceOptions.find(option => option.value === value);
    if ((valueNotInOptions || hasNoValue) && defaultService) {
      onChange(defaultService as DomainService<T>);
    }
  }, [value, defaultService, serviceOptions, onChange]);

  if (!domain) {
    return <p>No domain found for the selected component, domain must be a field under the `options` object</p>;
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
        if (opt?.value) onChange(opt.value as DomainService<T>);
      }}
      listItemSize={48}
      renderValue={opt => `${opt.label ?? opt.value}`}
      renderOption={opt => <ServiceRenderOption option={opt} domain={domain} />}
      isOptionEqualToValue={(opt, selected) => opt.value === (selected as Option).value}
      error={!matchedValue}
      helperText={!matchedValue ? `No services found for under the domain "${domain}"` : helperText}
    />
  );
}

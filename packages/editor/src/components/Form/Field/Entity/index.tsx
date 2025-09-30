import { useMemo } from 'react';
import { Row, Column } from '@hakit/components';
import { useIcon, useIconByDomain, computeDomain, type EntityName, useHass } from '@hakit/core';
import { AutocompleteField } from '../Autocomplete';
import { HassEntity } from 'home-assistant-js-websocket';

interface EntityOption {
  entity_id: string;
  attributes: {
    friendly_name?: string;
    icon?: string;
  };
}

function EntityRenderOption({ option }: { option: EntityOption }) {
  const domainIcon = useIconByDomain(computeDomain(option.entity_id as EntityName));
  const icon = useIcon(option.attributes.icon ?? domainIcon?.props?.icon ?? 'mdi:info', {
    style: {
      fontSize: '24px',
      display: 'flex',
      flexShrink: 0,
      width: '24px',
    },
  });

  return (
    <Row fullWidth justifyContent='flex-start' wrap='nowrap' gap='1rem'>
      {icon}
      <Column fullWidth alignItems='flex-start'>
        <div style={{ fontSize: '0.9rem', whiteSpace: 'nowrap' }}>{option.attributes.friendly_name || option.entity_id}</div>
        <span style={{ fontSize: '0.8rem', opacity: 0.7, whiteSpace: 'nowrap' }}>{option.entity_id}</span>
      </Column>
    </Row>
  );
}

interface EntityProps {
  value: EntityName;
  id: string;
  label?: React.ReactNode;
  name: string;
  icon?: React.ReactNode;
  options: HassEntity[];
  onChange: (value: EntityName, entity: HassEntity) => void;
  readOnly?: boolean;
  helperText?: string;
}

export function Entity({ value, onChange, id, name, options, readOnly, helperText, label, icon }: EntityProps) {
  const { getAllEntities } = useHass();

  // Get entities once and memoize to prevent re-renders
  const entities = useMemo(() => getAllEntities(), [getAllEntities]);

  const matchedValue = useMemo(() => {
    return options.find(option => option.entity_id === value);
  }, [options, value]);

  return (
    <AutocompleteField<EntityOption>
      id={id}
      name={name}
      icon={icon}
      readOnly={readOnly}
      error={!matchedValue}
      helperText={helperText}
      label={label}
      placeholder='Select an entity...'
      options={options}
      value={matchedValue}
      onChange={entity => entity && onChange(entity.entity_id as EntityName, entities[entity.entity_id])}
      renderValue={option => option.attributes.friendly_name || option.entity_id}
      renderOption={option => <EntityRenderOption option={option} />}
      isOptionEqualToValue={(option, selectedValue) => option.entity_id === selectedValue.entity_id}
    />
  );
}

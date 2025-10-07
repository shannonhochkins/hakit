import { useMemo } from 'react';
import { useIcon, useIconByDomain, computeDomain, type EntityName, useHass } from '@hakit/core';
import { AutocompleteField } from '../Autocomplete';
import { HassEntity } from 'home-assistant-js-websocket';
import styles from './EntityField.module.css';

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
    <div className={styles.optionRow}>
      <div className={styles.icon}>{icon}</div>
      <div className={styles.details}>
        <div className={styles.name}>{option.attributes.friendly_name || option.entity_id}</div>
        <span className={styles.id}>{option.entity_id}</span>
      </div>
    </div>
  );
}

interface EntityProps {
  value?: EntityName;
  id: string;
  label?: React.ReactNode;
  name: string;
  icon?: React.ReactNode;
  filterOptions?: (entities: HassEntity[]) => HassEntity[];
  onChange: (value: EntityName, entity: HassEntity) => void;
  readOnly?: boolean;
  helperText?: string;
}

export function Entity({ value, onChange, id, name, filterOptions, readOnly, helperText, label, icon }: EntityProps) {
  const { getAllEntities } = useHass();

  // Get entities once and memoize to prevent re-renders
  const entities = useMemo(() => getAllEntities(), [getAllEntities]);

  const options = useMemo(
    () => (filterOptions ? filterOptions(Object.values(entities)) : Object.values(entities)),
    [filterOptions, entities]
  );

  const hasValue = useMemo(() => (value?.trim() ?? '').length > 0, [value]);

  const matchedValue = useMemo(() => {
    return hasValue ? options.find(option => option.entity_id === value) : undefined;
  }, [options, value, hasValue]);

  return (
    <AutocompleteField<EntityOption>
      id={id}
      name={name}
      icon={icon}
      readOnly={readOnly}
      listItemSize={48}
      error={!matchedValue && hasValue}
      helperText={!matchedValue && hasValue ? `Entity "${value}" not found` : helperText}
      label={label}
      placeholder={'Select an entity...'}
      options={options}
      value={matchedValue}
      onChange={entity => entity && onChange(entity.entity_id as EntityName, entities[entity.entity_id])}
      renderValue={option => option.attributes.friendly_name || option.entity_id}
      renderOption={option => <EntityRenderOption option={option} />}
      isOptionEqualToValue={(option, selectedValue) => option.entity_id === selectedValue.entity_id}
    />
  );
}

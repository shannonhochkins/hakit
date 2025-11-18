import { useMemo, useEffect, useRef, useState } from 'react';
import { useIcon, useIconByDomain, computeDomain, type EntityName, useHass, getEntities, EntityListInfo } from '@hakit/core';
import { AutocompleteField } from '../Autocomplete';
import { HassEntity } from 'home-assistant-js-websocket';
import styles from './EntityField.module.css';

function EntityRenderOption({ option, showEntityIdPicker }: { option: EntityListInfo; showEntityIdPicker: boolean }) {
  const domainIcon = useIconByDomain(computeDomain(option.stateObj?.entity_id as EntityName));
  const icon = useIcon(option.stateObj?.attributes.icon ?? domainIcon?.props?.icon ?? 'mdi:info');

  return (
    <div className={styles.optionRow}>
      <div className={styles.icon}>{icon}</div>
      <div
        className={styles.details}
        style={{
          // Adjust width to account for icon and padding, and the gap between icon and text
          width: `calc(100% - var(--entity-field-icon-size) - var(--space-4))`,
        }}
      >
        <div className={styles.name}>{option.primary}</div>
        {showEntityIdPicker
          ? option.stateObj?.entity_id && (
              <span className={styles.labels}>
                {option.domain_name ? `${option.domain_name} ▸ ` : ''}
                {option.stateObj.entity_id}
              </span>
            )
          : option.secondary && (
              <span className={styles.labels}>
                {option.domain_name ? `${option.domain_name} ▸ ` : ''}
                {option.secondary}
              </span>
            )}
        {!showEntityIdPicker && !option.secondary && option.domain_name && <span className={styles.labels}>{option.domain_name}</span>}
      </div>
    </div>
  );
}

export interface EntityFieldProps {
  value?: EntityName;
  id: string;
  label?: React.ReactNode;
  name: string;
  icon?: React.ReactNode;
  filterOption?: (entity: HassEntity) => boolean;
  onChange: (value: EntityName, entity: HassEntity) => void;
  readOnly?: boolean;
  helperText?: string;
  includeDomains?: string[];
  excludeDomains?: string[];
}

const SEARCH_KEYS = ['search_labels'] as const;

export function EntityField({
  value,
  onChange,
  id,
  name,
  filterOption,
  readOnly,
  helperText,
  label,
  icon,
  includeDomains,
  excludeDomains,
}: EntityFieldProps) {
  const areas = useHass(s => s.areas);
  const floors = useHass(s => s.floors);
  const devices = useHass(s => s.devices);
  const entityRegistryDisplayEntries = useHass(s => s.entitiesRegistryDisplay);
  const entities = useHass(s => s.entities);
  const connection = useHass(s => s.connection);
  const userPrefsRequestedRef = useRef(false);
  const [showEntityIdPicker, setShowEntityIdPicker] = useState(false);

  // Fetch user display preferences once when connection becomes available.
  useEffect(() => {
    if (!connection || userPrefsRequestedRef.current) return;
    userPrefsRequestedRef.current = true;
    connection
      .sendMessagePromise<{ value?: { showAdvanced?: boolean; showEntityIdPicker?: boolean; show_entity_id_in_entity_picker?: boolean } }>({
        type: 'frontend/get_user_data',
        key: 'core',
      })
      .then(r => {
        const v = r?.value;
        const flag = v?.showEntityIdPicker ?? v?.show_entity_id_in_entity_picker;
        if (typeof flag === 'boolean') setShowEntityIdPicker(flag);
      })
      .catch(() => {
        // allow retry if it fails for transient reasons
        userPrefsRequestedRef.current = false;
      });
  }, [connection]);
  // really need to convert this method to use destructured params
  const options = getEntities(
    entities,
    entityRegistryDisplayEntries,
    devices,
    areas,
    floors,
    includeDomains,
    excludeDomains,
    filterOption,
    undefined,
    undefined,
    undefined,
    undefined,
    value
  );

  const hasValue = useMemo(() => (value?.trim() ?? '').length > 0, [value]);

  const matchedValue = useMemo(() => {
    return hasValue ? options.find(option => option.stateObj?.entity_id === value) : undefined;
  }, [options, value, hasValue]);

  return (
    <AutocompleteField
      id={id}
      name={name}
      icon={icon}
      searchKeys={SEARCH_KEYS}
      readOnly={readOnly}
      listItemSize={58}
      error={!matchedValue && hasValue}
      helperText={!matchedValue && hasValue ? `Entity "${value}" not found` : helperText}
      label={label}
      placeholder={'Select an entity...'}
      options={options}
      value={matchedValue}
      onChange={entity => entity && onChange(entity.stateObj?.entity_id as EntityName, entities[entity.stateObj?.entity_id as EntityName])}
      renderValue={option => option.primary}
      renderOption={option => <EntityRenderOption option={option} showEntityIdPicker={showEntityIdPicker} />}
      isOptionEqualToValue={(option, selectedValue) => option.stateObj?.entity_id === selectedValue.stateObj?.entity_id}
    />
  );
}

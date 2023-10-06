import { useHass, computeDomain, EntityName } from '@hakit/core';
import { useState, useEffect } from 'react';
import { Autocomplete } from '@mui/material';
import TextField from '@mui/material/TextField';
import styled from '@emotion/styled';
import { Row, Column } from '@hakit/components';
import { HassEntity, HassServices } from 'home-assistant-js-websocket';

interface Option {
  value: string;
  label: string;
  description?: string;
}
interface ServiceAutocompleteProps {
  onChange: (value: string | null) => void;
  value?: HassEntity['entity_id'] | null;
  disabled?: boolean;
  entity: HassEntity | null;
}

const Title = styled.div`
  font-size: 0.9rem;
  color: var(--ha-S100-contrast);
`;
const Description = styled.span`
  font-size: 0.8rem;
  color: var(--ha-S400-contrast);
`;

export const ServiceAutocomplete: React.FC<ServiceAutocompleteProps> = ({ onChange, entity, disabled, value }) => {
  const { getServices } = useHass();
  const [services, setServices] = useState<HassServices | null>(null);
  const domain = computeDomain((entity?.entity_id ?? '') as EntityName);
  useEffect(() => {
    void(async function fetchData() {
      const services = await getServices();
      // purposely casting the type here. We know that the keys of services are the same as SupportedServices
      setServices(services);
    })();
  }, [getServices]);
  const domainServices = services ? services[domain] ?? {} : {};
  const options: Option[] = Object.entries(domainServices).map(([key, value]) => ({
    description: value.description ?? 'unknown',
    label: value.name ?? 'unknown',
    value: key,
  }));
  if (options.length === 0) return null;
  return (
    <Autocomplete
      options={options}
      style={{
        width: '100%',
      }}
      value={options.find(option => option.value === value) ?? null}
      disabled={disabled}
      placeholder="Service"
      onChange={(event, newValue) => onChange(newValue ? newValue.value : null)}
      getOptionLabel={(option) => `${option.label} (${option.value})`}
      renderOption={(props, option, state) => {
        const isEven = state.index % 2 === 0;
        const backgroundColor = isEven ? 'var(--ha-S300)' : 'var(--ha-S400)';
        return (
          <li {...props} style={{
            backgroundColor
          }}>
            <Row fullWidth justifyContent="flex-start" wrap="nowrap">
              <Column fullWidth alignItems="flex-start">
                <Title>{option.label}</Title>
                <Description>{option.description}</Description>
              </Column>
            </Row>
          </li>
        )
      }}
      renderInput={(params) => <TextField label="Service" {...params} />}
    />
  );
};

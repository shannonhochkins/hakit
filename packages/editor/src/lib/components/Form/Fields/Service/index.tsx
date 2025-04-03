import React, { isValidElement, Children, useMemo, useContext, useRef, useEffect, forwardRef } from 'react';
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
import Popper from '@mui/material/Popper';
import styled from '@emotion/styled';
import TextField from '@mui/material/TextField';
import { VariableSizeList, ListChildComponentProps } from 'react-window';
import { computeDomain, EntityName } from '@hakit/core';
import { Row, Column } from '@hakit/components';
import { useGlobalStore } from '@lib/hooks/useGlobalStore';
import { usePuckSelectedItem } from '@lib/hooks/usePuckSelectedItem';
import { getDefaultServiceByEntity } from '@lib/helpers/services';

const StyledTextField = styled(TextField)`
  &:focus-visible {
    outline: 2px solid var(--puck-color-azure-05);
    outline-offset: 2px;
  }
  .MuiInputBase-root {
    padding-top: 2px;
    padding-bottom: 2px;
    background-color: var(--puck-color-grey-12);
    border-color: var(--puck-color-grey-09);
    color: var(--puck-color-grey-02);

    &.Mui-focused fieldset {
      border-color: var(--puck-color-azure-05);
    }
    input.MuiInputBase-input {
    }
    .MuiAutocomplete-endAdornment button {
      color: var(--puck-color-grey-02);
      padding: 0;
      margin-right: -4px;
      .MuiSvgIcon-root {
        font-size: 1.7rem;
      }
    }
  }
`;

const StyledPopper = styled(Popper)({
  [`& .${autocompleteClasses.listbox}`]: {
    boxSizing: 'border-box',
    backgroundColor: 'var(--puck-color-grey-12)',
    color: 'var(--puck-color-grey-03)',
    '& ul': {
      padding: 0,
      margin: 0,
    },
  },
});

const RowElement = styled.div`
  &.even li:not([aria-selected='true']) {
    background-color: var(--puck-color-grey-12);
  }
  &.odd li:not([aria-selected='true']) {
    background-color: var(--puck-color-grey-10);
  }
  li[aria-selected='true'] {
    background-color: var(--puck-color-azure-09) !important;
    color: var(--puck-color-grey-01);
  }
  &:hover li {
    background-color: var(--puck-color-grey-05);
    color: var(--puck-color-grey-02);
  }
`;

interface Option {
  value: string;
  label?: string;
  description?: string;
}

const LISTBOX_PADDING = 8;
const ITEM_SIZE = 52;

function renderRow(props: ListChildComponentProps) {
  const { data, index, style } = props;
  const dataSet = data[index];
  const isEven = index % 2 === 0;
  const inlineStyle = {
    ...style,
    top: (style.top as number) + LISTBOX_PADDING,
  };
  return (
    <RowElement key={dataSet.key} style={inlineStyle} className={isEven ? 'even' : 'odd'}>
      {dataSet}
    </RowElement>
  );
}

const OuterElementContext = React.createContext({});

const OuterElementType = forwardRef<HTMLDivElement>((props, ref) => {
  const outerProps = useContext(OuterElementContext);
  return <div ref={ref} {...props} {...outerProps} />;
});

OuterElementType.displayName = 'OuterElementType';

function useResetCache(data: unknown) {
  const ref = useRef<VariableSizeList>(null);
  useEffect(() => {
    if (ref.current != null) {
      ref.current.resetAfterIndex(0, true);
    }
  }, [data]);
  return ref;
}

// Adapter for react-window
const ListboxComponent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLElement>>(function ListboxComponent(props, ref) {
  const { children, ...other } = props;
  const itemData: React.ReactNode[] = [];
  Children.forEach(children, child => {
    if (isValidElement(child)) {
      itemData.push(child);
    }
  });
  const itemCount = itemData.length;

  const gridRef = useResetCache(itemCount);

  const getHeight = () => {
    if (itemCount > 8) {
      return 8 * ITEM_SIZE;
    }
    return itemData.map(() => ITEM_SIZE).reduce((a, b) => a + b, 0);
  };

  return (
    <div ref={ref}>
      <OuterElementContext.Provider value={other}>
        <VariableSizeList
          itemData={itemData}
          height={getHeight() + 2 * LISTBOX_PADDING}
          width='100%'
          ref={gridRef}
          outerElementType={OuterElementType}
          innerElementType='ul'
          itemSize={() => ITEM_SIZE}
          itemCount={itemCount}
          overscanCount={5}
        >
          {renderRow}
        </VariableSizeList>
      </OuterElementContext.Provider>
    </div>
  );
});

const Label = styled.div`
  font-size: 0.9rem;
  white-space: nowrap;
`;
const Value = styled.span`
  font-size: 0.8rem;
  opacity: 0.7;
  white-space: nowrap;
`;

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

interface ServiceProps {
  value?: string;
  onChange: (value: string) => void;
}

export function Service({ value, onChange }: ServiceProps) {
  const selectedItem = usePuckSelectedItem<{
    options?: {
      entity?: string;
    };
  }>(true);
  const valueFromSelected = selectedItem?.props.options?.entity;
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
      value: service,
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

  if (!value || !matchedValue) {
    return <p>No services found for the selected entity</p>;
  }

  return (
    <Autocomplete
      disablePortal
      options={serviceOptions}
      disableListWrap
      value={matchedValue}
      getOptionLabel={option => `${option.label} (${option.value})`}
      renderInput={params => <StyledTextField variant='outlined' {...params} />}
      renderOption={({ key, ...props }, option) => <RenderOption key={key} {...props} option={option} />}
      slots={{
        popper: StyledPopper,
      }}
      slotProps={{
        listbox: {
          component: ListboxComponent,
        },
      }}
      onChange={(_event, value) => {
        if (value?.value) {
          onChange(value.value);
        }
      }}
    />
  );
}

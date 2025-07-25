import React, { isValidElement, Children, useMemo, useContext, useRef, useEffect, forwardRef } from 'react';
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
import Popper from '@mui/material/Popper';
import styled from '@emotion/styled';
import TextField from '@mui/material/TextField';
import { VariableSizeList, ListChildComponentProps } from 'react-window';
import { useIcon, useIconByDomain, computeDomain, type EntityName } from '@hakit/core';
import { Row, Column } from '@hakit/components';
import { HassEntity } from 'home-assistant-js-websocket';

const StyledTextField = styled(TextField)`
  &:focus-visible {
    outline: 2px solid var(--color-secondary-400);
    outline-offset: 2px;
  }
  .MuiInputBase-root {
    padding-top: 2px;
    padding-bottom: 2px;
    background-color: var(--color-gray-950);
    border-color: var(--color-gray-800);
    color: var(--color-gray-100);

    &.Mui-focused fieldset {
      border-color: var(--color-secondary-400);
    }
    input.MuiInputBase-input {
    }
    .MuiAutocomplete-endAdornment button {
      color: var(--color-gray-100);
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
    backgroundColor: 'var(--color-gray-950)',
    color: 'var(--color-gray-200)',
    '& ul': {
      padding: 0,
      margin: 0,
    },
  },
});

const RowElement = styled.div`
  &.even li:not([aria-selected='true']) {
    background-color: var(--color-gray-950);
  }
  &.odd li:not([aria-selected='true']) {
    background-color: var(--color-gray-900);
  }
  li[aria-selected='true'] {
    background-color: var(--color-secondary-800) !important;
    color: var(--color-gray-50);
  }
  &:hover li {
    background-color: var(--color-gray-400);
    color: var(--color-gray-100);
  }
`;

interface Option {
  value: string;
  label: string;
  icon?: string;
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
  const domainIcon = useIconByDomain(computeDomain(option.value as EntityName));
  const icon = useIcon(option.icon ?? domainIcon?.props?.icon ?? 'mdi:info', {
    style: {
      fontSize: '24px',
      display: 'flex',
      flexShrink: 0,
      width: '24px',
    },
  });

  return (
    <li {...props}>
      <Row fullWidth justifyContent='flex-start' wrap='nowrap' gap='1rem'>
        {icon}
        <Column fullWidth alignItems='flex-start'>
          <Label>{option.label}</Label>
          <Value>{option.value}</Value>
        </Column>
      </Row>
    </li>
  );
}

interface EntityProps {
  value: EntityName;
  options: HassEntity[];
  onChange: (value: EntityName) => void;
}

export function Entity({ value, options, onChange }: EntityProps) {

  // Transform the entities data into the format expected by the picker
  const entities = useMemo(() => {
    return options.map(entity => ({
      value: entity.entity_id as EntityName,
      icon: entity.attributes.icon,
      label: entity.attributes.friendly_name || entity.entity_id,
    }));
  }, [options]);

  const matchedValue = useMemo(() => {
    return entities.find(option => option.value === value);
  }, [entities, value]);

  if (!matchedValue) {
    return <p>Entity not found with value &quot;{value}&quot;</p>;
  }

  return (
    <Autocomplete
      disablePortal
      options={entities}
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

import { EntityName, computeDomain, useIconByDomain } from '@hakit/core';
import { Autocomplete, TextField } from '@mui/material';
import styled from '@emotion/styled';
import { Icon } from '@iconify/react';
import { Row, Column } from '@hakit/components';
import { HassEntity } from 'home-assistant-js-websocket';
import { VariableSizeList, ListChildComponentProps } from 'react-window';
import { forwardRef, cloneElement, isValidElement, useRef, useEffect, useContext, createContext, Children } from 'react';
import { Widget } from '@client/widgets/types';
import { useFilterEntities, useWidget } from '@client/hooks';
import { WidgetProps } from '@rjsf/utils';

interface Option {
  value: string;
  label: string;
  icon?: string;
}

const Title = styled.div`
  font-size: 0.9rem;
  color: var(--ha-S100-contrast);
`;
const Description = styled.span`
  font-size: 0.8rem;
  color: var(--ha-S400-contrast);
`;

const LISTBOX_PADDING = 8;
const ITEM_SIZE = 52;

const OuterElementContext = createContext({});

const OuterElementType = forwardRef<HTMLDivElement>((props, ref) => {
  const outerProps = useContext(OuterElementContext);
  return <div ref={ref} {...props} {...outerProps} />;
});

function useResetCache(data: any) {
  const ref = useRef<VariableSizeList>(null);
  useEffect(() => {
    if (ref.current != null) {
      ref.current.resetAfterIndex(0, true);
    }
  }, [data]);
  return ref;
}

function renderRow(props: ListChildComponentProps) {
  const { data, index, style } = props;
  const dataSet = data[index];
  const isEven = index % 2 === 0;
  const backgroundColor = isEven ? 'var(--ha-S300)' : 'var(--ha-S400)';
  const inlineStyle = {
    ...style,
    top: (style.top as number) + LISTBOX_PADDING,
    backgroundColor,
    color: `var(--ha-S50-contrast)`
  };
  return cloneElement(dataSet as React.ReactElement, {
    style: inlineStyle,
  });
}

const ListboxComponent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLElement>>(
  function ListboxComponent(props, ref) {
    const { children, ...other } = props;
    const itemData: React.ReactNode[] = [];
    Children.forEach(children, (child) => {
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
            width="100%"
            ref={gridRef}
            outerElementType={OuterElementType}
            innerElementType="ul"
            itemSize={() => ITEM_SIZE}
            itemCount={itemCount}
            overscanCount={5}
          >
            {renderRow}
          </VariableSizeList>
        </OuterElementContext.Provider>
      </div>
    );
  }
);

function RenderOption({
  option,
  ...props
}: {
  option: Option
}) {
  const domainIcon = useIconByDomain(computeDomain(option.value as EntityName));
  return (<li
    {...props}
  >
    <Row fullWidth justifyContent="flex-start" wrap="nowrap" gap="1rem">
      <Icon icon={option.icon ?? domainIcon.props.icon ?? 'mdi:info'} style={{
        fontSize: '24px'
      }} />
      <Column fullWidth alignItems="flex-start">
        <Title>{option.label}</Title>
        <Description>{option.value}</Description>
      </Column>
    </Row>
  </li>);
}

export function EntityAutocomplete({ onChange, disabled, value, formContext }: WidgetProps) {
  const filterEntities = useFilterEntities();
  const { formData } = formContext;
  const { widgetName } = formData;
  const getWidget = useWidget();
  const widgetDefinition = getWidget(widgetName);
  const entities = filterEntities(widgetDefinition);
  const options: Option[] = entities.map(item => ({
    value: item.entity_id,
    icon: item.attributes.icon,
    label: item.attributes.friendly_name ?? item.entity_id,
  }));
  const matchedValue = options.find((option) => option.value === value);
  return (
    <Autocomplete
      disabled={disabled}
      options={options}
      style={{ width: '100%' }}
      value={matchedValue}
      ListboxComponent={ListboxComponent as any}
      getOptionLabel={(option) => `${option.label} (${option.value})`}
      onChange={(_event, newValue) => {
        if (newValue) {
          onChange(newValue.value);
        }
      }}
      renderOption={(props, option) => <RenderOption {...props} option={option} />}
      renderInput={(params) => <TextField label="Entity" {...params} />}
    />
  );
}

import { Column } from '@hakit/components';
import { Tab as BaseTab, Tabs as BaseTabs } from '@mui/material';
import styled from '@emotion/styled';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return value === index ? (
    <Column
      fullWidth
      fullHeight
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      justifyContent="flex-start"
      style={{
        overflow: 'auto',
        backgroundColor: 'rgba(0,0,0,0.1)'
      }}
      {...other}
    >
      <Column fullHeight fullWidth justifyContent="flex-start" style={{
        padding: '1rem 1rem',
      }}>
        {children}
      </Column>
    </Column>
  ) : null;
}
export const Tabs = styled(BaseTabs)`
  width: 100%;
  .MuiTabs-indicator {
    background-color: var(--ha-A100);
  }
`;
export const Tab = styled(BaseTab)`
  background-color: var(--ha-S300);
  color: var(--ha-S300-contrast);
  &.Mui-selected {
    background-color: var(--ha-S400);
    color: var(--ha-A100);
  }
`;

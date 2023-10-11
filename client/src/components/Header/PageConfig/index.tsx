import { useState } from 'react';
import styled from '@emotion/styled';
import { useHakitStore, PageConfig as PageConfigType } from '@client/store';
import { Icon } from '@iconify/react';
import { Tooltip, Column, Modal, FabCard, Row, } from '@hakit/components';
import { useSaveConfiguration } from '@client/hooks';
import { Switch } from '@mui/material';
import { Tabs, Tab, TabPanel } from '@client/components/Shared/Tabs';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Theme } from '@rjsf/mui';
import getOptionsSchema from './optionsSchema';
import { withTheme } from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import { ThemeControls } from './ThemeControls';
const Form = withTheme(Theme);


// TODO - provide a switch from dark / light mode with @hakit mode
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

// const lightTheme = createTheme({
//   palette: {
//     mode: 'light',
//   },
// });

const Name = styled.div`
  font-size: 1rem;
  font-weight: bold;
`;
const Description = styled.div`
  color: var(--ha-S300-contrast);
`;
const ActionBar = styled.div`
  position: absolute;
  bottom: 1rem;
  right: 1rem;
`;

const BreakpointRow = styled(Row)`
  padding: 1rem;
  width: 100%;
  &.odd {
    background-color: var(--ha-S300);
  }
  &.even {
    background-color: var(--ha-S400);
  }
`;

const StyledModal = styled(Modal)`
  --ha-modal-width: 80vw;
  [class*="ModalInner"] {
    padding: 0;
    flex-direction: column;
  }
`;

const EditButton = styled(FabCard)`
  background-color: transparent;
  &:hover, &:active, &:focus {
    &:not(:disabled) {
      background-color: transparent;
    }
  }
`;

export function PageConfig() {
  const [open, setOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const setConfig = useHakitStore(({ setConfig }) => setConfig);
  const config = useHakitStore(({ config }) => config);
  const pages = useHakitStore(({ view }) => view?.pages ?? []);
  const [editingPage, setEditingPage] = useState<PageConfigType | null>(null);
  const setPages = useHakitStore(({ setPages }) => setPages);
  const editingPageIndex = pages.findIndex(bp => bp.id === editingPage?.id);
  const saveConfiguration = useSaveConfiguration();
  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };
  const minMaxWidth = typeof pages[editingPageIndex - 1] !== 'undefined' ? pages[editingPageIndex - 1].maxWidth + 1 : 0;
  const maxMaxWidth = typeof pages[editingPageIndex + 1] !== 'undefined' ? pages[editingPageIndex + 1].maxWidth - 1 : Infinity;
  const optionsSchema = getOptionsSchema({
    minMaxWidth,
    maxMaxWidth
  });
  return (<>
    <FabCard layoutId="page-config-editor" icon="mdi:cog" title="Settings" tooltipPlacement="left" onClick={() => {
      setOpen(true);
    }} />
    <StyledModal title="Dashboard Settings" id="page-config-editor" open={open} onClose={() => setOpen(false)}>
      <Tabs variant="fullWidth" value={selectedTab} onChange={handleChange}>
        <Tab label="Page Configuration" />
        <Tab label="Theme" />
      </Tabs>
      <TabPanel value={selectedTab} index={0}>
        <Column gap="1rem" alignItems="flex-start" justifyContent="space-between" wrap="nowrap" fullHeight fullWidth style={{
          padding: '1rem 0'
        }}>
          {editingPage !== null && <Column fullWidth style={{
              backgroundColor: 'var(--ha-S300)',
              padding: '1rem',
              borderRadius: '0.5rem'
            }} gap="1rem">
            <ThemeProvider theme={darkTheme}>
              <Form formData={Object.keys(optionsSchema.properties ?? {}).reduce((acc, key) => ({
                ...acc,
                [key]: editingPage[key as keyof PageConfigType]
              }), {})} validator={validator} schema={optionsSchema} onSubmit={(data) => {
                const newConfig = pages.map(bp => {
                  if (bp.id === editingPage.id) {
                    return {
                      ...editingPage,
                      ...data.formData,
                    };
                  }
                  return bp;
                });
                setPages(newConfig);
                setEditingPage(null);
                void saveConfiguration();
              }} />
            </ThemeProvider>
          </Column>}
          <Column alignItems="flex-start" justifyContent="flex-start" fullWidth>
          {pages.map((page, index) => (<BreakpointRow key={index} className={index % 2 === 0 ? 'even' : 'odd'} alignItems="center" justifyContent="space-between" wrap="nowrap">
            <Row justifyContent="flex-start" gap="1rem" wrap="nowrap" style={{
              width: '50%'
            }}>
              <Icon icon={page.icon} />
              <Name>{page.name}</Name>
            </Row>
            <Row fullWidth justifyContent="flex-start">
              <Description>
                {index === 0 && `between 0px and ${page.maxWidth}px`}
                {index !== 0 && index !== pages.length - 1 && `between ${pages[index - 1].maxWidth}px and ${page.maxWidth}px`}
                {index === pages.length - 1 && `greater than ${pages[index - 1].maxWidth}px`}
              </Description>
            </Row>
            <Row gap="1rem" wrap="nowrap">
              <EditButton disabled={!page.enabled} icon="mdi:edit" size={30} onClick={() => {
                setEditingPage(page);
              }} />
              <Tooltip title={index === pages.length - 1 ? 'The last breakpoint must always be enabled' : page.enabled ? 'Disable breakpoint' : 'Enable breakpoint'}>
                <Switch disabled={index === pages.length - 1} checked={page.enabled} onChange={() => {
                  setPages(pages.map(bp => {
                    if (bp.id === page.id) {
                      return {
                        ...bp,
                        enabled: !page.enabled
                      };
                    }
                    return bp;
                  }));
                }} />
              </Tooltip>
            </Row>
          </BreakpointRow>))}
          </Column>
        </Column>
      </TabPanel>
      <TabPanel value={selectedTab} index={1}>
        <ThemeControls {...config.theme} onChange={(theme) => {
          setConfig({
            ...config,
            theme,
          });
        }} />
      </TabPanel>
      <ActionBar>
        <Tooltip title="Save & Close" placement="left">
          <FabCard cssStyles={`
            button {
              background-color: var(--ha-A400);
              color: var(--ha-A400-contrast);
            }
          `} onClick={() => {
            void saveConfiguration();
            setOpen(false);
          }} size={48} icon="mdi:content-save-outline" />
        </Tooltip>
      </ActionBar>
    </StyledModal>
  </>);
}

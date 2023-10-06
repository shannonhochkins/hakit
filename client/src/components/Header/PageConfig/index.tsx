import { useState } from 'react';
import styled from '@emotion/styled';
import { useHakitStore, PageConfig as PageConfigType } from '@client/store';
import { Icon } from '@iconify/react';
import { Tooltip, Column, Modal, FabCard, Row } from '@hakit/components';
import { useSaveConfiguration } from '@client/hooks';
import { Switch, TextField, Button } from '@client/components/Shared';
import { Tabs, Tab, TabPanel } from '@client/components/Shared/Tabs';

const Name = styled.div`
  font-size: 1rem;
  font-weight: bold;
`;
const Description = styled.div`
  color: var(--ha-S300-contrast);
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
  const pages = useHakitStore(({ pages }) => pages);
  const [editingPage, setEditingPage] = useState<PageConfigType | null>(null);
  const setPages = useHakitStore(({ setPages }) => setPages);
  const editingPageIndex = pages.findIndex(bp => bp.id === editingPage?.id);
  const saveConfiguration = useSaveConfiguration();
  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };
  const minValue = typeof pages[editingPageIndex - 1] !== 'undefined' ? pages[editingPageIndex - 1].maxWidth + 1 : 0;
  const maxValue = typeof pages[editingPageIndex + 1] !== 'undefined' ? pages[editingPageIndex + 1].maxWidth - 1 : Infinity;
  return (<>
    <FabCard layoutId="page-config-editor" icon="mdi:cog" title="Settings" tooltipPlacement="left" onClick={() => {
      setOpen(true);
    }} />
    <StyledModal title="Dashboard Settings" id="page-config-editor" open={open} onClose={() => setOpen(false)}>
      <Tabs variant="fullWidth" value={selectedTab} onChange={handleChange}>
        <Tab label="Options" />
        <Tab label="Breakpoints" />
        <Tab label="Theme" />
      </Tabs>
      <TabPanel value={selectedTab} index={0}>
        options
      </TabPanel>
      <TabPanel value={selectedTab} index={1}>
        <Column gap="1rem" alignItems="flex-start" justifyContent="space-between" fullHeight fullWidth style={{
          padding: '1rem 0'
        }}>
          {editingPage !== null && <Column fullWidth style={{
              backgroundColor: 'var(--ha-S300)',
              padding: '1rem',
              borderRadius: '0.5rem'
            }} gap="1rem">
            <Row fullWidth justifyContent="flex-start" gap="1rem" wrap="nowrap">
              <TextField style={{
                width: '100%'
              }} label="Icon" value={editingPage.icon} type="string" onChange={(event) => {
                setEditingPage({
                  ...editingPage,
                  icon: event.target.value
                });
              }} />
              <TextField style={{
                width: '100%'
              }} label="Name" value={editingPage.name} type="text" onChange={(event) => {
                setEditingPage({
                  ...editingPage,
                  name: event.target.value
                });
              }} />
              {pages.length - 1 !== pages.findIndex(page => page.id === editingPage.id) && <TextField style={{
                width: '100%'
              }} label="Width" value={editingPage.maxWidth} type="number" min={minValue} max={maxValue} onChange={(event) => {
                let newValue = event.target.valueAsNumber;
                if (newValue > maxValue) {
                  newValue = maxValue;
                } else if (newValue < minValue) {
                  newValue = minValue;
                }
                setEditingPage({
                  ...editingPage,
                  maxWidth: newValue
                });
              }} />}
            </Row>
            <Row fullWidth justifyContent="flex-start" gap="1rem" wrap="nowrap">
              <Row justifyContent="flex-start" gap="1rem" wrap="nowrap" style={{
                width: 'calc(100% / 2)'
              }}>
                <TextField style={{
                  width: '100%'
                }} label="X Margin" value={editingPage.margin[0]} type="number" min={0} onChange={(event) => {
                  setEditingPage({
                    ...editingPage,
                    margin: [event.target.valueAsNumber, editingPage.margin[1]]
                  });
                }} />
                <TextField style={{
                  width: '100%'
                }} label="Y Margin" value={editingPage.margin[1]} type="number" min={0} onChange={(event) => {
                  setEditingPage({
                    ...editingPage,
                    margin: [editingPage.margin[0], event.target.valueAsNumber]
                  });
                }} />
              </Row>
              <Row justifyContent="flex-start" gap="1rem" wrap="nowrap" style={{
                width: 'calc(100% / 2)'
              }}>
                <TextField style={{
                  width: '100%'
                }} label="X Padding" value={editingPage.containerPadding[0]} type="number" min={0} onChange={(event) => {
                  setEditingPage({
                    ...editingPage,
                    containerPadding: [event.target.valueAsNumber, editingPage.containerPadding[1]]
                  });
                }} />
                <TextField style={{
                  width: '100%'
                }} label="Y Padding" value={editingPage.containerPadding[1]} type="number" min={0} onChange={(event) => {
                  setEditingPage({
                    ...editingPage,
                    containerPadding: [editingPage.containerPadding[0], event.target.valueAsNumber]
                  });
                }} />
              </Row>
            </Row>
            <Row justifyContent="flex-end" fullWidth gap="0.5rem">
              <Button onClick={() => {
                const newConfig = pages.map(bp => {
                  if (bp.id === editingPage.id) {
                    return editingPage;
                  }
                  return bp;
                });
                setPages(newConfig);
                setEditingPage(null);
                void saveConfiguration(newConfig);
              }}>
                <Icon icon="mdi:content-save-outline" />
                SAVE
              </Button>
              <Button secondary onClick={() => {
                setEditingPage(null);
              }}>
                CANCEL
              </Button>
            </Row>
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
      <TabPanel value={selectedTab} index={2}>
        theme
      </TabPanel>
    </StyledModal>
  </>);
}

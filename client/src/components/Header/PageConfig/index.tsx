import { useState } from 'react';
import styled from '@emotion/styled';
import { useHakitStore, PageConfig as PageConfigType } from '@client/store';
import { Icon } from '@iconify/react';
import { Tooltip, Column, Modal, FabCard, Row } from '@hakit/components';
import { motion } from 'framer-motion';
import { useWriteFile } from '@client/hooks';
import { Switch, TextField, Button } from '@client/components/Shared';

const PageContainer = styled.div`
  position: relative;
  height: 100%;
`;

const BreakPointButton = styled(motion.button)`
  background-color: var(--ha-S200);
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  height: 100%;
  aspect-ratio: 1/1;
  &:hover {
    background-color: var(--ha-S300);
  }
  &.active {
    background-color: var(--ha-S400);
  }
  > * {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

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
  [class*="ModalInner"] {
    padding: 0;
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
  const pages = useHakitStore(({ pages }) => pages);
  const [editingPage, setEditingPage] = useState<PageConfigType | null>(null);
  const currentPageId = useHakitStore(({ currentPageId }) => currentPageId);
  const currentPage = pages.find(page => page.id === currentPageId) ?? null;
  const setCurrentPageId = useHakitStore(({ setCurrentPageId }) => setCurrentPageId);
  const setPages = useHakitStore(({ setPages }) => setPages);
  const mode = useHakitStore(store => store.mode);
  const editingPageIndex = pages.findIndex(bp => bp.id === editingPage?.id);
  const writeFile = useWriteFile();
  const isEditMode = mode === 'edit';
  if (!isEditMode) {
    return null;
  }
  return (<PageContainer>
    <BreakPointButton layoutId="breakpoint-modal" onClick={() => {
      setOpen(true);
    }}>
      <Tooltip title="Edit Layout Properties" placement="bottom">
        <Icon icon="mdi:dots-vertical" />
      </Tooltip>
    </BreakPointButton>
    {pages.filter(page => page.enabled).map((page, index) => {
      const active = page.id === currentPage?.id;
      return (<BreakPointButton key={index} className={active ? 'active' : ''} onClick={() => {
        setCurrentPageId(page.id);
      }}>
        <Tooltip title={page.id} placement="bottom">
          <Icon icon={page.icon} />
        </Tooltip>
      </BreakPointButton>);
    })}
    <StyledModal title="Layout Properties" id="breakpoint-modal" open={open} onClose={() => setOpen(false)}>
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
            <TextField style={{
              width: '100%'
            }} label="Width" value={editingPage.maxWidth} type="number" min={typeof pages[editingPageIndex - 1] !== 'undefined' ? pages[editingPageIndex - 1].maxWidth : 0} max={typeof pages[editingPageIndex + 1] !== 'undefined' ? pages[editingPageIndex + 1].maxWidth : 1920} onChange={(event) => {
              setEditingPage({
                ...editingPage,
                maxWidth: event.target.valueAsNumber
              });
            }} />
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
          {/* <Row fullWidth>
            <FormControlGroup label="Include Sidebar">
              <Tooltip title={'If disabled, the sidebar will not be present for this layout'}>
                <Switch checked={editingPage.sidebarEnabled} onChange={() => {
                  setEditingPage({
                    ...editingPage,
                    sidebarEnabled: !editingPage.sidebarEnabled
                  });
                }} />
              </Tooltip>
            </FormControlGroup>
          </Row> */}
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
              void(async () => {
                try {
                  await writeFile({
                    content: JSON.stringify(newConfig, null, 2),
                    filename: 'config.json'
                  });
                } catch (e) {
                  // TODO - raise error with toasts
                  // console.log('error saving pages', e);
                }
              })();
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
    </StyledModal>
  </PageContainer>);
}

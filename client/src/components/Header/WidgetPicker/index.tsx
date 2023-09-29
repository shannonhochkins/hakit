import { useState } from 'react';
import styled from '@emotion/styled';
import { useHakitStore, PageWidget } from '@client/store';
import { Icon } from '@iconify/react';
import { Tooltip, Column, Modal, Group, FabCard, Row } from '@hakit/components';
import { motion } from 'framer-motion';
import { useWriteFile } from '@client/hooks';
import { Switch, Button, FormControlGroup } from '@client/components/Shared';
import WIDGETS from '@client/widgets';
import { AvailableWidgets } from '@client/widgets/types';
import { merge } from 'lodash';
import type { Layout } from 'react-grid-layout';

const PageContainer = styled.div`
  position: relative;
  height: 100%;
`;

const AddWidgetButton = styled(motion.button)`
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

const WidgetBox = styled.div`
  padding: 0.5rem;
  width: calc(100% / 2 - 1rem);
  display: flex;
  align-items: center;
  justify-content: stretch;
  flex-direction: column;
  border: 1px solid var(--ha-S500);
  border-radius: 0.5rem;
  aspect-ratio: 1 / 1;
  cursor: pointer;
`;

const WidgetTitle = styled.div`
  padding: 0.5rem;
`;

const WidgetPreview = styled.div`
  width: 100%;
  flex-grow: 1;
  pointer-events: none;
  > * {
    width: 100% !important;
    height: 100% !important;
  }
`;

const widgets = Object.entries(WIDGETS);
const DEFAULT_COLS = 48;

function findOptimalPosition(layout: Array<Omit<Layout, 'i'>>, w: number, h: number): { x: number; y: number } {
  // Assuming DEFAULT_COLS is the total number of columns in your grid.
  for (let x = 0; x < DEFAULT_COLS; x++) {
      let y = 0;

      while (y < Infinity) {  // theoretically, it could go till any height
          const spaceOccupied = layout.some(item => 
              item.x < x + w && 
              item.x + item.w > x &&
              item.y < y + h &&
              item.y + item.h > y
          );

          if (!spaceOccupied) {
              return { x, y };  // found a space
          }
          y++;
      }
  }

  // Fallback: If no optimal position was found (which is highly unlikely), place it at the bottom.
  return {
      x: 0,
      y: Infinity
  };
}

export function WidgetPicker() {
  const [open, setOpen] = useState(false);
  const [includeInAllLayouts, setIncludeInAllLayouts] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorType, setEditorType] = useState<AvailableWidgets | null>(null);
  const pages = useHakitStore(({ pages }) => pages);
  const currentPageId = useHakitStore(({ currentPageId }) => currentPageId);
  const page = pages.find(page => page.id === currentPageId) ?? null;
  const setPages = useHakitStore(({ setPages }) => setPages);

  function addWidget(key: AvailableWidgets) {
    const widget = WIDGETS[key];
    if (page === null) return;
    const count = page.widgets.length + 1;
    const layout = {
      ...merge({
        minW: 1,
        maxW: DEFAULT_COLS,
        w: DEFAULT_COLS,
        h: 4,
        static: false,
        isDraggable: true,
        isResizable: true,
      }, widget.layout),
    } satisfies Omit<Layout, 'i' | 'x' | 'y'>;
    setPages(pages.map(p => {
      const i = `${key}||page=${p.id}||i=${count}`;
      const { x, y } = findOptimalPosition(p.widgets.map(w => w.layout), layout.w, layout.h);
      const layoutWithPosition = { ...layout, x, y };
      const newWidget = {
        id: i,
        layout: layoutWithPosition,
        name: key,
        props: widget.props,
      } satisfies PageWidget;
      if (page.id === p.id || includeInAllLayouts) {
        return { ...p, widgets: [...p.widgets, {
          ...newWidget,
          i,
        }]};
      }
      return p;
    }));
  }

  return (<>
    <PageContainer>
      <AddWidgetButton layoutId="widget-picker" onClick={() => setOpen(true)}>
        <Tooltip title="Add Widget" placement="left">
          <Icon icon="solar:widget-add-broken" />
        </Tooltip>
      </AddWidgetButton>
    </PageContainer>
    <Modal title="Widget Picker" id="widget-picker" open={open} onClose={() => {
      setOpen(false);
    }}>
      {widgets.map(([key, widget]) => (<WidgetBox onClick={(e) => {
        e.stopPropagation();
        setOpen(false);
        setEditorType(key as AvailableWidgets);
        setEditorOpen(true);
      }} key={key}>
          <WidgetTitle>
            {key}
          </WidgetTitle>
          <WidgetPreview>
            {widget.renderer(widget.props)}
          </WidgetPreview>
        </WidgetBox>))}
    </Modal>
    {editorType && <Modal id="widget-editor" title={`${editorType} Configuration`} open={editorOpen} onClose={() => {
      setEditorOpen(false);
    }}>
      <FormControlGroup label="Include to all layouts">
        <Switch checked={includeInAllLayouts} onChange={value => {
          setIncludeInAllLayouts(value);
        }} />
        <Button onClick={() => {
          addWidget(editorType);
          setEditorOpen(false);
        }}>
          Save to {includeInAllLayouts ? 'all layouts' : 'current layout'}
        </Button>
      </FormControlGroup>
        asdf
    </Modal>}
  </>);
}

import { useState, useMemo } from 'react';
import styled from '@emotion/styled';
import { useHakitStore, PageWidget } from '@client/store';
import { DEFAULT_WIDGET_SIZE } from '@client/store/config';
import { Modal, Row, FabCard } from '@hakit/components';
import { HassEntity } from 'home-assistant-js-websocket';
import { useWidget, useWidgets, useFilterEntities } from '@client/hooks';
import { findWidgetInPage, convertPixelToColumn } from '@client/utils/layout-helpers';
import { AvailableWidgets } from '@client/widgets/available-widgets';
import { merge } from 'lodash';
import type { Layout } from 'react-grid-layout';
import { WidgetEditor } from '../WidgetEditor';
import { Widget } from '@client/widgets/types';

const WidgetButtonContainer = styled.div`
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 10;
`;

const WidgetBox = styled.div`
  padding: 1rem;
  width: calc(100% / 2 - 1rem);
  display: flex;
  align-items: center;
  justify-content: stretch;
  flex-direction: column;
  border: 1px solid var(--ha-S500);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: border-color var(--ha-transition-duration) var(--ha-easing);
  &:hover {
    border-color: var(--ha-S800);
  }
`;

const WidgetTitle = styled.div`
  padding: 0 0.5rem 0.5rem;
`;

const WidgetPreview = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-grow: 0;
  pointer-events: none;
  > * {
    width: 100% !important;
    max-width: 24rem;
    justify-content: center;
    display: flex;
  }
`;

const StyledModal = styled(Modal)`
  --ha-modal-width: 60rem;
  max-width: 100%;
`;

function findOptimalPosition(layout: Array<Omit<Layout, 'i'>>): { x: number; y: number } {
  // Find the highest Y position among all widgets
  const highestY = layout.reduce((maxY, item) => Math.max(maxY, item.y + item.h), 0);

  // Place the new widget at the bottom left of the grid on the next row
  return {
      x: 0,
      y: highestY
  };
}

const generateUID = (widgetLength: number): string => {
  const randomPart = Math.random().toString(36).substr(2, 4); // Produces 4 random alphanumeric characters
  const counterPart = (widgetLength++).toString(36).padStart(4, '0'); // Converts counter to base-36 (alphanumeric) representation, always of length 4
  return counterPart + randomPart;
};

export function WidgetPicker({
  widgetId,
}: {
  widgetId?: string;
}) {
  const [openWidgetPicker, setOpenWidgetPicker] = useState(false);
  const [dummyWidget, setDummyWidget] = useState<PageWidget | null>(null);
  const pages = useHakitStore(({ view }) => view?.pages ?? []);
  const currentPageId = useHakitStore(({ currentPageId }) => currentPageId);
  const page = pages.find(page => page.id === currentPageId) ?? null;
  const setPages = useHakitStore(({ setPages }) => setPages);
  const widgets = Object.entries(useWidgets());
  const getWidget = useWidget();
  const filterEntities = useFilterEntities();

  function createDummyWidget(key: AvailableWidgets, widget: Widget<Record<string, unknown>>): PageWidget | null {
    if (page === null) return null;
    const layout = {
      // defaults
      ...merge({
        w: convertPixelToColumn(widget.previewOptions?.width ?? DEFAULT_WIDGET_SIZE, page, pages),
        h: convertPixelToColumn(widget.previewOptions?.height ?? DEFAULT_WIDGET_SIZE, page, pages),
        x: 0,
        y: 0,
      }, widget.layout),
    } satisfies Partial<Layout>;
    const uid = generateUID(pages.flatMap(p => p.widgets).length);
    return {
      uid,
      layout,
      name: key,
      props: {
        ...widget.props,
        id: `${uid}-PLACEHOLDER`
      },
      widgets: []
    } satisfies PageWidget;
  }

  function addWidget(widget: PageWidget, includeInAllLayouts: boolean) {
    if (!page) return;
    const count = page.widgets.length + 1;
    setPages(pages.map(p => {
      if (page.id === p.id || includeInAllLayouts) {
        const i = `${widget.name}||page=${p.id}||i=${count}`;
        const { x, y } = findOptimalPosition(p.widgets.map(w => w.layout));
        const widgetDefinition = getWidget(widget.name);
        const w = convertPixelToColumn(widgetDefinition.previewOptions?.width ?? DEFAULT_WIDGET_SIZE, p, pages);
        const h = convertPixelToColumn(widgetDefinition.previewOptions?.height ?? DEFAULT_WIDGET_SIZE, p, pages);
        const layoutWithPosition = { ...widget.layout, x, y, w, h };
        const newWidget = {
          ...widget,
          props: {
            ...widget.props,
            id: i,
          },
          layout: layoutWithPosition,
        } satisfies PageWidget;
        // if there's a widgetId, we're adding to a widget not the main page
        if (widgetId) {
          const matchedWidget = findWidgetInPage(widgetId, p);
          if (matchedWidget) {
            matchedWidget.widgets = matchedWidget.widgets ?? [];
            matchedWidget.widgets.push(newWidget);
            return p;
          } else {
            throw new Error(`Something went wrong finding widget by id "${widgetId}"`);
          }
        }
        return { ...p, widgets: [...p.widgets, newWidget]};
      }
      return p;
    }));
  }

  const previewWidgets = useMemo(() => widgets.map<[string, Widget<Record<string, unknown>>]>(([key, widget]) => {
      let entities: HassEntity[] = [];
      if (widget.entityPicker !== false) {
        entities = filterEntities(widget);
      }
      widget.props = {
        ...widget.props,
        ...typeof widget.defaultProps === 'function' ? widget.defaultProps(widget.entityPicker !== false ? entities : []) : {},
      };
      if (widget.props) {
        widget.props.id = generateUID(widgets.length);
      }
      return [key, widget];
    }), [filterEntities, widgets]);

  return (<>
    <WidgetButtonContainer>
      <FabCard icon="solar:widget-add-broken" title="Add Widget" tooltipPlacement="left" layoutId="widget-picker" onClick={() => setOpenWidgetPicker(true)} />
    </WidgetButtonContainer>
    {openWidgetPicker && <StyledModal title="Widget Picker" id="widget-picker" open onClose={() => {
      setOpenWidgetPicker(false);
    }}>
      <Row fullWidth gap="0.5rem" alignItems="stretch">
        {previewWidgets.map(([key, widget]) => (<WidgetBox onClick={(e) => {
            e.stopPropagation();
            setOpenWidgetPicker(false);
            const dummyWidget = createDummyWidget(key as AvailableWidgets, widget);
            setDummyWidget(dummyWidget);
          }} key={key}>
              <WidgetTitle>
                {key}
              </WidgetTitle>
              <WidgetPreview>
                {widget.renderer(widget.props ?? {})}
              </WidgetPreview>
            </WidgetBox>))}
      </Row>
    </StyledModal>}
    {dummyWidget && <WidgetEditor type="new" widget={dummyWidget} id={`${dummyWidget.props.id}-editor`} open onClose={() => {
      setDummyWidget(null);
    }} onSave={(data, includeInAllLayouts) => {
      addWidget(data, includeInAllLayouts ?? false);
      setDummyWidget(null);
    }} />}
  </>);
}

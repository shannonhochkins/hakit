import { useState, useEffect, useMemo, useRef, ReactElement } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { useHakitStore, PageWidget, PageConfig } from '@client/store';
import styled from '@emotion/styled';
import { useResizeDetector } from 'react-resize-detector';
import widgets from '../../widgets';
import { FabCard, Row, Tooltip } from '@hakit/components';
import { WidgetEditor } from '@client/components/WidgetEditor';

const ResponsiveGridLayout = WidthProvider(Responsive);


const Parent = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
`;

const EditContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;


function getBreakpointFromWidth(
  breakpoints: Record<string, number>,
  width: number
): string {
  const sorted = sortBreakpoints(breakpoints);
  let matching = sorted[0];
  for (let i = 1, len = sorted.length; i < len; i++) {
    const breakpointName = sorted[i];
    if (width > breakpoints[breakpointName]) matching = breakpointName;
  }
  return matching;
}

/**
 * Given breakpoints, return an array of breakpoints sorted by width. This is usually
 * e.g. ['xxs', 'xs', 'sm', ...]
 *
 * @param  {Object} breakpoints Key/value pair of breakpoint names to widths.
 * @return {Array}              Sorted breakpoints.
 */
function sortBreakpoints(
  breakpoints: Record<string, number>
): string[] {
  const keys: string[] = Object.keys(breakpoints);
  return keys.sort(function (a, b) {
    return breakpoints[a] - breakpoints[b];
  });
}

const DEFAULT_COLS = 48;

const InnerBar = styled(Row)`

`;

const StyledEditBar = styled.div`
  position: absolute;
  inset: 0;
  bottom: 0;
  z-index: 1;
  background-color: transparent;
  transition: background-color var(--ha-transition-duration) var(--ha-easing);
  overflow: hidden;
  cursor: move;
  .inner-bar {
    transition: transform var(--ha-transition-duration) var(--ha-easing);
    transform: translate3d(0, 100%, 0);
    position: absolute;
    bottom: 0;
    left: 0;
    padding: 0.5rem;
  }
  &:hover {
    background-color: rgba(0,0,0,0.4);
    .inner-bar {
      transform: translate3d(0, 0, 0);
    }
  }
`;

interface EditBarProps {
  widget: PageWidget;
}

function EditBar({ widget }: EditBarProps): ReactElement {
  const [editWidget, setEditWidget] = useState(false);
  return (<>
    <StyledEditBar className="edit-bar">
      <InnerBar className="inner-bar" fullWidth gap="0.5rem">
        <Tooltip title="Edit" placement="bottom">
          <FabCard layoutId={`${widget.id}-editor`} icon="mdi:edit" size={30} onClick={() => setEditWidget(true)} />
        </Tooltip>
        <Tooltip title="Delete" placement="bottom">
          <FabCard icon="mdi:trash" size={30} />
        </Tooltip>
      </InnerBar>
    </StyledEditBar>
    <WidgetEditor widget={widget} id={`${widget.id}-editor`} open={editWidget} onClose={() => {
      setEditWidget(false);
    }} onSave={() => {
      setEditWidget(false);
    }} />
  </>);
}
interface RendererProps {
  nested?: boolean;
  onHeightChange?: (height: number, key: string) => void;
}

export function Renderer(props: RendererProps) {
  const { width, ref } = useResizeDetector();
  const firstLayoutChange = useRef(true);
  const mode = useHakitStore(({ mode }) => mode);
  const [layoutChanges, setLayoutChanges] = useState<Record<string, Layout[]>>({});
  const pages = useHakitStore(({ pages }) => pages);
  const currentPageId = useHakitStore(({ currentPageId }) => currentPageId);
  const page = pages.find(page => page.id === currentPageId) ?? null;
  const setPages = useHakitStore(({ setPages }) => setPages);
  const setCurrentPageId = useHakitStore(({ setCurrentPageId }) => setCurrentPageId);
  const [mounted, setMounted] = useState(false);
  const isEditMode = mode === 'edit';

  function widgetRenderer(pageWidget: PageWidget) {
    const { props, renderer} = widgets[pageWidget.name];
    return renderer(props);
  }

  const cols = useMemo(() => pages.reduce<Record<string, number>>((acc, breakpoint) => {
    acc[breakpoint.id] = DEFAULT_COLS;
    return acc;
  }, {}), [pages]);
  const breakpoints = useMemo(() => pages.reduce<Record<string, number>>((acc, breakpoint) => {
    acc[breakpoint.id] = breakpoint.maxWidth;
    return acc;
  }, {}), [pages]);

  useEffect(() => {
    if (typeof width !== 'undefined' && width > 0 && !mounted) {
      setMounted(true);
    }
  }, [width, mounted]);

  useEffect(() => () => {
    firstLayoutChange.current = true;
  }, []);

  useEffect(() => {
    // TODO - make this smarter to pick the right default page
    if (!currentPageId) {
      setCurrentPageId('3');
    }
  }, [currentPageId, setCurrentPageId]);

  const updateLayouts = (layout: Layout[]) => {
    if (page === null) return;
    setPages(pages.map(p => {
      if (page.id === p.id) {
        const newPage =  { ...page, widgets: page.widgets.map(widget => {
          const updatedLayout = layout.find(l => l.i === widget.id);
          if (typeof updatedLayout === 'undefined') return widget;
          return { ...widget, layout: updatedLayout };
        }) } satisfies PageConfig;
        return newPage;
      }
      return p;
    }));
  };

  const layouts = useMemo(() => pages.reduce<Record<string, Layout[]>>((acc, page) => {
    acc[page.id] = page.widgets.map(widget => ({
      i: widget.id,
      ...widget.layout,
    }));
    return acc;
  }, {}), [pages]);

  const columnWidth = ((width ?? 0) - ((page?.margin[0] ?? 0) * (DEFAULT_COLS - 1) + 2 * (page?.containerPadding[0] ?? 0))) / DEFAULT_COLS;
  // if (width) {
  //   console.log(JSON.stringify(layouts, null, 2));
  //   console.log(JSON.stringify(breakpoints, null, 2));
  //   console.log(JSON.stringify(cols, null, 2));
  //   console.log(JSON.stringify(columnWidth, null, 2));
  //   console.log(JSON.stringify(page, null, 2));
  // }

  return (
    <Parent className="parent" ref={ref}>
      {mounted && page && <ResponsiveGridLayout
          width={width}
          margin={page?.margin ?? [0, 0]}
          containerPadding={page?.containerPadding ?? [0, 0]}
          onDragStart={(_layout, _oldItem, _newItem, _placeholder, e) => e.stopPropagation()}
          layouts={layouts}
          isResizable
          isDraggable
          isDroppable
          onResizeStop={(layout) => {
            updateLayouts(layout);
          }}
          breakpoint={currentPageId ?? undefined}
          onWidthChange={(newWidth, _oldWidth) => {
            const newBreakpointId = getBreakpointFromWidth(breakpoints, newWidth);
            if (currentPageId !== newBreakpointId) {
              setCurrentPageId(newBreakpointId);
            }
          }}
          breakpoints={breakpoints}
          cols={cols}
          onLayoutChange={(_layout, allLayouts) => {
            // setLayoutChanges(allLayouts);
            // if (props.nested === true && typeof props.onHeightChange === 'function') {
            //   // Sum up the height of all items
            //   const totalHeight = layout.reduce((sum, item) => sum + item.h, 2);
            //   props.onHeightChange(totalHeight, props.itemKey ?? '');
            // }
            const malformed = _layout.some(item => typeof item.minW === 'undefined');
            if (!malformed) {
              updateLayouts(_layout);
            }
          }}
          // disables the height calculation
          autoSize={false}
          measureBeforeMount={false}
          useCSSTransforms
          className="layout"
          rowHeight={columnWidth}
        >
          {page.widgets.map(function (widget) {
            return (
              <div key={widget.id}>
                {/* {widget.id.startsWith("grid-") && (
                  <Renderer
                    nested
                    itemKey={widget.id}
                    onHeightChange={(newHeight, key) => {
                      if (page === null) return;
                      const updatedLayout = page.widgets.map(widget => {
                        if (widget.id === key) {
                          return { ...widget, layout: {
                            ...widget.layout,
                            h: newHeight,
                          } };
                        }
                        return widget;
                      });
                      setPages(pages.map(p => {
                        if (page.id === p.id) {
                          return { ...page, layout: updatedLayout };
                        }
                        return page;
                      }));
                    }}
                  />
                )} */}
                {!widget.id.startsWith("grid-") && isEditMode ? (<EditContainer className="edit-container">
                    {widgetRenderer(widget)}
                    <EditBar widget={widget} />
                  </EditContainer>) : widgetRenderer(widget)
                }
              </div>
            );
          })}
      </ResponsiveGridLayout>}
    </Parent>
  );
}

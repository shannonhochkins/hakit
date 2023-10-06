import { useState, useEffect, useMemo, useRef } from 'react';
import GridLayout, { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { useHakitStore, PageWidget, PageConfig } from '@client/store';
import styled from '@emotion/styled';
import { useResizeDetector } from 'react-resize-detector';
import { useWidget } from '@client/hooks';
import { WidgetEditBar } from '@client/components/WidgetEditBar';
import { DEFAULT_COLUMNS, DEFAULT_LAYOUT_PROPS } from '@client/store/pages';
import { getMinimumPageWidth } from '@root/client/src/utils/layout-helpers';

// const ResponsiveGridLayout = WidthProvider(Responsive);

const Parent = styled.div`
  position: relative;
  width: 100%;
  height: calc(100vh - var(--ha-header-height));
  maxWidth: 100%;
  margin: 0 auto;
  overflow: auto;
`;

const EditContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  border: 1px solid transparent;
  transition: border-color var(--ha-transition-duration) var(--ha-easing);
  &:hover {
    border-color: var(--ha-A400);
  }
`;

function getBreakpointFromWidth(
  pages: PageConfig[],
  width: number
): string {
  const breakpoints = pages.filter(page => page.enabled).reduce<Record<string, number>>((acc, breakpoint) => {
    acc[breakpoint.id] = breakpoint.maxWidth;
    return acc;
  }, {});
  const sorted = sortBreakpoints(breakpoints);
  if (width <= breakpoints[sorted[0]]) {
    return sorted[0];  // Handle the first range
  }
  for (let i = 1, len = sorted.length; i < len; i++) {
    const prevBreakpointName = sorted[i - 1];
    const breakpointName = sorted[i];
    if (width > breakpoints[prevBreakpointName] && width <= breakpoints[breakpointName]) {
      return breakpointName;
    }
  }
  return sorted[sorted.length - 1];  // If width is greater than the last breakpoint, return the last breakpoint name
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


interface RendererProps {
  nested?: boolean;
  onHeightChange?: (height: number, key: string) => void;
}

export function Renderer(props: RendererProps) {
  const { width, ref } = useResizeDetector();
  const firstLayoutChange = useRef(true);
  const mode = useHakitStore(({ mode }) => mode);
  const pages = useHakitStore(({ pages }) => pages);
  const currentPageId = useHakitStore(({ currentPageId }) => currentPageId);
  const page = pages.find(page => page.id === currentPageId) ?? null;
  const setPages = useHakitStore(({ setPages }) => setPages);
  const setCurrentPageId = useHakitStore(({ setCurrentPageId }) => setCurrentPageId);
  const [mounted, setMounted] = useState(false);
  const isEditMode = mode === 'edit';
  const getWidget = useWidget();

  function widgetRenderer(pageWidget: PageWidget) {
    const { props, renderer} = getWidget(pageWidget.name);
    return renderer({
      ...props,
      ...pageWidget.props
    }, pageWidget);
  }

  const cols = useMemo(() => pages.reduce<Record<string, number>>((acc, breakpoint) => {
    acc[breakpoint.id] = DEFAULT_COLUMNS;
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

  const updateLayouts = (layout: Layout[]) => {
    if (page === null) return;
    setPages(pages.map(p => {
      if (page.id === p.id) {
        const newPage =  { ...page, widgets: page.widgets.map(widget => {
          const updatedLayout = layout.find(l => l.i === widget.props.id);
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
      ...DEFAULT_LAYOUT_PROPS,
      i: widget.props.id,
      ...widget.layout,
    }));
    return acc;
  }, {}), [pages]);

  useEffect(() => {
    if (!currentPageId && width) {
      const newBreakpointId = getBreakpointFromWidth(pages, width);
      setCurrentPageId(newBreakpointId);
    }
    // when in live mode, we need to update the current page id when the width changes
    // to activate breakpoints
    if (!isEditMode && width) {
      const newBreakpointId = getBreakpointFromWidth(pages, width);
      if (newBreakpointId !== currentPageId) {
        setCurrentPageId(newBreakpointId);
      }
    }
  }, [currentPageId, isEditMode, pages, setCurrentPageId, width]);

  const columnWidth = ((width ?? 0) - ((page?.margin[0] ?? 0) * (DEFAULT_COLUMNS - 1) + 2 * (page?.containerPadding[0] ?? 0))) / DEFAULT_COLUMNS;
  // in edit mode, we set the container width to the minimum width of the page so that in
  // live mode, as it's fluid it doesn't squash any of the components below the desired size
  const minPageWidth = isEditMode && page ? getMinimumPageWidth(page, pages) : '100%';

  return (
    <Parent className="parent" ref={ref} style={isEditMode ? {
      width: minPageWidth,
      border: `2px solid var(--ha-A400)`
    } : {}}>
      {mounted && page && currentPageId && <GridLayout
          width={width}
          margin={page?.margin ?? [0, 0]}
          containerPadding={page?.containerPadding ?? [0, 0]}
          onDragStart={(_layout, _oldItem, _newItem, _placeholder, e) => e.stopPropagation()}
          layout={layouts[currentPageId]}
          isResizable
          isDraggable
          isDroppable
          onResizeStop={(layout) => {
            // when any element is resized in the UI, we need to update the layout
            updateLayouts(layout);
          }}
          // breakpoint={currentPageId ?? undefined}
          // onWidthChange={(newWidth, _oldWidth) => {
          //   const newBreakpointId = getBreakpointFromWidth(pages, newWidth);
          //   console.log('newBreakpointId', newBreakpointId, newWidth);
          //   if (currentPageId !== newBreakpointId) {
          //     setCurrentPageId(newBreakpointId);
          //   }
          // }}
          // breakpoints={breakpoints}
          cols={cols[currentPageId]}
          onLayoutChange={(_layout) => {
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
          compactType={null}
          // measureBeforeMount={false}
          useCSSTransforms
          className="layout"
          rowHeight={columnWidth}
        >
          {page.widgets.map(function (widget) {
            return (
              <div key={widget.props.id}>
                {/* {widget.props.id.startsWith("grid-") && (
                  <Renderer
                    nested
                    itemKey={widget.props.id}
                    onHeightChange={(newHeight, key) => {
                      if (page === null) return;
                      const updatedLayout = page.widgets.map(widget => {
                        if (widget.props.id === key) {
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
                {isEditMode ? (<EditContainer className="edit-container">
                    {widgetRenderer(widget)}
                    <WidgetEditBar widget={widget} />
                  </EditContainer>) : widgetRenderer(widget)
                }
              </div>
            );
          })}
      </GridLayout>}
    </Parent>
  );
}

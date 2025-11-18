import { ChevronRight, PanelLeftIcon, PanelRightIcon } from 'lucide-react';
import { useEditorUIStore } from '@hooks/useEditorUIStore';
import { Puck, createUsePuck } from '@measured/puck';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { IconButton } from '@components/Button/IconButton';
import styles from './RightSidebar.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
import { useBreadcrumbs } from '@hooks/useBreadcrumbs';
import { Row } from '@components/Layout';
import { SharedActionBar } from '../../PuckOverrides/ActionBar/SharedActionBar';

const getClassName = getClassNameFactory('RightSidebar', styles);

const usePuck = createUsePuck();

export function RightSidebar({ onToggle }: { onToggle: (collapsed: boolean) => void }) {
  const { rightSidebar, setRightSidebarCollapsed } = useEditorUIStore();
  const { isCollapsed } = rightSidebar;
  const dispatch = usePuck(c => c.dispatch);

  const onClickExpandSidebar = useCallback(() => {
    setRightSidebarCollapsed(false);
    onToggle(false);
  }, [setRightSidebarCollapsed, onToggle]);

  const onClickCollapseSidebar = useCallback(() => {
    setRightSidebarCollapsed(true);
    onToggle(true);
  }, [setRightSidebarCollapsed, onToggle]);

  // Measurement-based dynamic breadcrumb fitting:
  // Fetch the full breadcrumb trail, then measure actual rendered widths to determine how many can fit
  // (from end backwards) in the available horizontal space without causing overflow.
  // This avoids brittle fixed pixel thresholds and adapts to varying label lengths/icons.
  const breadcrumbs = useBreadcrumbs();
  const sidebarTitleRef = useRef<HTMLDivElement>(null);
  const breadcrumbsContainerRef = useRef<HTMLDivElement>(null);
  // Hidden measurement container renders ALL breadcrumbs for accurate width calculation regardless of current visible subset.
  const breadcrumbsMeasureRef = useRef<HTMLDivElement>(null);
  // Ref for deselect button width measurement. IconButton renders a button element.
  const endRowRef = useRef<HTMLButtonElement | null>(null);
  // Only show the last breadcrumb initially to avoid flashing all on selection change.
  const [visibleIndices, setVisibleIndices] = useState<number[]>(() => [breadcrumbs.length - 1 >= 0 ? breadcrumbs.length - 1 : 0]);

  // Whenever breadcrumb array changes (e.g. selection changes), optimistically show all before re-measure.
  useEffect(() => {
    // On breadcrumbs change, show only the last (selected) breadcrumb until measurement runs.
    setVisibleIndices([breadcrumbs.length - 1 >= 0 ? breadcrumbs.length - 1 : 0]);
  }, [breadcrumbs]);

  const recomputeVisible = useCallback(() => {
    const container = breadcrumbsContainerRef.current;
    const measureEl = breadcrumbsMeasureRef.current;
    if (!container || !measureEl) return;
    // All breadcrumb DOM nodes (full trail) live in measurement container.
    const allItems = Array.from(measureEl.querySelectorAll('[data-breadcrumb-measure]')) as HTMLElement[];
    if (!allItems.length) return;
    const rowComputed = getComputedStyle(container.querySelector('[data-breadcrumb-row]') as HTMLElement);
    const gapToken = (rowComputed.gap || '0').split(' ')[0];
    const gap = parseFloat(gapToken) || 0;
    // Available width excludes deselect button & sidebarTitle gap.
    const sidebarTitle = container.parentElement as HTMLElement | null;
    const fullWidth = sidebarTitle?.clientWidth ?? container.clientWidth;
    const deselectWidth = endRowRef.current ? endRowRef.current.offsetWidth : 0;
    const parentGapToken = sidebarTitle ? getComputedStyle(sidebarTitle).gap?.split(' ')[0] || '0' : '0';
    const parentGap = parseFloat(parentGapToken) || 0;
    const available = Math.max(0, fullWidth - deselectWidth - parentGap);
    // Build kept indices from end backwards ensuring at least one (last) is preserved.
    let acc = 0;
    const keptRev: number[] = [];
    for (let i = allItems.length - 1; i >= 0; i--) {
      const w = allItems[i].offsetWidth;
      const extraGap = keptRev.length === 0 ? 0 : gap;
      // Always allow last crumb even if width exceeds available (guarantee visibility of selection context).
      if (keptRev.length === 0 || acc + w + extraGap <= available) {
        acc += w + extraGap;
        keptRev.push(i);
      } else {
        break;
      }
    }
    keptRev.reverse(); // restore natural order (ancestor -> descendant among kept crumbs)
    if (keptRev.length === 0) keptRev.push(allItems.length - 1); // fallback safety
    setVisibleIndices(prev => {
      if (prev.length === keptRev.length && prev.every((v, i) => v === keptRev[i])) return prev;
      return keptRev;
    });
  }, []);

  // Measure after layout for initial & subsequent breadcrumb changes.
  useLayoutEffect(() => {
    recomputeVisible();
  }, [recomputeVisible, breadcrumbs]);

  // ResizeObserver keeps layout responsive to container width changes.
  useEffect(() => {
    const el = breadcrumbsContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      // rAF to batch with potential layout changes
      requestAnimationFrame(recomputeVisible);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [recomputeVisible]);

  // removed isTruncated logic per requirements; ellipsis indicator omitted. Expansion re-measured dynamically.

  return (
    <>
      {isCollapsed ? (
        <div className={getClassName('collapsedSidebar')}>
          <IconButton
            variant='transparent'
            onClick={onClickExpandSidebar}
            icon={<PanelLeftIcon size={18} />}
            aria-label='Expand properties'
          />
          <SharedActionBar />
        </div>
      ) : (
        <div className={getClassName('expandedSidebar')}>
          <div className={getClassName('sidebarHeader')}>
            <IconButton
              variant='transparent'
              onClick={onClickCollapseSidebar}
              icon={<PanelRightIcon size={16} />}
              aria-label='Collapse properties'
            />
            <div className={getClassName('sidebarTitle')} ref={sidebarTitleRef}>
              <div className={getClassName('breadcrumbsWrapper')} ref={breadcrumbsContainerRef}>
                {/* Visible breadcrumbs row */}
                <Row
                  wrap='nowrap'
                  gap='var(--space-2)'
                  fullWidth
                  justifyContent='flex-start'
                  data-breadcrumb-row
                  className={getClassName('breadcrumbsRow')}
                >
                  {visibleIndices
                    .map(i => breadcrumbs[i])
                    .filter(Boolean)
                    .map(bc =>
                      bc.isLast ? (
                        <span key={bc.id} className={getClassName('breadcrumbLabel')} data-breadcrumb-item>
                          {bc.label}
                        </span>
                      ) : (
                        <a
                          className={getClassName('breadcrumb')}
                          key={bc.id}
                          data-breadcrumb-item
                          onClick={() => dispatch({ type: 'setUi', ui: { itemSelector: bc.selector }, recordHistory: true })}
                        >
                          {bc.label}
                          <ChevronRight size={16} />
                        </a>
                      )
                    )}
                </Row>
                {/* Hidden measurement container (all breadcrumbs) */}
                <div
                  ref={breadcrumbsMeasureRef}
                  style={{ position: 'absolute', visibility: 'hidden', pointerEvents: 'none', top: 0, left: -9999 }}
                >
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    {breadcrumbs.map(bc =>
                      bc.isLast ? (
                        <span key={`m-${bc.id}`} data-breadcrumb-measure className={getClassName('breadcrumbLabel')}>
                          {bc.label}
                        </span>
                      ) : (
                        <span key={`m-${bc.id}`} data-breadcrumb-measure className={getClassName('breadcrumb')}>
                          {bc.label}
                          <ChevronRight size={16} />
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
              {breadcrumbs.length > 1 && (
                // capture underlying container element width
                <Row ref={endRowRef as unknown as React.Ref<HTMLDivElement>}>
                  <SharedActionBar />
                </Row>
              )}
            </div>
          </div>
          <div className={getClassName('sidebarContent') + ' puck-sidebar-content'}>
            <Puck.Fields />
          </div>
        </div>
      )}
    </>
  );
}

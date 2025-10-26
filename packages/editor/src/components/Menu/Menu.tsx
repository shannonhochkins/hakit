import React, { useCallback, useEffect, useMemo, useRef, useState, useLayoutEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import styles from './Menu.module.css';
import { create } from 'zustand';

// Local (module-scoped) Zustand store to allow only one open menu at a time
type MenuStore = {
  activeMenuId: string | null;
  setActiveMenuId: (id: string | null) => void;
};
const useMenuStore = create<MenuStore>(set => ({
  activeMenuId: null,
  setActiveMenuId: id => set({ activeMenuId: id }),
}));

type Horizontal = 'left' | 'center' | 'right';
type Vertical = 'top' | 'center' | 'bottom';

export interface Origin {
  vertical: Vertical;
  horizontal: Horizontal;
}

export interface MenuProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  anchorOrigin?: Origin; // relative to anchor
  transformOrigin?: Origin; // point on the menu that is placed at the anchor point
  children: React.ReactNode;
  doc?: Document;
}

export function Menu({
  open,
  anchorEl,
  onClose,
  children,
  anchorOrigin = { vertical: 'bottom', horizontal: 'right' },
  transformOrigin = { vertical: 'top', horizontal: 'right' },
  className,
  style,
  doc = document,
  ...rest
}: MenuProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [portalEl, setPortalEl] = useState<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const myId = useId();
  const activeMenuId = useMenuStore(s => s.activeMenuId);
  const setActiveMenuId = useMenuStore(s => s.setActiveMenuId);
  const [computedPlacement, setComputedPlacement] = useState<{
    anchor: Origin;
    transform: Origin;
    arrowClass: string;
    arrowStyle: React.CSSProperties;
  }>({ anchor: anchorOrigin, transform: transformOrigin, arrowClass: styles.arrowTop, arrowStyle: {} });

  // Create a persistent portal container for this instance
  useLayoutEffect(() => {
    const el = doc.createElement('div');
    el.setAttribute('data-portal', 'menu');
    el.style.position = 'absolute';
    el.style.zIndex = String(1060);
    el.style.width = 'auto';
    doc.body.appendChild(el);
    containerRef.current = el;
    setPortalEl(el);
    return () => {
      if (el.parentNode) el.parentNode.removeChild(el);
      if (containerRef.current === el) containerRef.current = null;
      setPortalEl(null);
    };
  }, [doc]);

  // When this menu opens, mark it as active
  useEffect(() => {
    if (open) setActiveMenuId(myId);
  }, [open, setActiveMenuId, myId]);
  // If another menu becomes active while this is open, close this one
  useEffect(() => {
    if (open && activeMenuId && activeMenuId !== myId) {
      onClose();
    }
  }, [activeMenuId, open, onClose, myId]);

  // Close on outside click, but ignore clicks within wrapper or anchorEl
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      if (wrapper.contains(target)) return; // click inside menu
      if (anchorEl && anchorEl.contains(target)) return; // click on anchor should not close
      onClose();
    };
    doc.addEventListener('mousedown', onPointerDown);
    doc.addEventListener('touchstart', onPointerDown);
    return () => {
      doc.removeEventListener('mousedown', onPointerDown);
      doc.removeEventListener('touchstart', onPointerDown);
    };
  }, [open, onClose, anchorEl, doc]);

  const position = useCallback(() => {
    const container = containerRef.current;
    if (!open || !anchorEl || !container) return;

    const anchorRect = anchorEl.getBoundingClientRect();

    // temporarily make visible to measure
    container.style.visibility = 'hidden';
    container.style.display = 'block';

    const contentEl = menuRef.current;
    if (!contentEl) return;
    const menuRect = contentEl.getBoundingClientRect();
    const menuWidth = menuRect.width;
    const menuHeight = menuRect.height;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const minX = window.scrollX + 8;
    const maxX = window.scrollX + vw - menuWidth - 8;
    const minY = window.scrollY + 8;
    const maxY = window.scrollY + vh - menuHeight - 8;

    // Decide vertical orientation (top/bottom) based on space and default
    const spaceBelow = window.scrollY + vh - (anchorRect.bottom + window.scrollY);
    const spaceAbove = anchorRect.top + window.scrollY - window.scrollY;
    const preferBottom = anchorOrigin.vertical === 'bottom';
    const placeBottom = preferBottom ? spaceBelow >= 0 || spaceBelow >= spaceAbove : spaceBelow > spaceAbove;

    // Target point (center of anchor along the perpendicular axis)
    const targetX = anchorRect.left + window.scrollX + anchorRect.width / 2;

    // Respect requested horizontal anchor origin for menu edges
    // and compute a static arrow position based on that origin.
    // For vertical-placement arrows, we want:
    // - left origin: arrow near top-right corner (slightly inset)
    // - center origin: arrow centered
    // - right origin: arrow near top-left corner (slightly inset)
    const inset = 10; // keep off rounded corners
    let desiredArrowLeft: number;
    if (anchorOrigin.horizontal === 'left') {
      desiredArrowLeft = menuWidth - inset;
    } else if (anchorOrigin.horizontal === 'right') {
      desiredArrowLeft = inset;
    } else {
      desiredArrowLeft = Math.round(menuWidth / 2);
    }
    // Position menu so arrow points to the trigger center
    let left: number = Math.round(targetX - desiredArrowLeft);
    let top = placeBottom ? Math.round(anchorRect.bottom + window.scrollY) : Math.round(anchorRect.top + window.scrollY - menuHeight);

    // Clamp into viewport horizontally and vertically
    left = Math.min(Math.max(left, minX), maxX);
    top = Math.min(Math.max(top, minY), maxY);

    // Arrow orientation and alignment
    const arrowClass = placeBottom ? styles.arrowTop : styles.arrowBottom;
    // Use static arrow position based on origin; do not recenter arrow when clamped
    const arrowLeft = Math.max(inset, Math.min(menuWidth - inset, desiredArrowLeft));
    const arrowStyle: React.CSSProperties = { left: `${arrowLeft}px` };

    container.style.left = `${left}px`;
    container.style.top = `${top}px`;
    container.style.visibility = 'visible';

    setComputedPlacement({
      anchor: { vertical: placeBottom ? 'bottom' : 'top', horizontal: 'center' },
      transform: { vertical: placeBottom ? 'top' : 'bottom', horizontal: 'center' },
      arrowClass,
      arrowStyle,
    });
  }, [open, anchorEl, anchorOrigin]);

  useLayoutEffect(() => {
    if (!open) return;
    // First synchronous measure after portal children are mounted
    position();
    // Then another pass on next frame to catch late style/layout changes
    const raf = requestAnimationFrame(() => position());
    const handleResize = () => position();
    const handleScroll = () => position();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);
    let ro: ResizeObserver | null = null;
    if (menuRef.current && 'ResizeObserver' in window) {
      ro = new ResizeObserver(() => position());
      ro.observe(menuRef.current);
    }
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
      if (ro) ro.disconnect();
    };
  }, [open, position, children, className, style]);

  useEffect(() => {
    if (!open) return;
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  }, [open, onClose]);

  const content = useMemo(() => {
    if (!open) return null;
    return (
      <div ref={wrapperRef} className={`${styles.menu} ${className ?? ''}`} style={style} {...rest}>
        <div className={`${styles.arrow} ${computedPlacement.arrowClass}`} style={computedPlacement.arrowStyle} aria-hidden>
          <div className={styles.arrowBorder} />
          <div className={styles.arrowFill} />
        </div>
        <div ref={menuRef} className={styles.menuList} role='menu'>
          {children}
        </div>
      </div>
    );
  }, [open, children, className, style, rest, computedPlacement.arrowClass, computedPlacement.arrowStyle]);

  if (!open || typeof doc === 'undefined') return null;
  if (!portalEl) return null;
  return createPortal(content, portalEl);
}

Menu.displayName = 'Menu';

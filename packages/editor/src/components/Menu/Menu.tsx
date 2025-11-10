// Menu.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  cloneElement,
  isValidElement,
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
} from 'react';
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
  useInteractions,
  useListNavigation,
  useTypeahead,
  useClick,
  useDismiss,
  useRole,
  FloatingFocusManager,
  FloatingPortal,
  FloatingList,
  Placement,
  UseInteractionsReturn,
  FloatingContext,
  FloatingArrow,
  arrow,
  autoPlacement,
} from '@floating-ui/react';
import styles from './Menu.module.css';

type VirtualPoint = { x: number; y: number };

// Optional imperative controller API
export type MenuControllerRef = {
  open: () => void;
  close: () => void;
  openAtPoint: (x: number, y: number) => void;
  attachToAnchor: (el: HTMLElement | null) => void;
};

export type MenuContext = {
  open: boolean;
  setOpen: (v: boolean) => void;

  // floating core
  refs: ReturnType<typeof useFloating>['refs'];
  floatingStyles: React.CSSProperties;
  context: FloatingContext;
  getReferenceProps: UseInteractionsReturn['getReferenceProps'];
  getFloatingProps: UseInteractionsReturn['getFloatingProps'];

  // list & typeahead
  elementsRef: React.RefObject<Array<HTMLElement | null>>;
  labelsRef: React.RefObject<Array<string | null>>;
  activeIndex: number | null;
  setActiveIndex: React.Dispatch<React.SetStateAction<number | null>>;
  selectedIndex: number | null;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number | null>>;
  onSelectIndex: (index: number | null) => void;

  // anchoring variants
  setVirtualPoint: (pt: VirtualPoint | null) => void;

  // same-origin iframe outside-press
  registerIframeDocument: (doc: Document | null) => void;

  // arrow
  arrowRef: React.RefObject<SVGSVGElement | null>;
};

const Ctx = createContext<MenuContext | null>(null);
export const useMenu = (): MenuContext => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('Menu: missing provider');
  return ctx;
};

export type MenuProps = {
  children: React.ReactNode;

  // control
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;

  // behavior
  /** Use 'auto' for smart placement (default), or a concrete placement like 'bottom-start'. */
  placement?: Placement | 'auto';
  closeOnSelect?: boolean;
  matchWidth?: boolean;

  // same-origin iframe doc (optional)
  iframeDocument?: Document | null;

  // external anchor support
  anchorRef?: React.RefObject<HTMLElement | null>;
};

export const Menu = forwardRef<MenuControllerRef, MenuProps>(function Menu(
  {
    children,
    open: openProp,
    defaultOpen,
    onOpenChange,
    placement = 'auto',
    closeOnSelect = true,
    matchWidth = true,
    iframeDocument = null,
    anchorRef,
  },
  ref
) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState<boolean>(!!defaultOpen);
  const isControlled = openProp !== undefined;
  const open = isControlled ? Boolean(openProp) : uncontrolledOpen;
  const setOpen = useCallback((v: boolean) => (isControlled ? onOpenChange?.(v) : setUncontrolledOpen(v)), [isControlled, onOpenChange]);

  // Support virtual anchors (context menu)
  const virtualPointRef = useRef<VirtualPoint | null>(null);
  const setVirtualPoint = (pt: VirtualPoint | null) => {
    virtualPointRef.current = pt;
  };

  // Shared arrow ref (used by middleware + <FloatingArrow />)
  const arrowRef = useRef<SVGSVGElement | null>(null);

  // Tweak these to taste for spacing/visual comfort
  const ARROW_HEIGHT = 7;
  const GAP = 2;

  // Decide middleware based on placement mode
  const isAuto = placement === 'auto';

  // Floating core
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    // Initial placement is only used when not in auto mode.
    placement: isAuto ? 'bottom-start' : (placement as Placement),
    whileElementsMounted: autoUpdate,
    strategy: 'fixed',
    middleware: [
      offset(ARROW_HEIGHT + GAP),
      isAuto
        ? autoPlacement({
            alignment: 'start', // prefers -start aligned placements; will fall back as needed
            // You can constrain candidates if desired:
            // allowedPlacements: ['top', 'bottom', 'right', 'left'],
          })
        : flip({ fallbackPlacements: ['top-start', 'top-end', 'bottom-start', 'bottom-end', 'left-start', 'right-start'] }),
      shift({ padding: 8 }),
      arrow({ element: arrowRef }),
      {
        name: 'matchWidth',
        fn: ({ rects, elements }) => {
          if (matchWidth && elements.floating) {
            elements.floating.style.minWidth = `${rects.reference.width}px`;
          }
          return {};
        },
      },
    ],
  });

  // Use a virtual reference when opened via coordinates
  useEffect(() => {
    if (!open) return;
    const pt = virtualPointRef.current;
    if (!pt) return;
    refs.setPositionReference({
      getBoundingClientRect: () => ({
        width: 0,
        height: 0,
        x: pt.x,
        y: pt.y,
        top: pt.y,
        left: pt.x,
        right: pt.x,
        bottom: pt.y,
      }),
    });
  }, [open, refs]);

  // 🔗 Wire an external anchorRef (if provided) before paint
  useLayoutEffect(() => {
    const el = anchorRef?.current ?? null;
    if (!el) return;
    setVirtualPoint(null);
    refs.setReference(el);
  }, [anchorRef?.current, refs]); // eslint-disable-line react-hooks/exhaustive-deps

  // Interactions
  const elementsRef = useRef<Array<HTMLElement | null>>([]);
  const labelsRef = useRef<Array<string | null>>([]);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const onSelectIndex = useCallback(
    (index: number | null) => {
      setSelectedIndex(index);
      if (closeOnSelect) setOpen(false);
    },
    [closeOnSelect, setOpen]
  );

  const listNav = useListNavigation(context, {
    listRef: elementsRef,
    activeIndex,
    selectedIndex,
    onNavigate: setActiveIndex,
    loop: false,
  });

  const typeahead = useTypeahead(context, {
    listRef: labelsRef,
    activeIndex,
    selectedIndex,
    onMatch: index => {
      if (open) setActiveIndex(index);
      else onSelectIndex(index);
    },
  });

  const click = useClick(context, { toggle: true });
  const dismiss = useDismiss(context, {
    escapeKey: true,
    outsidePress: true,
    referencePress: false,
    ancestorScroll: true,
  });
  const role = useRole(context, { role: 'menu' });

  const { getReferenceProps, getFloatingProps } = useInteractions([listNav, typeahead, click, dismiss, role]);

  // Same-origin iframe outside-press support
  const iframeDocRef = useRef<Document | null>(iframeDocument);
  const registerIframeDocument = (doc: Document | null) => {
    iframeDocRef.current = doc;
  };
  useEffect(() => {
    if (!open || !iframeDocRef.current) return;
    const d = iframeDocRef.current;
    const close = () => setOpen(false);
    d.addEventListener('pointerdown', close, { passive: true });
    return () => d.removeEventListener('pointerdown', close);
  }, [open, setOpen]);

  useImperativeHandle(
    ref,
    (): MenuControllerRef => ({
      open: () => {
        setVirtualPoint(null);
        setOpen(true);
      },
      close: () => setOpen(false),
      openAtPoint: (x, y) => {
        setVirtualPoint({ x, y });
        setOpen(true);
      },
      attachToAnchor: (el: HTMLElement | null) => {
        setVirtualPoint(null);
        refs.setReference(el);
      },
    }),
    [setOpen, refs]
  );

  const value = useMemo<MenuContext>(
    () => ({
      open,
      setOpen,
      refs,
      floatingStyles,
      context,
      getReferenceProps,
      getFloatingProps,
      elementsRef,
      labelsRef,
      activeIndex,
      setActiveIndex,
      selectedIndex,
      setSelectedIndex,
      onSelectIndex,
      setVirtualPoint,
      registerIframeDocument,
      arrowRef,
    }),
    [open, setOpen, refs, floatingStyles, context, getReferenceProps, getFloatingProps, activeIndex, selectedIndex, onSelectIndex]
  );

  return (
    <Ctx.Provider value={value}>
      <Cleanup />
      {children}
    </Ctx.Provider>
  );
});

function Cleanup() {
  const { setActiveIndex, setVirtualPoint, setSelectedIndex } = useMenu();
  // reset certain values on unmount in the menu store
  useEffect(() => {
    return () => {
      setActiveIndex(null);
      setSelectedIndex(null);
      setVirtualPoint(null);
    };
  }, [setActiveIndex, setSelectedIndex, setVirtualPoint]);
  return null;
}

/** Anchor the menu to any element (use with `asChild`) */
export function MenuAnchor({ children }: { children: React.ReactElement }) {
  const { refs, getReferenceProps, open, setOpen } = useMenu();
  const child = isValidElement(children) ? children : <button type='button'>{children}</button>;

  const mergedRef = (node: HTMLElement | null) => {
    refs.setReference(node);
    const refProp = (child as React.ReactElement & { ref?: React.Ref<HTMLElement> }).ref;
    if (typeof refProp === 'function') refProp(node);
    else if (refProp && typeof refProp === 'object') {
      refProp.current = node;
    }
  };

  return cloneElement(child, {
    ...getReferenceProps({
      onKeyDown: (e: React.KeyboardEvent) => {
        if ((e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') && !open) {
          e.preventDefault();
          setOpen(true);
        }
      },
      onClick(event) {
        event.stopPropagation();
      },
    }),
    ref: mergedRef,
    'aria-haspopup': 'menu',
    'aria-expanded': open,
  });
}

// MenuContent – renders the floating menu + arrow
export function MenuContent({
  className,
  style,
  portal = true,
  focusManager = false,
  children,
  arrowWidth = 12,
  arrowHeight = 7,
  tipRadius = 1.5,
}: {
  className?: string;
  style?: React.CSSProperties;
  portal?: boolean;
  focusManager?: boolean;
  children: React.ReactNode;
  arrowWidth?: number;
  arrowHeight?: number;
  tipRadius?: number;
}) {
  const { open, refs, floatingStyles, getFloatingProps, elementsRef, labelsRef, setActiveIndex, context, arrowRef } = useMenu();
  if (!open) return null;

  const body = (
    <div
      {...getFloatingProps({
        ref: refs.setFloating,
        className: [className, styles.menu].filter(Boolean).join(' '),
        style: { ...floatingStyles, ...style },
        onMouseLeave: () => setActiveIndex(null),
      })}
    >
      <FloatingList elementsRef={elementsRef} labelsRef={labelsRef}>
        {children}
      </FloatingList>

      {/* Arrow is measured/positioned by middleware via the shared ref */}
      <FloatingArrow
        ref={arrowRef}
        context={context}
        width={arrowWidth}
        height={arrowHeight}
        tipRadius={tipRadius}
        className={styles.arrow}
      />
    </div>
  );

  const wrapped = focusManager ? (
    <FloatingFocusManager context={context} modal={false} initialFocus={-1} returnFocus={false}>
      {body}
    </FloatingFocusManager>
  ) : (
    body
  );

  return portal ? <FloatingPortal>{wrapped}</FloatingPortal> : wrapped;
}

/** Controller helpers: open at point, or attach to an external ref */
export function useMenuController() {
  const { setOpen, setVirtualPoint, refs } = useMenu();

  const openAtPoint = (clientX: number, clientY: number) => {
    setVirtualPoint({ x: clientX, y: clientY });
    setOpen(true);
  };

  const close = () => setOpen(false);

  const attachToAnchorRef = (el: HTMLElement | null) => {
    if (el) {
      setVirtualPoint(null);
      refs.setReference(el);
    }
  };

  return { openAtPoint, close, attachToAnchorRef };
}

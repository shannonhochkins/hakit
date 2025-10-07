import React from 'react';
import { createPortal } from 'react-dom';

// Global registry to close all dropdowns except the one requesting focus
const activeDropdowns = new Set<() => void>();

export const registerDropdown = (closeFn: () => void) => {
  activeDropdowns.add(closeFn);
  return () => {
    activeDropdowns.delete(closeFn);
  };
};

export const closeAllDropdowns = (except?: () => void) => {
  activeDropdowns.forEach(closeFn => {
    if (closeFn !== except) {
      closeFn();
    }
  });
};

type UseDropdownPortalArgs = {
  anchorRef: React.RefObject<HTMLDivElement | null>;
  isOpen: boolean;
  onRequestClose: () => void;
  /** Overlap the anchor bottom border by pixels */
  overlap?: number;
  /** Match portal width to anchor width including borders */
  matchWidth?: boolean;
  /** Handle request to open dropdown */
  onRequestOpen?: () => void;
  /** Handle navigation within dropdown */
  onNavigateDown?: () => void;
  onNavigateUp?: () => void;
  onSelectCurrent?: () => void;
};

export function useDropdownPortal({
  anchorRef,
  isOpen,
  onRequestClose,
  overlap = 1,
  matchWidth = true,
  onRequestOpen,
  onNavigateDown,
  onNavigateUp,
  onSelectCurrent,
}: UseDropdownPortalArgs) {
  // Register this dropdown for global focus management
  React.useEffect(() => {
    const unregister = registerDropdown(onRequestClose);
    return unregister;
  }, [onRequestClose]);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const ensureContainer = React.useCallback(() => {
    if (!containerRef.current) {
      const el = document.createElement('div');
      el.setAttribute('data-portal', 'dropdown');
      el.style.position = 'absolute';
      el.style.zIndex = '9999';
      containerRef.current = el;
      document.body.appendChild(el);
    }
    return containerRef.current;
  }, []);

  const position = React.useCallback(() => {
    const anchor = anchorRef?.current;
    const container = containerRef.current;
    if (!anchor || !container) return;
    const rect = anchor.getBoundingClientRect();
    const top = rect.top + window.scrollY + rect.height - overlap;
    const left = rect.left + window.scrollX - 1; // overlap left border by 1px
    container.style.top = `${top}px`;
    container.style.left = `${left}px`;
    if (matchWidth) container.style.width = `${rect.width + 2}px`; // include right border
  }, [anchorRef, overlap, matchWidth]);

  // Close on outside click
  React.useEffect(() => {
    if (!isOpen) return;
    ensureContainer();
    position();

    const handleClick = (e: MouseEvent) => {
      const anchor = anchorRef?.current;
      const container = containerRef.current;
      const target = e.target as Node;
      if (!anchor || !container) return;
      if (!anchor.contains(target) && !container.contains(target)) onRequestClose();
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') onRequestClose();
    };
    const handleScroll = () => position();
    const handleResize = () => position();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onRequestClose();
      } else if (e.key === 'ArrowDown') {
        if (!isOpen && onRequestOpen) {
          // Open dropdown
          closeAllDropdowns(onRequestClose);
          onRequestOpen();
        } else if (isOpen && onNavigateDown) {
          // Navigate down within dropdown - prevent page scroll
          e.preventDefault();
          onNavigateDown();
        }
      } else if (e.key === 'ArrowUp' && isOpen && onNavigateUp) {
        // Navigate up within dropdown - prevent page scroll
        e.preventDefault();
        onNavigateUp();
      } else if (e.key === 'Enter' && isOpen && onSelectCurrent) {
        // Select current option - prevent form submission
        e.preventDefault();
        onSelectCurrent();
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKey);
    };
  }, [anchorRef, ensureContainer, onRequestOpen, onNavigateDown, onNavigateUp, onSelectCurrent, isOpen, onRequestClose, position]);

  // Cleanup container when unmount
  React.useEffect(() => {
    return () => {
      if (containerRef.current && containerRef.current.parentNode) {
        containerRef.current.parentNode.removeChild(containerRef.current);
      }
      containerRef.current = null;
    };
  }, []);

  const renderPortal = React.useCallback(
    (children: React.ReactNode, className?: string) => {
      if (!isOpen) return null;
      const el = ensureContainer();
      if (className) el.className = className;
      // ensure latest position before paint
      position();
      return createPortal(children, el);
    },
    [ensureContainer, isOpen, position]
  );

  return { renderPortal } as const;
}

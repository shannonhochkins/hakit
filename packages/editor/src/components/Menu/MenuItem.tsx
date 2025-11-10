import React, { useState, useCallback } from 'react';
import { useListItem, useInteractions } from '@floating-ui/react';
import { useMenu } from './Menu';
import { MenuItemInner, MenuItemInnerProps } from './MenuItemInner';
import { AutoHeight } from '@components/AutoHeight';
import { ChevronDown, ChevronUp } from 'lucide-react';
import styles from './MenuItemInner.module.css';

export type MenuItemProps = Omit<MenuItemInnerProps, 'type'> & {
  label?: string;
  variant?: 'item' | 'group';
  defaultOpen?: boolean; // for group items
  children?: React.ReactNode; // group children
};

export function MenuItem({ label, onClick, variant = 'item', defaultOpen = false, children, ...rest }: MenuItemProps) {
  const { onSelectIndex, activeIndex } = useMenu();
  const { ref, index } = useListItem({ label });
  const { getItemProps } = useInteractions([]);

  const [open, setOpen] = useState(defaultOpen);

  const toggle = useCallback(() => setOpen(o => !o), []);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (variant === 'group') {
      // prevent menu auto-closing on group header select
      e.preventDefault();
      e.stopPropagation();
      toggle();
      return;
    }
    onClick?.(e);
    onSelectIndex(index);
  };

  const highlighted = activeIndex === index;

  // Render simple item
  if (variant === 'item') {
    return (
      <MenuItemInner
        {...getItemProps({
          ref,
          role: 'menuitem',
          onClick: handleClick,
        })}
        data-highlighted={highlighted ? 'true' : 'false'}
        {...rest}
      >
        {children ?? label}
      </MenuItemInner>
    );
  }

  // Render group header + collapsible content
  return (
    <>
      <MenuItemInner
        {...getItemProps({
          ref,
          role: 'menuitem',
          onClick: handleClick,
        })}
        aria-haspopup='true'
        aria-expanded={open}
        data-highlighted={highlighted ? 'true' : 'false'}
        endIcon={open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        {...rest}
      >
        {label}
      </MenuItemInner>
      <AutoHeight isOpen={open} duration={180} className={styles.menuGroupChildren}>
        <div role='group' aria-label={label} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          {children}
        </div>
      </AutoHeight>
    </>
  );
}

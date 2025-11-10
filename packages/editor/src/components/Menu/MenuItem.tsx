import React from 'react';
import { useListItem, useInteractions } from '@floating-ui/react';
import { useMenu } from './Menu';
import { MenuItemInner, MenuItemInnerProps } from './MenuItemInner';

export type MenuItemProps = MenuItemInnerProps & { label?: string };

export function MenuItem({ label, onClick, ...rest }: MenuItemProps) {
  const { onSelectIndex, activeIndex } = useMenu();
  const { ref, index } = useListItem({ label });
  const { getItemProps } = useInteractions([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    onSelectIndex(index);
  };

  const highlighted = activeIndex === index;

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
      {rest.children ?? label}
    </MenuItemInner>
  );
}

import { Column, Row } from '@components/Layout';
import { Group } from '@components/Group';
import { Menu, MenuAnchor, MenuContent, MenuItem, useMenuController, type MenuControllerRef } from '@components/Menu';
import { IconButton } from '@components/Button';
import { MoreVertical } from 'lucide-react';
import { useRef } from 'react';

export function StyleguidePageMenu() {
  const externalBtnRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<MenuControllerRef | null>(null);

  return (
    <Column fullWidth alignItems='start' justifyContent='start' gap='var(--space-4)' style={{ padding: 'var(--space-4) 0' }}>
      <Group title='Standard anchored menu'>
        <Menu placement='bottom-start' closeOnSelect matchWidth>
          <MenuAnchor>
            <IconButton icon={<MoreVertical size={16} />} aria-label='Open menu' />
          </MenuAnchor>

          <MenuContent>
            <MenuItem label='Rename' onClick={() => console.log('Rename')} />
            <MenuItem label='Duplicate' onClick={() => console.log('Duplicate')} />
            <MenuItem label='Delete' onClick={() => console.log('Delete')} />
          </MenuContent>
        </Menu>
      </Group>

      <Group title='Multiple Menus'>
        <Row justifyContent='space-between' gap='var(--space-4)' fullWidth>
          <Menu placement='bottom-start' closeOnSelect matchWidth>
            <MenuAnchor>
              <IconButton icon={<MoreVertical size={16} />} aria-label='Open menu' />
            </MenuAnchor>

            <MenuContent>
              <MenuItem label='Long Label Rename' onClick={() => console.log('Long Label Rename')} />
              <MenuItem label='Duplicate' onClick={() => console.log('Duplicate')} />
              <MenuItem label='Delete' onClick={() => console.log('Delete')} />
            </MenuContent>
          </Menu>
          <Menu placement='bottom-start' closeOnSelect matchWidth>
            <MenuAnchor>
              <IconButton icon={<MoreVertical size={16} />} aria-label='Open menu' />
            </MenuAnchor>

            <MenuContent>
              <MenuItem label='Long Label Rename' onClick={() => console.log('Long Label Rename')} />
              <MenuItem label='Duplicate' onClick={() => console.log('Duplicate')} />
              <MenuItem label='Delete' onClick={() => console.log('Delete')} />
            </MenuContent>
          </Menu>
          <Menu placement='bottom-start' closeOnSelect matchWidth>
            <MenuAnchor>
              <IconButton icon={<MoreVertical size={16} />} aria-label='Open menu' />
            </MenuAnchor>

            <MenuContent>
              <MenuItem label='Long Label Rename' onClick={() => console.log('Long Label Rename')} />
              <MenuItem label='Duplicate' onClick={() => console.log('Duplicate')} />
              <MenuItem label='Delete' onClick={() => console.log('Delete')} />
            </MenuContent>
          </Menu>
          <Menu placement='bottom-start' closeOnSelect matchWidth>
            <MenuAnchor>
              <IconButton icon={<MoreVertical size={16} />} aria-label='Open menu' />
            </MenuAnchor>

            <MenuContent>
              <MenuItem label='Long Label Rename' onClick={() => console.log('Long Label Rename')} />
              <MenuItem label='Duplicate' onClick={() => console.log('Duplicate')} />
              <MenuItem label='Delete' onClick={() => console.log('Delete')} />
            </MenuContent>
          </Menu>
        </Row>
      </Group>

      <Group title='External anchor' description='Button elsewhere else opens the menu'>
        <IconButton
          ref={externalBtnRef}
          icon={<MoreVertical size={16} />}
          aria-label='Open menu'
          onClick={() => {
            menuRef.current?.open();
          }}
        />
        <Menu ref={menuRef} closeOnSelect anchorRef={externalBtnRef}>
          <MenuContent className='menu'>
            <MenuItem label='Cut' onClick={() => console.log('Cut')} />
            <MenuItem label='Copy' onClick={() => console.log('Copy')} />
            <MenuItem label='Paste' onClick={() => console.log('Paste')} />
          </MenuContent>
        </Menu>
      </Group>

      <Group title='Context menu (no fixed trigger)'>
        <Menu placement='right-start' closeOnSelect>
          <RightClickArea />
          <MenuContent className='menu'>
            <MenuItem label='Cut' onClick={() => console.log('Cut')} />
            <MenuItem label='Copy' onClick={() => console.log('Copy')} />
            <MenuItem label='Paste' onClick={() => console.log('Paste')} />
          </MenuContent>
        </Menu>
      </Group>
    </Column>
  );
}

function RightClickArea() {
  const { openAtPoint } = useMenuController();
  return (
    <div
      style={{ border: '1px dashed #aaa', padding: 24 }}
      onContextMenu={e => {
        e.preventDefault();
        openAtPoint(e.clientX, e.clientY);
      }}
    >
      Right-click me
    </div>
  );
}

import { Menu, MenuContent, MenuItem } from '@components/Menu';
import { EyeIcon, EditIcon, FileTextIcon, PlusIcon, LayoutDashboardIcon } from 'lucide-react';

type DashboardMenuProps = {
  type: 'dashboard';
  id: string;
  onView: (type: 'dashboard', id: string) => void;
  onEdit: (type: 'dashboard', id: string) => void;
  onDuplicate: (type: 'dashboard', id: string) => void;
  onCreatePage: (dashboardId: string) => void;
  onDesign: (type: 'dashboard', id: string) => void;
  onDelete: (type: 'dashboard', id: string) => void;
};

type PageMenuProps = {
  type: 'page';
  id: string;
  dashboardId: string;
  onView: (type: 'page', id: string, dashboardId: string) => void;
  onEdit: (type: 'page', id: string, dashboardId: string) => void;
  onDuplicate: (type: 'page', id: string, dashboardId: string) => void;
  onDesign: (type: 'page', id: string, dashboardId: string) => void;
  onDelete: (type: 'page', id: string, dashboardId: string) => void;
};

type ActionsMenuCommonProps = {
  /** External anchor element coming from Dashboards */
  anchorEl: HTMLElement | null;
  /** Controlled open coming from Dashboards */
  open: boolean;
  /** When the menu closes, notify Dashboards to clear its local state */
  onClose: () => void;
};

type ActionsMenuProps = ActionsMenuCommonProps & (DashboardMenuProps | PageMenuProps);

export const ActionMenu = (props: ActionsMenuProps) => {
  const { onClose, open, anchorEl, type, id } = props;

  return (
    <Menu
      // Controlled open from parent
      open={open}
      onOpenChange={(isOpen: boolean) => {
        if (!isOpen) onClose();
      }}
      // Anchor to external trigger element
      anchorRef={{ current: anchorEl }}
      // Make placement smart by default (works with arrow & flipping)
      placement='auto'
      // Close after selecting an item
      closeOnSelect
      // Keep widths independent for action menus (toggle to true if you want 1:1 width)
      matchWidth={false}
    >
      <MenuContent>
        <MenuItem
          onClick={() => {
            if (type === 'dashboard') {
              props.onDesign('dashboard', id);
            } else {
              props.onDesign('page', id, props.dashboardId);
            }
          }}
          startIcon={<LayoutDashboardIcon size={16} />}
          label={type === 'dashboard' ? 'Design Dashboard' : 'Design Page'}
        />

        <MenuItem
          onClick={() => {
            if (type === 'dashboard') {
              props.onView('dashboard', id);
            } else {
              props.onView('page', id, props.dashboardId);
            }
          }}
          startIcon={<EyeIcon size={16} />}
          label={type === 'dashboard' ? 'View Dashboard' : 'View Page'}
        />

        <MenuItem
          onClick={() => {
            if (type === 'dashboard') {
              props.onEdit('dashboard', id);
            } else {
              props.onEdit('page', id, props.dashboardId);
            }
          }}
          startIcon={<EditIcon size={16} />}
          label={type === 'dashboard' ? 'Rename Dashboard' : 'Rename Page'}
        />

        <MenuItem
          onClick={() => {
            if (type === 'dashboard') {
              props.onDuplicate('dashboard', id);
            } else {
              props.onDuplicate('page', id, props.dashboardId);
            }
          }}
          startIcon={<FileTextIcon size={16} />}
          label={type === 'dashboard' ? 'Duplicate Dashboard' : 'Duplicate Page'}
        />

        {type === 'dashboard' && <MenuItem label='Add page' onClick={() => props.onCreatePage(id)} startIcon={<PlusIcon size={16} />} />}

        <MenuItem
          onClick={() => {
            if (type === 'dashboard') {
              props.onDelete('dashboard', id);
            } else {
              props.onDelete('page', id, props.dashboardId);
            }
          }}
          startIcon={<LayoutDashboardIcon size={16} />}
          style={{ color: 'var(--color-error-500)' }}
          label={type === 'dashboard' ? 'Delete Dashboard' : 'Delete Page'}
        />
      </MenuContent>
    </Menu>
  );
};

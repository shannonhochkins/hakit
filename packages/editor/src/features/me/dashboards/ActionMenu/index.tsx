import { Menu, MenuItem } from '@components/Menu';
import { EyeIcon, EditIcon, FileTextIcon, PlusIcon, LayoutDashboardIcon } from 'lucide-react';

// Types for ActionsMenu
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

type ActionsMenuProps = {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
} & (DashboardMenuProps | PageMenuProps);

// Add the Menu component for actions
export const ActionMenu = (props: ActionsMenuProps) => {
  const { anchorEl, open, onClose, type, id } = props;

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
    >
      <MenuItem
        onClick={() => {
          if (type === 'dashboard') {
            props.onDesign('dashboard', id);
          } else {
            props.onDesign('page', id, props.dashboardId);
          }
        }}
        startIcon={<LayoutDashboardIcon size={16} />}
      >
        {type === 'dashboard' ? 'Design Dashboard' : 'Design Page'}
      </MenuItem>
      <MenuItem
        onClick={() => {
          if (type === 'dashboard') {
            props.onView('dashboard', id);
          } else {
            props.onView('page', id, props.dashboardId);
          }
        }}
        startIcon={<EyeIcon size={16} />}
      >
        {type === 'dashboard' ? 'View Dashboard' : 'View Page'}
      </MenuItem>
      <MenuItem
        onClick={() => {
          if (type === 'dashboard') {
            props.onEdit('dashboard', id);
          } else {
            props.onEdit('page', id, props.dashboardId);
          }
        }}
        startIcon={<EditIcon size={16} />}
      >
        {type === 'dashboard' ? 'Rename Dashboard' : 'Rename Page'}
      </MenuItem>
      <MenuItem
        onClick={() => {
          if (type === 'dashboard') {
            props.onDuplicate('dashboard', id);
          } else {
            props.onDuplicate('page', id, props.dashboardId);
          }
        }}
        startIcon={<FileTextIcon size={16} />}
      >
        {type === 'dashboard' ? 'Duplicate Dashboard' : 'Duplicate Page'}
      </MenuItem>
      {type === 'dashboard' && (
        <MenuItem onClick={() => props.onCreatePage(id)} startIcon={<PlusIcon size={16} />}>
          Add Page
        </MenuItem>
      )}
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
      >
        {type === 'dashboard' ? 'Delete Dashboard' : 'Delete Page'}
      </MenuItem>
    </Menu>
  );
};

import React from 'react';
import { Menu, X } from 'lucide-react';
import { Tooltip } from '../Tooltip';
import { IconButton } from '../IconButtons';

type Props = {
  open: boolean;
  onToggle: () => void;
};

export const NavigationSidebarToggle: React.FC<Props> = ({ open, onToggle }) => {
  return (
    <Tooltip title="Toggle Menu" placement="right">
      <IconButton
        title="Toggle Menu"
        onClick={onToggle}
      >
        {open ? <X size={32} /> : <Menu size={32} />}
      </IconButton>
    </Tooltip>
  );
};

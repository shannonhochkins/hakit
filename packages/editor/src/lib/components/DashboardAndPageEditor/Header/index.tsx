import Stack from '@mui/material/Stack';
import { Bell } from 'lucide-react';
import NavbarBreadcrumbs from '../Breadcrumbs';
import MenuButton from '../MenuButton';

export default function Header() {
  return (
    <Stack
      direction="row"
      sx={{
        display: { xs: 'none', md: 'flex' },
        width: '100%',
        alignItems: { xs: 'flex-start', md: 'center' },
        justifyContent: 'space-between',
        maxWidth: { sm: '100%', md: '1700px' },
        pt: 1.5,
      }}
      spacing={2}
    >
      <NavbarBreadcrumbs />
      <Stack direction="row" sx={{ gap: 1 }}>
        <MenuButton showBadge aria-label="Open notifications">
          <Bell />
        </MenuButton>
      </Stack>
    </Stack>
  );
}
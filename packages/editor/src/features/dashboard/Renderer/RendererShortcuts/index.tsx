import { useKeyboardShortcuts } from '@hooks/useKeyboardShortcut';
import { useNavigate, useParams } from '@tanstack/react-router';

export function RendererShortcuts() {
  const params = useParams({
    strict: false,
  });
  const navigate = useNavigate();

  // Keyboard shortcut callbacks
  const handleNavigateToEditor = () => {
    const { dashboardPath, pagePath } = params;
    if (!dashboardPath || !pagePath) {
      // Dashboard path or page path is missing
      return;
    }
    navigate({
      to: `/dashboard/${dashboardPath}/${pagePath}/edit/`,
    });
  };

  useKeyboardShortcuts([
    {
      keys: ['ctrl', 'shift', 'e'],
      onEvent: handleNavigateToEditor,
    },
  ]);

  return null;
}

import { useKeyboardShortcuts } from '@hooks/useKeyboardShortcut';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useGlobalStore } from '@hooks/useGlobalStore';
import { useUnsavedChanges } from '@hooks/useUnsavedChanges';
import { toast } from 'react-toastify';

export function EditorShortcuts() {
  const params = useParams({
    strict: false,
  });
  const navigate = useNavigate();
  const { actions } = useGlobalStore();
  const { hasUnsavedChanges, removeStoredData } = useUnsavedChanges();

  // Keyboard shortcut callbacks
  const handleNavigateToPublishedDashboard = () => {
    const { dashboardPath, pagePath } = params;
    if (!dashboardPath || !pagePath) {
      // Dashboard path or page path is missing
      return;
    }
    navigate({
      to: `/dashboard/${dashboardPath}/${pagePath}/`,
    });
  };

  const handleSave = async () => {
    if (!hasUnsavedChanges) {
      toast('No changes to save', {
        type: 'info',
        theme: 'dark',
      });
      return;
    }
    const { pagePath } = params;
    if (!pagePath) {
      // Page path is missing
      toast.error('Cannot save: Page path not found.');
      return;
    }
    try {
      await actions.save(pagePath, removeStoredData);
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  useKeyboardShortcuts([
    {
      keys: ['ctrl', 'shift', 'd'],
      onEvent: handleNavigateToPublishedDashboard,
    },
    {
      keys: ['ctrl', 's'],
      onEvent: handleSave,
    },
  ]);

  return null;
}

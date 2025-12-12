/** export reusable utils/hooks, these utils/hooks won't actually be part of the addon code
 * Module federation will handle some magic there.
 *
 *
 * IMPORTANT - This file is copied into the addon directory when it builds the addon package
 */
export { registerOverlayPortal } from '@measured/puck';
export { generateId } from '@shared/helpers/generateId';

// reusable hooks
export { useLocalStorage } from '@hooks/useLocalStorage';
export { useKeyboardShortcuts } from '@hooks/useKeyboardShortcut';
export { usePrevious } from '@hooks/usePrevious';
export { useIsPageEditMode } from '@hooks/useIsPageEditMode';
export { useElementSizeChange } from '@hooks/useElementSizeChange';
export { useHakit } from '@hooks/useHakit';

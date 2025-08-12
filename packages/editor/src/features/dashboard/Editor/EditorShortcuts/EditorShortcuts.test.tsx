import { expect, test, describe, beforeEach, afterAll, mock } from 'bun:test';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { createElement } from 'react';
import { createModuleMocker } from '@test-utils/moduleMocker';

/**
 * Due to an issue with Bun (https://github.com/oven-sh/bun/issues/7823), we need to manually restore mocked modules
 * after we're done. We do this by setting the mocked value to the original module.
 */

// Set up module mocker at top level
const moduleMocker = createModuleMocker();

// Mock functions for testing
const mockNavigate = mock(() => {});
const mockUseNavigate = mock(() => mockNavigate);
let mockParamsValue = {
  dashboardPath: 'test-dashboard',
  pagePath: 'test-page',
};
const mockUseParams = mock(() => mockParamsValue);
const mockSaveAction = mock(() => Promise.resolve());
const mockUseGlobalStore = mock(() => ({
  actions: {
    save: mockSaveAction,
  },
}));
const mockRemoveStoredData = mock(() => {});
let mockUnsavedChangesValue = {
  hasUnsavedChanges: true,
  removeStoredData: mockRemoveStoredData,
};
const mockUseUnsavedChanges = mock(() => mockUnsavedChangesValue);

// Track keyboard shortcuts registered
let registeredShortcuts: Array<{ keys: string[]; onEvent: () => void }> = [];
const mockUseKeyboardShortcuts = mock((shortcuts: Array<{ keys: string[]; onEvent: () => void }>) => {
  registeredShortcuts = shortcuts;
});

const mockToast = mock(() => {});

await moduleMocker.mock('@tanstack/react-router', () => ({
  useNavigate: mockUseNavigate,
  useParams: mockUseParams,
}));

await moduleMocker.mock('@hooks/useGlobalStore', () => ({
  useGlobalStore: mockUseGlobalStore,
}));

await moduleMocker.mock('@hooks/useUnsavedChanges', () => ({
  useUnsavedChanges: mockUseUnsavedChanges,
}));

await moduleMocker.mock('@hooks/useKeyboardShortcut', () => ({
  useKeyboardShortcuts: mockUseKeyboardShortcuts,
}));

await moduleMocker.mock('react-toastify', () => ({
  toast: mockToast,
}));

// Now import the component to test
import { EditorShortcuts } from './index';

describe('EditorShortcuts', () => {
  beforeEach(() => {
    // Reset all mocks
    mockNavigate.mockClear();
    mockUseNavigate.mockClear();
    mockUseParams.mockClear();
    mockUseGlobalStore.mockClear();
    mockUseUnsavedChanges.mockClear();
    mockUseKeyboardShortcuts.mockClear();
    mockSaveAction.mockClear();
    mockRemoveStoredData.mockClear();
    mockToast.mockClear();
    registeredShortcuts = [];

    // Reset mock values to defaults
    mockParamsValue = {
      dashboardPath: 'test-dashboard',
      pagePath: 'test-page',
    };
    mockUnsavedChangesValue = {
      hasUnsavedChanges: true,
      removeStoredData: mockRemoveStoredData,
    };
  });

  afterAll(() => {
    // No-op: cleanup handled by createModuleMocker()
  });

  test('should create component without throwing', () => {
    const result = EditorShortcuts();
    expect(result).toBe(null); // Component returns null
  });

  test('should register keyboard shortcuts with correct keys', () => {
    EditorShortcuts(); // Actually call the component function to trigger hooks

    expect(mockUseKeyboardShortcuts).toHaveBeenCalledTimes(1);
    expect(registeredShortcuts).toHaveLength(2);

    const [navigateShortcut, saveShortcut] = registeredShortcuts;
    expect(navigateShortcut.keys).toEqual(['ctrl', 'shift', 'd']);
    expect(saveShortcut.keys).toEqual(['ctrl', 's']);
    expect(typeof navigateShortcut.onEvent).toBe('function');
    expect(typeof saveShortcut.onEvent).toBe('function');
  });

  test('should navigate to published dashboard when navigate shortcut is triggered', () => {
    render(createElement(EditorShortcuts));

    const navigateShortcut = registeredShortcuts[0];
    navigateShortcut.onEvent();

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/dashboard/test-dashboard/test-page/',
    });
  });

  test('should not navigate when dashboard path is missing', () => {
    mockParamsValue.dashboardPath = '';

    render(createElement(EditorShortcuts));

    const navigateShortcut = registeredShortcuts[0];
    navigateShortcut.onEvent();

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('should not navigate when page path is missing', () => {
    mockParamsValue.pagePath = '';

    render(createElement(EditorShortcuts));

    const navigateShortcut = registeredShortcuts[0];
    navigateShortcut.onEvent();

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('should call save action when save shortcut is triggered and has unsaved changes', async () => {
    render(createElement(EditorShortcuts));

    const saveShortcut = registeredShortcuts[1];
    await saveShortcut.onEvent();

    expect(mockSaveAction).toHaveBeenCalledWith('test-page', mockRemoveStoredData);
  });

  test('should show toast when save shortcut is triggered but no unsaved changes', async () => {
    mockUnsavedChangesValue.hasUnsavedChanges = false;

    render(createElement(EditorShortcuts));

    const saveShortcut = registeredShortcuts[1];
    await saveShortcut.onEvent();

    expect(mockToast).toHaveBeenCalledWith('No changes to save', {
      type: 'info',
      theme: 'dark',
    });
    expect(mockSaveAction).not.toHaveBeenCalled();
  });

  test('should handle save errors gracefully', async () => {
    const mockError = new Error('Save failed');
    mockSaveAction.mockRejectedValueOnce(mockError);

    const consoleSpy = mock(() => {});
    const originalError = console.error;
    console.error = consoleSpy;

    render(createElement(EditorShortcuts));

    const saveShortcut = registeredShortcuts[1];
    await saveShortcut.onEvent();

    expect(consoleSpy).toHaveBeenCalledWith('Save failed:', mockError);

    // Restore console.error
    console.error = originalError;
  });

  test('should call useParams with correct options', () => {
    render(createElement(EditorShortcuts));

    expect(mockUseParams).toHaveBeenCalledWith({
      strict: false,
    });
  });

  test('should call all required hooks', () => {
    render(createElement(EditorShortcuts));

    expect(mockUseParams).toHaveBeenCalled();
    expect(mockUseNavigate).toHaveBeenCalledWith();
    expect(mockUseGlobalStore).toHaveBeenCalled();
    expect(mockUseUnsavedChanges).toHaveBeenCalled();
    expect(mockUseKeyboardShortcuts).toHaveBeenCalled();
  });

  test('should be integrated into Editor component', async () => {
    // Test that EditorShortcuts is properly integrated into the Editor
    const { Editor } = await import('../index');

    expect(Editor).toBeDefined();
    expect(typeof Editor).toBe('function');

    // Check that Editor component source references EditorShortcuts
    const editorStr = Editor.toString();
    expect(editorStr).toContain('EditorShortcuts');
  });
});

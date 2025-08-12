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

// Track keyboard shortcuts registered
let registeredShortcuts: Array<{ keys: string[]; onEvent: () => void }> = [];
const mockUseKeyboardShortcuts = mock((shortcuts: Array<{ keys: string[]; onEvent: () => void }>) => {
  registeredShortcuts = shortcuts;
});

await moduleMocker.mock('@tanstack/react-router', () => ({
  useNavigate: mockUseNavigate,
  useParams: mockUseParams,
}));

await moduleMocker.mock('@hooks/useKeyboardShortcut', () => ({
  useKeyboardShortcuts: mockUseKeyboardShortcuts,
}));

// Now import the component to test
import { RendererShortcuts } from './index';

describe('RendererShortcuts', () => {
  beforeEach(() => {
    // Reset all mocks
    mockNavigate.mockClear();
    mockUseNavigate.mockClear();
    mockUseParams.mockClear();
    mockUseKeyboardShortcuts.mockClear();
    registeredShortcuts = [];

    // Reset mock values to defaults
    mockParamsValue = {
      dashboardPath: 'test-dashboard',
      pagePath: 'test-page',
    };
  });

  afterAll(() => {
    // No-op: cleanup handled by createModuleMocker()
  });

  test('should create component without throwing', () => {
    const result = RendererShortcuts();
    expect(result).toBe(null); // Component returns null
  });

  test('should register keyboard shortcut with correct keys', () => {
    render(createElement(RendererShortcuts));

    expect(mockUseKeyboardShortcuts).toHaveBeenCalledTimes(1);
    expect(registeredShortcuts).toHaveLength(1);

    const shortcut = registeredShortcuts[0];
    expect(shortcut.keys).toEqual(['ctrl', 'shift', 'e']);
    expect(typeof shortcut.onEvent).toBe('function');
  });

  test('should navigate to editor when shortcut is triggered', () => {
    render(createElement(RendererShortcuts));

    const shortcut = registeredShortcuts[0];
    shortcut.onEvent();

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/dashboard/test-dashboard/test-page/edit/',
    });
  });

  test('should not navigate when dashboard path is missing', () => {
    mockParamsValue.dashboardPath = '';

    render(createElement(RendererShortcuts));

    const shortcut = registeredShortcuts[0];
    shortcut.onEvent();

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('should not navigate when page path is missing', () => {
    mockParamsValue.pagePath = '';

    render(createElement(RendererShortcuts));

    const shortcut = registeredShortcuts[0];
    shortcut.onEvent();

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('should handle missing dashboard path from params', () => {
    // @ts-expect-error - simulated no dashboard path
    delete mockParamsValue.dashboardPath;

    render(createElement(RendererShortcuts));

    const shortcut = registeredShortcuts[0];
    shortcut.onEvent();

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('should handle missing page path from params', () => {
    // @ts-expect-error - simulated no page path
    delete mockParamsValue.pagePath;

    render(createElement(RendererShortcuts));

    const shortcut = registeredShortcuts[0];
    shortcut.onEvent();

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('should call useParams with correct options', () => {
    render(createElement(RendererShortcuts));

    expect(mockUseParams).toHaveBeenCalledWith({
      strict: false,
    });
  });

  test('should call all required hooks', () => {
    render(createElement(RendererShortcuts));

    expect(mockUseParams).toHaveBeenCalled();
    expect(mockUseNavigate).toHaveBeenCalled();
    expect(mockUseKeyboardShortcuts).toHaveBeenCalled();
  });

  test('should construct correct editor path for various dashboard and page names', () => {
    const testCases = [
      {
        dashboardPath: 'my-dashboard',
        pagePath: 'my-page',
        expectedPath: '/dashboard/my-dashboard/my-page/edit/',
      },
      {
        dashboardPath: 'dashboard-with-hyphens',
        pagePath: 'page-with-hyphens',
        expectedPath: '/dashboard/dashboard-with-hyphens/page-with-hyphens/edit/',
      },
      {
        dashboardPath: 'dashboard123',
        pagePath: 'page456',
        expectedPath: '/dashboard/dashboard123/page456/edit/',
      },
    ];

    testCases.forEach(({ dashboardPath, pagePath, expectedPath }) => {
      mockParamsValue.dashboardPath = dashboardPath;
      mockParamsValue.pagePath = pagePath;

      render(createElement(RendererShortcuts));

      const shortcut = registeredShortcuts[0];
      shortcut.onEvent();

      expect(mockNavigate).toHaveBeenCalledWith({
        to: expectedPath,
      });

      // Reset for next test case
      mockNavigate.mockClear();
      mockUseNavigate.mockClear();
      mockUseParams.mockClear();
      registeredShortcuts = [];
    });
  });

  test('should be integrated into Renderer component', async () => {
    // Test that RendererShortcuts is properly integrated into the Renderer
    const { Renderer } = await import('../index');

    expect(Renderer).toBeDefined();
    expect(typeof Renderer).toBe('function');

    // Check that Renderer component source references RendererShortcuts
    const rendererStr = Renderer.toString();
    expect(rendererStr).toContain('RendererShortcuts');
  });

  test('should work with special characters in paths', () => {
    // Test edge cases with special URL-safe characters
    mockParamsValue.dashboardPath = 'dashboard_with_underscores';
    mockParamsValue.pagePath = 'page.with.dots';

    render(createElement(RendererShortcuts));

    const shortcut = registeredShortcuts[0];
    shortcut.onEvent();

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/dashboard/dashboard_with_underscores/page.with.dots/edit/',
    });
  });

  test('should handle empty string paths correctly', () => {
    mockParamsValue.dashboardPath = '';
    mockParamsValue.pagePath = '';

    render(createElement(RendererShortcuts));

    const shortcut = registeredShortcuts[0];
    shortcut.onEvent();

    // Should not navigate when paths are empty strings
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('should only register one shortcut', () => {
    render(createElement(RendererShortcuts));

    expect(registeredShortcuts).toHaveLength(1);
    expect(registeredShortcuts[0].keys).toEqual(['ctrl', 'shift', 'e']);
  });

  test('should use correct shortcut according to documentation', () => {
    render(createElement(RendererShortcuts));

    const shortcut = registeredShortcuts[0];

    // According to KEYBOARD_SHORTCUTS.md, Ctrl+Shift+E should navigate from dashboard to editor
    expect(shortcut.keys).toEqual(['ctrl', 'shift', 'e']);
  });
});

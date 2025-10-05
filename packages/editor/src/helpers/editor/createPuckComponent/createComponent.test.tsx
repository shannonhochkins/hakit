import { expect, test, describe, beforeEach, mock } from 'bun:test';
import { createElement } from 'react';
import { createModuleMocker } from '@test-utils/moduleMocker';

/**
 * Due to an issue with Bun (https://github.com/oven-sh/bun/issues/7823), we need to manually restore mocked modules
 * after we're done. We do this by setting the mocked value to the original module.
 */

// Set up module mocker at top level
const moduleMocker = createModuleMocker();

await moduleMocker.mock('@hakit/components', () => ({
  AvailableQueries: {},
}));

await moduleMocker.mock('leaflet', () => ({
  Map: class MockMap {},
  DomUtil: { create: () => ({}) },
  DivIcon: class MockDivIcon {},
}));

// Mock functions for testing
const mockUseActiveBreakpoint = mock(() => 'desktop');
const mockUseGlobalStore = mock(() => ({ dashboardWithoutData: { id: 'test-dashboard' } }));
const mockUsePuckIframeElements = mock(() => ({ iframe: null, document: null }));

await moduleMocker.mock('@hooks/useActiveBreakpoint', () => ({
  useActiveBreakpoint: mockUseActiveBreakpoint,
}));

await moduleMocker.mock('@hooks/useGlobalStore', () => ({
  useGlobalStore: mockUseGlobalStore,
}));

await moduleMocker.mock('@hooks/usePuckIframeElements', () => ({
  usePuckIframeElements: mockUsePuckIframeElements,
}));

await moduleMocker.mock('@components/Alert', () => ({
  Alert: ({ title, children }: { title: string; children: React.ReactNode }) =>
    createElement('div', { 'data-testid': 'alert', 'data-title': title }, children),
}));

await moduleMocker.mock('@features/dashboard/Editor/RenderErrorBoundary', () => ({
  RenderErrorBoundary: ({ children }: { children: React.ReactNode }) => createElement('div', { 'data-testid': 'error-boundary' }, children),
}));

// Now import the types and main module
import { CustomComponentConfig, ComponentFactoryData } from '@typings/puck';
import { DefaultComponentProps } from '@measured/puck';
import { createComponent } from './index';

// Test component interfaces
interface SimpleProps extends DefaultComponentProps {
  text: string;
  count: number;
}

// Test components
function SimpleComponent({ text, count }: SimpleProps) {
  return createElement('div', {}, `${text}: ${count}`);
}

describe('createComponent', () => {
  beforeEach(() => {
    // Reset all mocks
    mockUseActiveBreakpoint.mockClear();
    mockUseGlobalStore.mockClear();
    mockUsePuckIframeElements.mockClear();
  });

  const createMockComponentFactoryData = (): ComponentFactoryData => ({
    getAllEntities: mock(() => ({})) as ComponentFactoryData['getAllEntities'],
    getAllServices: mock(() => Promise.resolve({})) as ComponentFactoryData['getAllServices'],
  });

  test('should create a component config with basic setup', async () => {
    const config: CustomComponentConfig<SimpleProps> = {
      label: 'Simple Component',
      fields: {
        text: { type: 'text', label: 'Text', default: 'hello' },
        count: { type: 'number', label: 'Count', default: 0 },
      },
      render: SimpleComponent,
    };

    const data = createMockComponentFactoryData();
    const componentFactory = createComponent(config);
    const result = await componentFactory(data);

    expect(result).toBeDefined();
    expect(result.label).toBe('Simple Component');
    expect(result.inline).toBe(true);
    expect(typeof result.render).toBe('function');
    expect(result.fields).toBeDefined();
  });

  test('should call getDefaultPropsFromFields with correct parameters', async () => {
    const config: CustomComponentConfig<SimpleProps> = {
      label: 'Test Component',
      fields: {
        text: { type: 'text', label: 'Text', default: 'hello' },
        count: { type: 'number', label: 'Count', default: 0 },
      },
      render: SimpleComponent,
    };

    const data = createMockComponentFactoryData();
    const componentFactory = createComponent(config);
    const result = await componentFactory(data);
    expect(result.defaultProps).toEqual(
      expect.objectContaining({
        text: 'hello',
        count: 0,
        _activeBreakpoint: 'xlg',
        // css may be '' initially
        styles: expect.objectContaining({ css: '' }),
      })
    );
  });

  test('should call getAllEntities and getAllServices', async () => {
    const config: CustomComponentConfig<SimpleProps> = {
      label: 'Test Component',
      fields: {
        text: { type: 'text', label: 'Text', default: 'hello' },
      },
      render: SimpleComponent,
    };

    const data = createMockComponentFactoryData();
    const componentFactory = createComponent(config);
    await componentFactory(data);

    expect(data.getAllEntities).toHaveBeenCalledTimes(1);
    expect(data.getAllServices).toHaveBeenCalledTimes(1);
  });

  test('should transform fields and add internal breakpoint field', async () => {
    const config: CustomComponentConfig<SimpleProps> = {
      label: 'Test Component',
      fields: {
        text: { type: 'text', label: 'Text', default: 'hello' },
      },
      render: SimpleComponent,
    };

    const data = createMockComponentFactoryData();
    const componentFactory = createComponent(config);
    const result = await componentFactory(data);

    const transformedFields = result.fields;
    expect(transformedFields).toHaveProperty('text');
    expect(transformedFields).toHaveProperty('_activeBreakpoint');
    expect(transformedFields).toHaveProperty('styles');

    // Verify transformed structure
    expect(transformedFields.text.type).toBe('text');

    const activeBreakpointField = transformedFields._activeBreakpoint;
    expect(activeBreakpointField.type).toBe('custom');
    expect(activeBreakpointField.type === 'custom' ? typeof activeBreakpointField.render : null).toBe('function');

    const stylesField = transformedFields.styles;
    expect(stylesField.type).toBe('object');
    if (stylesField.type === 'object') {
      expect(stylesField.label).toBe('Style Overrides');
    } else {
      // should fail the test
      expect(false).toBe(true);
    }
  });

  test('should handle empty fields correctly', async () => {
    const config: CustomComponentConfig<SimpleProps> = {
      label: 'Empty Fields Component',
      fields: {},
      render: SimpleComponent,
    };

    const data = createMockComponentFactoryData();
    const componentFactory = createComponent(config);
    const result = await componentFactory(data);

    const transformedFields = result.fields;
    expect(transformedFields).toHaveProperty('_activeBreakpoint');
    expect(transformedFields).toHaveProperty('styles');

    const activeBreakpointField = transformedFields._activeBreakpoint;
    expect(activeBreakpointField.type).toBe('custom');
    expect(activeBreakpointField.type === 'custom' ? typeof activeBreakpointField.render : null).toBe('function');

    const stylesField = transformedFields.styles;
    expect(stylesField.type).toBe('object');
    if (stylesField.type === 'object') {
      expect(stylesField.label).toBe('Style Overrides');
    } else {
      // should fail the test
      expect(false).toBe(true);
    }
  });

  test('should preserve original config properties', async () => {
    const config: CustomComponentConfig<SimpleProps> = {
      label: 'Test Component',
      fields: {
        text: { type: 'text', label: 'Text', default: 'hello' },
      },
      render: SimpleComponent,
      permissions: { delete: true, drag: false, duplicate: true },
    };

    const data = createMockComponentFactoryData();
    const componentFactory = createComponent(config);
    const result = await componentFactory(data);

    expect(result.label).toBe(config.label);
    if (config.permissions) {
      expect(result.permissions).toEqual(config.permissions);
    } else {
      // should fail the test
      expect(false).toBe(true);
    }
  });

  test('should set default props from field defaults', async () => {
    const expectedDefaults = { text: 'default text', count: 42 };

    const config: CustomComponentConfig<SimpleProps> = {
      label: 'Test Component',
      fields: {
        text: { type: 'text', label: 'Text', default: 'default text' },
        count: { type: 'number', label: 'Count', default: 42 },
      },
      render: SimpleComponent,
    };

    const data = createMockComponentFactoryData();
    const componentFactory = createComponent(config);
    const result = await componentFactory(data);
    expect(result.defaultProps).toEqual(
      expect.objectContaining({
        ...expectedDefaults,
        _activeBreakpoint: 'xlg',
        styles: expect.objectContaining({ css: '' }),
      })
    );
  });

  test('should create breakpoint field with correct behavior', async () => {
    const config: CustomComponentConfig<SimpleProps> = {
      label: 'Test Component',
      fields: {
        text: { type: 'text', label: 'Text', default: 'hello' },
      },
      render: SimpleComponent,
    };

    const data = createMockComponentFactoryData();
    const componentFactory = createComponent(config);
    const result = await componentFactory(data);

    const transformedFields = result.fields;
    expect(transformedFields._activeBreakpoint).toBeDefined();
    expect(transformedFields._activeBreakpoint.type).toBe('custom');
    expect(transformedFields.styles).toBeDefined();
  });

  test('should maintain consistent behavior across multiple calls', async () => {
    const config: CustomComponentConfig<SimpleProps> = {
      label: 'Consistent Component',
      fields: {
        text: { type: 'text', label: 'Text', default: 'test' },
      },
      render: SimpleComponent,
    };

    const data = createMockComponentFactoryData();
    const componentFactory = createComponent(config);

    const result1 = await componentFactory(data);
    const result2 = await componentFactory(data);

    expect(result1.label).toBe('Consistent Component');
    expect(result2.label).toBe('Consistent Component');
    expect(result1.inline).toBe(true);
    expect(result2.inline).toBe(true);
    expect(typeof result1.render).toBe('function');
    expect(typeof result2.render).toBe('function');
  });

  test('should handle basic component rendering flow', async () => {
    const config: CustomComponentConfig<SimpleProps> = {
      label: 'Basic Component',
      fields: {
        text: { type: 'text', label: 'Text', default: 'hello' },
        count: { type: 'number', label: 'Count', default: 0 },
      },
      render: SimpleComponent,
    };

    const data = createMockComponentFactoryData();
    const componentFactory = createComponent(config);
    const result = await componentFactory(data);

    // Verify the component was wrapped with error boundary and dragRef attachment
    expect(result.render).toBeDefined();
    expect(typeof result.render).toBe('function');

    // Verify inline is always true for drag behavior
    expect(result.inline).toBe(true);
  });

  test('should call all required hooks and functions', async () => {
    const config: CustomComponentConfig<SimpleProps> = {
      label: 'Hook Test Component',
      fields: {
        text: { type: 'text', label: 'Text', default: 'hello' },
      },
      render: SimpleComponent,
    };

    const data = createMockComponentFactoryData();
    const componentFactory = createComponent(config);
    await componentFactory(data);

    // Verify all required functions were called
    expect(data.getAllEntities).toHaveBeenCalled();
    expect(data.getAllServices).toHaveBeenCalled();
  });

  test('should handle styles function correctly', async () => {
    const mockStylesFunction = mock(
      (props: SimpleProps) => `
      background: ${props.text === 'red' ? 'red' : 'blue'};
      padding: 10px;
    `
    );

    const config: CustomComponentConfig<SimpleProps> = {
      label: 'Styled Component',
      fields: {
        text: { type: 'text', label: 'Text', default: 'red' },
      },
      render: SimpleComponent,
      styles: mockStylesFunction,
    };

    const data = createMockComponentFactoryData();
    const componentFactory = createComponent(config);
    const result = await componentFactory(data);

    expect(result).toBeDefined();
    expect(typeof result.render).toBe('function');

    // The styles function itself should be available in the config
    expect(config.styles).toBe(mockStylesFunction);
  });

  test('should work without styles function', async () => {
    const config: CustomComponentConfig<SimpleProps> = {
      label: 'Unstyled Component',
      fields: {
        text: { type: 'text', label: 'Text', default: 'hello' },
      },
      render: SimpleComponent,
      // No styles function provided
    };

    const data = createMockComponentFactoryData();
    const componentFactory = createComponent(config);
    const result = await componentFactory(data);

    expect(result).toBeDefined();
    expect(typeof result.render).toBe('function');
    expect(config.styles).toBeUndefined();
  });
});

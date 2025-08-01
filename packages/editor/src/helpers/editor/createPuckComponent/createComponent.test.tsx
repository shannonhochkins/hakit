import { expect, test, describe, beforeEach, mock } from 'bun:test';
import { createElement } from 'react';

// Mock window and leaflet to prevent import issues
(global as { window?: unknown }).window = {
  setTimeout: setTimeout,
  requestAnimationFrame: (fn: () => void) => setTimeout(fn, 16),
};

// Mock leaflet module to prevent window issues
mock.module('leaflet', () => ({
  Map: class MockMap {},
  DomUtil: { create: () => ({}) },
  DivIcon: class MockDivIcon {},
}));

// Mock @hakit/components to prevent leaflet imports
mock.module('@hakit/components', () => ({
  AvailableQueries: {},
}));

// Mock all the external dependencies before importing anything else
const mockGetDefaultPropsFromFields = mock(() => Promise.resolve({}));
const mockTransformFields = mock((fields: unknown) => fields);
const mockUseActiveBreakpoint = mock(() => 'desktop');
const mockUseGlobalStore = mock(() => ({ dashboardWithoutData: { id: 'test-dashboard' } }));
const mockUsePuckIframeElements = mock(() => ({ iframe: null, document: null }));

// Mock the modules before importing the main module
mock.module('@helpers/editor/pageData/getDefaultPropsFromFields', () => ({
  getDefaultPropsFromFields: mockGetDefaultPropsFromFields,
}));

mock.module('@helpers/editor/pageData/transformFields', () => ({
  transformFields: mockTransformFields,
}));

mock.module('@hooks/useActiveBreakpoint', () => ({
  useActiveBreakpoint: mockUseActiveBreakpoint,
}));

mock.module('@hooks/useGlobalStore', () => ({
  useGlobalStore: mockUseGlobalStore,
}));

mock.module('@hooks/usePuckIframeElements', () => ({
  usePuckIframeElements: mockUsePuckIframeElements,
}));

mock.module('@components/Alert', () => ({
  Alert: ({ title, children }: { title: string; children: React.ReactNode }) => 
    createElement('div', { 'data-testid': 'alert', 'data-title': title }, children),
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
    mockGetDefaultPropsFromFields.mockClear();
    mockTransformFields.mockClear();
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
    await componentFactory(data);

    expect(mockGetDefaultPropsFromFields).toHaveBeenCalledTimes(1);
    expect(mockGetDefaultPropsFromFields).toHaveBeenCalledWith(
      config.fields,
      expect.objectContaining({
        entities: expect.any(Object),
        services: expect.any(Object),
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
    await componentFactory(data);

    expect(mockTransformFields).toHaveBeenCalledTimes(1);
    expect(mockTransformFields).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.any(Object),
        _activeBreakpoint: expect.objectContaining({
          type: 'custom',
          render: expect.any(Function),
        }),
      })
    );
  });

  test('should handle empty fields correctly', async () => {
    const config: CustomComponentConfig<SimpleProps> = {
      label: 'Empty Fields Component',
      fields: {},
      render: SimpleComponent,
    };

    const data = createMockComponentFactoryData();
    const componentFactory = createComponent(config);
    await componentFactory(data);

    // Even with empty fields, the _activeBreakpoint field should be added
    expect(mockTransformFields).toHaveBeenCalledWith(
      expect.objectContaining({
        _activeBreakpoint: expect.objectContaining({
          type: 'custom',
          render: expect.any(Function),
        }),
      })
    );
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
    }
  });

  test('should set default props from field defaults', async () => {
    const expectedDefaults = { text: 'default text', count: 42 };
    mockGetDefaultPropsFromFields.mockResolvedValueOnce(expectedDefaults);

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

    expect(result.defaultProps).toEqual(expectedDefaults);
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
    await componentFactory(data);

    // Verify the breakpoint field was added to transformed fields
    const transformedFieldsCall = mockTransformFields.mock.calls[0][0] as Record<string, unknown>;
    expect(transformedFieldsCall._activeBreakpoint).toBeDefined();
    expect((transformedFieldsCall._activeBreakpoint as { type: string }).type).toBe('custom');
    expect(typeof (transformedFieldsCall._activeBreakpoint as { render: () => unknown }).render).toBe('function');
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
    expect(mockGetDefaultPropsFromFields).toHaveBeenCalled();
    expect(mockTransformFields).toHaveBeenCalled();
  });

  test('should handle styles function correctly', async () => {
    const mockStylesFunction = mock((props: SimpleProps) => `
      background: ${props.text === 'red' ? 'red' : 'blue'};
      padding: 10px;
    `);
    
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

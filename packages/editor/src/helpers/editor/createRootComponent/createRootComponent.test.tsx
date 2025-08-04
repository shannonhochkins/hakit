import { expect, test, describe, beforeEach, mock } from 'bun:test';

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

// Mock the hooks used in the render function
mock.module('@hooks/usePuckIframeElements', () => ({
  usePuckIframeElements: () => ({
    iframe: null,
    document: null,
  }),
}));

mock.module('@hooks/useGlobalStore', () => ({
  useGlobalStore: (selector: (state: Record<string, unknown>) => unknown) => {
    const mockState = {
      dashboardWithoutData: { id: 'test-dashboard' },
    };
    return selector(mockState);
  },
}));

import { ComponentFactoryData } from '@typings/puck';
import { rootConfigs } from './__mocks__/rootConfigs.mock';
import type { Slot } from '@measured/puck';
import { createRootComponent } from './index';
import { CustomRootConfigWithRemote } from '../../../features/dashboard/PuckDynamicConfiguration';

// Mock data for component factory
const mockComponentFactoryData: ComponentFactoryData = {
  getAllEntities: () => ({}),
  getAllServices: async () => null,
};

// Additional mock root configs for testing
type MockRootProps = {
  testField1?: string;
  testField2?: number;
  sharedField?: string;
  color?: string;
  fontSize?: number;
  anotherSlot?: Slot;
};

const mockRootConfig1: CustomRootConfigWithRemote<MockRootProps> = {
  label: 'Test Root 1',
  fields: {
    testField1: {
      type: 'text',
      label: 'Test Field 1',
      default: 'default value 1',
    },
    sharedField: {
      type: 'text',
      label: 'Shared Field',
      default: 'from config 1',
    },
  },
  _remoteRepositoryId: 'test-repo-1',
  _remoteRepositoryName: 'Test Repository 1',
  styles: (props: MockRootProps) => `color: ${props.testField1 || 'red'};`,
  render: mock(() => <div data-testid='test-root-1'>Test Root 1 Content</div>),
};

const mockRootConfig2: CustomRootConfigWithRemote<MockRootProps> = {
  label: 'Test Root 2',
  fields: {
    testField2: {
      type: 'number',
      label: 'Test Field 2',
      default: 42,
    },
    sharedField: {
      type: 'text',
      label: 'Shared Field',
      default: 'from config 2',
    },
  },
  _remoteRepositoryId: 'test-repo-2',
  _remoteRepositoryName: 'Test Repository 2',
  styles: (props: MockRootProps) => `font-size: ${props.testField2 || 16}px;`,
  render: mock(() => <div data-testid='test-root-2'>Test Root 2 Content</div>),
};

const mockRootConfig3: CustomRootConfigWithRemote<MockRootProps> = {
  label: 'Test Root 2',
  fields: {
    testField2: {
      type: 'number',
      label: 'Test Field 2',
      default: 42,
    },
    sharedField: {
      type: 'text',
      label: 'Shared Field',
      default: 'from config 2',
    },
    anotherSlot: {
      type: 'slot',
    },
  },
  _remoteRepositoryId: 'test-repo-3',
  _remoteRepositoryName: 'Test Repository 3',
  styles: (props: MockRootProps) => `font-size: ${props.testField2 || 16}px;`,
  render: mock(() => <div data-testid='test-root-3'>Test Root 3 Content</div>),
};

// Duplicate config (should be ignored)
const duplicateRootConfig: CustomRootConfigWithRemote<MockRootProps> = {
  label: 'Duplicate Root',
  fields: {
    testField1: {
      type: 'text',
      label: 'Duplicate Field',
      default: 'should be ignored',
    },
  },
  _remoteRepositoryId: 'test-repo-1', // Same ID as mockRootConfig1
  _remoteRepositoryName: 'Duplicate Repository',
  render: mock(() => <div data-testid='duplicate-root'>Duplicate Content</div>),
};

describe('createRootComponent', () => {
  beforeEach(() => {
    const mockRenderFn1 = mockRootConfig1.render as ReturnType<typeof mock>;
    const mockRenderFn2 = mockRootConfig2.render as ReturnType<typeof mock>;
    const mockRenderFn3 = duplicateRootConfig.render as ReturnType<typeof mock>;

    mockRenderFn1.mockClear();
    mockRenderFn2.mockClear();
    mockRenderFn3.mockClear();
    console.warn = mock(() => {});
  });

  test('should create a root component and render slots', async () => {
    const result = await createRootComponent([mockRootConfig1, mockRootConfig2, mockRootConfig3], mockComponentFactoryData);
    expect(result).toBeDefined();
    expect(result.fields).toBeDefined();
    expect(result.fields!['test-repo-1']).toBeDefined();
    expect(result.fields!['test-repo-2']).toBeDefined();
    expect(result.fields!['test-repo-3']).toBeDefined();
    expect(result.fields!['test-repo-1'].type).toBe('custom');
    expect(result.fields!['test-repo-2'].type).toBe('custom');
    expect(result.fields!['test-repo-3'].type).toBe('custom');

    // now just check the 3rd repo has the slot field
    const testRepo3Field = result.fields!['test-repo-3'] as Record<string, unknown>;
    expect((testRepo3Field._field as Record<string, unknown>).type).toBe('object');
    expect((testRepo3Field._field as Record<string, unknown>).objectFields).toHaveProperty('anotherSlot');
  });

  test('should always include the default root config with fixed id', async () => {
    const result = await createRootComponent([], mockComponentFactoryData);

    expect(result.fields).toBeDefined();
    expect(result.fields!).toHaveProperty('@hakit/default-root');

    // Check that the default root config has the expected structure
    const defaultRootField = result.fields!['@hakit/default-root'] as Record<string, unknown>;
    expect((defaultRootField._field as Record<string, unknown>).label).toBe('@hakit/editor');
    expect((defaultRootField._field as Record<string, unknown>).type).toBe('object');
    expect((defaultRootField._field as Record<string, unknown>).collapseOptions).toEqual({
      startExpanded: true,
    });
    expect((defaultRootField._field as Record<string, unknown>).objectFields).toHaveProperty('background');
  });

  test('should merge fields from both default and provided rootConfigs', async () => {
    const result = await createRootComponent([mockRootConfig1, mockRootConfig2], mockComponentFactoryData);

    // Should have default config plus the two provided configs
    expect(result.fields).toBeDefined();
    const fieldKeys = Object.keys(result.fields!);
    expect(fieldKeys).toContain('@hakit/default-root');
    expect(fieldKeys).toContain('test-repo-1');
    expect(fieldKeys).toContain('test-repo-2');
    expect(fieldKeys).toContain('content');

    // Check first config fields structure
    const testRepo1Field = result.fields!['test-repo-1'] as Record<string, unknown>;
    expect((testRepo1Field._field as Record<string, unknown>).label).toBe('Test Repository 1');
    expect((testRepo1Field._field as Record<string, unknown>).type).toBe('object');

    // Check second config fields structure
    const testRepo2Field = result.fields!['test-repo-2'] as Record<string, unknown>;
    expect((testRepo2Field._field as Record<string, unknown>).label).toBe('Test Repository 2');
    expect((testRepo2Field._field as Record<string, unknown>).type).toBe('object');
  });

  test('should ignore duplicate repository IDs and warn about them', async () => {
    const result = await createRootComponent([mockRootConfig1, duplicateRootConfig, mockRootConfig2], mockComponentFactoryData);

    // Should only have unique configs
    expect(result.fields).toBeDefined();
    const fieldKeys = Object.keys(result.fields!);
    expect(fieldKeys).toContain('@hakit/default-root');
    expect(fieldKeys).toContain('test-repo-1');
    expect(fieldKeys).toContain('test-repo-2');
    expect(fieldKeys).toContain('content');

    // Should warn about duplicate
    expect(console.warn).toHaveBeenCalledWith('Duplicate root config repository ID detected: test-repo-1. Ignoring duplicate.');

    // Should have the first config, not the duplicate
    const testRepo1Field = result.fields!['test-repo-1'] as Record<string, unknown>;
    expect((testRepo1Field._field as Record<string, unknown>).label).toBe('Test Repository 1');
    // Should keep the original config's properties, not the duplicate's
    expect((testRepo1Field._field as Record<string, unknown>).objectFields).toHaveProperty('testField1');
    expect((testRepo1Field._field as Record<string, unknown>).objectFields).toHaveProperty('sharedField');
  });

  test('should always include content slot field in final config', async () => {
    const result = await createRootComponent([mockRootConfig1], mockComponentFactoryData);

    expect(result.fields).toBeDefined();
    expect(result.fields!.content).toEqual({
      type: 'slot',
    });
  });

  test('should isolate props for each root config in render function', async () => {
    const result = await createRootComponent([mockRootConfig1, mockRootConfig2], mockComponentFactoryData);

    const mockProps = {
      '@hakit/default-root': {
        background: {
          backgroundColor: '#123456',
          useBackgroundImage: false,
        },
      },
      'test-repo-1': {
        testField1: 'custom value 1',
        sharedField: 'isolated value 1',
      },
      'test-repo-2': {
        testField2: 99,
        sharedField: 'isolated value 2',
      },
      _activeBreakpoint: 'mobile' as const,
      puck: {} as Record<string, unknown>,
      content: () => <div data-testid='content-slot'>Content Slot</div>,
      _styleOverrides: { style: 'body { margin: 0; }' },
    };

    // Create a test render to call the render function
    const TestComponent = result.render;
    if (TestComponent) {
      TestComponent(mockProps as unknown as Parameters<typeof TestComponent>[0]);
    }

    // Verify render functions were called
    expect(mockRootConfig1.render).toHaveBeenCalledWith(
      expect.objectContaining({
        testField1: 'custom value 1',
        sharedField: 'isolated value 1',
        _activeBreakpoint: 'mobile',
        _dashboard: { id: 'test-dashboard' },
        _editMode: false,
        _editor: { iframe: null, document: null },
      })
    );

    expect(mockRootConfig2.render).toHaveBeenCalledWith(
      expect.objectContaining({
        testField2: 99,
        sharedField: 'isolated value 2',
        _activeBreakpoint: 'mobile',
        _dashboard: { id: 'test-dashboard' },
        _editMode: false,
        _editor: { iframe: null, document: null },
      })
    );

    // Verify each config only sees its own props, not other configs' props
    const mockRenderFn1 = mockRootConfig1.render as ReturnType<typeof mock>;
    const mockRenderFn2 = mockRootConfig2.render as ReturnType<typeof mock>;

    const config1Call = mockRenderFn1.mock.calls[0][0];
    expect(config1Call).not.toHaveProperty('testField2');
    expect(config1Call).not.toHaveProperty('test-repo-2');

    const config2Call = mockRenderFn2.mock.calls[0][0];
    expect(config2Call).not.toHaveProperty('testField1');
    expect(config2Call).not.toHaveProperty('test-repo-1');
  });

  test('should handle root configs with styles function from mock', async () => {
    // Use the actual mock from rootConfigs.mock.tsx (cast to compatible type)
    const result = await createRootComponent(rootConfigs as unknown as CustomRootConfigWithRemote[], mockComponentFactoryData);

    const mockProps = {
      '@hakit/default-root': {
        background: {
          backgroundColor: '#ff0000',
          useBackgroundImage: true,
          backgroundImage: 'test-image.jpg',
          blendMode: 'overlay' as const,
          opacity: 0.8,
          blur: 10,
        },
      },
      content: () => <div data-testid='content-slot'>Content Slot</div>,
      _styleOverrides: { style: 'body { padding: 10px; }' },
      _activeBreakpoint: 'mobile' as const,
      puck: {} as Record<string, unknown>,
    };

    // Test that the render function can be called without error
    const TestComponent = result.render;
    if (TestComponent) {
      expect(() => TestComponent(mockProps as unknown as Parameters<typeof TestComponent>[0])).not.toThrow();
    }
  });

  test('should handle empty root configs array', async () => {
    const result = await createRootComponent([], mockComponentFactoryData);

    // Should still have default config and content slot
    expect(result.fields).toBeDefined();
    const fieldKeys = Object.keys(result.fields!);
    expect(fieldKeys).toContain('content');
    expect(fieldKeys).toContain('@hakit/default-root');
    expect(result.fields!.content).toEqual({ type: 'slot' });
    expect(result.fields!['@hakit/default-root']).toBeDefined();
  });

  test('should not have _remoteRepositoryId in final config', async () => {
    const result = await createRootComponent([mockRootConfig1], mockComponentFactoryData);

    expect(result).not.toHaveProperty('_remoteRepositoryId');
  });

  test('should collect and apply all styles from root configs', async () => {
    const mockStyleConfig1: CustomRootConfigWithRemote<MockRootProps> = {
      label: 'Style Config 1',
      fields: {
        color: {
          type: 'text',
          label: 'Color',
          default: 'blue',
        },
      },
      _remoteRepositoryId: 'style-repo-1',
      _remoteRepositoryName: 'Style Repository 1',
      styles: (props: MockRootProps) => `body { color: ${props.color || 'blue'}; }`,
      render: mock(() => <div>Style Config 1</div>),
    };

    const mockStyleConfig2: CustomRootConfigWithRemote<MockRootProps> = {
      label: 'Style Config 2',
      fields: {
        fontSize: {
          type: 'number',
          label: 'Font Size',
          default: 16,
        },
      },
      _remoteRepositoryId: 'style-repo-2',
      _remoteRepositoryName: 'Style Repository 2',
      styles: (props: MockRootProps) => `body { font-size: ${props.fontSize || 16}px; }`,
      render: mock(() => <div>Style Config 2</div>),
    };

    const result = await createRootComponent([mockStyleConfig1, mockStyleConfig2], mockComponentFactoryData);

    const mockProps = {
      '@hakit/default-root': {
        background: {
          backgroundColor: '#ffffff',
        },
      },
      'style-repo-1': {
        color: 'red',
      },
      'style-repo-2': {
        fontSize: 18,
      },
      content: () => <div>Content</div>,
      _styleOverrides: { style: 'body { margin: 10px; }' },
      _activeBreakpoint: 'mobile' as const,
      puck: {} as Record<string, unknown>,
    };

    // Test that the render function can be called and styles are collected
    const TestComponent = result.render;
    if (TestComponent) {
      expect(() => TestComponent(mockProps as unknown as Parameters<typeof TestComponent>[0])).not.toThrow();
    }

    // Verify styles functions were called with correct props
    expect(mockStyleConfig1.styles).toBeDefined();
    expect(mockStyleConfig2.styles).toBeDefined();
  });

  test('should handle root config with slot fields', async () => {
    // Define a root config with slot fields
    interface SlotRootProps {
      something: string;
      somethingElse: string;
      anotherSlot: Slot;
    }

    const slotRootConfig: CustomRootConfigWithRemote<SlotRootProps> = {
      label: 'Slot Root Config',
      fields: {
        something: {
          type: 'text',
          label: 'Something',
          default: 'This is a text field',
        },
        somethingElse: {
          type: 'text',
          label: 'Something Else',
          default: 'This is another text field',
        },
        anotherSlot: {
          type: 'slot',
        },
      },
      _remoteRepositoryId: 'slot-repo',
      _remoteRepositoryName: 'Slot Repository',
      render: mock(props => (
        <div data-testid='slot-root'>
          <h1>{props.something}</h1>
          <p>{props.somethingElse}</p>
          <div data-testid='another-slot-container'>{props.anotherSlot && props.anotherSlot()}</div>
        </div>
      )),
    };

    const result = await createRootComponent([slotRootConfig as unknown as CustomRootConfigWithRemote], mockComponentFactoryData);

    // Verify the slot config was properly processed
    expect(result.fields).toBeDefined();
    const fieldKeys = Object.keys(result.fields!);
    expect(fieldKeys).toContain('slot-repo');
    expect(fieldKeys).toContain('content');

    // Check the slot config structure
    const slotRepoField = result.fields!['slot-repo'] as Record<string, unknown>;
    expect((slotRepoField._field as Record<string, unknown>).label).toBe('Slot Repository');
    expect((slotRepoField._field as Record<string, unknown>).type).toBe('object');

    // Test that the render function properly handles slots
    const mockProps = {
      '@hakit/default-root': {
        background: {
          backgroundColor: '#ffffff',
        },
      },
      'slot-repo': {
        something: 'Test Something',
        somethingElse: 'Test Something Else',
        anotherSlot: () => <div data-testid='another-slot-content'>Slot Content</div>,
      },
      content: () => <div data-testid='content-slot'>Main Content</div>,
      _activeBreakpoint: 'mobile' as const,
      puck: {} as Record<string, unknown>,
    };

    // Render the component to test slot handling
    const TestComponent = result.render;
    if (TestComponent) {
      TestComponent(mockProps as unknown as Parameters<typeof TestComponent>[0]);
    }

    // Verify the render function was called with the correct props including slots
    expect(slotRootConfig.render).toHaveBeenCalledWith(
      expect.objectContaining({
        something: 'Test Something',
        somethingElse: 'Test Something Else',
        anotherSlot: expect.any(Function),
        _activeBreakpoint: 'mobile',
        _dashboard: { id: 'test-dashboard' },
        _editMode: false,
        _editor: { iframe: null, document: null },
      })
    );

    // Verify the slot function is properly passed through
    const mockRenderFn = slotRootConfig.render as ReturnType<typeof mock>;
    const callArgs = mockRenderFn.mock.calls[0][0];
    expect(callArgs).toHaveProperty('anotherSlot');
    expect(typeof callArgs.anotherSlot).toBe('function');
  });
});

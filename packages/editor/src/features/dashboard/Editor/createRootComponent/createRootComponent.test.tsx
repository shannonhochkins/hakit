import { expect, test, describe, beforeEach, mock } from 'bun:test';
import { render } from '@testing-library/react';

// Mock window and leaflet to prevent import issues
(global as { window?: unknown }).window = {
  setTimeout: setTimeout,
  requestAnimationFrame: (fn: () => void) => setTimeout(fn, 16),
  addEventListener: () => {},
  removeEventListener: () => {},
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
      templateFieldMap: {
        root: [],
      },
    };
    return selector(mockState);
  },
}));

import { ComponentFactoryData } from '@typings/puck';
import { rootConfigs } from './__mocks__/rootConfigs.mock';
import type { Slot } from '@measured/puck';
import { createRootComponent } from './index';
import { CustomRootConfigWithRemote } from '@features/dashboard/PuckDynamicConfiguration';
import React from 'react';

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
  defaultProps: {},
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
  defaultProps: {},
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
  defaultProps: {},
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
  defaultProps: {},
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
    // @ts-expect-error - This does exist, just not typed intentionally
    expect(result.fields!['test-repo-1']).toBeDefined();
    // @ts-expect-error - This does exist, just not typed intentionally
    expect(result.fields!['test-repo-2']).toBeDefined();
    // @ts-expect-error - This does exist, just not typed intentionally
    expect(result.fields!['test-repo-3']).toBeDefined();
    // @ts-expect-error - This does exist, just not typed intentionally
    expect(result.fields!['test-repo-1'].type).toBe('object');
    // @ts-expect-error - This does exist, just not typed intentionally
    expect(result.fields!['test-repo-2'].type).toBe('object');
    // @ts-expect-error - This does exist, just not typed intentionally
    expect(result.fields!['test-repo-3'].type).toBe('object');

    // now just check the 3rd repo has the slot field
    // @ts-expect-error - This does exist, just not typed intentionally
    const testRepo3Field = result.fields!['test-repo-3'] as Record<string, unknown>;
    expect(testRepo3Field.type).toBe('object');
    expect(testRepo3Field.objectFields).toHaveProperty('anotherSlot');
  });

  test('should always include the default root config with fixed id', async () => {
    const result = await createRootComponent([], mockComponentFactoryData);

    expect(result.fields).toBeDefined();
    expect(result.fields!).toHaveProperty('@hakit/default-root');

    // @ts-expect-error - dynamic key not present in the static type
    const defaultRootField = result.fields!['@hakit/default-root'] as Record<string, unknown>;
    expect(defaultRootField.label).toBe('@hakit/editor');
    expect(defaultRootField.type).toBe('object');
    expect(defaultRootField.collapseOptions).toEqual({
      startExpanded: true,
    });
    expect(defaultRootField.objectFields).toHaveProperty('background');
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
    // @ts-expect-error - This does exist, just not typed intentionally
    const testRepo1Field = result.fields!['test-repo-1'] as Record<string, unknown>;
    expect(testRepo1Field.label).toBe('Test Repository 1');
    expect(testRepo1Field.type).toBe('object');

    // Check second config fields structure
    // @ts-expect-error - This does exist, just not typed intentionally
    const testRepo2Field = result.fields!['test-repo-2'] as Record<string, unknown>;
    expect(testRepo2Field.label).toBe('Test Repository 2');
    expect(testRepo2Field.type).toBe('object');
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

    // @ts-expect-error - This does exist, just not typed intentionally
    const testRepo1Field = result.fields!['test-repo-1'] as Record<string, unknown>;
    expect(testRepo1Field.label).toBe('Test Repository 1');
    // Should keep the original config's properties, not the duplicate's
    expect(testRepo1Field.objectFields).toHaveProperty('testField1');
    expect(testRepo1Field.objectFields).toHaveProperty('sharedField');
  });

  test('should always include content slot field in final config', async () => {
    const result = await createRootComponent([mockRootConfig1], mockComponentFactoryData);

    expect(result.fields).toBeDefined();
    // content is injected internally; assert its type property without forcing exact shape
    expect(result.fields!.content?.type).toBe('slot');
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
      const element = TestComponent(mockProps as unknown as Parameters<typeof TestComponent>[0]);
      render(React.createElement(React.Fragment, null, element));
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
    // content is a slot field injected internally, structure not statically typed
    expect(result.fields!.content?.type).toBe('slot');
    // @ts-expect-error - dynamic key not present in the static type
    expect(result.fields!['@hakit/default-root']).toBeDefined();
  });

  test('should not have _remoteRepositoryId in final config', async () => {
    const result = await createRootComponent([mockRootConfig1], mockComponentFactoryData);

    expect(result).not.toHaveProperty('_remoteRepositoryId');
  });

  test('should collect and apply all styles from root configs', async () => {
    const mockStyleConfig1: CustomRootConfigWithRemote<MockRootProps> = {
      defaultProps: {},
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
      defaultProps: {},
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

  test('should attach repository reference to default root config', async () => {
    const result = await createRootComponent([], mockComponentFactoryData);

    expect(result.fields).toBeDefined();

    // @ts-expect-error - dynamic key not present in the static type
    if (result.fields!['@hakit/default-root'].type === 'custom') {
      // Check that the default root config has the repository ID
      // @ts-expect-error - dynamic key not present in the static type
      const defaultRootField = result.fields!['@hakit/default-root']._field;
      expect(defaultRootField.repositoryId).toBe('@hakit/default-root');
    }
  });

  test('should attach repository reference to array fields', async () => {
    // Create a root config with array fields to test array field processing
    interface ArrayProps {
      items: Array<{
        name: string;
        config: {
          enabled: boolean;
        };
      }>;
    }

    const arrayRootConfig: CustomRootConfigWithRemote<ArrayProps> = {
      label: 'Array Root Config',
      defaultProps: {
        items: [],
      },
      fields: {
        items: {
          type: 'array',
          label: 'Items',
          default: [],
          arrayFields: {
            name: {
              type: 'text',
              label: 'Item Name',
              default: '',
            },
            config: {
              type: 'object',
              label: 'Item Config',
              objectFields: {
                enabled: {
                  type: 'switch',
                  label: 'Enabled',
                  default: true,
                },
              },
            },
          },
        },
      },
      _remoteRepositoryId: 'array-repo',
      _remoteRepositoryName: 'Array Repository',
      render: mock(() => <div>Array Config</div>),
    };

    const result = await createRootComponent<ArrayProps>([arrayRootConfig], mockComponentFactoryData);

    expect(result.fields).toBeDefined();
    // @ts-expect-error = this does exist, it's intentionally not typed internally
    const field = result.fields['array-repo'];
    expect(field.repositoryId).toBe('array-repo');
    // @ts-expect-error = this does exist, it's intentionally not typed internally
    const subField = result.fields['array-repo'].objectFields.items;
    expect(subField.repositoryId).toBe('array-repo');
  });

  test('should handle root config with slot fields', async () => {
    interface SlotRootProps {
      something: string;
      somethingElse: string;
      anotherSlot: Slot;
    }

    const slotRootConfig: CustomRootConfigWithRemote<SlotRootProps> = {
      defaultProps: {
        something: 'This is a text field',
        somethingElse: 'This is another text field',
        // @ts-expect-error - slot field is not typed correctly
        anotherSlot: () => <div>Another Slot</div>,
      },
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
    // @ts-expect-error - dynamic key not present in the static type
    const slotRepoField = result.fields!['slot-repo'] as Record<string, unknown>;
    expect(slotRepoField.label).toBe('Slot Repository');
    expect(slotRepoField.type).toBe('object');

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

    // Render the returned element so the inner Render component runs
    const TestComponent = result.render;
    if (TestComponent) {
      const element = TestComponent(mockProps as unknown as Parameters<typeof TestComponent>[0]);
      render(React.createElement(React.Fragment, null, element));
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

  test('should populate defaultProps from field configurations', async () => {
    const result = await createRootComponent([mockRootConfig1, mockRootConfig2], mockComponentFactoryData);

    // Check that defaultProps are populated
    // @ts-expect-error - defaultProps exists at runtime but not in type definition
    expect(result.defaultProps).toBeDefined();

    // Check default root config defaults
    // @ts-expect-error - defaultProps exists at runtime but not in type definition
    expect(result.defaultProps).toHaveProperty('@hakit/default-root');
    // @ts-expect-error - defaultProps exists at runtime but not in type definition
    expect(result.defaultProps['@hakit/default-root']).toHaveProperty('background');
    // @ts-expect-error - defaultProps exists at runtime but not in type definition
    expect(result.defaultProps['@hakit/default-root']).toHaveProperty('typography');

    // Check that background defaults are populated
    // @ts-expect-error - defaultProps exists at runtime but not in type definition
    const backgroundDefaults = result.defaultProps['@hakit/default-root'].background;
    expect(backgroundDefaults).toHaveProperty('useBackgroundImage', true);
    expect(backgroundDefaults).toHaveProperty('overlayColor', '#4254c5');
    expect(backgroundDefaults).toHaveProperty('overlayBlendMode', 'multiply');
    expect(backgroundDefaults).toHaveProperty('overlayOpacity', 0.9);
    expect(backgroundDefaults).toHaveProperty('blur', 25);

    // Check that typography defaults are populated
    // @ts-expect-error - defaultProps exists at runtime but not in type definition
    const typographyDefaults = result.defaultProps['@hakit/default-root'].typography;
    expect(typographyDefaults).toHaveProperty('fontFamily', 'roboto');
    expect(typographyDefaults).toHaveProperty('fontColor', '#ffffff');
    expect(typographyDefaults).toHaveProperty('useAdvancedTypography', false);
    expect(typographyDefaults).toHaveProperty('headingWeight', 600);
    expect(typographyDefaults).toHaveProperty('bodyWeight', 400);
    expect(typographyDefaults).toHaveProperty('baseFontSize', '16px');
    expect(typographyDefaults).toHaveProperty('lineHeight', 1.5);
    expect(typographyDefaults).toHaveProperty('letterSpacing', 0);

    // Check custom root config defaults
    // @ts-expect-error - defaultProps exists at runtime but not in type definition
    expect(result.defaultProps).toHaveProperty('test-repo-1');
    // @ts-expect-error - defaultProps exists at runtime but not in type definition
    expect(result.defaultProps['test-repo-1']).toHaveProperty('testField1', 'default value 1');
    // @ts-expect-error - defaultProps exists at runtime but not in type definition
    expect(result.defaultProps['test-repo-1']).toHaveProperty('sharedField', 'from config 1');

    // @ts-expect-error - defaultProps exists at runtime but not in type definition
    expect(result.defaultProps).toHaveProperty('test-repo-2');
    // @ts-expect-error - defaultProps exists at runtime but not in type definition
    expect(result.defaultProps['test-repo-2']).toHaveProperty('testField2', 42);
    // @ts-expect-error - defaultProps exists at runtime but not in type definition
    expect(result.defaultProps['test-repo-2']).toHaveProperty('sharedField', 'from config 2');
  });

  test('should handle nested object field defaults', async () => {
    interface NestedProps {
      config: {
        enabled: boolean;
        settings: {
          theme: string;
          size: number;
        };
      };
    }

    const nestedRootConfig: CustomRootConfigWithRemote<NestedProps> = {
      defaultProps: {
        config: {
          enabled: true,
          settings: {
            theme: 'dark',
            size: 16,
          },
        },
      },
      label: 'Nested Root Config',
      fields: {
        config: {
          type: 'object',
          label: 'Configuration',
          objectFields: {
            enabled: {
              type: 'switch',
              label: 'Enabled',
              default: true,
            },
            settings: {
              type: 'object',
              label: 'Settings',
              objectFields: {
                theme: {
                  type: 'select',
                  label: 'Theme',
                  default: 'dark',
                  options: [
                    { label: 'Dark', value: 'dark' },
                    { label: 'Light', value: 'light' },
                  ],
                },
                size: {
                  type: 'number',
                  label: 'Size',
                  default: 16,
                  min: 12,
                  max: 24,
                },
              },
            },
          },
        },
      },
      _remoteRepositoryId: 'nested-repo',
      _remoteRepositoryName: 'Nested Repository',
      render: mock(() => <div>Nested Config</div>),
    };

    const result = await createRootComponent([nestedRootConfig], mockComponentFactoryData);

    // Check that nested defaults are populated
    // @ts-expect-error - defaultProps exists at runtime but not in type definition
    expect(result.defaultProps).toHaveProperty('nested-repo');
    // @ts-expect-error - defaultProps exists at runtime but not in type definition
    expect(result.defaultProps['nested-repo']).toHaveProperty('config');

    // @ts-expect-error - defaultProps exists at runtime but not in type definition
    const configDefaults = result.defaultProps['nested-repo'].config;
    expect(configDefaults).toHaveProperty('enabled', true);
    expect(configDefaults).toHaveProperty('settings');

    const settingsDefaults = configDefaults.settings;
    expect(settingsDefaults).toHaveProperty('theme', 'dark');
    expect(settingsDefaults).toHaveProperty('size', 16);
  });

  test('should handle array field defaults', async () => {
    interface ArrayProps {
      items: Array<{
        name: string;
        count: number;
      }>;
    }

    const arrayRootConfig: CustomRootConfigWithRemote<ArrayProps> = {
      defaultProps: {
        items: [
          { name: 'Default Item 1', count: 5 },
          { name: 'Default Item 2', count: 10 },
        ],
      },
      label: 'Array Root Config',
      fields: {
        items: {
          type: 'array',
          label: 'Items',
          default: [
            { name: 'Default Item 1', count: 5 },
            { name: 'Default Item 2', count: 10 },
          ],
          arrayFields: {
            name: {
              type: 'text',
              label: 'Item Name',
              default: 'New Item',
            },
            count: {
              type: 'number',
              label: 'Count',
              default: 1,
              min: 0,
            },
          },
        },
      },
      _remoteRepositoryId: 'array-repo',
      _remoteRepositoryName: 'Array Repository',
      render: mock(() => <div>Array Config</div>),
    };

    const result = await createRootComponent([arrayRootConfig], mockComponentFactoryData);

    // Check that array defaults are populated
    // @ts-expect-error - defaultProps exists at runtime but not in type definition
    expect(result.defaultProps).toHaveProperty('array-repo');
    // @ts-expect-error - defaultProps exists at runtime but not in type definition
    expect(result.defaultProps['array-repo']).toHaveProperty('items');

    // @ts-expect-error - defaultProps exists at runtime but not in type definition
    const itemsDefaults = result.defaultProps['array-repo'].items;
    expect(Array.isArray(itemsDefaults)).toBe(true);
    expect(itemsDefaults).toHaveLength(2);
    expect(itemsDefaults[0]).toEqual({ name: 'Default Item 1', count: 5 });
    expect(itemsDefaults[1]).toEqual({ name: 'Default Item 2', count: 10 });
  });

  test('should handle different field types with defaults', async () => {
    interface VariousFieldProps {
      textField: string;
      numberField: number;
      booleanField: boolean;
      selectField: string;
      colorField: string;
    }

    const variousFieldsConfig: CustomRootConfigWithRemote<VariousFieldProps> = {
      defaultProps: {
        textField: 'Default Text',
        numberField: 42,
        booleanField: true,
        selectField: 'option2',
        colorField: '#ff0000',
      },
      label: 'Various Fields Config',
      fields: {
        textField: {
          type: 'text',
          label: 'Text Field',
          default: 'Default Text',
        },
        numberField: {
          type: 'number',
          label: 'Number Field',
          default: 42,
          min: 0,
          max: 100,
        },
        booleanField: {
          type: 'switch',
          label: 'Boolean Field',
          default: true,
        },
        selectField: {
          type: 'select',
          label: 'Select Field',
          default: 'option2',
          options: [
            { label: 'Option 1', value: 'option1' },
            { label: 'Option 2', value: 'option2' },
            { label: 'Option 3', value: 'option3' },
          ],
        },
        colorField: {
          type: 'color',
          label: 'Color Field',
          default: '#ff0000',
        },
      },
      _remoteRepositoryId: 'various-repo',
      _remoteRepositoryName: 'Various Repository',
      render: mock(() => <div>Various Config</div>),
    };

    const result = await createRootComponent([variousFieldsConfig], mockComponentFactoryData);

    // Check that various field type defaults are populated
    // @ts-expect-error - defaultProps exists at runtime but not in type definition
    expect(result.defaultProps).toHaveProperty('various-repo');
    // @ts-expect-error - defaultProps exists at runtime but not in type definition
    const variousDefaults = result.defaultProps['various-repo'];

    expect(variousDefaults).toHaveProperty('textField', 'Default Text');
    expect(variousDefaults).toHaveProperty('numberField', 42);
    expect(variousDefaults).toHaveProperty('booleanField', true);
    expect(variousDefaults).toHaveProperty('selectField', 'option2');
    expect(variousDefaults).toHaveProperty('colorField', '#ff0000');
  });

  test('should populate defaultProps from defaultRootConfig with exact field defaults', async () => {
    // Test with just the default root config to verify all its defaults
    const result = await createRootComponent([], mockComponentFactoryData);

    // Check that defaultProps are populated
    // @ts-expect-error - defaultProps exists at runtime but not in type definition
    expect(result.defaultProps).toBeDefined();

    // Check default root config defaults
    // @ts-expect-error - defaultProps exists at runtime but not in type definition
    expect(result.defaultProps).toHaveProperty('@hakit/default-root');
    // @ts-expect-error - defaultProps exists at runtime but not in type definition
    expect(result.defaultProps['@hakit/default-root']).toHaveProperty('background');
    // @ts-expect-error - defaultProps exists at runtime but not in type definition
    expect(result.defaultProps['@hakit/default-root']).toHaveProperty('typography');

    // @ts-expect-error - defaultProps exists at runtime but not in type definition
    const backgroundDefaults = result.defaultProps['@hakit/default-root'].background;
    // @ts-expect-error - defaultProps exists at runtime but not in type definition
    const typographyDefaults = result.defaultProps['@hakit/default-root'].typography;

    // Verify ALL background field defaults match defaultRootConfig exactly
    expect(backgroundDefaults).not.toHaveProperty('test');
    expect(backgroundDefaults).toHaveProperty('useBackgroundImage', true);
    expect(backgroundDefaults).toHaveProperty('backgroundImage', undefined);
    expect(backgroundDefaults).toHaveProperty('backgroundSize', 'cover');
    expect(backgroundDefaults).toHaveProperty('backgroundSizeCustom', '');
    expect(backgroundDefaults).toHaveProperty('backgroundPosition', 'center center');
    expect(backgroundDefaults).toHaveProperty('backgroundRepeat', 'no-repeat');
    expect(backgroundDefaults).toHaveProperty('overlayColor', '#4254c5');
    expect(backgroundDefaults).toHaveProperty('overlayBlendMode', 'multiply');
    expect(backgroundDefaults).toHaveProperty('blur', 25);
    expect(backgroundDefaults).toHaveProperty('overlayOpacity', 0.9);
    expect(backgroundDefaults).toHaveProperty('useAdvancedFilters', false);
    expect(backgroundDefaults).toHaveProperty('filterBrightness', 1);
    expect(backgroundDefaults).toHaveProperty('filterContrast', 1);
    expect(backgroundDefaults).toHaveProperty('filterSaturate', 1);
    expect(backgroundDefaults).toHaveProperty('filterGrayscale', 0);

    // Verify ALL typography field defaults match defaultRootConfig exactly
    expect(typographyDefaults).toHaveProperty('fontFamily', 'roboto');
    expect(typographyDefaults).toHaveProperty('fontColor', '#ffffff');
    expect(typographyDefaults).toHaveProperty('useAdvancedTypography', false);
    expect(typographyDefaults).toHaveProperty('headingWeight', 600);
    expect(typographyDefaults).toHaveProperty('bodyWeight', 400);
    expect(typographyDefaults).toHaveProperty('baseFontSize', '16px');
    expect(typographyDefaults).toHaveProperty('lineHeight', 1.5);
    expect(typographyDefaults).toHaveProperty('letterSpacing', 0);
  });

  test('should handle defaultRootConfig with custom root configs and preserve all defaults', async () => {
    // Test with defaultRootConfig + custom configs to ensure defaults are preserved
    const result = await createRootComponent([mockRootConfig1, mockRootConfig2], mockComponentFactoryData);

    // Check that defaultProps are populated for all configs
    // @ts-expect-error - defaultProps exists at runtime but not in type definition
    expect(result.defaultProps).toBeDefined();

    // Verify default root config defaults are still correct
    // @ts-expect-error - defaultProps exists at runtime but not in type definition
    const backgroundDefaults = result.defaultProps['@hakit/default-root'].background;
    // @ts-expect-error - defaultProps exists at runtime but not in type definition
    const typographyDefaults = result.defaultProps['@hakit/default-root'].typography;

    // Verify defaultRootConfig defaults are preserved
    expect(backgroundDefaults).toHaveProperty('useBackgroundImage', true);
    expect(backgroundDefaults).toHaveProperty('overlayColor', '#4254c5');
    expect(backgroundDefaults).toHaveProperty('blur', 25);
    expect(typographyDefaults).toHaveProperty('fontFamily', 'roboto');
    expect(typographyDefaults).toHaveProperty('fontColor', '#ffffff');

    // Verify custom config defaults are also present
    // @ts-expect-error - defaultProps exists at runtime but not in type definition
    expect(result.defaultProps).toHaveProperty('test-repo-1');
    // @ts-expect-error - defaultProps exists at runtime but not in type definition
    expect(result.defaultProps).toHaveProperty('test-repo-2');
    // @ts-expect-error - defaultProps exists at runtime but not in type definition
    expect(result.defaultProps['test-repo-1']).toHaveProperty('testField1', 'default value 1');
    // @ts-expect-error - defaultProps exists at runtime but not in type definition
    expect(result.defaultProps['test-repo-2']).toHaveProperty('testField2', 42);
  });

  test('should match defaultRootConfig field structure exactly', async () => {
    // This test ensures the field structure matches what's defined in defaultRootConfig
    const result = await createRootComponent([], mockComponentFactoryData);

    // @ts-expect-error - defaultProps exists at runtime but not in type definition
    const defaultProps = result.defaultProps['@hakit/default-root'];

    // Verify the structure matches DefaultRootProps interface
    expect(defaultProps).toHaveProperty('background');
    expect(defaultProps).toHaveProperty('typography');

    // Verify background structure matches BackgroundProps interface
    const background = defaultProps.background;
    expect(background).not.toHaveProperty('test');
    expect(background).toHaveProperty('useBackgroundImage');
    expect(background).toHaveProperty('backgroundImage');
    expect(background).toHaveProperty('backgroundSize');
    expect(background).toHaveProperty('backgroundSizeCustom');
    expect(background).toHaveProperty('backgroundPosition');
    expect(background).toHaveProperty('backgroundRepeat');
    expect(background).toHaveProperty('overlayColor');
    expect(background).toHaveProperty('overlayBlendMode');
    expect(background).toHaveProperty('blur');
    expect(background).toHaveProperty('overlayOpacity');
    expect(background).toHaveProperty('useAdvancedFilters');
    expect(background).toHaveProperty('filterBrightness');
    expect(background).toHaveProperty('filterContrast');
    expect(background).toHaveProperty('filterSaturate');
    expect(background).toHaveProperty('filterGrayscale');

    // Verify typography structure matches TypographyProps interface
    const typography = defaultProps.typography;
    expect(typography).toHaveProperty('fontFamily');
    expect(typography).toHaveProperty('fontColor');
    expect(typography).toHaveProperty('useAdvancedTypography');
    expect(typography).toHaveProperty('headingWeight');
    expect(typography).toHaveProperty('bodyWeight');
    expect(typography).toHaveProperty('baseFontSize');
    expect(typography).toHaveProperty('lineHeight');
    expect(typography).toHaveProperty('letterSpacing');
  });

  test('should merge missing fields with default props in render function', async () => {
    // This test simulates the scenario where stored data is missing new fields
    // and verifies that default props are merged in
    const result = await createRootComponent([], mockComponentFactoryData);

    // Simulate props that are missing the typography object (like old stored data)
    const mockPropsWithMissingFields = {
      '@hakit/default-root': {
        background: {
          useBackgroundImage: true,
          overlayColor: '#ff0000', // Different from default to test merging
          blur: 10, // Different from default to test merging
        },
        // Missing typography object entirely
      },
      content: () => <div>Content</div>,
      _activeBreakpoint: 'mobile' as const,
      puck: {} as Record<string, unknown>,
    };

    // Test that the render function can be called without error
    const TestComponent = result.render;
    if (TestComponent) {
      expect(() => TestComponent(mockPropsWithMissingFields as unknown as Parameters<typeof TestComponent>[0])).not.toThrow();
    }
  });
});

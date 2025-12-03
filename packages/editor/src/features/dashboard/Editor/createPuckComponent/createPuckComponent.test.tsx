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
const mockUseGlobalStore = mock(() => ({ dashboardWithoutData: { id: 'test-dashboard' } }));
const mockUsePuckIframeElements = mock(() => ({ iframe: null, document: null }));

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
import { assertField, assertObjectField } from '@test-utils/fieldAssertions';

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
        // css may be '' initially
        $styles: expect.objectContaining({ css: '' }),
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
    expect(transformedFields).toHaveProperty('$styles');

    // Verify transformed structure
    expect(transformedFields.text.type).toBe('text');

    const stylesField = transformedFields.$styles;
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
    expect(transformedFields).toHaveProperty('$styles');

    const stylesField = transformedFields.$styles;
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
        $styles: expect.objectContaining({ css: '' }),
      })
    );
  });

  test('switch fields should honor their defaults', async () => {
    // borders, should be disabled by default
    const config: CustomComponentConfig<DefaultComponentProps> = {
      label: 'Test Component',
      fields: {},
      render: props => {
        return createElement('div', {}, `borderEnabled: ${props.$appearance?.design?.borderEnabled}`);
      },
    };

    const data = createMockComponentFactoryData();
    const componentFactory = createComponent(config);
    const result = await componentFactory(data);
    expect(result.defaultProps.$appearance?.design?.borderEnabled).toBe(false);
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
    expect(transformedFields.$styles).toBeDefined();
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

  describe('internalFields functionality', () => {
    test('should omit $interactions field when omit is configured', async () => {
      const config: CustomComponentConfig<SimpleProps> = {
        label: 'Component Without Interactions',
        fields: {
          text: { type: 'text', label: 'Text', default: 'hello' },
        },
        render: SimpleComponent,
        internalFields: {
          omit: {
            $interactions: true,
          },
        },
      };

      const data = createMockComponentFactoryData();
      const componentFactory = createComponent(config);
      const result = await componentFactory(data);

      expect(result.fields).toBeDefined();
      expect('$interactions' in result.fields).toBe(false);
      expect('$appearance' in result.fields).toBe(true);
      expect('$styles' in result.fields).toBe(true);
    });

    test('should omit $appearance field when omit is configured', async () => {
      const config: CustomComponentConfig<SimpleProps> = {
        label: 'Component Without Appearance',
        fields: {
          text: { type: 'text', label: 'Text', default: 'hello' },
        },
        render: SimpleComponent,
        internalFields: {
          omit: {
            $appearance: true,
          },
        },
      };

      const data = createMockComponentFactoryData();
      const componentFactory = createComponent(config);
      const result = await componentFactory(data);

      expect(result.fields).toBeDefined();
      expect('$appearance' in result.fields).toBe(false);
      expect('$interactions' in result.fields).toBe(true);
      expect('$styles' in result.fields).toBe(true);
    });

    test('should omit $styles field when omit is configured', async () => {
      const config: CustomComponentConfig<SimpleProps> = {
        label: 'Component Without Styles',
        fields: {
          text: { type: 'text', label: 'Text', default: 'hello' },
        },
        render: SimpleComponent,
        internalFields: {
          omit: {
            $styles: true,
          },
        },
      };

      const data = createMockComponentFactoryData();
      const componentFactory = createComponent(config);
      const result = await componentFactory(data);

      expect(result.fields).toBeDefined();
      expect('$styles' in result.fields).toBe(false);
      expect('$appearance' in result.fields).toBe(true);
      expect('$interactions' in result.fields).toBe(true);
    });

    test('should omit multiple internal fields', async () => {
      const config: CustomComponentConfig<SimpleProps> = {
        label: 'Component Without Multiple Fields',
        fields: {
          text: { type: 'text', label: 'Text', default: 'hello' },
        },
        render: SimpleComponent,
        internalFields: {
          omit: {
            $interactions: true,
            $styles: true,
          },
        },
      };

      const data = createMockComponentFactoryData();
      const componentFactory = createComponent(config);
      const result = await componentFactory(data);

      expect(result.fields).toBeDefined();
      expect('$interactions' in result.fields).toBe(false);
      expect('$styles' in result.fields).toBe(false);
      expect('$appearance' in result.fields).toBe(true);
    });

    test('should omit nested field within $appearance', async () => {
      const config: CustomComponentConfig<SimpleProps> = {
        label: 'Component Without Typography',
        fields: {
          text: { type: 'text', label: 'Text', default: 'hello' },
        },
        render: SimpleComponent,
        internalFields: {
          omit: {
            $appearance: {
              typography: true,
            },
          },
        },
      };

      const data = createMockComponentFactoryData();
      const componentFactory = createComponent(config);
      const result = await componentFactory(data);

      expect(result.fields).toBeDefined();
      assertObjectField(result.fields.$appearance);
      expect('typography' in result.fields.$appearance.objectFields).toBe(false);
      expect('design' in result.fields.$appearance.objectFields).toBe(true);
    });

    test('should omit deeply nested field within $appearance.background', async () => {
      const config: CustomComponentConfig<SimpleProps> = {
        label: 'Component Without Background Color',
        fields: {
          text: { type: 'text', label: 'Text', default: 'hello' },
        },
        render: SimpleComponent,
        internalFields: {
          omit: {
            $appearance: {
              design: {
                backgroundColor: true,
              },
            },
          },
        },
      };

      const data = createMockComponentFactoryData();
      const componentFactory = createComponent(config);
      const result = await componentFactory(data);

      expect(result.fields).toBeDefined();
      assertObjectField(result.fields.$appearance);
      assertObjectField(result.fields.$appearance.objectFields.design);
      const designField = result.fields.$appearance.objectFields.design;
      expect('backgroundColor' in designField.objectFields).toBe(false);
      expect('useImage' in designField.objectFields).toBe(true);
      expect('backgroundImage' in designField.objectFields).toBe(true);
      expect('backgroundSize' in designField.objectFields).toBe(true);
      expect('backgroundPosition' in designField.objectFields).toBe(true);
      expect('backgroundRepeat' in designField.objectFields).toBe(true);
      expect('backgroundAttachment' in designField.objectFields).toBe(true);
    });

    test('should omit $interactions.tap field', async () => {
      const config: CustomComponentConfig<SimpleProps> = {
        label: 'Component Without Tap Interaction',
        fields: {
          text: { type: 'text', label: 'Text', default: 'hello' },
        },
        render: SimpleComponent,
        internalFields: {
          omit: {
            $interactions: {
              tap: true,
            },
          },
        },
      };

      const data = createMockComponentFactoryData();
      const componentFactory = createComponent(config);
      const result = await componentFactory(data);

      expect(result.fields).toBeDefined();
      assertObjectField(result.fields.$interactions);
      expect('tap' in result.fields.$interactions.objectFields).toBe(false);
      expect('hold' in result.fields.$interactions.objectFields).toBe(true);
      expect('doubleTap' in result.fields.$interactions.objectFields).toBe(true);
    });

    test('should omit $interactions.hold field', async () => {
      const config: CustomComponentConfig<SimpleProps> = {
        label: 'Component Without Hold Interaction',
        fields: {
          text: { type: 'text', label: 'Text', default: 'hello' },
        },
        render: SimpleComponent,
        internalFields: {
          omit: {
            $interactions: {
              hold: true,
            },
          },
        },
      };

      const data = createMockComponentFactoryData();
      const componentFactory = createComponent(config);
      const result = await componentFactory(data);

      expect(result.fields).toBeDefined();
      expect('$interactions' in result.fields).toBe(true);
      assertObjectField(result.fields.$interactions);
      expect(result.fields.$interactions.objectFields).toBeDefined();
      expect('hold' in result.fields.$interactions.objectFields).toBe(false);
      expect('tap' in result.fields.$interactions.objectFields).toBe(true);
      expect('doubleTap' in result.fields.$interactions.objectFields).toBe(true);
    });

    test('should omit $interactions.doubleTap field', async () => {
      const config: CustomComponentConfig<SimpleProps> = {
        label: 'Component Without Double Tap Interaction',
        fields: {
          text: { type: 'text', label: 'Text', default: 'hello' },
        },
        render: SimpleComponent,
        internalFields: {
          omit: {
            $interactions: {
              doubleTap: true,
            },
          },
        },
      };

      const data = createMockComponentFactoryData();
      const componentFactory = createComponent(config);
      const result = await componentFactory(data);

      expect(result.fields).toBeDefined();
      expect('$interactions' in result.fields).toBe(true);
      assertObjectField(result.fields.$interactions);
      expect(result.fields.$interactions.objectFields).toBeDefined();
      expect('doubleTap' in result.fields.$interactions.objectFields).toBe(false);
      expect('tap' in result.fields.$interactions.objectFields).toBe(true);
      expect('hold' in result.fields.$interactions.objectFields).toBe(true);
    });

    test('should omit multiple nested fields within $interactions', async () => {
      const config: CustomComponentConfig<SimpleProps> = {
        label: 'Component Without Multiple Interactions',
        fields: {
          text: { type: 'text', label: 'Text', default: 'hello' },
        },
        render: SimpleComponent,
        internalFields: {
          omit: {
            $interactions: {
              tap: true,
              hold: true,
            },
          },
        },
      };

      const data = createMockComponentFactoryData();
      const componentFactory = createComponent(config);
      const result = await componentFactory(data);

      expect(result.fields).toBeDefined();
      expect('$interactions' in result.fields).toBe(true);
      assertObjectField(result.fields.$interactions);
      expect(result.fields.$interactions.objectFields).toBeDefined();
      expect('tap' in result.fields.$interactions.objectFields).toBe(false);
      expect('hold' in result.fields.$interactions.objectFields).toBe(false);
      expect('doubleTap' in result.fields.$interactions.objectFields).toBe(true);
    });

    test('should omit deeply nested field within $interactions.tap', async () => {
      const config: CustomComponentConfig<SimpleProps> = {
        label: 'Component Without Tap Type',
        fields: {
          text: { type: 'text', label: 'Text', default: 'hello' },
        },
        render: SimpleComponent,
        internalFields: {
          omit: {
            $interactions: {
              tap: {
                type: true,
              },
            },
          },
        },
      };

      const data = createMockComponentFactoryData();
      const componentFactory = createComponent(config);
      const result = await componentFactory(data);

      expect(result.fields).toBeDefined();
      expect('$interactions' in result.fields).toBe(true);
      assertObjectField(result.fields.$interactions);
      expect(result.fields.$interactions.objectFields).toBeDefined();
      // Verify tap field still exists
      expect('tap' in result.fields.$interactions.objectFields).toBe(true);
      const tapFieldValue = result.fields.$interactions.objectFields.tap;
      // tap should be an object field
      if (tapFieldValue && typeof tapFieldValue === 'object' && 'objectFields' in tapFieldValue) {
        const tapField = tapFieldValue;
        expect(tapField.objectFields).toBeDefined();
        expect('type' in tapField.objectFields).toBe(false);
        // Other tap fields should still exist (at least one of them)
        const hasOtherFields =
          'callService' in tapField.objectFields ||
          'url' in tapField.objectFields ||
          'page' in tapField.objectFields ||
          'popupId' in tapField.objectFields;
        expect(hasOtherFields).toBe(true);
      } else {
        throw new Error('tap field should be an object field');
      }
    });

    test('should omit multiple deeply nested fields within $appearance.background', async () => {
      const config: CustomComponentConfig<SimpleProps> = {
        label: 'Component Without Background Options',
        fields: {
          text: { type: 'text', label: 'Text', default: 'hello' },
        },
        render: SimpleComponent,
        internalFields: {
          omit: {
            $appearance: {
              design: {
                backgroundColor: true,
                useImage: true,
              },
            },
          },
        },
      };

      const data = createMockComponentFactoryData();
      const componentFactory = createComponent(config);
      const result = await componentFactory(data);

      expect(result.fields).toBeDefined();
      assertObjectField(result.fields.$appearance);
      assertObjectField(result.fields.$appearance.objectFields.design);
      const designField = result.fields.$appearance.objectFields.design;
      expect('backgroundColor' in designField.objectFields).toBe(false);
      expect('useImage' in designField.objectFields).toBe(false);
      // Other background fields should still exist
      expect('backgroundImage' in designField.objectFields || 'backgroundSize' in designField.objectFields).toBe(true);
      expect('backgroundPosition' in designField.objectFields || 'backgroundRepeat' in designField.objectFields).toBe(true);
      expect('backgroundAttachment' in designField.objectFields).toBe(true);
    });

    test('should omit nested fields across multiple internal field groups', async () => {
      const config: CustomComponentConfig<SimpleProps> = {
        label: 'Component With Multiple Nested Omissions',
        fields: {
          text: { type: 'text', label: 'Text', default: 'hello' },
        },
        render: SimpleComponent,
        internalFields: {
          omit: {
            $interactions: {
              tap: true,
            },
            $appearance: {
              design: {
                backgroundColor: true,
              },
            },
          },
        },
      };

      const data = createMockComponentFactoryData();
      const componentFactory = createComponent(config);
      const result = await componentFactory(data);

      expect(result.fields).toBeDefined();
      // Verify $interactions.tap is omitted
      assertObjectField(result.fields.$interactions);
      expect('tap' in result.fields.$interactions.objectFields).toBe(false);
      // Verify $appearance.background.color is omitted
      assertObjectField(result.fields.$appearance);
      assertObjectField(result.fields.$appearance.objectFields.design);
      const designField = result.fields.$appearance.objectFields.design;
      expect('backgroundColor' in designField.objectFields).toBe(false);
    });

    test('should extend internal fields with new top-level field', async () => {
      const config: CustomComponentConfig<
        SimpleProps,
        {
          customField: string;
        }
      > = {
        label: 'Component With Extended Field',
        fields: {
          text: { type: 'text', label: 'Text', default: 'hello' },
        },
        render: SimpleComponent,
        internalFields: {
          extend: {
            customField: {
              type: 'text',
              label: 'Custom Field',
              default: 'custom value',
            },
          },
        },
      };

      const data = createMockComponentFactoryData();
      const componentFactory = createComponent(config);
      const result = await componentFactory(data);

      expect(result.fields).toBeDefined();
      expect('customField' in result.fields).toBe(true);
      assertField(result.fields.customField, 'text');
      const customField = result.fields.customField;
      expect(customField.label).toBe('Custom Field');
      expect(customField.default).toBe('custom value');
    });

    test('should extend $appearance with new nested field', async () => {
      const config: CustomComponentConfig<
        SimpleProps,
        {
          $appearance: {
            customColor: string;
          };
        }
      > = {
        label: 'Component With Extended Appearance',
        fields: {
          text: { type: 'text', label: 'Text', default: 'hello' },
        },
        render: SimpleComponent,
        internalFields: {
          extend: {
            $appearance: {
              customColor: {
                type: 'color',
                label: 'Custom Color',
                default: '#ff0000',
              },
            },
          },
        },
      };

      const data = createMockComponentFactoryData();
      const componentFactory = createComponent(config);
      const result = await componentFactory(data);

      expect(result.fields).toBeDefined();
      assertObjectField(result.fields.$appearance);
      expect('customColor' in result.fields.$appearance.objectFields).toBe(true);
      assertField(result.fields.$appearance.objectFields.customColor, 'color');
      const customColorField = result.fields.$appearance.objectFields.customColor;
      expect(customColorField.label).toBe('Custom Color');
      expect(customColorField.default).toBe('#ff0000');
    });

    test('should extend $appearance.background with new nested field', async () => {
      const config: CustomComponentConfig<
        SimpleProps,
        {
          $appearance: {
            design: {
              overlayColor: string;
            };
          };
        }
      > = {
        label: 'Component With Extended Background',
        fields: {
          text: { type: 'text', label: 'Text', default: 'hello' },
        },
        render: SimpleComponent,
        internalFields: {
          extend: {
            $appearance: {
              design: {
                overlayColor: {
                  type: 'color',
                  label: 'Overlay Color',
                  default: '#000000',
                },
              },
            },
          },
        },
      };

      const data = createMockComponentFactoryData();
      const componentFactory = createComponent(config);
      const result = await componentFactory(data);

      expect(result.fields).toBeDefined();
      expect('$appearance' in result.fields).toBe(true);
      assertObjectField(result.fields.$appearance);
      expect(result.fields.$appearance.objectFields).toBeDefined();
      expect('design' in result.fields.$appearance.objectFields).toBe(true);
      assertObjectField(result.fields.$appearance.objectFields.design);
      const designField = result.fields.$appearance.objectFields.design;
      expect(designField.objectFields).toBeDefined();
      expect('overlayColor' in designField.objectFields).toBe(true);
      assertField(designField.objectFields.overlayColor, 'color');
      const overlayColorField = designField.objectFields.overlayColor;
      expect(overlayColorField.label).toBe('Overlay Color');
      expect(overlayColorField.default).toBe('#000000');
      // Verify existing background fields still exist
      expect('backgroundColor' in designField.objectFields).toBe(true);
      expect('useImage' in designField.objectFields).toBe(true);
    });

    test('should extend $interactions.tap with new nested field', async () => {
      const config: CustomComponentConfig<
        SimpleProps,
        {
          $interactions: {
            tap: {
              customAction: string;
            };
          };
        }
      > = {
        label: 'Component With Extended Tap Interaction',
        fields: {
          text: { type: 'text', label: 'Text', default: 'hello' },
        },
        render: SimpleComponent,
        internalFields: {
          extend: {
            $interactions: {
              tap: {
                customAction: {
                  type: 'text',
                  label: 'Custom Action',
                  default: 'action-value',
                },
              },
            },
          },
        },
      };

      const data = createMockComponentFactoryData();
      const componentFactory = createComponent(config);
      const result = await componentFactory(data);

      expect(result.fields).toBeDefined();
      expect('$interactions' in result.fields).toBe(true);
      assertObjectField(result.fields.$interactions);
      expect(result.fields.$interactions.objectFields).toBeDefined();
      expect('tap' in result.fields.$interactions.objectFields).toBe(true);
      assertObjectField(result.fields.$interactions.objectFields.tap);
      const tapField = result.fields.$interactions.objectFields.tap;
      expect(tapField.objectFields).toBeDefined();
      expect('customAction' in tapField.objectFields).toBe(true);
      assertField(tapField.objectFields.customAction, 'text');
      const customActionField = tapField.objectFields.customAction;
      expect(customActionField.label).toBe('Custom Action');
      expect(customActionField.default).toBe('action-value');
      // Verify existing tap fields still exist
      expect('type' in tapField.objectFields).toBe(true);
    });

    test('should update default value of $styles.css', async () => {
      const config: CustomComponentConfig<SimpleProps> = {
        label: 'Component With Custom CSS Default',
        fields: {
          text: { type: 'text', label: 'Text', default: 'hello' },
        },
        render: SimpleComponent,
        internalFields: {
          defaults: {
            $styles: {
              css: 'body { margin: 0; }',
            },
          },
        },
      };

      const data = createMockComponentFactoryData();
      const componentFactory = createComponent(config);
      const result = await componentFactory(data);

      expect(result.fields).toBeDefined();
      assertObjectField(result.fields.$styles);
      assertField(result.fields.$styles.objectFields.css, 'code');
      const cssField = result.fields.$styles.objectFields.css;
      expect(cssField.default).toBe('body { margin: 0; }');
    });

    test('should update default value of nested $appearance field', async () => {
      const config: CustomComponentConfig<SimpleProps> = {
        label: 'Component With Custom Appearance Default',
        fields: {
          text: { type: 'text', label: 'Text', default: 'hello' },
        },
        render: SimpleComponent,
        internalFields: {
          defaults: {
            $appearance: {
              design: {
                useImage: true,
                backgroundImage: 'https://example.com/image.jpg',
              },
            },
          },
        },
      };

      const data = createMockComponentFactoryData();
      const componentFactory = createComponent(config);
      const result = await componentFactory(data);

      expect(result.fields).toBeDefined();
      expect('$appearance' in result.fields).toBe(true);
      assertObjectField(result.fields.$appearance);
      expect(result.fields.$appearance.objectFields).toBeDefined();
      expect('design' in result.fields.$appearance.objectFields).toBe(true);
      assertObjectField(result.fields.$appearance.objectFields.design);
      const designField = result.fields.$appearance.objectFields.design;
      expect(designField.objectFields).toBeDefined();
      expect('useImage' in designField.objectFields).toBe(true);
      assertField(designField.objectFields.useImage, 'switch');
      const useImageField = designField.objectFields.useImage;
      expect(useImageField.default).toBe(true);
    });

    test('should update default value of deeply nested $appearance.background.color', async () => {
      const config: CustomComponentConfig<SimpleProps> = {
        label: 'Component With Custom Background Color Default',
        fields: {
          text: { type: 'text', label: 'Text', default: 'hello' },
        },
        render: SimpleComponent,
        internalFields: {
          defaults: {
            $appearance: {
              design: {
                backgroundColor: '#ff0000',
              },
            },
          },
        },
      };

      const data = createMockComponentFactoryData();
      const componentFactory = createComponent(config);
      const result = await componentFactory(data);

      expect(result.fields).toBeDefined();
      expect('$appearance' in result.fields).toBe(true);
      assertObjectField(result.fields.$appearance);
      expect(result.fields.$appearance.objectFields).toBeDefined();
      expect('design' in result.fields.$appearance.objectFields).toBe(true);
      assertObjectField(result.fields.$appearance.objectFields.design);
      const designField = result.fields.$appearance.objectFields.design;
      expect(designField.objectFields).toBeDefined();
      expect('backgroundColor' in designField.objectFields).toBe(true);
      assertField(designField.objectFields.backgroundColor, 'color');
      const backgroundColorField = designField.objectFields.backgroundColor;
      expect(backgroundColorField.default).toBe('#ff0000');
    });

    test('should update default value of $interactions.tap.type', async () => {
      const config: CustomComponentConfig<SimpleProps> = {
        label: 'Component With Custom Tap Type Default',
        fields: {
          text: { type: 'text', label: 'Text', default: 'hello' },
        },
        render: SimpleComponent,
        internalFields: {
          defaults: {
            $interactions: {
              tap: {
                type: 'navigate',
              },
            },
          },
        },
      };

      const data = createMockComponentFactoryData();
      const componentFactory = createComponent(config);
      const result = await componentFactory(data);

      expect(result.fields).toBeDefined();
      expect('$interactions' in result.fields).toBe(true);
      assertObjectField(result.fields.$interactions);
      expect(result.fields.$interactions.objectFields).toBeDefined();
      expect('tap' in result.fields.$interactions.objectFields).toBe(true);
      assertObjectField(result.fields.$interactions.objectFields.tap);
      const tapField = result.fields.$interactions.objectFields.tap;
      expect(tapField.objectFields).toBeDefined();
      expect('type' in tapField.objectFields).toBe(true);
      assertField(tapField.objectFields.type, 'select');
      const typeField = tapField.objectFields.type;
      expect(typeField.default).toBe('navigate');
    });

    test('should update multiple deeply nested default values', async () => {
      const config: CustomComponentConfig<SimpleProps> = {
        label: 'Component With Multiple Nested Defaults',
        fields: {
          text: { type: 'text', label: 'Text', default: 'hello' },
        },
        render: SimpleComponent,
        internalFields: {
          defaults: {
            $appearance: {
              design: {
                backgroundColor: '#00ff00',
                useImage: true,
              },
            },
            $interactions: {
              tap: {
                type: 'popup',
              },
              hold: {
                type: 'callService',
              },
            },
          },
        },
      };

      const data = createMockComponentFactoryData();
      const componentFactory = createComponent(config);
      const result = await componentFactory(data);

      expect(result.fields).toBeDefined();
      // Verify $appearance.background defaults
      expect('$appearance' in result.fields).toBe(true);
      assertObjectField(result.fields.$appearance);
      expect(result.fields.$appearance.objectFields).toBeDefined();
      expect('design' in result.fields.$appearance.objectFields).toBe(true);
      assertObjectField(result.fields.$appearance.objectFields.design);
      const designField = result.fields.$appearance.objectFields.design;
      expect(designField.objectFields).toBeDefined();
      expect('backgroundColor' in designField.objectFields).toBe(true);
      assertField(designField.objectFields.backgroundColor, 'color');
      expect(designField.objectFields.backgroundColor.default).toBe('#00ff00');
      expect('useImage' in designField.objectFields).toBe(true);
      assertField(designField.objectFields.useImage, 'switch');
      expect(designField.objectFields.useImage.default).toBe(true);

      // Verify $interactions defaults
      expect('$interactions' in result.fields).toBe(true);
      assertObjectField(result.fields.$interactions);
      expect(result.fields.$interactions.objectFields).toBeDefined();
      expect('tap' in result.fields.$interactions.objectFields).toBe(true);
      expect('hold' in result.fields.$interactions.objectFields).toBe(true);
      assertObjectField(result.fields.$interactions.objectFields.tap);
      assertObjectField(result.fields.$interactions.objectFields.hold);
      const tapField = result.fields.$interactions.objectFields.tap;
      const holdField = result.fields.$interactions.objectFields.hold;
      expect(tapField.objectFields).toBeDefined();
      expect(holdField.objectFields).toBeDefined();
      expect('type' in tapField.objectFields).toBe(true);
      expect('type' in holdField.objectFields).toBe(true);
      assertField(tapField.objectFields.type, 'select');
      expect(tapField.objectFields.type.default).toBe('popup');
      assertField(holdField.objectFields.type, 'select');
      expect(holdField.objectFields.type.default).toBe('callService');
    });

    test('should handle omit, extend, and defaults together', async () => {
      const config: CustomComponentConfig<
        SimpleProps,
        {
          customField: string;
        }
      > = {
        label: 'Component With All InternalFields Options',
        fields: {
          text: { type: 'text', label: 'Text', default: 'hello' },
        },
        render: SimpleComponent,
        internalFields: {
          omit: {
            $interactions: true,
          },
          extend: {
            customField: {
              type: 'text',
              label: 'Custom Field',
              default: 'original',
            },
          },
          defaults: {
            $styles: {
              css: '/* custom css */',
            },
            // @ts-expect-error - customField is an extended field, not in InternalComponentFields defaults
            customField: 'updated',
          },
        },
      };

      const data = createMockComponentFactoryData();
      const componentFactory = createComponent(config);
      const result = await componentFactory(data);

      expect(result.fields).toBeDefined();
      // Verify omit
      expect('$interactions' in result.fields).toBe(false);
      // Verify extend
      expect('customField' in result.fields).toBe(true);
      assertField(result.fields.customField, 'text');
      const customField = result.fields.customField;
      // Verify defaults
      expect(customField.default).toBe('updated');
      assertObjectField(result.fields.$styles);
      assertField(result.fields.$styles.objectFields.css, 'code');
      const cssField = result.fields.$styles.objectFields.css;
      expect(cssField.default).toBe('/* custom css */');
    });

    test('should handle omit set to false', async () => {
      const config: CustomComponentConfig<SimpleProps> = {
        label: 'Component With Omit Set to False',
        fields: {
          text: { type: 'text', label: 'Text', default: 'hello' },
        },
        render: SimpleComponent,
        internalFields: {
          omit: {
            $interactions: false,
          },
        },
      };

      const data = createMockComponentFactoryData();
      const componentFactory = createComponent(config);
      const result = await componentFactory(data);

      expect(result.fields).toBeDefined();
      // Verify omit did not work
      expect('$interactions' in result.fields).toBe(true);
    });

    test('should handle deep nested omit, extend, and defaults together', async () => {
      const config: CustomComponentConfig<
        SimpleProps,
        {
          $appearance: {
            design: {
              overlayOpacity: number;
            };
          };
        }
      > = {
        label: 'Component With Deep Nested InternalFields Options',
        fields: {
          text: { type: 'text', label: 'Text', default: 'hello' },
        },
        render: SimpleComponent,
        internalFields: {
          omit: {
            $appearance: {
              design: {
                backgroundColor: true,
              },
            },
            $interactions: {
              tap: true,
            },
          },
          extend: {
            $appearance: {
              design: {
                overlayOpacity: {
                  type: 'number',
                  label: 'Overlay Opacity',
                  default: 0.5,
                },
              },
            },
          },
          defaults: {
            $appearance: {
              design: {
                useImage: true,
                // @ts-expect-error - overlayOpacity is an extended field, not in InternalComponentFields defaults
                overlayOpacity: 0.8,
              },
            },
            $interactions: {
              hold: {
                type: 'navigate',
              },
            },
          },
        },
      };

      const data = createMockComponentFactoryData();
      const componentFactory = createComponent(config);
      const result = await componentFactory(data);

      expect(result.fields).toBeDefined();
      // Verify omit - $appearance.background.color should be removed
      assertObjectField(result.fields.$appearance);
      assertObjectField(result.fields.$appearance.objectFields.design);
      const designField = result.fields.$appearance.objectFields.design;
      expect('backgroundColor' in designField.objectFields).toBe(false);
      // Verify omit - $interactions.tap should be removed
      assertObjectField(result.fields.$interactions);
      expect('tap' in result.fields.$interactions.objectFields).toBe(false);
      // Verify extend - overlayOpacity should exist
      expect('overlayOpacity' in designField.objectFields).toBe(true);
      assertField(designField.objectFields.overlayOpacity, 'number');
      const overlayOpacityField = designField.objectFields.overlayOpacity;
      // Verify defaults - overlayOpacity default should be updated
      expect(overlayOpacityField.default).toBe(0.8);
      // Verify defaults - useImage default should be updated
      assertField(designField.objectFields.useImage, 'switch');
      expect(designField.objectFields.useImage.default).toBe(true);
      // Verify defaults - $interactions.hold.type should be updated
      assertObjectField(result.fields.$interactions.objectFields.hold);
      const holdField = result.fields.$interactions.objectFields.hold;
      assertField(holdField.objectFields.type, 'select');
      expect(holdField.objectFields.type.default).toBe('navigate');
    });

    test('should preserve existing field metadata when extending', async () => {
      const config: CustomComponentConfig<
        SimpleProps,
        {
          $appearance: {
            customField: string;
          };
        }
      > = {
        label: 'Component With Extended Appearance',
        fields: {
          text: { type: 'text', label: 'Text', default: 'hello' },
        },
        render: SimpleComponent,
        internalFields: {
          extend: {
            $appearance: {
              customField: {
                type: 'text',
                label: 'Custom Field',
                default: '',
              },
            },
          },
        },
      };

      const data = createMockComponentFactoryData();
      const componentFactory = createComponent(config);
      const result = await componentFactory(data);

      expect(result.fields).toBeDefined();
      assertObjectField(result.fields.$appearance);
      // Verify that existing $appearance metadata is preserved
      expect(result.fields.$appearance.label).toBeDefined();
      // Verify extended field exists
      expect('customField' in result.fields.$appearance.objectFields).toBe(true);
      // Verify existing fields still exist
      expect('design' in result.fields.$appearance.objectFields).toBe(true);
    });

    test('should place extended fields before existing fields', async () => {
      const config: CustomComponentConfig<
        SimpleProps,
        {
          firstField: string;
          secondField: string;
        }
      > = {
        label: 'Component With Ordered Extended Fields',
        fields: {
          text: { type: 'text', label: 'Text', default: 'hello' },
        },
        render: SimpleComponent,
        internalFields: {
          extend: {
            firstField: {
              type: 'text',
              label: 'First',
              default: '',
            },
            secondField: {
              type: 'text',
              label: 'Second',
              default: '',
            },
          },
        },
      };

      const data = createMockComponentFactoryData();
      const componentFactory = createComponent(config);
      const result = await componentFactory(data);

      expect(result.fields).toBeDefined();
      const keys = Object.keys(result.fields);
      const firstFieldIndex = keys.indexOf('firstField');
      const secondFieldIndex = keys.indexOf('secondField');
      const textIndex = keys.indexOf('text');
      const appearanceIndex = keys.indexOf('$appearance');

      expect(firstFieldIndex).toBeGreaterThanOrEqual(0);
      expect(secondFieldIndex).toBeGreaterThanOrEqual(0);
      // Both extended fields should come before existing fields
      expect(firstFieldIndex).toBeLessThan(textIndex);
      expect(secondFieldIndex).toBeLessThan(textIndex);
      expect(firstFieldIndex).toBeLessThan(appearanceIndex);
      expect(secondFieldIndex).toBeLessThan(appearanceIndex);
    });

    test('should handle empty internalFields config', async () => {
      const config: CustomComponentConfig<SimpleProps> = {
        label: 'Component With Empty InternalFields',
        fields: {
          text: { type: 'text', label: 'Text', default: 'hello' },
        },
        render: SimpleComponent,
        internalFields: {},
      };

      const data = createMockComponentFactoryData();
      const componentFactory = createComponent(config);
      const result = await componentFactory(data);

      expect(result.fields).toBeDefined();
      // All internal fields should still be present
      expect('$appearance' in result.fields).toBe(true);
      expect('$interactions' in result.fields).toBe(true);
      expect('$styles' in result.fields).toBe(true);
    });

    test('should handle undefined internalFields config', async () => {
      const config: CustomComponentConfig<SimpleProps> = {
        label: 'Component Without InternalFields',
        fields: {
          text: { type: 'text', label: 'Text', default: 'hello' },
        },
        render: SimpleComponent,
        // internalFields is undefined
      };

      const data = createMockComponentFactoryData();
      const componentFactory = createComponent(config);
      const result = await componentFactory(data);

      expect(result.fields).toBeDefined();
      // All internal fields should still be present
      expect('$appearance' in result.fields).toBe(true);
      expect('$interactions' in result.fields).toBe(true);
      expect('$styles' in result.fields).toBe(true);
    });

    describe('extend with object fields', () => {
      test('should extend appearance with new object field containing nested fields', async () => {
        const config: CustomComponentConfig<
          SimpleProps,
          {
            $appearance: {
              general: {
                type: 'primary' | 'secondary';
                size: 'xs' | 'sm' | 'md' | 'lg';
              };
            };
          }
        > = {
          label: 'Component With Extended Object Field',
          fields: {
            text: { type: 'text', label: 'Text', default: 'hello' },
          },
          render: SimpleComponent,
          internalFields: {
            extend: {
              $appearance: {
                general: {
                  type: 'object',
                  label: 'General',
                  objectFields: {
                    type: {
                      type: 'select',
                      label: 'Type',
                      default: 'primary',
                      options: [
                        { label: 'Primary', value: 'primary' },
                        { label: 'Secondary', value: 'secondary' },
                      ],
                    },
                    size: {
                      type: 'select',
                      label: 'Size',
                      default: 'md',
                      options: [
                        { label: 'Extra Small', value: 'xs' },
                        { label: 'Small', value: 'sm' },
                        { label: 'Medium', value: 'md' },
                        { label: 'Large', value: 'lg' },
                      ],
                    },
                  },
                },
              },
            },
          },
        };

        const data = createMockComponentFactoryData();
        const componentFactory = createComponent(config);
        const result = await componentFactory(data);

        expect(result.fields).toBeDefined();
        assertObjectField(result.fields.$appearance);
        expect('general' in result.fields.$appearance.objectFields).toBe(true);
        assertObjectField(result.fields.$appearance.objectFields.general);
        const generalField = result.fields.$appearance.objectFields.general;
        expect(generalField.label).toBe('General');
        expect('type' in generalField.objectFields).toBe(true);
        expect('size' in generalField.objectFields).toBe(true);
        assertField(generalField.objectFields.type, 'select');
        assertField(generalField.objectFields.size, 'select');
        // Verify existing $appearance fields still exist
        expect('design' in result.fields.$appearance.objectFields).toBe(true);
      });

      test('should extend $appearance with object field containing visible functions', async () => {
        const config: CustomComponentConfig<
          SimpleProps,
          {
            $appearance: {
              general: {
                type: 'primary' | 'secondary';
                primaryVariant: 'primary' | 'success' | 'danger';
                secondaryVariant: 'secondary' | 'danger' | 'success' | 'transparent';
              };
            };
          }
        > = {
          label: 'Component With Extended Object Field With Visible',
          fields: {
            text: { type: 'text', label: 'Text', default: 'hello' },
          },
          render: SimpleComponent,
          internalFields: {
            extend: {
              $appearance: {
                general: {
                  type: 'object',
                  label: 'General',
                  objectFields: {
                    type: {
                      type: 'select',
                      label: 'Type',
                      default: 'primary',
                      options: [
                        { label: 'Primary', value: 'primary' },
                        { label: 'Secondary', value: 'secondary' },
                      ],
                    },
                    primaryVariant: {
                      type: 'select',
                      label: 'Primary Variant',
                      default: 'primary',
                      options: [
                        { label: 'Default', value: 'primary' },
                        { label: 'Success', value: 'success' },
                        { label: 'Error', value: 'error' },
                      ],
                      visible(data) {
                        return data.$appearance?.general?.type === 'primary';
                      },
                    },
                    secondaryVariant: {
                      type: 'select',
                      label: 'Secondary Variant',
                      default: 'secondary',
                      options: [
                        { label: 'Default', value: 'secondary' },
                        { label: 'Success', value: 'success' },
                        { label: 'Error', value: 'error' },
                        { label: 'Transparent', value: 'transparent' },
                      ],
                      visible(data) {
                        return data.$appearance?.general?.type === 'secondary';
                      },
                    },
                  },
                },
              },
            },
          },
        };

        const data = createMockComponentFactoryData();
        const componentFactory = createComponent(config);
        const result = await componentFactory(data);

        expect(result.fields).toBeDefined();
        assertObjectField(result.fields.$appearance);
        assertObjectField(result.fields.$appearance.objectFields.general);
        const generalField = result.fields.$appearance.objectFields.general;
        expect('primaryVariant' in generalField.objectFields).toBe(true);
        expect('secondaryVariant' in generalField.objectFields).toBe(true);
        assertField(generalField.objectFields.primaryVariant, 'select');
        assertField(generalField.objectFields.secondaryVariant, 'select');
        // Verify visible functions are preserved
        expect(typeof generalField.objectFields.primaryVariant.visible).toBe('function');
        expect(typeof generalField.objectFields.secondaryVariant.visible).toBe('function');
      });

      test('should extend $appearance.sizeAndSpacing with new fields', async () => {
        const config: CustomComponentConfig<
          SimpleProps,
          {
            $appearance: {
              sizeAndSpacing: {
                fullHeight: boolean;
                fullWidth: boolean;
              };
            };
          }
        > = {
          label: 'Component With Extended SizeAndSpacing',
          fields: {
            text: { type: 'text', label: 'Text', default: 'hello' },
          },
          render: SimpleComponent,
          internalFields: {
            extend: {
              $appearance: {
                sizeAndSpacing: {
                  fullHeight: {
                    type: 'switch',
                    label: 'Full Height',
                    default: false,
                  },
                  fullWidth: {
                    type: 'switch',
                    label: 'Full Width',
                    default: false,
                  },
                },
              },
            },
          },
        };

        const data = createMockComponentFactoryData();
        const componentFactory = createComponent(config);
        const result = await componentFactory(data);

        expect(result.fields).toBeDefined();
        assertObjectField(result.fields.$appearance);
        assertObjectField(result.fields.$appearance.objectFields.sizeAndSpacing);
        const sizeAndSpacingField = result.fields.$appearance.objectFields.sizeAndSpacing;
        expect('fullHeight' in sizeAndSpacingField.objectFields).toBe(true);
        expect('fullWidth' in sizeAndSpacingField.objectFields).toBe(true);
        assertField(sizeAndSpacingField.objectFields.fullHeight, 'switch');
        assertField(sizeAndSpacingField.objectFields.fullWidth, 'switch');
        // Verify existing sizeAndSpacing fields still exist
        expect('width' in sizeAndSpacingField.objectFields || 'height' in sizeAndSpacingField.objectFields).toBe(true);
      });

      test('should extend with deeply nested object fields (3 levels)', async () => {
        const config: CustomComponentConfig<
          SimpleProps,
          {
            $appearance: {
              general: {
                icons: {
                  start: {
                    icon: string;
                    size: string;
                  };
                };
              };
            };
          }
        > = {
          label: 'Component With Deeply Nested Extended Fields',
          fields: {
            text: { type: 'text', label: 'Text', default: 'hello' },
          },
          render: SimpleComponent,
          internalFields: {
            extend: {
              $appearance: {
                general: {
                  type: 'object',
                  label: 'General',
                  objectFields: {
                    icons: {
                      type: 'object',
                      label: 'Icons',
                      objectFields: {
                        start: {
                          type: 'object',
                          label: 'Start Icon',
                          objectFields: {
                            icon: {
                              type: 'icon',
                              label: 'Icon',
                              default: undefined,
                            },
                            size: {
                              type: 'text',
                              label: 'Size',
                              default: '1.25rem',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        };

        const data = createMockComponentFactoryData();
        const componentFactory = createComponent(config);
        const result = await componentFactory(data);

        expect(result.fields).toBeDefined();
        assertObjectField(result.fields.$appearance);
        assertObjectField(result.fields.$appearance.objectFields.general);
        const generalField = result.fields.$appearance.objectFields.general;
        assertObjectField(generalField.objectFields.icons);
        const iconsField = generalField.objectFields.icons;
        assertObjectField(iconsField.objectFields.start);
        const startField = iconsField.objectFields.start;
        expect('icon' in startField.objectFields).toBe(true);
        expect('size' in startField.objectFields).toBe(true);
        assertField(startField.objectFields.icon, 'icon');
        assertField(startField.objectFields.size, 'text');
      });

      test('should extend existing object field with new nested fields', async () => {
        const config: CustomComponentConfig<
          SimpleProps,
          {
            $appearance: {
              design: {
                overlay: {
                  color: string;
                  opacity: number;
                };
              };
            };
          }
        > = {
          label: 'Component Extending Existing Background Field',
          fields: {
            text: { type: 'text', label: 'Text', default: 'hello' },
          },
          render: SimpleComponent,
          internalFields: {
            extend: {
              $appearance: {
                design: {
                  overlay: {
                    type: 'object',
                    label: 'Overlay',
                    objectFields: {
                      color: {
                        type: 'color',
                        label: 'Overlay Color',
                        default: '#000000',
                      },
                      opacity: {
                        type: 'number',
                        label: 'Overlay Opacity',
                        default: 0.5,
                      },
                    },
                  },
                },
              },
            },
          },
        };

        const data = createMockComponentFactoryData();
        const componentFactory = createComponent(config);
        const result = await componentFactory(data);

        expect(result.fields).toBeDefined();
        assertObjectField(result.fields.$appearance);
        assertObjectField(result.fields.$appearance.objectFields.design);
        const designField = result.fields.$appearance.objectFields.design;
        expect('overlay' in designField.objectFields).toBe(true);
        assertObjectField(designField.objectFields.overlay);
        const overlayField = designField.objectFields.overlay;
        expect('color' in overlayField.objectFields).toBe(true);
        expect('opacity' in overlayField.objectFields).toBe(true);
        // Verify existing background fields still exist
        expect('color' in designField.objectFields || 'useImage' in designField.objectFields).toBe(true);
      });

      test('should extend with object field and then omit some of its nested fields', async () => {
        const config: CustomComponentConfig<
          SimpleProps,
          {
            $appearance: {
              general: {
                type: 'primary' | 'secondary';
                size: 'xs' | 'sm' | 'md' | 'lg';
                variant: string;
              };
            };
          }
        > = {
          label: 'Component With Extended Object Field Then Omit',
          fields: {
            text: { type: 'text', label: 'Text', default: 'hello' },
          },
          render: SimpleComponent,
          internalFields: {
            extend: {
              $appearance: {
                general: {
                  type: 'object',
                  label: 'General',
                  objectFields: {
                    type: {
                      type: 'select',
                      label: 'Type',
                      default: 'primary',
                      options: [
                        { label: 'Primary', value: 'primary' },
                        { label: 'Secondary', value: 'secondary' },
                      ],
                    },
                    size: {
                      type: 'select',
                      label: 'Size',
                      default: 'md',
                      options: [
                        { label: 'Extra Small', value: 'xs' },
                        { label: 'Small', value: 'sm' },
                        { label: 'Medium', value: 'md' },
                        { label: 'Large', value: 'lg' },
                      ],
                    },
                    variant: {
                      type: 'text',
                      label: 'Variant',
                      default: '',
                    },
                  },
                },
              },
            },
            omit: {
              $appearance: {
                // @ts-expect-error - general is an extended field, not in base AppearanceFields
                // Note: omit happens before extend, so we can't omit nested fields from extended object fields
                general: {
                  variant: true,
                },
              },
            },
          },
        };

        const data = createMockComponentFactoryData();
        const componentFactory = createComponent(config);
        const result = await componentFactory(data);

        expect(result.fields).toBeDefined();
        assertObjectField(result.fields.$appearance);
        assertObjectField(result.fields.$appearance.objectFields.general);
        const generalField = result.fields.$appearance.objectFields.general;
        expect('type' in generalField.objectFields).toBe(true);
        expect('size' in generalField.objectFields).toBe(true);
        // Note: omit happens before extend, so nested fields in extended object fields cannot be omitted
        // The variant field will still exist because it was added by extend after omit ran
        expect('variant' in generalField.objectFields).toBe(true);
      });

      test('should extend with object field and update defaults for its nested fields', async () => {
        const config: CustomComponentConfig<
          SimpleProps,
          {
            $appearance: {
              general: {
                type: 'primary' | 'secondary';
                size: 'xs' | 'sm' | 'md' | 'lg';
              };
            };
          }
        > = {
          label: 'Component With Extended Object Field And Defaults',
          fields: {
            text: { type: 'text', label: 'Text', default: 'hello' },
          },
          render: SimpleComponent,
          internalFields: {
            extend: {
              $appearance: {
                general: {
                  type: 'object',
                  label: 'General',
                  objectFields: {
                    type: {
                      type: 'select',
                      label: 'Type',
                      default: 'primary',
                      options: [
                        { label: 'Primary', value: 'primary' },
                        { label: 'Secondary', value: 'secondary' },
                      ],
                    },
                    size: {
                      type: 'select',
                      label: 'Size',
                      default: 'md',
                      options: [
                        { label: 'Extra Small', value: 'xs' },
                        { label: 'Small', value: 'sm' },
                        { label: 'Medium', value: 'md' },
                        { label: 'Large', value: 'lg' },
                      ],
                    },
                  },
                },
              },
            },
            defaults: {
              $appearance: {
                // @ts-expect-error - general is an extended field, not in base AppearanceFields
                general: {
                  type: 'secondary',
                  size: 'lg',
                },
              },
            },
          },
        };

        const data = createMockComponentFactoryData();
        const componentFactory = createComponent(config);
        const result = await componentFactory(data);

        expect(result.fields).toBeDefined();
        assertObjectField(result.fields.$appearance);
        assertObjectField(result.fields.$appearance.objectFields.general);
        const generalField = result.fields.$appearance.objectFields.general;
        assertField(generalField.objectFields.type, 'select');
        assertField(generalField.objectFields.size, 'select');
        expect(generalField.objectFields.type.default).toBe('secondary');
        expect(generalField.objectFields.size.default).toBe('lg');
      });

      test('should extend multiple object fields at different levels', async () => {
        const config: CustomComponentConfig<
          SimpleProps,
          {
            $appearance: {
              general: {
                type: 'primary' | 'secondary';
              };
              layout: {
                direction: 'row' | 'column';
              };
            };
          }
        > = {
          label: 'Component With Multiple Extended Object Fields',
          fields: {
            text: { type: 'text', label: 'Text', default: 'hello' },
          },
          render: SimpleComponent,
          internalFields: {
            extend: {
              $appearance: {
                general: {
                  type: 'object',
                  label: 'General',
                  objectFields: {
                    type: {
                      type: 'select',
                      label: 'Type',
                      default: 'primary',
                      options: [
                        { label: 'Primary', value: 'primary' },
                        { label: 'Secondary', value: 'secondary' },
                      ],
                    },
                  },
                },
                layout: {
                  type: 'object',
                  label: 'Layout',
                  objectFields: {
                    direction: {
                      type: 'select',
                      label: 'Direction',
                      default: 'row',
                      options: [
                        { label: 'Row', value: 'row' },
                        { label: 'Column', value: 'column' },
                      ],
                    },
                  },
                },
              },
            },
          },
        };

        const data = createMockComponentFactoryData();
        const componentFactory = createComponent(config);
        const result = await componentFactory(data);

        expect(result.fields).toBeDefined();
        assertObjectField(result.fields.$appearance);
        expect('general' in result.fields.$appearance.objectFields).toBe(true);
        expect('layout' in result.fields.$appearance.objectFields).toBe(true);
        assertObjectField(result.fields.$appearance.objectFields.general);
        assertObjectField(result.fields.$appearance.objectFields.layout);
        const generalField = result.fields.$appearance.objectFields.general;
        const layoutField = result.fields.$appearance.objectFields.layout;
        expect('type' in generalField.objectFields).toBe(true);
        expect('direction' in layoutField.objectFields).toBe(true);
      });

      test('should extend object field and set defaults for its nested fields', async () => {
        const config: CustomComponentConfig<
          SimpleProps,
          {
            $appearance: {
              general: {
                type: 'primary' | 'secondary';
                size: 'xs' | 'sm' | 'md' | 'lg';
                disabled: boolean;
              };
            };
          }
        > = {
          label: 'Component With Extended Object Field And Defaults',
          fields: {
            text: { type: 'text', label: 'Text', default: 'hello' },
          },
          render: SimpleComponent,
          internalFields: {
            extend: {
              $appearance: {
                general: {
                  type: 'object',
                  label: 'General',
                  objectFields: {
                    type: {
                      type: 'select',
                      label: 'Type',
                      default: 'primary',
                      options: [
                        { label: 'Primary', value: 'primary' },
                        { label: 'Secondary', value: 'secondary' },
                      ],
                    },
                    size: {
                      type: 'select',
                      label: 'Size',
                      default: 'md',
                      options: [
                        { label: 'Extra Small', value: 'xs' },
                        { label: 'Small', value: 'sm' },
                        { label: 'Medium', value: 'md' },
                        { label: 'Large', value: 'lg' },
                      ],
                    },
                    disabled: {
                      type: 'switch',
                      label: 'Disabled',
                      default: false,
                    },
                  },
                },
              },
            },
            defaults: {
              $appearance: {
                // @ts-expect-error - general is an extended field, not in base AppearanceFields
                general: {
                  type: 'secondary',
                  size: 'lg',
                  disabled: true,
                },
              },
            },
          },
        };

        const data = createMockComponentFactoryData();
        const componentFactory = createComponent(config);
        const result = await componentFactory(data);

        expect(result.fields).toBeDefined();
        assertObjectField(result.fields.$appearance);
        assertObjectField(result.fields.$appearance.objectFields.general);
        const generalField = result.fields.$appearance.objectFields.general;
        // Verify extend - all fields should exist
        expect('type' in generalField.objectFields).toBe(true);
        expect('size' in generalField.objectFields).toBe(true);
        expect('disabled' in generalField.objectFields).toBe(true);
        // Verify defaults
        assertField(generalField.objectFields.type, 'select');
        assertField(generalField.objectFields.size, 'select');
        assertField(generalField.objectFields.disabled, 'switch');
        expect(generalField.objectFields.type.default).toBe('secondary');
        expect(generalField.objectFields.size.default).toBe('lg');
        expect(generalField.objectFields.disabled.default).toBe(true);
      });

      test('should extend $interactions with new object field', async () => {
        const config: CustomComponentConfig<
          SimpleProps,
          {
            $interactions: {
              custom: {
                action: string;
                delay: number;
              };
            };
          }
        > = {
          label: 'Component With Extended Interactions Object Field',
          fields: {
            text: { type: 'text', label: 'Text', default: 'hello' },
          },
          render: SimpleComponent,
          internalFields: {
            extend: {
              $interactions: {
                custom: {
                  type: 'object',
                  label: 'Custom Interaction',
                  objectFields: {
                    action: {
                      type: 'text',
                      label: 'Action',
                      default: '',
                    },
                    delay: {
                      type: 'number',
                      label: 'Delay',
                      default: 0,
                    },
                  },
                },
              },
            },
          },
        };

        const data = createMockComponentFactoryData();
        const componentFactory = createComponent(config);
        const result = await componentFactory(data);

        expect(result.fields).toBeDefined();
        assertObjectField(result.fields.$interactions);
        expect('custom' in result.fields.$interactions.objectFields).toBe(true);
        assertObjectField(result.fields.$interactions.objectFields.custom);
        const customField = result.fields.$interactions.objectFields.custom;
        expect('action' in customField.objectFields).toBe(true);
        expect('delay' in customField.objectFields).toBe(true);
        // Verify existing interaction fields still exist
        expect('tap' in result.fields.$interactions.objectFields).toBe(true);
      });
    });
  });
});

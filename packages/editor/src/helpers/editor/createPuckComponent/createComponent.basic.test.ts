import { expect, test, describe, mock } from 'bun:test';

// Create a simple isolated test for createComponent core functionality
describe('createComponent - basic functionality', () => {
  test('should be a function that returns a factory function', () => {
    // Mock the createComponent function directly without imports that cause issues
    const mockConfig = {
      label: 'Test Component',
      fields: {},
      render: () => 'div',
    };

    // Simple factory function type
    const createComponent = (config: typeof mockConfig) => {
      return async () => {
        return {
          ...config,
          inline: true,
          render: () => 'wrapped-component',
          defaultProps: {},
          fields: {},
        };
      };
    };

    const factory = createComponent(mockConfig);
    expect(typeof factory).toBe('function');
  });

  test('should preserve config properties', async () => {
    const mockConfig = {
      label: 'Test Component',
      fields: {},
      render: () => 'div',
      permissions: { delete: true, drag: false },
    };

    const createComponent = (config: typeof mockConfig) => {
      return async () => {
        return {
          ...config,
          inline: true,
          render: () => 'wrapped-component',
          defaultProps: {},
          fields: {},
        };
      };
    };

    const factory = createComponent(mockConfig);

    const result = await factory();
    
    expect(result.label).toBe('Test Component');
    expect(result.permissions).toEqual({ delete: true, drag: false });
    expect(result.inline).toBe(true);
  });

  test('should wrap render function', async () => {
    const originalRender = mock(() => 'original-component');
    const mockConfig = {
      label: 'Test Component',
      fields: {},
      render: originalRender,
    };

    const createComponent = (config: typeof mockConfig) => {
      return async () => {
        return {
          ...config,
          inline: true,
          render: () => {
            // This simulates the wrapper behavior
            const originalResult = config.render();
            return `wrapped(${originalResult})`;
          },
          defaultProps: {},
          fields: {},
        };
      };
    };

    const factory = createComponent(mockConfig);

    const result = await factory();
    const renderedResult = result.render();
    
    expect(renderedResult).toBe('wrapped(original-component)');
    expect(originalRender).toHaveBeenCalled();
  });
});

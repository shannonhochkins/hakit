import { jsx } from '@emotion/react';
import { ReactNode, isValidElement, Fragment, createElement } from 'react';

/**
 * Automatically attach dragRef to the top-level element returned by a component
 *
 * This function handles the complexity of automatically attaching Puck's dragRef
 * to user components without requiring manual ref management.
 *
 * Considerations and edge cases handled:
 *
 * 1. **Fragment at top level**: Extracts children and wraps in a div (or custom wrapper) with dragRef
 * 2. **Intentional falsy returns**: Returns null, undefined, false, empty string unchanged
 * 3. **Array returns**: Wraps entire array in a div (or custom wrapper) with dragRef
 * 4. **String/number returns**: Wraps in a span (or custom wrapper) with dragRef (including 0 and negative numbers)
 * 5. **Regular elements**: Uses jsx from '@emotion/react' to add/merge the ref and apply css properly
 * 6. **Existing refs**: Preserves and calls existing refs alongside dragRef
 * 7. **Clone failures**: Falls back to div (or custom wrapper) if jsx fails
 * 8. **Custom wrapper**: If provided, replaces auto-wrapping elements and merges createWrapperProps onto it
 *
 * Trade-offs:
 * - May introduce extra wrapper elements in some cases
 * - Fragment semantics are lost (converted to div or custom wrapper)
 * - Some performance overhead from jsx/cloning
 *
 * Benefits:
 * - Eliminates manual ref management for users
 * - Handles all common React return patterns
 * - Preserves existing component functionality
 * - Allows custom wrapper elements for more control
 */

type AttachPropsToElementProps = {
  element: ReactNode | undefined;
  ref?: ((element: Element | null) => void) | null;
  componentLabel?: string;
  updateProps?: (currentProps: React.ComponentPropsWithRef<'div'>) => React.ComponentPropsWithRef<'div'>;
  wrapper?: ReactNode;
};

export function attachPropsToElement({
  element,
  ref,
  componentLabel,
  updateProps,
  wrapper,
}: AttachPropsToElementProps): ReactNode | undefined {
  // Helper to create wrapper props with optional emotion CSS
  const createWrapperProps = (additionalProps?: React.ComponentPropsWithRef<'div'>) => {
    const baseProps: React.ComponentPropsWithRef<'div'> = {
      ref: ref ?? null,
      ...additionalProps,
    };
    const updatedProps = updateProps ? updateProps(baseProps) : baseProps;
    // Ensure ref is always preserved even if updateProps doesn't include it
    return {
      ...updatedProps,
      ref: updatedProps.ref ?? ref ?? null,
    };
  };

  // Helper to wrap element with custom wrapper or default element
  const wrapElement = (children: ReactNode, defaultType: 'div' | 'span' = 'div') => {
    if (wrapper && isValidElement(wrapper)) {
      // Merge createWrapperProps onto the wrapper element
      const wrapperProps = createWrapperProps();
      const wrapperElementProps = wrapper.props as Record<string, unknown>;
      // Use wrapper's children if it explicitly has children, otherwise use the provided children
      // Check if 'children' key exists in props (even if value is undefined/null)
      const hasWrapperChildren = 'children' in wrapperElementProps && wrapperElementProps.children !== undefined;
      const wrapperChildren = hasWrapperChildren ? (wrapperElementProps.children as ReactNode) : children;
      const mergedProps = {
        ...wrapperElementProps,
        ...wrapperProps,
        // Ensure ref from wrapperProps (which includes dragRef) is explicitly applied
        ref: wrapperProps.ref,
        // Include key in props, not as separate argument
        key: wrapper.key,
      };
      // Remove children from props - createElement handles it as 3rd+ argument
      delete (mergedProps as { children?: unknown }).children;
      // Use createElement for wrapper to ensure proper children handling
      // Key is now in props, children are passed as 3rd argument
      return createElement(wrapper.type, mergedProps, wrapperChildren);
    }
    // Fallback to default wrapper - use createElement for consistency
    const defaultProps = createWrapperProps();
    // Pass children as 3rd argument to createElement (not in props)
    return createElement(defaultType, defaultProps, children);
  };

  // First check: if component intentionally returned falsy value, respect that decision
  // Only return early for truly falsy values that don't render content
  if (element === null || element === undefined || element === false || element === '') {
    // null, undefined, false, empty string - don't wrap, return as-is
    return element;
  }

  const logAutoWrap = (reason: string, wrapperType: 'div' | 'span') => {
    console.warn(
      `HAKIT: Automatically wrapping component${componentLabel ? ` "${componentLabel}"` : ''} with <${wrapperType}> for drag behavior. Reason: ${reason}. Consider returning a single React element from your render function to avoid this wrapper.`
    );
  };

  // Handle numbers (including 0) and non-empty strings
  if (typeof element === 'string' || typeof element === 'number') {
    logAutoWrap(`Component returned ${typeof element}`, 'span');
    return wrapElement(element, 'span');
  }

  // Handle arrays
  if (Array.isArray(element)) {
    logAutoWrap('Component returned an array', 'div');
    return wrapElement(element, 'div');
  }

  // Handle React elements
  if (isValidElement(element)) {
    // Handle Fragment specifically
    if (element.type === Fragment) {
      logAutoWrap('Component returned a React Fragment', 'div');
      // Extract children from fragment and wrap
      const fragmentProps = element.props as { children?: ReactNode };
      return wrapElement(fragmentProps.children, 'div');
    }
    // if the element.type is not a simple string (like 'div' or 'span'), it is a custom component
    // we need to wrap it
    if (typeof element.type !== 'string') {
      logAutoWrap('Component returned a custom React component', 'div');
      return wrapElement(element, 'div');
    }

    // Handle regular React elements - clone and add/merge the ref and CSS
    try {
      const originalProps = element.props as React.ComponentPropsWithRef<'div'>;

      // If wrapper is provided, updateProps is meant for the wrapper, not the element
      // So we don't call updateProps on the element's props when a wrapper is present
      const finalProps = wrapper && isValidElement(wrapper) ? originalProps : updateProps ? updateProps(originalProps) : originalProps;

      // Compose refs
      const innerRef = finalProps?.ref;
      const outerRef = ref;

      const composedRef = (node: HTMLDivElement | null) => {
        // outer ref first
        if (typeof outerRef === 'function') outerRef(node);
        else if (outerRef && typeof outerRef === 'object' && 'current' in outerRef) {
          // @ts-expect-error - TODO - Fix types later
          outerRef.current = node;
        }

        // then inner/original ref
        if (typeof innerRef === 'function') innerRef(node);
        else if (innerRef && typeof innerRef === 'object' && 'current' in innerRef) {
          innerRef.current = node;
        }
      };

      // If wrapper is provided, wrap the element with the wrapper
      if (wrapper && isValidElement(wrapper)) {
        // For the element, use originalProps (don't apply updateProps which is for the wrapper)
        // Ensure children are on props (not as jsx's 3rd arg)
        const propsForJsx = {
          ...originalProps,
          ref: composedRef, // <— our composed ref wins
          key: element.key, // key goes here for jsx runtime
          children: originalProps?.children,
        };

        const clonedElement = jsx(element.type, propsForJsx);

        // Merge wrapper's original props with the ref first, then apply updateProps
        const wrapperElementProps = wrapper.props as Record<string, unknown>;
        const baseWrapperProps: React.ComponentPropsWithRef<'div'> = {
          ref: ref ?? null,
          ...(wrapperElementProps as React.ComponentPropsWithRef<'div'>),
        };

        // Apply updateProps to the merged wrapper props (not just the ref)
        const updatedWrapperProps = updateProps ? updateProps(baseWrapperProps) : baseWrapperProps;

        // Ensure ref is always preserved
        const finalWrapperProps = {
          ...updatedWrapperProps,
          ref: updatedWrapperProps.ref ?? ref ?? null,
          // Include key in props for jsx
          key: wrapper.key,
        };

        // Determine children: use wrapper's children if explicitly provided, otherwise use the cloned element
        const hasWrapperChildren = 'children' in wrapperElementProps && wrapperElementProps.children !== undefined;
        const wrapperChildren = hasWrapperChildren ? (wrapperElementProps.children as ReactNode) : clonedElement;

        // Remove children from props - jsx handles it as 3rd+ argument
        delete (finalWrapperProps as { children?: unknown }).children;
        // Pass children as 3rd argument to jsx (not in props)
        return jsx(wrapper.type, finalWrapperProps, wrapperChildren);
      }

      // When no wrapper, updateProps applies to the element itself
      // Ensure children are on props (not as jsx's 3rd arg)
      const propsForJsx = {
        ...finalProps,
        ref: composedRef, // <— our composed ref wins
        key: element.key, // key goes here for jsx runtime
        children: finalProps?.children ?? originalProps?.children,
      };

      return jsx(element.type, propsForJsx);
    } catch (error) {
      console.warn('HAKIT: Failed to clone element for automatic drag behavior:', error);
      logAutoWrap('cloneElement failed', 'div');
      // Fallback: wrap in div or custom wrapper
      return wrapElement(element, 'div');
    }
  }
  // for react portals, just return the original element
  const portal = element as { $$typeof?: symbol };
  if (portal && portal.$$typeof && typeof portal.$$typeof === 'symbol') {
    return element;
  }
  // Fallback for any other case
  logAutoWrap('Component returned unknown type', 'div');
  return wrapElement(element, 'div');
}

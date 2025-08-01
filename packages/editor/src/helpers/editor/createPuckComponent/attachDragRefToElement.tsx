import { ReactNode, ReactElement, cloneElement, isValidElement, Fragment } from 'react';

/**
 * Automatically attach dragRef to the top-level element returned by a component
 *
 * This function handles the complexity of automatically attaching Puck's dragRef
 * to user components without requiring manual ref management.
 *
 * Considerations and edge cases handled:
 *
 * 1. **Fragment at top level**: Extracts children and wraps in a div with dragRef
 * 2. **Intentional falsy returns**: Returns null, undefined, false, empty string unchanged
 * 3. **Array returns**: Wraps entire array in a div with dragRef
 * 4. **String/number returns**: Wraps in a span with dragRef (including 0 and negative numbers)
 * 5. **Regular elements**: Uses cloneElement to add/merge the ref
 * 6. **Existing refs**: Preserves and calls existing refs alongside dragRef
 * 7. **Clone failures**: Falls back to div wrapper if cloneElement fails
 *
 * Trade-offs:
 * - May introduce extra wrapper elements in some cases
 * - Fragment semantics are lost (converted to div)
 * - Some performance overhead from cloneElement
 *
 * Benefits:
 * - Eliminates manual ref management for users
 * - Handles all common React return patterns
 * - Preserves existing component functionality
 */
export function attachDragRefToElement(
  element: ReactNode | undefined,
  dragRef?: ((element: Element | null) => void) | null,
  componentLabel?: string
): ReactNode | undefined {
  if (!dragRef) {
    return element;
  }

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
    return <span ref={dragRef}>{element}</span>;
  }

  // Handle arrays
  if (Array.isArray(element)) {
    logAutoWrap('Component returned an array', 'div');
    return <div ref={dragRef}>{element}</div>;
  }

  // Handle React elements
  if (isValidElement(element)) {
    // Handle Fragment specifically
    if (element.type === Fragment) {
      logAutoWrap('Component returned a React Fragment', 'div');
      // Extract children from fragment and wrap in div
      const fragmentProps = element.props as { children?: ReactNode };
      return <div ref={dragRef}>{fragmentProps.children}</div>;
    }

    // Handle regular React elements - clone and add/merge the ref
    try {
      // Use a more permissive type for cloneElement to allow ref attachment
      return cloneElement(element, {
        ref: (node: Element | null) => {
          // Call the dragRef
          dragRef(node);

          // If the original element had a ref, call it too
          const elementWithRef = element as ReactElement<unknown> & { ref?: unknown };
          const originalRef = elementWithRef.ref;
          if (originalRef) {
            if (typeof originalRef === 'function') {
              originalRef(node);
            } else if (originalRef && typeof originalRef === 'object') {
              (originalRef as { current: Element | null }).current = node;
            }
          }
        },
      } as Partial<{ ref: (node: Element | null) => void }>); // Allow ref attachment
    } catch (error) {
      console.warn('HAKIT: Failed to clone element for automatic drag behavior:', error);
      logAutoWrap('cloneElement failed', 'div');
      // Fallback: wrap in div
      return <div ref={dragRef}>{element}</div>;
    }
  }

  // Fallback for any other case
  logAutoWrap('Component returned unknown type', 'div');
  return <div ref={dragRef}>{element}</div>;
}

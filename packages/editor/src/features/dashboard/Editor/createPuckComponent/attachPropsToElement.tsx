import { jsx } from '@emotion/react';
import { ReactNode, isValidElement, Fragment } from 'react';

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
 * 5. **Regular elements**: Uses jsx from '@emotion/react' to add/merge the ref and apply css properly
 * 6. **Existing refs**: Preserves and calls existing refs alongside dragRef
 * 7. **Clone failures**: Falls back to div wrapper if jsx fails
 *
 * Trade-offs:
 * - May introduce extra wrapper elements in some cases
 * - Fragment semantics are lost (converted to div)
 * - Some performance overhead from jsx/cloning
 *
 * Benefits:
 * - Eliminates manual ref management for users
 * - Handles all common React return patterns
 * - Preserves existing component functionality
 */

type AttachPropsToElementProps = {
  element: ReactNode | undefined;
  ref?: ((element: Element | null) => void) | null;
  componentLabel?: string;
  updateProps?: (currentProps: React.ComponentPropsWithRef<'div'>) => React.ComponentPropsWithRef<'div'>;
};

export function attachPropsToElement({ element, ref, componentLabel, updateProps }: AttachPropsToElementProps): ReactNode | undefined {
  // Helper to create wrapper props with optional emotion CSS
  const createWrapperProps = (additionalProps?: React.ComponentPropsWithRef<'div'>) => {
    const baseProps: React.ComponentPropsWithRef<'div'> = {
      ref: ref ?? null,
      ...additionalProps,
    };
    const updatedProps = updateProps ? updateProps(baseProps) : baseProps;
    return updatedProps;
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
    return <span {...createWrapperProps()}>{element}</span>;
  }

  // Handle arrays
  if (Array.isArray(element)) {
    logAutoWrap('Component returned an array', 'div');
    return <div {...createWrapperProps()}>{element}</div>;
  }

  // Handle React elements
  if (isValidElement(element)) {
    // Handle Fragment specifically
    if (element.type === Fragment) {
      logAutoWrap('Component returned a React Fragment', 'div');
      // Extract children from fragment and wrap in div
      const fragmentProps = element.props as { children?: ReactNode };
      return <div {...createWrapperProps()}>{fragmentProps.children}</div>;
    }

    // Handle regular React elements - clone and add/merge the ref and CSS
    try {
      const originalProps = element.props as React.ComponentPropsWithRef<'div'>;

      // Build the current props view for updateProps to inspect and modify
      const currentProps: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> = {
        ...originalProps,
        // don't compose yet; let updateProps see the original
        ref: originalProps?.ref,
      };

      const finalProps = updateProps ? updateProps(currentProps) : currentProps;

      // Compose refs *after* updateProps so we include any ref it set
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
      // Fallback: wrap in div
      return <div {...createWrapperProps()}>{element}</div>;
    }
  }
  // for react portals, just return the original element
  const portal = element as { $$typeof?: symbol };
  if (portal && portal.$$typeof && typeof portal.$$typeof === 'symbol') {
    return element;
  }
  // Fallback for any other case
  logAutoWrap('Component returned unknown type', 'div');
  return <div {...createWrapperProps()}>{element}</div>;
}

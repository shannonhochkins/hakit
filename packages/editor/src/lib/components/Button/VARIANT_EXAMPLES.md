# Primary Button Variants

The `PrimaryButton` component now supports different color variants while maintaining the same gradient style and behavior.

## Available Variants

- `primary` (default) - Blue to cyan gradient
- `success` - Green gradient 
- `error` - Red gradient

## Usage Examples

```tsx
import { PrimaryButton } from '@lib/components/Button';

// Default primary variant (blue/cyan gradient)
<PrimaryButton aria-label="Save changes">
  Save
</PrimaryButton>

// Explicitly set primary variant (same as default)
<PrimaryButton variant="primary" aria-label="Continue action">
  Continue
</PrimaryButton>

// Success variant (green gradient)
<PrimaryButton variant="success" aria-label="Confirm action">
  Confirm
</PrimaryButton>

// Error variant (red gradient) 
<PrimaryButton variant="error" aria-label="Delete item">
  Delete
</PrimaryButton>
```

## Variant Features

All variants maintain the same:
- Gradient background with smooth hover transitions
- Shadow effects that match the variant color
- Loading state with spinner
- Size variants (sm, md, lg)
- Accessibility features
- Focus management

## Design System Integration

The variants use the design system's semantic color variables:
- **Success**: Uses `--color-success-*` variables for green gradients
- **Error**: Uses `--color-error-*` variables for red gradients  
- **Primary**: Uses `--color-primary-*` and `--color-secondary-*` for blue/cyan gradients

## Backward Compatibility

All existing `PrimaryButton` usage continues to work without changes since `variant="primary"` is the default behavior.

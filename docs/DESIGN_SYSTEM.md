# HA KIT Design System

This document outlines the design system and CSS variables used throughout the HA KIT editor application.

## 🎨 Color System

### Primary Colors (Blues)
- `--color-primary-50` to `--color-primary-900`: Complete blue scale
- Usage: Primary buttons, links, focus states, brand elements

### Secondary Colors (Cyans)
- `--color-secondary-50` to `--color-secondary-900`: Complete cyan scale
- Usage: Accent colors, secondary elements, gradient combinations

### Neutral Colors (Grays)
- `--color-gray-50` to `--color-gray-950`: Complete gray scale
- Usage: Backgrounds, text, borders, surfaces

### Semantic Colors
```css
--color-surface: Main background color
--color-surface-elevated: Elevated surfaces (cards, modals)
--color-surface-overlay: Semi-transparent overlays
--color-border: Standard border color
--color-border-subtle: Subtle borders
```

### Text Colors
```css
--color-text-primary: Primary text (white)
--color-text-secondary: Secondary text (gray-300)
--color-text-muted: Muted text (gray-400)
--color-text-disabled: Disabled text (gray-500)
```

## 🎭 Gradients

### Primary Gradients
```css
--gradient-primary: Main brand gradient (blue to cyan)
--gradient-primary-hover: Hover state gradient
--gradient-primary-active: Active state gradient
--gradient-text: Text gradient for headings
--gradient-text-secondary: Secondary text gradient
```

## 🌟 Shadows

### Standard Shadows
- `--shadow-sm` to `--shadow-2xl`: Standard elevation shadows

### Primary Button Shadows
- `--shadow-primary-base`: Default button shadow
- `--shadow-primary-hover`: Hover state shadow
- `--shadow-primary-active`: Active state shadow
- `--shadow-primary-focus`: Focus ring shadow (3px)
- `--shadow-primary-focus-sm`: Small focus ring shadow (2px)

### Error Button Shadows
- `--shadow-error-base`: Default error button shadow
- `--shadow-error-hover`: Error hover state shadow
- `--shadow-error-active`: Error active state shadow
- `--shadow-error-focus`: Error focus ring shadow (3px)
- `--shadow-error-focus-sm`: Small error focus ring shadow (2px)

### Success Button Shadows
- `--shadow-success-base`: Default success button shadow
- `--shadow-success-hover`: Success hover state shadow
- `--shadow-success-active`: Success active state shadow
- `--shadow-success-focus`: Success focus ring shadow (3px)
- `--shadow-success-focus-sm`: Small success focus ring shadow (2px)

## 📝 Typography

### Font Sizes
- `--font-size-xs` (12px) to `--font-size-6xl` (60px)
- Follow consistent scaling ratio

### Font Weights
```css
--font-weight-normal: 400
--font-weight-medium: 500
--font-weight-semibold: 600
--font-weight-bold: 700
```

### Line Heights
```css
--line-height-tight: 1.25
--line-height-normal: 1.5
--line-height-relaxed: 1.75
```

## 📏 Spacing

### Space Scale
- `--space-0` (0) to `--space-32` (128px)
- Based on 4px increments for consistency

## 🔄 Border Radius

```css
--radius-sm: 4px     /* Small elements */
--radius-md: 6px     /* Form inputs */
--radius-lg: 8px     /* Cards */
--radius-xl: 12px    /* Buttons */
--radius-2xl: 16px   /* Large containers */
--radius-full: 9999px /* Pills/circular */
```

## 📱 Responsive Breakpoints

The application uses a dynamic JavaScript-based responsive system instead of CSS media queries. Responsive classes are automatically added to the `<body>` element based on the current viewport width:

### Breakpoint Thresholds
- **xs**: `< 640px` (mobile phones)
- **sm**: `>= 640px` (small tablets)  
- **md**: `>= 768px` (tablets)
- **lg**: `>= 1024px` (desktop)
- **xl**: `>= 1200px` (large desktop)

### Dynamic Body Classes

```css
.mq-xs   /* < 640px (mobile) */
.mq-sm   /* >= 640px (small tablets) */
.mq-md   /* >= 768px (tablets) */
.mq-lg   /* >= 1024px (desktop) */
.mq-xl   /* >= 1200px (large desktop) */
```

**Only one class is active at any time**, automatically updated on window resize.

**Usage in CSS/Emotion:**
```css
/* Base styles */
.some-element {
  grid-template-columns: 1fr;
}

/* Responsive styles using body classes */
.mq-sm & {
  grid-template-columns: repeat(2, 1fr);
}

.mq-md & {
  grid-template-columns: repeat(3, 1fr);
}

.mq-lg & {
  grid-template-columns: repeat(4, 1fr);
}

.mq-xl & {
  grid-template-columns: repeat(5, 1fr);
}
```

**Usage in Emotion styled components:**
```tsx
const ResponsiveGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);

  .mq-sm & {
    grid-template-columns: repeat(2, 1fr);
  }

  .mq-md & {
    grid-template-columns: repeat(3, 1fr);
  }

  .mq-lg & {
    grid-template-columns: repeat(4, 1fr);
  }

  .mq-xl & {
    grid-template-columns: repeat(5, 1fr);
  }
`;
```

**Benefits:**
- ✅ No hardcoded breakpoint values anywhere in the codebase
- ✅ Centralized breakpoint management in JavaScript
- ✅ Dynamic updates on window resize without CSS recalculation
- ✅ Cleaner, more maintainable responsive code
- ✅ Consistent breakpoint behavior across the entire app
- ✅ Better performance than CSS media queries
- ✅ Single source of truth for breakpoint logic

## 🌀 Effects

### Blur Values
- `--blur-sm` (4px) to `--blur-3xl` (64px)

### Transitions
```css
--transition-fast: 0.15s cubic-bezier(0.4, 0, 0.2, 1)
--transition-normal: 0.3s cubic-bezier(0.4, 0, 0.2, 1)
--transition-slow: 0.5s cubic-bezier(0.4, 0, 0.2, 1)
```

## 🎯 Z-Index Scale

```css
--z-dropdown: 1000
--z-sticky: 1020
--z-fixed: 1030
--z-modal-backdrop: 1040
--z-modal: 1050
--z-popover: 1060
--z-tooltip: 1070
```

## 💡 Usage Guidelines

### Do's
- ✅ Always use CSS variables instead of hardcoded values
- ✅ Use semantic color names (e.g., `--color-text-primary`)
- ✅ Follow the spacing scale for consistent layouts
- ✅ Use the typography scale for consistent text sizing
- ✅ Use responsive classes (`.mq-sm &`, `.mq-md &`) for breakpoints

### Don'ts
- ❌ Don't use arbitrary color values
- ❌ Don't use inconsistent spacing (stick to the scale)
- ❌ Don't bypass the design system for one-off styles
- ❌ Don't use hardcoded z-index values
- ❌ Don't use CSS media queries (`@media`) - use responsive classes instead
- ❌ Don't hardcode breakpoint pixel values in components

### Component Examples

#### Primary Button
```tsx
import { PrimaryButton } from '@lib/page/shared/Button';

// Basic usage
<PrimaryButton>Get Started</PrimaryButton>

// With props
<PrimaryButton 
  size="lg" 
  loading={isLoading}
  startIcon={<SendIcon />}
  onClick={handleSubmit}
>
  Submit Form
</PrimaryButton>
```

#### Secondary Button
```tsx
import { SecondaryButton } from '@lib/page/shared/Button';

<SecondaryButton 
  variant="secondary"
  endIcon={<ArrowRightIcon />}
>
  Learn More
</SecondaryButton>
```

#### Floating Action Button (FAB)
```tsx
import { Fab } from '@lib/page/shared/Button';

// Fixed position FAB
<Fab
  icon={<PlusIcon />}
  position="bottom-right"
  pulse
  aria-label="Add new item"
  onClick={handleAdd}
/>

// Inline FAB
<Fab
  icon={<EditIcon />}
  position="relative"
  variant="secondary"
  size="sm"
  aria-label="Edit"
/>
```

#### Button Features
- **Smooth Gradient Animations**: Uses pseudo-elements for seamless hover transitions
- **Accessibility**: Full keyboard navigation and screen reader support
- **Loading States**: Built-in loading spinners
- **Multiple Sizes**: sm, md, lg variants
- **Icon Support**: Start and end icon props
- **Performance Optimized**: GPU acceleration and optimized transitions

#### Form Field Features
- **Size Variants**: small, medium, large sizes with consistent spacing
- **Integrated Design**: Adornments appear as part of the input field itself for seamless appearance
- **Smart Adornment Detection**: Automatically detects icons vs custom content for optimal styling
- **Adornment Variants**: Support for default (1:1 boxes), icon, and custom styling variants
- **1:1 Ratio Adornments**: Default adornments fill full height with perfect square proportions
- **Custom Adornment Control**: Explicit variant and className props for fine-grained control
- **Controlled Components**: Full support for controlled state with onChange handlers
- **State Management**: Built-in error and success states with appropriate styling
- **Accessibility**: Full ARIA support and keyboard navigation
- **Design System Integration**: Uses all design system variables for consistent styling
- **Type Safety**: Full TypeScript support with proper type inference
- **Focus States**: Consistent focus ring styling using design system shadow variables
- **Text Enhancement**: Subtle text-indent for improved readability

## 🔧 Customization

To modify the design system:

1. Update the CSS variables in `src/index.tsx`
2. Ensure all components use the updated variables
3. Test across all breakpoints and states
4. Update this documentation

#### AutocompleteField Features
- **Size Variants**: small, medium, large sizes with proportional dimensions
- **Generic Type Support**: Full TypeScript generics for type-safe options and values
- **Multiple Selection**: Optional multiple prop with array-based value handling
- **Start/End Adornments**: Icon and custom adornment support with smart detection
- **Virtualization**: react-window integration for large datasets (1000+ items)
- **Search/Filtering**: Real-time filtering of options as user types
- **Keyboard Navigation**: Arrow keys, Enter, Escape, and Tab support
- **Visual States**: Focus, error, success, disabled, and readOnly states
- **Controlled Components**: Full support for controlled state with onChange handlers
- **Accessibility**: ARIA attributes, screen reader support, and keyboard navigation
- **Performance**: Optimized rendering and event handling for large datasets
- **Design System Integration**: Consistent styling with all design system variables

## 🎨 Color Accessibility

- All color combinations meet WCAG AA standards
- High contrast mode is supported via `@media (prefers-contrast: high)`
- Reduced motion is respected via `@media (prefers-reduced-motion: reduce)`

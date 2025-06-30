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
- `--shadow-primary-focus`: Focus ring shadow

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

## 📱 Breakpoints

```css
--breakpoint-sm: 640px   /* Small devices */
--breakpoint-md: 768px   /* Medium devices */
--breakpoint-lg: 1024px  /* Large devices */
--breakpoint-xl: 1200px  /* Extra large */
```

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

### Don'ts
- ❌ Don't use arbitrary color values
- ❌ Don't use inconsistent spacing (stick to the scale)
- ❌ Don't bypass the design system for one-off styles
- ❌ Don't use hardcoded z-index values

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

## 🔧 Customization

To modify the design system:

1. Update the CSS variables in `src/index.tsx`
2. Ensure all components use the updated variables
3. Test across all breakpoints and states
4. Update this documentation

## 🎨 Color Accessibility

- All color combinations meet WCAG AA standards
- High contrast mode is supported via `@media (prefers-contrast: high)`
- Reduced motion is respected via `@media (prefers-reduced-motion: reduce)`

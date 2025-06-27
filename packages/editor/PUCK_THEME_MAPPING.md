# Puck Theme Mapping - Light to Dark Theme Conversion

## Overview
This document explains how the original Puck CSS variables (designed for light theme) have been mapped to the HA KIT design system for dark theme compatibility.

## Mapping Strategy

### Original Puck Color Scale (Light Theme)
- `--puck-color-*-01`: Darkest colors (e.g., #181818 for grey-01)
- `--puck-color-*-12`: Lightest colors (e.g., #fafafa for grey-12)

### Dark Theme Conversion Strategy
For dark theme compatibility, we **inverted** the mapping:
- Original `01` (darkest) → Design system light colors (50, 100, 200)
- Original `12` (lightest) → Design system dark colors (900, 950)

## Color Mappings

### Grey Scale (Most Important)
```css
/* Original light theme → Dark theme mapping */
--puck-color-grey-01: var(--color-gray-50);   /* #181818 → light gray */
--puck-color-grey-02: var(--color-gray-100);  /* #292929 → light gray */
--puck-color-grey-03: var(--color-gray-200);  /* #404040 → medium light */
--puck-color-grey-04: var(--color-gray-300);  /* #5a5a5a → medium light */
--puck-color-grey-05: var(--color-gray-400);  /* #767676 → medium */
--puck-color-grey-06: var(--color-gray-500);  /* #949494 → medium */
--puck-color-grey-07: var(--color-gray-600);  /* #ababab → medium dark */
--puck-color-grey-08: var(--color-gray-700);  /* #c3c3c3 → dark */
--puck-color-grey-09: var(--color-gray-800);  /* #dcdcdc → darker */
--puck-color-grey-10: var(--color-gray-900);  /* #efefef → very dark */
--puck-color-grey-11: var(--color-gray-950);  /* #f5f5f5 → darkest */
--puck-color-grey-12: var(--color-gray-950);  /* #fafafa → darkest */
```

### Brand Colors
- **Rose palette** → Primary colors (blues)
- **Azure palette** → Secondary colors (cyans)

### Status Colors
- **Green palette** → Success colors
- **Yellow palette** → Warning colors  
- **Red palette** → Error colors

### Semantic Colors
```css
--puck-color-black: var(--color-gray-950);      /* Dark theme background */
--puck-color-white: var(--color-text-primary);  /* Dark theme text */
```

## Why This Approach Works

1. **Maintains Visual Hierarchy**: Light elements in original theme become light in dark theme
2. **Preserves Contrast**: High contrast relationships are maintained
3. **Consistent with Design System**: Uses existing color tokens
4. **Future-Proof**: Easy to adjust by modifying design system variables

## Testing
- ✅ Build completes successfully
- ✅ All components maintain proper styling
- ✅ Color relationships preserved
- ✅ No hardcoded color values

## Benefits
- Puck editor now uses consistent dark theme
- All Puck components automatically inherit design system colors
- Easy maintenance through centralized color variables
- Consistent look and feel across the entire application

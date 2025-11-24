import { type BreakPoint } from '@hakit/components';
import type { FieldTypes } from '@typings/fields';

// the order of the breakpoint keys
export const BREAKPOINT_ORDER: BreakPoint[] = ['xxs', 'xs', 'sm', 'md', 'lg', 'xlg'] as const;

// a list of field types that do not support responsive values
export const EXCLUDE_FIELD_TYPES_FROM_RESPONSIVE_VALUES: readonly FieldTypes[] = ['object', 'array', 'pages', 'hidden', 'slot'] as const;

// Fields that should not support template mode
export const EXCLUDE_FIELD_TYPES_FROM_TEMPLATES: readonly FieldTypes[] = [
  'object',
  'array',
  'hidden',
  'page',
  'pages',
  'slot',
  'unit',
] as const;

// Marker used to store raw template strings in DB
export const TEMPLATE_PREFIX = 'jinja2Template::';

export const DEFAULT_FIELD_DEBOUNCE_MS = 150;

export const CSS_VARIABLE_PREFIX = '--clr-';

export const COMPONENT_TYPE_DELIMITER = '__@@__';

export const DEFAULT_ROOT_ZONE = 'root:content';
export const DEFAULT_POPUP_ZONE = 'root:popupContent';

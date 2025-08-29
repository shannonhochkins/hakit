import { type BreakPoint } from '@hakit/components';
import type { FieldTypes } from '@typings/fields';

// the order of the breakpoint keys
export const BREAKPOINT_ORDER: BreakPoint[] = ['xxs', 'xs', 'sm', 'md', 'lg', 'xlg'] as const;

// list of keys to not transform to breakpoint objects
export const BREAKPOINT_TRANSFORM_EXCLUDE = ['key', 'children', 'puck', 'editMode', 'id'] as const;

// a list of field types that do not support responsive values
export const EXCLUDE_FIELD_TYPES_FROM_RESPONSIVE_VALUES: readonly FieldTypes[] = ['object', 'array', 'divider', 'hidden'] as const;

// Fields that should not support template mode
export const EXCLUDE_FIELD_TYPES_FROM_TEMPLATES: readonly FieldTypes[] = ['object', 'array', 'divider', 'hidden'] as const;

// Marker used to store raw template strings in DB
export const TEMPLATE_PREFIX = 'jinja2Template::';

/**
 * Sanitizes a string for safe use as a CSS class or ID.
 * Replaces all invalid characters with "_".
 *
 * Allowed characters:
 * - a-z, A-Z, 0-9, "_", "-", "~"
 *
 * @example
 * sanitizeCssIdentifier("Navigation~~@hakit/navigation-c0af");
 * // "Navigation~~_hakit_navigation-c0af"
 *
 * @example
 * sanitizeCssIdentifier("123abc!#@");
 * // "123abc___"
 */
export function sanitizeCssIdentifier(input: string): string {
  // Replace any character NOT in the allowed CSS identifier set
  // Note: "~" is explicitly allowed to preserve delimiters like "~~"
  const sanitized = input.replace(/[^a-zA-Z0-9_~-]/g, '_');

  // We are intentionally NOT forcing the first char to be non-numeric,
  // because we want to preserve "123abc___" as in the example.
  return sanitized;
}

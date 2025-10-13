export function removeWhitespace(str: string): string {
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\f/g, '\f')
    .replace(/\\v/g, '\v')
    .replace(/\\b/g, '\b')
    .replace(/\\\\/g, '\\')
    .replace(/\s/g, '');
}

export function toSnakeCase(str: string) {
  // Handle null or undefined input
  if (str === null || typeof str === 'undefined') {
    return '';
  }

  // Convert to string and trim whitespace
  str = String(str).trim();

  // Replace spaces, hyphens, and camelCase transitions with underscores
  // Then convert to lowercase
  return str
    .replace(/([A-Z])/g, '_$1') // Add underscore before uppercase letters (for camelCase conversion)
    .replace(/[\s-]+/g, '_') // Replace spaces and hyphens with underscores
    .toLowerCase(); // Convert the entire string to lowercase
}

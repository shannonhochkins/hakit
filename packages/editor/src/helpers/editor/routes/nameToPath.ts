export function nameToPath(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove invalid chars
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/--+/g, '-') // Replace multiple dashes with one
    .replace(/^-+|-+$/g, ''); // Trim leading/trailing dashes
}

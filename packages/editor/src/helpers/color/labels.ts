// Shared label generation for color scales
// Produces a0..a90 distributed across count steps.
// For count=10: a0,a10,...,a90
// For count=8: matches existing surface labels a0,a10..a70 (last label scaled proportionally to 90)
// Generic logic: stepValue = Math.round((i * 90) / (count - 1))
export function makeScaleLabels(count: number): string[] {
  return Array.from({ length: count }, (_, i) => (i === 0 ? 'a0' : `a${Math.round((i * 90) / (count - 1))}`));
}

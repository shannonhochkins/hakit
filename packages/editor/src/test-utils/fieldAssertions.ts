// Helper to assert field structure (avoids type errors)
export function assertField(
  field: unknown,
  type: string
): asserts field is Record<string, unknown> & { type: string; label?: string; default?: unknown } {
  if (!field || typeof field !== 'object' || !('type' in field) || field.type !== type) {
    throw new Error(`Expected field with type "${type}"`);
  }
}

export function assertObjectField(
  field: unknown
): asserts field is Record<string, unknown> & { type: 'object'; objectFields?: Record<string, unknown> } {
  assertField(field, 'object');
}

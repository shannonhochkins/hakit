import { makeSemanticSwatches } from './semantic';
import { generateCssVariables } from './generateCssVariables';
import { describe, it, expect } from 'bun:test';

describe('makeSemanticSwatches', () => {
  it('generates no swatches when no semantic values provided', () => {
    const sem = makeSemanticSwatches({
      success: undefined,
      warning: undefined,
      danger: undefined,
      info: undefined,
    });
    expect(Object.keys(sem)).toEqual(['success', 'warning', 'danger', 'info']);
    (Object.keys(sem) as (keyof typeof sem)[]).forEach(k => {
      const isArray = Array.isArray(sem[k]);
      expect(isArray).toBe(true);
      expect(sem[k]?.length).toBe(0);
    });
  });

  it('generates 10 semantic scales with default colors', () => {
    const sem = makeSemanticSwatches({
      success: '#28a745',
      warning: '#ffc107',
      danger: '#dc3545',
      info: '#17a2b8',
    });
    expect(Object.keys(sem)).toEqual(['success', 'warning', 'danger', 'info']);
    (Object.keys(sem) as (keyof typeof sem)[]).forEach(k => {
      expect(sem[k]?.length).toBe(10);
      const labels = sem[k]?.map((s: { label: string }) => s.label);
      expect(labels).toEqual(['a0', 'a10', 'a20', 'a30', 'a40', 'a50', 'a60', 'a70', 'a80', 'a90']);
    });
  });

  it('integrates with generateCssVariables', () => {
    const sem = makeSemanticSwatches({
      success: '#28a745',
      warning: '#ffc107',
      danger: '#dc3545',
      info: '#17a2b8',
    });
    const css = generateCssVariables(
      { primary: sem.success, surface: sem.warning, semantics: { danger: sem.danger, info: sem.info } },
      { prefix: 'clr' }
    );
    // success mapped as primary
    expect(css).toContain('--clr-primary-a0:');
    expect(css).toContain('--clr-on-primary-a0:');
    // warning mapped as surface
    expect(css).toContain('--clr-surface-a0:');
    expect(css).toContain('--clr-on-surface-a0:');
    // danger/info via semantics keys
    expect(css).toContain('--clr-danger-a30:');
    expect(css).toContain('--clr-info-a20:');
  });
});

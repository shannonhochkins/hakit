import { generateSemanticSwatches } from './semantic';
import { generateCssVariables } from './generateCssVariables';
import { describe, it, expect } from 'bun:test';

describe('generateSemanticSwatches', () => {
  it('generates 4 semantic scales with default colors', () => {
    const sem = generateSemanticSwatches({});
    expect(Object.keys(sem)).toEqual(['success', 'warning', 'danger', 'info']);
    (Object.keys(sem) as (keyof typeof sem)[]).forEach(k => {
      expect(sem[k].length).toBe(4);
      const labels = sem[k].map((s: { label: string }) => s.label);
      expect(labels).toEqual(['a0', 'a10', 'a20', 'a30']);
    });
  });

  it('integrates with generateCssVariables', () => {
    const sem = generateSemanticSwatches({});
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

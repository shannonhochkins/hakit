import { describe, it, expect } from 'bun:test';
import { getClassNameFactory } from './class-name-factory';

describe('getClassNameFactory', () => {
  // Mock CSS module with known keys
  const mockStyles = {
    Sidebar: 'Sidebar_abc123',
    'Sidebar-overlay': 'Sidebar-overlay_def456',
    'Sidebar-overlay--open': 'Sidebar-overlay--open_ghi789',
    'Sidebar-container': 'Sidebar-container_jkl012',
    'Sidebar-container--open': 'Sidebar-container--open_mno345',
    'Sidebar-header': 'Sidebar-header_pqr678',
    'Sidebar-title': 'Sidebar-title_stu901',
    'Sidebar-chevronIcon': 'Sidebar-chevronIcon_vwx234',
    'Sidebar-chevronIcon--isExpanded': 'Sidebar-chevronIcon--isExpanded_yza567',
  } as const;

  const getClassName = getClassNameFactory('Sidebar', mockStyles);

  describe('Basic functionality', () => {
    it('should return root class when called with no arguments', () => {
      expect(getClassName()).toBe('Sidebar_abc123');
    });

    it('should return descendant class when called with descendant name', () => {
      expect(getClassName('overlay')).toBe('Sidebar-overlay_def456');
      expect(getClassName('container')).toBe('Sidebar-container_jkl012');
      expect(getClassName('header')).toBe('Sidebar-header_pqr678');
    });

    it('should return root class when called with root class name', () => {
      expect(getClassName('Sidebar')).toBe('Sidebar_abc123');
    });
  });

  describe('Modifiers functionality', () => {
    it('should return modifier class when called with modifier object', () => {
      expect(getClassName({ 'overlay--open': true })).toBe('Sidebar-overlay--open_ghi789');
      expect(getClassName({ 'container--open': true })).toBe('Sidebar-container--open_mno345');
      expect(getClassName({ 'chevronIcon--isExpanded': true })).toBe('Sidebar-chevronIcon--isExpanded_yza567');
    });

    it('should return root class when called with root class modifier', () => {
      expect(getClassName({ Sidebar: true })).toBe('Sidebar_abc123');
    });

    it('should return empty string when modifier is false', () => {
      expect(getClassName({ 'overlay--open': false })).toBe('');
    });

    it('should return empty string when modifier is undefined', () => {
      expect(getClassName({ 'overlay--open': undefined })).toBe('');
    });
  });

  describe('Combined functionality', () => {
    it('should combine descendant and modifier classes', () => {
      expect(getClassName('overlay', { open: true })).toBe('Sidebar-overlay_def456 Sidebar-overlay--open_ghi789');
      expect(getClassName('container', { open: true })).toBe('Sidebar-container_jkl012 Sidebar-container--open_mno345');
    });

    it('should combine descendant with root class modifier', () => {
      expect(getClassName('overlay', { Sidebar: true })).toBe('Sidebar-overlay_def456 Sidebar_abc123');
    });

    it('should handle multiple modifiers', () => {
      expect(getClassName({ 'overlay--open': true, 'container--open': true })).toBe(
        'Sidebar-overlay--open_ghi789 Sidebar-container--open_mno345'
      );
    });
  });

  describe('Extra className functionality', () => {
    it('should append extra className to descendant', () => {
      expect(getClassName('overlay', 'custom-class')).toBe('Sidebar-overlay_def456 custom-class');
    });

    it('should append extra className to modifier', () => {
      expect(getClassName({ 'overlay--open': true }, 'custom-class')).toBe('Sidebar-overlay--open_ghi789 custom-class');
    });

    it('should append extra className to combined classes', () => {
      expect(getClassName('overlay', { open: true }, 'custom-class')).toBe(
        'Sidebar-overlay_def456 Sidebar-overlay--open_ghi789 custom-class'
      );
    });
  });

  describe('Error handling', () => {
    it('should throw error for invalid descendant class', () => {
      // @ts-expect-error - invalid key
      expect(() => getClassName('invalid')).toThrow('Invalid class name key "invalid" for Sidebar');
    });

    it('should throw error for invalid modifier class', () => {
      expect(() => getClassName({ 'invalid--modifier': true })).toThrow('Invalid class name key "invalid--modifier" for Sidebar');
    });

    it('should throw error for invalid standalone key', () => {
      expect(() => getClassName({ open: true })).toThrow('Invalid class name key "open" for Sidebar');
    });

    it('should throw error for invalid key in combined call', () => {
      expect(() => getClassName('overlay', { 'invalid--modifier': true })).toThrow(
        'Invalid class name key "invalid--modifier" for Sidebar'
      );
    });

    it('should include available keys in error message', () => {
      try {
        // @ts-expect-error - invalid key
        getClassName('invalid');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        expect(errorMessage).toContain('Available keys:');
        expect(errorMessage).toContain('Sidebar');
        expect(errorMessage).toContain('Sidebar-overlay');
        expect(errorMessage).toContain('Sidebar-overlay--open');
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle empty modifier object', () => {
      expect(getClassName({})).toBe('');
    });

    it('should handle undefined modifier object', () => {
      expect(getClassName(undefined)).toBe('Sidebar_abc123');
    });

    it('should handle mixed valid and invalid modifiers', () => {
      expect(() => getClassName({ 'overlay--open': true, invalid: true })).toThrow('Invalid class name key "invalid" for Sidebar');
    });

    it('should handle descendant with empty modifier object', () => {
      expect(getClassName('overlay', {})).toBe('Sidebar-overlay_def456');
    });
  });

  describe('TypeScript type constraints', () => {
    it('should only allow valid descendant names as first argument', () => {
      // These should work (no TypeScript errors)
      getClassName('overlay');
      getClassName('container');
      getClassName('header');
      getClassName('Sidebar');

      // These should cause TypeScript errors (but we can't test that in runtime)
      // getClassName('invalid');
      // getClassName('open');
    });

    it('should only allow valid modifier keys in modifier object', () => {
      // These should work (no TypeScript errors)
      getClassName({ 'overlay--open': true });
      getClassName({ 'container--open': true });
      getClassName({ 'chevronIcon--isExpanded': true });
      getClassName({ Sidebar: true });
      getClassName({ overlay: true });
      getClassName({ container: true });

      // These should cause TypeScript errors (but we can't test that in runtime)
      // getClassName({ 'open': true });
      // getClassName({ 'invalid': true });
      // getClassName({ 'invalid--modifier': true });
    });
  });
});

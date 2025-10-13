import type { Unit, UnitFieldValue, UnitFieldValueSingle, UnitFieldValueAllCorners } from '@typings/fields';
import { units } from '@typings/fields';
const DEFAULT_UNIT = 'px';

/**
 * Parses a unit value string and returns the numeric value and unit
 * @param value - The unit value string (e.g., "10px", "1.5em", "auto")
 * @returns Object with value and unit, or null if parsing fails
 */
function parseUnitValue(value: string): { value: number; unit: Unit } | null {
  // Create dynamic regex pattern from units array
  const unitPattern = units.filter(unit => unit !== 'auto').join('|');
  const unitRegex = new RegExp(`^(-?\\d+(?:\\.\\d+)?)(${unitPattern})$`);
  if (!value || typeof value !== 'string') {
    return null;
  }

  // Handle 'auto' unit specially
  if (value === 'auto') {
    return { value: 0, unit: 'auto' };
  }

  // Match pattern: number followed by unit (using dynamic regex)
  const match = value.match(unitRegex);

  if (!match) {
    return null;
  }

  const numericValue = parseFloat(match[1]);
  const unit = match[2] as Unit;

  // Check if the numeric value is valid
  if (isNaN(numericValue)) {
    return null;
  }

  return { value: numericValue, unit };
}

/**
 * Computes the internal representation of a UnitFieldValue
 * @param value - The unit field value (string format)
 * @returns Object representation or null if parsing fails
 */
export function getComputedValue(value?: UnitFieldValue):
  | { value: number; unit: Unit }
  | {
      top: { value: number; unit: Unit };
      left: { value: number; unit: Unit };
      right: { value: number; unit: Unit };
      bottom: { value: number; unit: Unit };
    }
  | null {
  if (!value || typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  // Check if it's a single value (no spaces)
  if (!trimmedValue.includes(' ')) {
    const parsed = parseUnitValue(trimmedValue);
    return parsed;
  }

  // Check if it's all corners (4 space-separated values)
  const parts = trimmedValue.split(/\s+/);

  if (parts.length !== 4) {
    return null;
  }

  const [topStr, leftStr, rightStr, bottomStr] = parts;

  const top = parseUnitValue(topStr);
  const left = parseUnitValue(leftStr);
  const right = parseUnitValue(rightStr);
  const bottom = parseUnitValue(bottomStr);

  // All parts must parse successfully
  if (!top || !left || !right || !bottom) {
    return null;
  }

  return { top, left, right, bottom };
}

/**
 * Creates a UnitFieldValueSingle from a value and unit
 * @param value - The numeric value
 * @param unit - The unit
 * @returns Formatted string value
 */
export function createSingleValue(value: number, unit: Unit = DEFAULT_UNIT): UnitFieldValueSingle {
  return `${value}${unit}` as UnitFieldValueSingle;
}

/**
 * Creates a UnitFieldValueAllCorners from corner values
 * @param top - Top corner value and unit
 * @param left - Left corner value and unit
 * @param right - Right corner value and unit
 * @param bottom - Bottom corner value and unit
 * @returns Formatted string value
 */
export function createAllCornersValue(
  top: { value: number; unit: Unit },
  left: { value: number; unit: Unit },
  right: { value: number; unit: Unit },
  bottom: { value: number; unit: Unit }
): UnitFieldValueAllCorners {
  return `${top.value}${top.unit} ${left.value}${left.unit} ${right.value}${right.unit} ${bottom.value}${bottom.unit}` as UnitFieldValueAllCorners;
}

/**
 * Updates corners in an all-corners value
 * @param currentValue - Current all-corners value object
 * @param updates - Partial updates for corners
 * @returns Updated all-corners string value
 */
export function updateCornerValue(
  currentValue: {
    top: { value: number; unit: Unit };
    left: { value: number; unit: Unit };
    right: { value: number; unit: Unit };
    bottom: { value: number; unit: Unit };
  },
  updates: Partial<{
    top: { value: number; unit: Unit };
    left: { value: number; unit: Unit };
    right: { value: number; unit: Unit };
    bottom: { value: number; unit: Unit };
  }>
): UnitFieldValueAllCorners {
  const updatedValue = { ...currentValue, ...updates };
  return createAllCornersValue(updatedValue.top, updatedValue.left, updatedValue.right, updatedValue.bottom);
}

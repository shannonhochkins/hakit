/**
 * Format a date to a standard readable format (e.g., "June 21, 2025")
 * @param dateString - The date string to format
 * @param withHours - Whether to include hours and minutes
 * @returns A formatted date string
 */
export function toReadableDate(dateString: string, withHours: boolean = false): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  };
  if (withHours) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  return date.toLocaleString('en-US', options);
}

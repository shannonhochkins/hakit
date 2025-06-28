
// convert this date structure 2025-06-21T13:23:16.822Z to a readable format like "June 21, 2025"
export function toReadableDate(dateString: string, withHours: boolean = false): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    // Use long month format
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }
  if (withHours) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  return date.toLocaleString('en-US', options);
}
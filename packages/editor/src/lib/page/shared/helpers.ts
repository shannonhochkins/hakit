
// conver this date structure 2025-06-21T13:23:16.822Z to a readable format like "June 21, 2025, 1:23 PM"
export function toReadableDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    // Use long month format
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric', 
  }
  return date.toLocaleString('en-US', options);
}
export type Unit = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';

type Thresholds = Record<'second' | 'minute' | 'hour' | 'day' | 'week' | 'month', number>;

const DEFAULT_THRESHOLDS: Thresholds = {
  second: 45, // seconds to minute
  minute: 45, // minutes to hour
  hour: 22, // hour to day
  day: 5, // day to week
  week: 4, // week to months
  month: 11, // month to years
};

const MS_PER_SECOND = 1000;
const SECS_PER_MIN = 60;
const SECS_PER_HOUR = SECS_PER_MIN * 60;

const relativeTimeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

function differenceInDays(from: Date, to: Date): number {
  const diffTime = from.getTime() - to.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

function differenceInWeeks(from: Date, to: Date): number {
  const diffDays = differenceInDays(from, to);
  return Math.floor(diffDays / 7);
}

function startOfWeek(date: Date, options: { weekStartsOn: number } = { weekStartsOn: 0 }): Date {
  const { weekStartsOn } = options;
  const day = date.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  const result = new Date(date);
  result.setDate(date.getDate() - diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function selectUnit(
  from: Date | number,
  to: Date | number = Date.now(),
  thresholds: Partial<Thresholds> = {}
): { value: number; unit: Unit } {
  const resolvedThresholds: Thresholds = {
    ...DEFAULT_THRESHOLDS,
    ...thresholds,
  };

  const secs = (+from - +to) / MS_PER_SECOND;
  if (Math.abs(secs) < resolvedThresholds.second) {
    return {
      value: Math.round(secs),
      unit: 'second',
    };
  }

  const mins = secs / SECS_PER_MIN;
  if (Math.abs(mins) < resolvedThresholds.minute) {
    return {
      value: Math.round(mins),
      unit: 'minute',
    };
  }

  const hours = secs / SECS_PER_HOUR;
  if (Math.abs(hours) < resolvedThresholds.hour) {
    return {
      value: Math.round(hours),
      unit: 'hour',
    };
  }

  const fromDate = new Date(from);
  const toDate = new Date(to);

  // Set time component to zero, which allows us to compare only the days
  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(0, 0, 0, 0);

  const days = differenceInDays(fromDate, toDate);
  if (days === 0) {
    return {
      value: Math.round(hours),
      unit: 'hour',
    };
  }
  if (Math.abs(days) < resolvedThresholds.day) {
    return {
      value: days,
      unit: 'day',
    };
  }

  const fromWeek = startOfWeek(fromDate, { weekStartsOn: 0 });
  const toWeek = startOfWeek(toDate, { weekStartsOn: 0 });

  const weeks = differenceInWeeks(fromWeek, toWeek);
  if (weeks === 0) {
    return {
      value: days,
      unit: 'day',
    };
  }
  if (Math.abs(weeks) < resolvedThresholds.week) {
    return {
      value: weeks,
      unit: 'week',
    };
  }

  const years = fromDate.getFullYear() - toDate.getFullYear();
  const months = years * 12 + fromDate.getMonth() - toDate.getMonth();
  if (months === 0) {
    return {
      value: weeks,
      unit: 'week',
    };
  }
  if (Math.abs(months) < resolvedThresholds.month || years === 0) {
    return {
      value: months,
      unit: 'month',
    };
  }

  return {
    value: Math.round(years),
    unit: 'year',
  };
}

/**
 * Format a date to a human-readable relative time string using native Intl.RelativeTimeFormat
 * Examples: "2 days ago", "just now", "in 3 hours"
 * @param dateString - The date string to format
 * @returns A human-readable relative time string
 */
export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return 'Unknown';

  const date = new Date(dateString);

  // Handle invalid dates
  if (isNaN(date.getTime())) return 'Unknown';

  const diff = selectUnit(date);
  return relativeTimeFormatter.format(diff.value, diff.unit);
}

/**
 * Format a date to a standard readable format (e.g., "June 21, 2025")
 * @param dateString - The date string to format
 * @param withHours - Whether to include hours and minutes
 * @returns A formatted date string
 * @deprecated Use formatRelativeTime instead for better user experience
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

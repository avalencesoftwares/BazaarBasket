// packages/shared/src/utils/date.ts
// Date formatting utilities with IST (Asia/Kolkata) timezone support

const IST_TIMEZONE = 'Asia/Kolkata';

const DATE_FORMATTER = new Intl.DateTimeFormat('en-IN', {
  timeZone: IST_TIMEZONE,
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('en-IN', {
  timeZone: IST_TIMEZONE,
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

const TIME_FORMATTER = new Intl.DateTimeFormat('en-IN', {
  timeZone: IST_TIMEZONE,
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

const RELATIVE_TIME_FORMATTER =
  typeof Intl !== 'undefined' && 'RelativeTimeFormat' in Intl
    ? new Intl.RelativeTimeFormat('en-IN', {
        numeric: 'auto',
      })
    : null;

/**
 * Format a date in IST: "19 Jun 2026"
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) {
    return '';
  }
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) {
    return '';
  }
  return DATE_FORMATTER.format(d);
}

/**
 * Format a date with time in IST: "19 Jun 2026, 02:30 pm"
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) {
    return '';
  }
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) {
    return '';
  }
  return DATE_TIME_FORMATTER.format(d);
}

/**
 * Format time only in IST: "02:30 pm"
 */
export function formatTime(date: Date | string | null | undefined): string {
  if (!date) {
    return '';
  }
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) {
    return '';
  }
  return TIME_FORMATTER.format(d);
}

/**
 * Get a relative time string: "2 hours ago", "yesterday", "in 3 days"
 */
export function getRelativeTime(date: Date | string | null | undefined): string {
  if (!date) {
    return '';
  }
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) {
    return '';
  }

  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);

  if (RELATIVE_TIME_FORMATTER) {
    if (Math.abs(diffSeconds) < 60) {
      return RELATIVE_TIME_FORMATTER.format(diffSeconds, 'second');
    }
    if (Math.abs(diffMinutes) < 60) {
      return RELATIVE_TIME_FORMATTER.format(diffMinutes, 'minute');
    }
    if (Math.abs(diffHours) < 24) {
      return RELATIVE_TIME_FORMATTER.format(diffHours, 'hour');
    }
    return RELATIVE_TIME_FORMATTER.format(diffDays, 'day');
  }

  // Fallback formatting when Intl.RelativeTimeFormat is not supported (e.g. Hermes)
  const isFuture = diffSeconds > 0;
  const absSeconds = Math.abs(diffSeconds);
  const absMinutes = Math.abs(diffMinutes);
  const absHours = Math.abs(diffHours);
  const absDays = Math.abs(diffDays);

  if (absSeconds < 60) {
    return isFuture ? `in ${absSeconds} seconds` : `${absSeconds} seconds ago`;
  }
  if (absMinutes < 60) {
    return isFuture ? `in ${absMinutes} minutes` : `${absMinutes} minutes ago`;
  }
  if (absHours < 24) {
    return isFuture ? `in ${absHours} hours` : `${absHours} hours ago`;
  }
  if (absDays === 1) {
    return isFuture ? 'tomorrow' : 'yesterday';
  }
  return isFuture ? `in ${absDays} days` : `${absDays} days ago`;
}

/**
 * Convert a Date to IST-formatted ISO string for Firestore.
 */
export function toISTString(date: Date): string {
  return date.toLocaleString('en-IN', { timeZone: IST_TIMEZONE });
}

/**
 * Get today's date as YYYY-MM-DD string in IST.
 */
export function getTodayIST(): string {
  const now = new Date();
  const istDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  return istDate;
}

/**
 * Generate an array of dates for the next N days (for delivery slot picker).
 */
export function getNextNDays(n: number): Array<{ date: string; label: string; dayName: string }> {
  const days: Array<{ date: string; label: string; dayName: string }> = [];
  const dayFormatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    weekday: 'short',
  });
  const labelFormatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    month: 'short',
    day: 'numeric',
  });
  const dateFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      date: dateFormatter.format(d),
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : labelFormatter.format(d),
      dayName: dayFormatter.format(d),
    });
  }

  return days;
}

// packages/shared/src/utils/date.test.ts
// Unit tests for date formatting utilities

import { formatDate, formatDateTime, formatTime, getRelativeTime, getNextNDays } from './date';

describe('formatDate', () => {
  it('should format a valid date', () => {
    const date = new Date('2026-06-19T10:00:00Z');
    const result = formatDate(date);
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(0);
  });

  it('should return empty string for null', () => {
    expect(formatDate(null)).toBe('');
  });

  it('should return empty string for undefined', () => {
    expect(formatDate(undefined)).toBe('');
  });

  it('should handle date string input', () => {
    const result = formatDate('2026-06-19T10:00:00Z');
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(0);
  });

  it('should return empty string for invalid date string', () => {
    expect(formatDate('not-a-date')).toBe('');
  });
});

describe('formatDateTime', () => {
  it('should format a valid date with time', () => {
    const date = new Date('2026-06-19T10:00:00Z');
    const result = formatDateTime(date);
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(0);
  });

  it('should return empty string for null', () => {
    expect(formatDateTime(null)).toBe('');
  });

  it('should return empty string for undefined', () => {
    expect(formatDateTime(undefined)).toBe('');
  });
});

describe('formatTime', () => {
  it('should format time from a valid date', () => {
    const date = new Date('2026-06-19T10:30:00Z');
    const result = formatTime(date);
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(0);
  });

  it('should return empty string for null', () => {
    expect(formatTime(null)).toBe('');
  });

  it('should return empty string for undefined', () => {
    expect(formatTime(undefined)).toBe('');
  });
});

describe('getRelativeTime', () => {
  it('should return a non-empty string for a valid date', () => {
    const now = new Date();
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const result = getRelativeTime(fiveMinAgo);
    expect(result).toBeTruthy();
  });

  it('should return empty string for null', () => {
    expect(getRelativeTime(null)).toBe('');
  });

  it('should return empty string for undefined', () => {
    expect(getRelativeTime(undefined)).toBe('');
  });

  it('should return empty string for invalid date', () => {
    expect(getRelativeTime('invalid')).toBe('');
  });
});

describe('getNextNDays', () => {
  it('should return correct number of days', () => {
    const days = getNextNDays(7);
    expect(days).toHaveLength(7);
  });

  it('should label first day as Today', () => {
    const days = getNextNDays(3);
    expect(days[0].label).toBe('Today');
  });

  it('should label second day as Tomorrow', () => {
    const days = getNextNDays(3);
    expect(days[1].label).toBe('Tomorrow');
  });

  it('should have date strings in YYYY-MM-DD format', () => {
    const days = getNextNDays(3);
    for (const day of days) {
      expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('should return empty array for 0 days', () => {
    const days = getNextNDays(0);
    expect(days).toHaveLength(0);
  });

  it('should have dayName property for each day', () => {
    const days = getNextNDays(3);
    for (const day of days) {
      expect(day.dayName).toBeTruthy();
    }
  });
});

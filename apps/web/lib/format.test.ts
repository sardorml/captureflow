import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  formatBytes,
  formatDuration,
  formatRelativeLong,
  formatRelativeShort,
  formatTimestamp,
  initials,
} from './format';

describe('formatBytes', () => {
  it('handles zero / negative / non-finite', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(-5)).toBe('0 B');
    expect(formatBytes(NaN)).toBe('0 B');
  });
  it('formats across units with adaptive precision', () => {
    expect(formatBytes(500)).toBe('500 B');
    expect(formatBytes(1024)).toBe('1.0 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(10 * 1024)).toBe('10 KB');
    expect(formatBytes(1024 * 1024)).toBe('1.0 MB');
    expect(formatBytes(5 * 1024 * 1024 * 1024)).toBe('5.0 GB');
  });
});

describe('formatDuration', () => {
  it('formats m:ss', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(65000)).toBe('1:05');
    expect(formatDuration(600000)).toBe('10:00');
  });
});

describe('formatTimestamp', () => {
  it('formats m:ss under an hour', () => {
    expect(formatTimestamp(0)).toBe('0:00');
    expect(formatTimestamp(65000)).toBe('1:05');
  });
  it('formats h:mm:ss past an hour (the regression fix)', () => {
    expect(formatTimestamp(3661000)).toBe('1:01:01');
    expect(formatTimestamp(4530000)).toBe('1:15:30');
  });
  it('clamps negatives to zero', () => {
    expect(formatTimestamp(-1000)).toBe('0:00');
  });
});

describe('relative time', () => {
  const NOW = 1_700_000_000_000;
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => vi.useRealTimers());

  const ago = (ms: number) => NOW - ms;
  const S = 1000;
  const MIN = 60 * S;
  const HR = 60 * MIN;
  const DAY = 24 * HR;

  it('formatRelativeShort', () => {
    expect(formatRelativeShort(NOW + 5 * S)).toBe('just now');
    expect(formatRelativeShort(ago(10 * S))).toBe('just now');
    expect(formatRelativeShort(ago(90 * S))).toBe('1m ago');
    expect(formatRelativeShort(ago(2 * HR))).toBe('2h ago');
    expect(formatRelativeShort(ago(3 * DAY))).toBe('3d ago');
    expect(formatRelativeShort(ago(40 * DAY))).toBe('1mo ago');
    expect(formatRelativeShort(ago(400 * DAY))).toBe('1y ago');
  });

  it('formatRelativeLong', () => {
    expect(formatRelativeLong(ago(90 * S))).toBe('1 minute ago');
    expect(formatRelativeLong(ago(5 * MIN))).toBe('5 minutes ago');
    expect(formatRelativeLong(ago(1 * HR))).toBe('about 1 hour ago');
    expect(formatRelativeLong(ago(2 * HR))).toBe('about 2 hours ago');
    expect(formatRelativeLong(ago(1 * DAY))).toBe('1 day ago');
    expect(formatRelativeLong(ago(10 * DAY))).toBe('1 week ago');
    expect(formatRelativeLong(ago(40 * DAY))).toBe('1 month ago');
  });
});

describe('initials', () => {
  it('takes up to two uppercase initials', () => {
    expect(initials('Sardor Mamadaliyev')).toBe('SM');
    expect(initials('alice')).toBe('A');
    expect(initials('a b c d')).toBe('AB');
  });
  it('returns ? for empty/whitespace', () => {
    expect(initials('')).toBe('?');
    expect(initials('   ')).toBe('?');
  });
});

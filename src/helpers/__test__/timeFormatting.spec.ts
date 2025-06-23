import { formatElapsedTime } from '../timeFormatting';

describe('formatElapsedTime', () => {
  const FIXED_TIMESTAMP = 1673352000000;

  beforeEach(() => {
    jest.spyOn(global.Date, 'now').mockImplementation(() => FIXED_TIMESTAMP);

    const actualDate = global.Date;
    global.Date = class extends actualDate {
      constructor(...args: any[]) {
        super();
        if (args.length === 0) {
          return new actualDate(FIXED_TIMESTAMP);
        }
        return new actualDate(...(args as [any?]));
      }
    } as unknown as DateConstructor;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('returns formatted time for normal case', () => {
    const firstAssignedAt = '2023-01-10T11:00:00Z';
    const result = formatElapsedTime(firstAssignedAt, null, false, null, 0);
    expect(result).toBe('01h 00m 00s');
  });

  test('returns default time for invalid date', () => {
    const result = formatElapsedTime('invalid-date', null, false, null, 0);
    expect(result).toBe('00h 00m 00s');
  });

  test('handles paused task with lastPowAt', () => {
    const firstAssignedAt = '2023-01-10T10:00:00Z'; // 2 hours ago
    const lastPowAt = '2023-01-10T11:30:00Z'; // 30 minutes ago
    const result = formatElapsedTime(firstAssignedAt, lastPowAt, true, null, 0);
    expect(result).toBe('01h 30m 00s');
  });

  test('handles completed bounty', () => {
    const firstAssignedAt = '2023-01-10T10:00:00Z'; // 2 hours ago
    const lastPowAt = '2023-01-10T11:30:00Z'; // 30 minutes ago
    const closedAt = '2023-01-10T11:45:00Z'; // 15 minutes ago
    const result = formatElapsedTime(firstAssignedAt, lastPowAt, true, closedAt, 0);
    expect(result).toBe('01h 45m 00s');
  });

  test('handles active task with lastPowAt', () => {
    const firstAssignedAt = '2023-01-10T10:00:00Z'; // 2 hours ago
    const lastPowAt = '2023-01-10T11:30:00Z'; // 30 minutes ago
    const result = formatElapsedTime(firstAssignedAt, lastPowAt, false, null, 0);
    expect(result).toBe('00h 30m 00s');
  });

  test('subtracts accumulated pause seconds when paused', () => {
    const firstAssignedAt = '2023-01-10T11:00:00Z'; // 1 hour ago
    const accumulatedPauseSeconds = 1800; // 30 minutes
    const result = formatElapsedTime(firstAssignedAt, null, true, null, accumulatedPauseSeconds);
    expect(result).toBe('00h 30m 00s');
  });

  test('handles edge case with negative time difference', () => {
    const futureDate = '2023-01-10T13:00:00Z'; // 1 hour in the future
    const result = formatElapsedTime(futureDate, null, false, null, 0);
    expect(result).toBe('00h 00m 00s');
  });
});

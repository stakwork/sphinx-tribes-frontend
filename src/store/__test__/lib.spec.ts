import { waitFor } from '@testing-library/react';
import { random } from 'lodash';
import { getUserAvatarPlaceholder } from 'store/lib';

jest.mock('lodash', () => ({
  random: jest.fn()
}));

describe('getUserAvatarPlaceholder', () => {
  const storageCacheKey = 'userPlaceholdersCache';
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    localStorageMock = {};
    jest.clearAllMocks();

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => localStorageMock[key]),
        setItem: jest.fn((key: string, value: string) => {
          localStorageMock[key] = value;
        })
      }
    });

    (random as jest.Mock).mockReturnValue(1);
  });

  it('should return cached avatar for existing user', () => {
    const userId = 'user123';
    const cachedIndex = 5;
    localStorageMock[storageCacheKey] = JSON.stringify({ [userId]: cachedIndex });

    const result = getUserAvatarPlaceholder(userId);

    expect(result).toBe(`/static/avatarPlaceholders/placeholder_${cachedIndex}.jpg`);
    expect(random).not.toHaveBeenCalled();
  });

  it('should generate new avatar for new user', () => {
    const userId = 'newUser';
    const randomIndex = 7;
    (random as jest.Mock).mockReturnValue(randomIndex);

    const result = getUserAvatarPlaceholder(userId);

    expect(result).toBe(`/static/avatarPlaceholders/placeholder_${randomIndex}.jpg`);
    expect(random).toHaveBeenCalledWith(1, 39, false);
    expect(JSON.parse(localStorageMock[storageCacheKey])[userId]).toBe(randomIndex);
  });

  it('should handle empty user ID', () => {
    const result = getUserAvatarPlaceholder('');

    expect(result).toMatch(/\/static\/avatarPlaceholders\/placeholder_\d+\.jpg/);
    expect(JSON.parse(localStorageMock[storageCacheKey])['']).toBeDefined();
  });

  it('should handle maximum length user ID', () => {
    const longUserId = 'a'.repeat(1000);
    const result = getUserAvatarPlaceholder(longUserId);

    expect(result).toMatch(/\/static\/avatarPlaceholders\/placeholder_\d+\.jpg/);
    expect(JSON.parse(localStorageMock[storageCacheKey])[longUserId]).toBeDefined();
  });

  it('should handle invalid JSON in cache', () => {
    localStorageMock[storageCacheKey] = 'invalid-json';
    const userId = 'user123';
    const randomIndex = 3;
    (random as jest.Mock).mockReturnValue(randomIndex);

    waitFor(() => {
      const result = getUserAvatarPlaceholder(userId);
      expect(result).toBe(`/static/avatarPlaceholders/placeholder_${randomIndex}.jpg`);
      expect(random).toHaveBeenCalled();
    });
  });

  it('should handle non-string user ID', () => {
    const numericUserId = 123 as any;
    const result = getUserAvatarPlaceholder(numericUserId);

    expect(result).toMatch(/\/static\/avatarPlaceholders\/placeholder_\d+\.jpg/);
    expect(JSON.parse(localStorageMock[storageCacheKey])['123']).toBeDefined();
  });

  it('should handle large cache', () => {
    const largeCache = Array(1000)
      .fill(0)
      .reduce((acc: Record<string, number>, _: unknown, index: number) => {
        acc[`user${index}`] = (index % 39) + 1;
        return acc;
      }, {});
    localStorageMock[storageCacheKey] = JSON.stringify(largeCache);

    const result = getUserAvatarPlaceholder('newUser');

    expect(result).toMatch(/\/static\/avatarPlaceholders\/placeholder_\d+\.jpg/);
    const updatedCache = JSON.parse(localStorageMock[storageCacheKey]);
    expect(Object.keys(updatedCache).length).toBe(1001);
  });

  it('should respect random index boundary values', () => {
    (random as jest.Mock).mockReturnValue(1);
    let result = getUserAvatarPlaceholder('user1');
    expect(result).toBe('/static/avatarPlaceholders/placeholder_1.jpg');

    (random as jest.Mock).mockReturnValue(39);
    result = getUserAvatarPlaceholder('user2');
    expect(result).toBe('/static/avatarPlaceholders/placeholder_39.jpg');
  });

  it('should persist cache between calls', () => {
    const userId = 'user123';
    const randomIndex = 5;
    (random as jest.Mock).mockReturnValue(randomIndex);

    getUserAvatarPlaceholder(userId);
    const firstCache = JSON.parse(localStorageMock[storageCacheKey]);

    const result = getUserAvatarPlaceholder(userId);
    const secondCache = JSON.parse(localStorageMock[storageCacheKey]);

    expect(result).toBe(`/static/avatarPlaceholders/placeholder_${randomIndex}.jpg`);
    expect(firstCache).toEqual(secondCache);
    expect(random).toHaveBeenCalledTimes(1);
  });

  it('should handle cache overwrite for same user ID', () => {
    const userId = 'user123';

    (random as jest.Mock).mockReturnValue(5);
    getUserAvatarPlaceholder(userId);

    localStorageMock[storageCacheKey] = JSON.stringify({ [userId]: 10 });

    const result = getUserAvatarPlaceholder(userId);

    expect(result).toBe('/static/avatarPlaceholders/placeholder_10.jpg');
    expect(random).toHaveBeenCalledTimes(1);
  });
});

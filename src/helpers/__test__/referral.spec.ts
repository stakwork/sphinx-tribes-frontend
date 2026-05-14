import {
  REFERRED_BY_STORAGE_KEY,
  appendStoredReferredBy,
  getStoredReferredBy,
  persistReferredByFromSearch
} from '../referral';

const createStorage = (initialValues: Record<string, string> = {}) => {
  const values = { ...initialValues };

  return {
    getItem: jest.fn((key: string) => values[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      values[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete values[key];
    }),
    clear: jest.fn(() => {
      Object.keys(values).forEach((key) => delete values[key]);
    }),
    key: jest.fn((index: number) => Object.keys(values)[index] ?? null),
    get length() {
      return Object.keys(values).length;
    }
  } as unknown as Storage;
};

describe('referral helpers', () => {
  it('stores the p query value as referred_by', () => {
    const storage = createStorage();

    const referredBy = persistReferredByFromSearch('?p=abc-123', storage);

    expect(referredBy).toBe('abc-123');
    expect(storage.setItem).toHaveBeenCalledWith(REFERRED_BY_STORAGE_KEY, 'abc-123');
    expect(getStoredReferredBy(storage)).toBe('abc-123');
  });

  it('does not overwrite an existing referred_by value', () => {
    const storage = createStorage({ [REFERRED_BY_STORAGE_KEY]: 'first-referrer' });

    const referredBy = persistReferredByFromSearch('?p=second-referrer', storage);

    expect(referredBy).toBe('first-referrer');
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it('ignores invalid p query values', () => {
    const storage = createStorage();

    const referredBy = persistReferredByFromSearch('?p=<script>alert(1)</script>', storage);

    expect(referredBy).toBeNull();
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it('appends stored referred_by to new profile payloads', () => {
    const storage = createStorage({ [REFERRED_BY_STORAGE_KEY]: 'referrer-uuid' });

    expect(appendStoredReferredBy({ owner_alias: 'Ada' }, storage)).toEqual({
      owner_alias: 'Ada',
      referred_by: 'referrer-uuid'
    });
  });

  it('keeps an explicit referred_by payload value', () => {
    const storage = createStorage({ [REFERRED_BY_STORAGE_KEY]: 'stored-referrer' });

    expect(appendStoredReferredBy({ referred_by: 'explicit-referrer' }, storage)).toEqual({
      referred_by: 'explicit-referrer'
    });
  });
});

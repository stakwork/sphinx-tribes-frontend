export const REFERRED_BY_STORAGE_KEY = 'referred_by';

const REFERRAL_ID_PATTERN = /^[a-zA-Z0-9-]{1,64}$/;

const getStorage = (storage?: Storage): Storage | undefined => {
  if (storage) return storage;
  if (typeof window === 'undefined') return undefined;
  return window.localStorage;
};

export const normalizeReferralCode = (value?: string | null): string => {
  const trimmedValue = value?.trim() ?? '';
  return REFERRAL_ID_PATTERN.test(trimmedValue) ? trimmedValue : '';
};

export const getStoredReferredBy = (storage?: Storage): string | null => {
  const localStorageRef = getStorage(storage);
  if (!localStorageRef) return null;

  return normalizeReferralCode(localStorageRef.getItem(REFERRED_BY_STORAGE_KEY)) || null;
};

export const persistReferredByFromSearch = (
  search: string,
  storage?: Storage
): string | null => {
  const localStorageRef = getStorage(storage);
  if (!localStorageRef || localStorageRef.getItem(REFERRED_BY_STORAGE_KEY)) {
    return getStoredReferredBy(localStorageRef);
  }

  const searchParams = new URLSearchParams(search);
  const referredBy = normalizeReferralCode(searchParams.get('p'));

  if (!referredBy) return null;

  localStorageRef.setItem(REFERRED_BY_STORAGE_KEY, referredBy);
  return referredBy;
};

export const appendStoredReferredBy = <T extends Record<string, any>>(
  body: T,
  storage?: Storage
): T & { referred_by?: string } => {
  const referredBy = getStoredReferredBy(storage);

  if (!referredBy || body.referred_by) {
    return body;
  }

  return {
    ...body,
    referred_by: referredBy
  };
};

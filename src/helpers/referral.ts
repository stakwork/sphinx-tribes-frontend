export const REFERRED_BY_KEY = 'referred_by';
export const REFERRAL_PARAM = 'p';

export function persistReferralQuery(search: string): string | null {
  const params = new URLSearchParams(search);
  const referredBy = params.get(REFERRAL_PARAM);

  if (!referredBy) return null;

  localStorage.setItem(REFERRED_BY_KEY, referredBy);
  return referredBy;
}

export function buildReferralUrl(pathOrUrl: string, referrerUuid?: string): string {
  const url = new URL(pathOrUrl, window.location.origin);

  if (referrerUuid) {
    url.searchParams.set(REFERRAL_PARAM, referrerUuid);
  }

  return url.toString();
}

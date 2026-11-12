import { buildReferralUrl, persistReferralQuery, REFERRED_BY_KEY } from '../referral';

describe('referral helpers', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.pushState({}, '', '/bounties');
  });

  it('stores referral query values locally', () => {
    expect(persistReferralQuery('?p=referrer-uuid&tab=bounties')).toBe('referrer-uuid');
    expect(localStorage.getItem(REFERRED_BY_KEY)).toBe('referrer-uuid');
  });

  it('does not overwrite the stored referral when the query is missing', () => {
    localStorage.setItem(REFERRED_BY_KEY, 'existing-referrer');

    expect(persistReferralQuery('?tab=bounties')).toBeNull();
    expect(localStorage.getItem(REFERRED_BY_KEY)).toBe('existing-referrer');
  });

  it('adds the signed-in user uuid to copied bounty links', () => {
    expect(buildReferralUrl('/bounty/12', 'my-user-uuid')).toBe(
      'http://localhost/bounty/12?p=my-user-uuid'
    );
  });

  it('preserves existing query params when adding referral data', () => {
    expect(buildReferralUrl('/bounty/12?foo=bar', 'my-user-uuid')).toBe(
      'http://localhost/bounty/12?foo=bar&p=my-user-uuid'
    );
  });
});

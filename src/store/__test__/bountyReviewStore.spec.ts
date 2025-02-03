import { BountyReviewStore } from '../bountyReviewStore';

describe('BountyReviewStore', () => {
  let store: BountyReviewStore;

  beforeEach(() => {
    store = new BountyReviewStore();
  });

  describe('setLoading', () => {
    it('should default to false', () => {
      expect(store.loading).toEqual(false);
    });

    it('should be true after setting to true', () => {
      store.setLoading(true);
      expect(store.loading).toEqual(true);
    });

    it('should be true when already true and set to true again', () => {
      store.setLoading(true);
      store.setLoading(true);
      expect(store.loading).toEqual(true);
    });

    it('should be false when true then set to false', () => {
      store.setLoading(true);
      store.setLoading(false);
      expect(store.loading).toEqual(false);
    });

    it('should be false when already false and set to false again', () => {
      store.setLoading(false);
      store.setLoading(false);
      expect(store.loading).toEqual(false);
    });

    it('should be false after rapid state change', () => {
      for (let i = 0; i < 1000; i++) {
        store.setLoading(i % 2 == 0);
      }
    });
  });
});

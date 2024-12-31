import sinon from 'sinon';
import { BountyStore } from '../bountyStore';

describe('BountyStore', () => {
  let store: BountyStore;
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    localStorageMock = {};

    global.localStorage = {
      getItem: (key: string) => localStorageMock[key] || null,
      setItem: (key: string, value: string) => {
        localStorageMock[key] = value;
      },
      removeItem: (key: string) => {
        delete localStorageMock[key];
      },
      clear: () => {
        localStorageMock = {};
      },
      length: 0,
      key: () => null
    };

    store = new BountyStore();
  });

  describe('constructor', () => {
    it('should initialize with empty featured bounties', () => {
      expect(store.featuredBounties).toEqual([]);
      expect(store.maxFeaturedBounties).toBe(3);
    });

    it('should load existing bounties from storage', () => {
      const savedBounties = [
        { bountyId: '123', url: 'https://example.com/bounty/123', addedAt: Date.now() }
      ];
      localStorage.setItem('featuredBounties', JSON.stringify(savedBounties));

      store = new BountyStore();
      expect(store.getFeaturedBounties()).toEqual(savedBounties);
    });

    it('should migrate old storage format', async () => {
      const oldBounty = { bountyId: '123', url: 'https://example.com/bounty/123' };
      localStorage.setItem('featuredBounty', JSON.stringify(oldBounty));

      store = new BountyStore();

      expect(store.getFeaturedBounties().length).toBe(1);
      expect(store.getFeaturedBounties()[0].bountyId).toBe('123');

      const newStorage = localStorage.getItem('featuredBounties');
      expect(newStorage).toBeTruthy();
      if (newStorage) {
        const parsedBounties = JSON.parse(newStorage);
        expect(parsedBounties.length).toBe(1);
        expect(parsedBounties[0].bountyId).toBe('123');
      }
    });
  });

  describe('getBountyIdFromURL', () => {
    it('should extract bounty ID from valid URL', () => {
      const url = 'https://example.com/bounty/123';
      expect(store.getBountyIdFromURL(url)).toBe('123');
    });

    it('should return null for invalid URL', () => {
      const url = 'https://example.com/invalid';
      expect(store.getBountyIdFromURL(url)).toBeNull();
    });
  });

  describe('addFeaturedBounty', () => {
    it('should add new bounty', () => {
      store.addFeaturedBounty('https://example.com/bounty/123', 'Test Bounty');
      expect(store.getFeaturedBounties().length).toBe(1);
      expect(store.hasBounty('123')).toBe(true);
    });

    it('should not add duplicate bounty', () => {
      store.addFeaturedBounty('https://example.com/bounty/123', 'Test Bounty');
      store.addFeaturedBounty('https://example.com/bounty/123', 'Test Bounty Again');
      expect(store.getFeaturedBounties().length).toBe(1);
    });

    it('should respect maximum limit', () => {
      store.addFeaturedBounty('https://example.com/bounty/123', 'Test 1');
      store.addFeaturedBounty('https://example.com/bounty/124', 'Test 2');
      store.addFeaturedBounty('https://example.com/bounty/125', 'Test 3');
      store.addFeaturedBounty('https://example.com/bounty/126', 'Test 4');

      expect(store.getFeaturedBounties().length).toBe(3);
      expect(store.hasBounty('126')).toBe(true);
      expect(store.hasBounty('123')).toBe(false);
    });
  });

  describe('removeFeaturedBounty', () => {
    beforeEach(() => {
      localStorage.clear();
      store = new BountyStore();
      store.addFeaturedBounty('https://example.com/bounty/123', 'Test Bounty');
    });

    it('should remove existing bounty', () => {
      store.removeFeaturedBounty('123');
      expect(store.getFeaturedBounties().length).toBe(0);
      expect(store.hasBounty('123')).toBe(false);
    });

    it('should handle removing non-existent bounty', () => {
      store.removeFeaturedBounty('999');
      expect(store.getFeaturedBounties().length).toBe(1);
    });
  });

  describe('clearFeaturedBounties', () => {
    beforeEach(() => {
      store.addFeaturedBounty('https://example.com/bounty/123', 'Test 1');
      store.addFeaturedBounty('https://example.com/bounty/124', 'Test 2');
    });

    it('should remove all bounties', () => {
      store.clearFeaturedBounties();
      expect(store.getFeaturedBounties().length).toBe(0);
    });
  });

  describe('storage operations', () => {
    it('should persist bounties to localStorage', () => {
      store.addFeaturedBounty('https://example.com/bounty/123', 'Test Bounty');

      const saved = localStorage.getItem('featuredBounties');
      expect(saved).toBeTruthy();

      if (saved) {
        const parsedBounties = JSON.parse(saved);
        expect(parsedBounties.length).toBe(1);
        expect(parsedBounties[0].bountyId).toBe('123');
      }
    });

    it('should handle storage errors gracefully', () => {
      const setItemStub = sinon.stub(localStorage, 'setItem').throws(new Error('Storage error'));

      expect(() => {
        store.addFeaturedBounty('https://example.com/bounty/123', 'Test Bounty');
      }).not.toThrow();

      setItemStub.restore();
    });
  });
});

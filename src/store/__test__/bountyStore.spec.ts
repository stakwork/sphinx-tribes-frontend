import sinon from 'sinon';
import { BountyStore } from '../bountyStore';
import { mainStore } from '../main';

describe('BountyStore', () => {
  let store: BountyStore;
  let fetchFeaturedBountiesStub: sinon.SinonStub;
  let addFeaturedBountyStub: sinon.SinonStub;
  let deleteFeaturedBountyStub: sinon.SinonStub;

  beforeEach(() => {
    store = new BountyStore();

    fetchFeaturedBountiesStub = sinon.stub(mainStore, 'fetchFeaturedBounties');
    addFeaturedBountyStub = sinon.stub(mainStore, 'addFeaturedBounty');
    deleteFeaturedBountyStub = sinon.stub(mainStore, 'deleteFeaturedBounty');
  });

  afterEach(() => {
    fetchFeaturedBountiesStub.restore();
    addFeaturedBountyStub.restore();
    deleteFeaturedBountyStub.restore();
  });

  describe('constructor', () => {
    it('should initialize with empty featured bounties', () => {
      expect(store.featuredBounties).toEqual([]);
      expect(store.maxFeaturedBounties).toBe(3);
    });
  });

  describe('loadFeaturedBounties', () => {
    it('should load featured bounties successfully', async () => {
      const fakeBounties = [
        { bountyId: '123', url: 'https://example.com/bounty/123', addedAt: Date.now() }
      ];
      fetchFeaturedBountiesStub.resolves(fakeBounties);

      await store.loadFeaturedBounties();
      expect(store.featuredBounties).toEqual(fakeBounties);
    });

    it('should handle error during loading', async () => {
      fetchFeaturedBountiesStub.rejects(new Error('Error loading bounties'));

      await store.loadFeaturedBounties();
      expect(store.featuredBounties).toEqual([]);
    });
  });

  describe('addFeaturedBounty', () => {
    it('should add new bounty', async () => {
      const bounty = {
        bountyId: '123',
        url: 'https://example.com/bounty/123',
        title: 'Test Bounty'
      };
      addFeaturedBountyStub.resolves(true);
      fetchFeaturedBountiesStub.resolves([{ ...bounty, addedAt: Date.now() }]);

      const result = await store.addFeaturedBounty(bounty);
      expect(result).toBe(true);
      expect(store.featuredBounties.length).toBe(1);
    });

    it('should not add duplicate bounty', async () => {
      const bounty = {
        bountyId: '123',
        url: 'https://example.com/bounty/123',
        title: 'Test Bounty'
      };
      addFeaturedBountyStub.resolves(true);
      fetchFeaturedBountiesStub.resolves([{ ...bounty, addedAt: Date.now() }]);

      await store.addFeaturedBounty(bounty);
      await store.addFeaturedBounty(bounty);
      expect(store.featuredBounties.length).toBe(1);
    });

    it('should handle error during add', async () => {
      const bounty = {
        bountyId: '123',
        url: 'https://example.com/bounty/123',
        title: 'Test Bounty'
      };
      addFeaturedBountyStub.rejects(new Error('Error adding bounty'));

      const result = await store.addFeaturedBounty(bounty);
      expect(result).toBe(false);
    });
  });

  describe('removeFeaturedBounty', () => {
    it('should remove existing bounty', async () => {
      const bounty = {
        bountyId: '123',
        url: 'https://example.com/bounty/123',
        addedAt: Date.now()
      };
      store.featuredBounties = [bounty];
      deleteFeaturedBountyStub.resolves(true);
      fetchFeaturedBountiesStub.resolves([]);

      const result = await store.removeFeaturedBounty('123');
      expect(result).toBe(true);
      expect(store.featuredBounties.length).toBe(0);
    });

    it('should handle error during remove', async () => {
      deleteFeaturedBountyStub.rejects(new Error('Error removing bounty'));

      const result = await store.removeFeaturedBounty('123');
      expect(result).toBe(false); // It should fail silently
    });
  });

  describe('clearFeaturedBounties', () => {
    it('should remove all bounties', async () => {
      const bounty1 = {
        bountyId: '123',
        url: 'https://example.com/bounty/123',
        addedAt: Date.now()
      };
      const bounty2 = {
        bountyId: '124',
        url: 'https://example.com/bounty/124',
        addedAt: Date.now()
      };
      store.featuredBounties = [bounty1, bounty2];

      deleteFeaturedBountyStub.resolves(true);
      fetchFeaturedBountiesStub.resolves([]);

      await store.clearFeaturedBounties();
      expect(store.featuredBounties.length).toBe(0);
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
});

import sinon from 'sinon';
import { waitFor } from '@testing-library/react';
import { uiStore } from 'store/ui';
import { user } from '__test__/__mockData__/user';
import { BountyCardStore } from '../bountyCard';

describe('BountyCardStore', () => {
  let store: BountyCardStore;
  let fetchStub: sinon.SinonStub;
  const mockWorkspaceId = 'test-workspace-123';

  beforeAll(() => {
    uiStore.setMeInfo(user);
  });

  beforeEach(() => {
    fetchStub = sinon.stub(global, 'fetch');
  });

  afterEach(() => {
    sinon.restore();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with correct default values', async () => {
      store = await waitFor(() => new BountyCardStore(mockWorkspaceId));

      expect(store.bountyCards).toEqual([]);
      expect(store.currentWorkspaceId).toBe(mockWorkspaceId);
      expect(store.loading).toBeFalsy();
      expect(store.pagination).toEqual({
        currentPage: 1,
        pageSize: 10,
        total: 0
      });
    });
  });

  describe('loadWorkspaceBounties', () => {
    it('should handle successful bounty cards fetch', async () => {
      const mockBounties = [{ id: 1, title: 'Test Bounty' }];
      fetchStub.resolves({
        ok: true,
        json: async () => mockBounties
      } as Response);

      store = await waitFor(() => new BountyCardStore(mockWorkspaceId));

      expect(store.bountyCards).toEqual(mockBounties);
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
    });

    it('should handle failed bounty cards fetch', async () => {
      const errorMessage = 'Failed to load bounties';
      fetchStub.resolves({
        ok: false,
        statusText: errorMessage
      } as Response);

      store = await waitFor(() => new BountyCardStore(mockWorkspaceId));
      expect(store.bountyCards).toEqual([]);
      expect(store.loading).toBe(false);
      expect(store.error).toBe(`Failed to load bounties: ${errorMessage}`);
    });
  });

  describe('switchWorkspace', () => {
    it('should switch workspace and reload bounties', async () => {
      const newWorkspaceId = 'new-workspace-456';
      const mockBounties = [{ id: 2, title: 'New Bounty' }];

      fetchStub.resolves({
        ok: true,
        json: async () => mockBounties
      } as Response);

      store = await waitFor(() => new BountyCardStore(mockWorkspaceId));

      await waitFor(() => store.switchWorkspace(newWorkspaceId));
      expect(store.currentWorkspaceId).toBe(newWorkspaceId);
      expect(store.pagination.currentPage).toBe(1);
      expect(store.bountyCards).toEqual(mockBounties);
    });

    it('should not reload if workspace id is the same', async () => {
      store = await waitFor(() => new BountyCardStore(mockWorkspaceId));
      const initialFetchCount = fetchStub.callCount;

      await waitFor(() => store.switchWorkspace(mockWorkspaceId));

      expect(fetchStub.callCount).toBe(initialFetchCount);
    });
  });

  describe('loadNextPage', () => {
    it('should not load next page if already loading', async () => {
      store = await waitFor(() => new BountyCardStore(mockWorkspaceId));

      store.loading = true;

      await waitFor(() => store.loadNextPage());
    });

    it('should not load next page if all items are loaded', async () => {
      store = await waitFor(() => new BountyCardStore(mockWorkspaceId));

      store.pagination.total = 10;
      store.pagination.currentPage = 1;
      store.pagination.pageSize = 10;

      await waitFor(() => store.loadNextPage());
    });
  });
});

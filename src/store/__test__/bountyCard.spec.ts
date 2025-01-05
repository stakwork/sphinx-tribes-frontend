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

      expect(store.bountyCards).toEqual([{ ...mockBounties[0], status: 'Todo' }]);
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
      expect(store.bountyCards).toEqual([{ ...mockBounties[0], status: 'Todo' }]);
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

  describe('calculateBountyStatus', () => {
    let store: BountyCardStore;

    beforeEach(async () => {
      store = await waitFor(() => new BountyCardStore(mockWorkspaceId));
    });

    it('should return "Paid" when bounty is paid', async () => {
      const mockBounty = {
        id: '1',
        title: 'Test Bounty',
        paid: true,
        completed: true,
        payment_pending: false,
        assignee_img: 'test.jpg'
      };

      fetchStub.resolves({
        ok: true,
        json: async () => [mockBounty]
      } as Response);

      await store.loadWorkspaceBounties();
      expect(store.bountyCards[0].status).toBe('Paid');
    });

    it('should return "Complete" when bounty is completed but not paid', async () => {
      const mockBounty = {
        id: '1',
        title: 'Test Bounty',
        paid: false,
        completed: true,
        payment_pending: false,
        assignee_img: 'test.jpg'
      };

      fetchStub.resolves({
        ok: true,
        json: async () => [mockBounty]
      } as Response);

      await store.loadWorkspaceBounties();
      expect(store.bountyCards[0].status).toBe('Complete');
    });

    it('should return "Complete" when payment is pending', async () => {
      const mockBounty = {
        id: '1',
        title: 'Test Bounty',
        paid: false,
        completed: false,
        payment_pending: true,
        assignee_img: 'test.jpg'
      };

      fetchStub.resolves({
        ok: true,
        json: async () => [mockBounty]
      } as Response);

      await store.loadWorkspaceBounties();
      expect(store.bountyCards[0].status).toBe('Complete');
    });

    it('should return "Assigned" when bounty has assignee but not completed or paid', async () => {
      const mockBounty = {
        id: '1',
        title: 'Test Bounty',
        paid: false,
        completed: false,
        payment_pending: false,
        assignee_img: 'test.jpg'
      };

      fetchStub.resolves({
        ok: true,
        json: async () => [mockBounty]
      } as Response);

      await store.loadWorkspaceBounties();
      expect(store.bountyCards[0].status).toBe('Assigned');
    });

    it('should return "Todo" when bounty has no assignee and is not completed or paid', async () => {
      const mockBounty = {
        id: '1',
        title: 'Test Bounty',
        paid: false,
        completed: false,
        payment_pending: false,
        assignee_img: undefined
      };

      fetchStub.resolves({
        ok: true,
        json: async () => [mockBounty]
      } as Response);

      await store.loadWorkspaceBounties();
      expect(store.bountyCards[0].status).toBe('Todo');
    });

    it('should return "Review" when bounty has proofs submitted', async () => {
      const mockBounty = {
        id: '1',
        title: 'Test Bounty',
        paid: false,
        completed: false,
        payment_pending: false,
        assignee_img: 'test.jpg',
        pow: 2
      };

      fetchStub.resolves({
        ok: true,
        json: async () => [mockBounty]
      } as Response);

      await store.loadWorkspaceBounties();
      expect(store.bountyCards[0].status).toBe('Review');
    });

    it('should prioritize paid status over review status', async () => {
      const mockBounty = {
        id: '1',
        title: 'Test Bounty',
        paid: true,
        completed: true,
        payment_pending: false,
        assignee_img: 'test.jpg',
        pow: 2
      };

      fetchStub.resolves({
        ok: true,
        json: async () => [mockBounty]
      } as Response);

      await store.loadWorkspaceBounties();
      expect(store.bountyCards[0].status).toBe('Paid');
    });

    describe('computed status lists', () => {
      it('should correctly filter bounties by status including review', async () => {
        const mockBounties = [
          {
            id: '1',
            title: 'Bounty 1',
            paid: true,
            completed: true,
            assignee_img: 'test.jpg',
            pow: 0
          },
          { id: '2', title: 'Bounty 2', completed: true, assignee_img: 'test.jpg', pow: 0 },
          { id: '3', title: 'Bounty 3', assignee_img: 'test.jpg', pow: 2 },
          { id: '4', title: 'Bounty 4', pow: 0 }
        ];

        fetchStub.resolves({
          ok: true,
          json: async () => mockBounties
        } as Response);

        await store.loadWorkspaceBounties();

        expect(store.paidItems.length).toBe(1);
        expect(store.completedItems.length).toBe(1);
        expect(store.reviewItems.length).toBe(1);
        expect(store.assignedItems.length).toBe(0);
        expect(store.todoItems.length).toBe(1);
      });
    });
  });
});

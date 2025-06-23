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
    });
  });

  describe('loadWorkspaceBounties', () => {
    it('should handle successful bounty cards fetch', async () => {
      const mockBounties = [{ id: 1, title: 'Test Bounty', status: 'TODO' }];

      fetchStub.resolves({
        ok: true,
        json: async () => mockBounties
      } as Response);

      store = new BountyCardStore(mockWorkspaceId);
      await waitFor(() => expect(store.bountyCards).toEqual(mockBounties));

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
      const mockBounties = [{ id: 2, title: 'New Bounty', status: 'TODO' }];

      fetchStub.resolves({
        ok: true,
        json: async () => mockBounties
      } as Response);

      store = new BountyCardStore(mockWorkspaceId);

      await waitFor(() => store.switchWorkspace(newWorkspaceId));
      expect(store.currentWorkspaceId).toBe(newWorkspaceId);
      expect(store.bountyCards).toEqual(mockBounties);
    });

    it('should not reload if workspace id is the same', async () => {
      store = await waitFor(() => new BountyCardStore(mockWorkspaceId));
      const initialFetchCount = fetchStub.callCount;

      await waitFor(() => store.switchWorkspace(mockWorkspaceId));

      expect(fetchStub.callCount).toBe(initialFetchCount);
    });
  });

  describe('computed status lists', () => {
    beforeEach(async () => {
      store = await waitFor(() => new BountyCardStore(mockWorkspaceId));
    });

    it('should correctly identify paid items', async () => {
      const mockBounty = {
        id: '1',
        title: 'Test Bounty',
        status: 'PAID',
        assignee_img: 'test.jpg'
      };

      fetchStub.resolves({
        ok: true,
        json: async () => [mockBounty]
      } as Response);

      await store.loadWorkspaceBounties();
      expect(store.paidItems).toHaveLength(1);
      expect(store.paidItems[0].id).toBe('1');
    });

    it('should correctly identify completed items', async () => {
      const mockBounty = {
        id: '1',
        title: 'Test Bounty',
        status: 'COMPLETED',
        assignee_img: 'test.jpg'
      };

      fetchStub.resolves({
        ok: true,
        json: async () => [mockBounty]
      } as Response);

      await store.loadWorkspaceBounties();
      expect(store.completedItems).toHaveLength(1);
      expect(store.completedItems[0].id).toBe('1');
    });

    it('should correctly identify in-progress items', async () => {
      const mockBounty = {
        id: '1',
        title: 'Test Bounty',
        status: 'IN_PROGRESS',
        assignee_img: 'test.jpg'
      };

      fetchStub.resolves({
        ok: true,
        json: async () => [mockBounty]
      } as Response);

      await store.loadWorkspaceBounties();
      expect(store.assignedItems).toHaveLength(1);
      expect(store.assignedItems[0].id).toBe('1');
    });

    it('should correctly identify review items', async () => {
      const mockBounty = {
        id: '1',
        title: 'Test Bounty',
        status: 'IN_REVIEW',
        assignee_img: 'test.jpg'
      };

      fetchStub.resolves({
        ok: true,
        json: async () => [mockBounty]
      } as Response);

      await store.loadWorkspaceBounties();
      expect(store.reviewItems).toHaveLength(1);
      expect(store.reviewItems[0].id).toBe('1');
    });

    it('should correctly identify todo items', async () => {
      const mockBounty = {
        id: '1',
        title: 'Test Bounty',
        status: 'TODO',
        assignee_img: undefined
      };

      fetchStub.resolves({
        ok: true,
        json: async () => [mockBounty]
      } as Response);

      await store.loadWorkspaceBounties();
      expect(store.todoItems).toHaveLength(1);
      expect(store.todoItems[0].id).toBe('1');
    });

    it('should correctly filter bounties by multiple statuses', async () => {
      const mockBounties = [
        {
          id: '1',
          title: 'Bounty 1',
          status: 'PAID'
        },
        {
          id: '2',
          title: 'Bounty 2',
          status: 'COMPLETED'
        },
        {
          id: '3',
          title: 'Bounty 3',
          status: 'IN_REVIEW'
        },
        {
          id: '4',
          title: 'Bounty 4',
          status: 'TODO'
        }
      ];

      fetchStub.resolves({
        ok: true,
        json: async () => mockBounties
      } as Response);

      await store.loadWorkspaceBounties();

      expect(store.paidItems.length).toBe(1);
      expect(store.completedItems.length).toBe(1);
      expect(store.reviewItems.length).toBe(1);
      expect(store.todoItems.length).toBe(1);
    });
  });

  describe('search functionality', () => {
    beforeEach(async () => {
      store = await waitFor(() => new BountyCardStore(mockWorkspaceId));
    });

    const mockBounties = [
      { id: '1', title: 'Test Bounty', status: 'TODO' },
      { id: '2', title: 'Another Task', status: 'IN_PROGRESS' },
      { id: '3', title: 'Test Task Two', status: 'COMPLETED' }
    ];

    it('should initialize with default search settings', () => {
      expect(store.searchText).toBe('');
      expect(store.inverseSearch).toBe(false);
    });

    it('should handle regular search correctly', async () => {
      fetchStub.resolves({
        ok: true,
        json: async () => mockBounties
      } as Response);

      store.setSearchText('Test');
      await store.loadWorkspaceBounties();

      const fetchCall = fetchStub.getCall(0);
      waitFor(() => {
        expect(fetchCall.args[0]).toContain('search=Test');
        expect(fetchCall.args[0]).not.toContain('inverse_search=true');
      });
    });

    it('should handle inverse search correctly', async () => {
      fetchStub.resolves({
        ok: true,
        json: async () => mockBounties
      } as Response);

      store.setSearchText('Test');
      store.toggleInverseSearch();
      await store.loadWorkspaceBounties();

      const fetchCall = fetchStub.getCall(0);
      waitFor(() => {
        expect(fetchCall.args[0]).toContain('search=Test');
        expect(fetchCall.args[0]).toContain('inverse_search=true');
      });
    });

    it('should toggle inverse search state', async () => {
      waitFor(() => {
        expect(store.inverseSearch).toBe(false);

        store.toggleInverseSearch();
        expect(store.inverseSearch).toBe(true);

        store.toggleInverseSearch();
        expect(store.inverseSearch).toBe(false);
      });
    });

    it('should persist search settings in session storage', async () => {
      const sessionStorageSpy = jest.spyOn(window.sessionStorage, 'setItem');

      store.setSearchText('Test');
      store.toggleInverseSearch();
      store.saveFilterState();

      waitFor(() => {
        expect(sessionStorageSpy).toHaveBeenCalledWith(
          'bountyFilterState',
          expect.stringContaining('"searchText":"Test"')
        );
        expect(sessionStorageSpy).toHaveBeenCalledWith(
          'bountyFilterState',
          expect.stringContaining('"inverseSearch":true')
        );
      });
    });

    it('should clear search text but maintain inverse search setting', async () => {
      store.setSearchText('Test');
      store.toggleInverseSearch();

      store.clearSearch();

      expect(store.searchText).toBe('');
      expect(store.inverseSearch).toBe(true);
    });

    it('should handle empty search text', async () => {
      fetchStub.resolves({
        ok: true,
        json: async () => mockBounties
      } as Response);

      store.setSearchText('');
      await store.loadWorkspaceBounties();

      const fetchCall = fetchStub.getCall(0);
      expect(fetchCall.args[0]).not.toContain('search=');
      expect(fetchCall.args[0]).not.toContain('inverse_search=');
    });

    it('should sanitize search text', async () => {
      store.setSearchText('Test@#$%^&*()');
      waitFor(() => {
        expect(store.searchText).toBe('Test');
      });
    });

    it('should handle search with special characters', async () => {
      fetchStub.resolves({
        ok: true,
        json: async () => mockBounties
      } as Response);

      const searchText = 'Test & Special!';
      store.setSearchText(searchText);
      await store.loadWorkspaceBounties();

      const fetchCall = fetchStub.getCall(0);
      waitFor(() => {
        expect(fetchCall.args[0]).toContain(encodeURIComponent(searchText));
      });
    });

    it('should maintain search state when switching workspaces', async () => {
      store.setSearchText('Test');
      store.toggleInverseSearch();

      const newWorkspaceId = 'new-workspace-456';
      await store.switchWorkspace(newWorkspaceId);

      waitFor(() => {
        expect(store.searchText).toBe('Test');
        expect(store.inverseSearch).toBe(true);
      });
    });

    it('should handle combined filters with search', async () => {
      fetchStub.resolves({
        ok: true,
        json: async () => mockBounties
      } as Response);

      store.setSearchText('Test');
      store.toggleInverseSearch();
      store.toggleStatus('TODO');
      store.toggleFeature('feature-1');

      await store.loadWorkspaceBounties();

      const fetchCall = fetchStub.getCall(0);
      waitFor(() => {
        expect(fetchCall.args[0]).toContain('search=Test');
        expect(fetchCall.args[0]).toContain('inverse_search=true');
      });
    });

    it('should clear search correctly', async () => {
      store.setSearchText('Test');
      store.toggleInverseSearch();

      waitFor(() => {
        expect(store.searchText).toBe('Test');
        expect(store.inverseSearch).toBe(true);
      });

      store.clearSearch();

      waitFor(() => {
        expect(store.searchText).toBe('');
        expect(store.inverseSearch).toBe(false);
      });

      const fetchCall = fetchStub.getCall(0);
      waitFor(() => {
        expect(fetchCall.args[0]).not.toContain('search=');
        expect(fetchCall.args[0]).not.toContain('inverse_search=');
      });
    });
  });
});

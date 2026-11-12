import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route } from 'react-router-dom';
import { WorkspaceTicketsPage } from '../workspace';

const setWorkspaceBountiesStatus = jest.fn();
const mockWorkspaceBountiesStatus = {
  Open: false,
  Assigned: false,
  Paid: false,
  Completed: false,
  Pending: false,
  Failed: false
};

const mockMain = {
  getUserWorkspaceByUuid: jest.fn(() =>
    Promise.resolve({
      uuid: 'random_org_uuid',
      name: 'Test Workspace',
      img: '',
      description: '',
      website: '',
      github: '',
      owner_pubkey: 'owner',
      bounty_count: 1
    })
  ),
  getTribesByOwner: jest.fn(),
  getTotalWorkspaceBountyCount: jest.fn(() => Promise.resolve(1)),
  setWorkspaceBountiesStatus,
  workspaceBountiesStatus: mockWorkspaceBountiesStatus
};

jest.mock('remark-gfm', () => null);
jest.mock('rehype-raw', () => null);

jest.mock('hooks', () => ({
  useIsMobile: () => false
}));

jest.mock('people/widgetViews/WidgetSwitchViewer', () => ({
  __esModule: true,
  default: () => <div data-testid="workspace-bounties" />
}));

jest.mock('../workspace/workspaceHeader', () => ({
  WorkspaceHeader: () => <div data-testid="workspace-header" />
}));

jest.mock('store', () => ({
  useStores: () => ({
    main: mockMain,
    ui: {
      meInfo: {
        owner_alias: 'test',
        owner_pubkey: 'owner'
      },
      toasts: [],
      setToasts: jest.fn()
    }
  })
}));

describe('WorkspaceTickets query status', () => {
  beforeEach(() => {
    setWorkspaceBountiesStatus.mockClear();
  });

  it('applies assigned status from the workspace bounty URL query', async () => {
    render(
      <MemoryRouter initialEntries={['/workspace/bounties/random_org_uuid?status=assigned']}>
        <Route path="/workspace/bounties/:uuid" component={WorkspaceTicketsPage} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(setWorkspaceBountiesStatus).toHaveBeenCalledWith(
        expect.objectContaining({
          Open: false,
          Assigned: true
        })
      );
    });
  });
});

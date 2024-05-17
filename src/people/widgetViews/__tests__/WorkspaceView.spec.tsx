import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen, act, waitFor } from '@testing-library/react';
import { setupStore } from '__test__/__mockData__/setupStore';
import { mockUsehistory } from '__test__/__mockFn__/useHistory';
import nock from 'nock';
import { user } from '__test__/__mockData__/user';
import { person } from '__test__/__mockData__/persons';
import { Workspace } from 'store/interface';
import { uiStore } from 'store/ui';
import { mainStore } from '../../../store/main.ts';
import WorkspaceView from '../WorkspaceView.tsx';

beforeAll(() => {
  nock.disableNetConnect();
  setupStore();
  mockUsehistory();
});

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useRouteMatch: () => ({ url: '', path: '' })
}));

const workspaces: Workspace[] = [
  {
    bounty_count: 0,
    created: '2024-01-03T20:34:09.585609Z',
    deleted: false,
    id: '51',
    img: '',
    name: 'TEST_NEW',
    owner_pubkey: '03cbb9c01cdcf91a3ac3b543a556fbec9c4c3c2a6ed753e19f2706012a26367ae3',
    show: false,
    updated: '2024-01-03T20:34:09.585609Z',
    uuid: 'cmas9gatu2rvqiev4ur0'
  },
  {
    bounty_count: 0,
    created: '2024-01-03T20:34:09.585609Z',
    deleted: false,
    id: '52',
    img: '',
    name: 'TEST_SECOND',
    owner_pubkey: '03cbb9c01cdcf91a3ac3b543a556fbec9c4c3c2a6ed753e19f2706012a26367ae3',
    show: false,
    updated: '2024-01-03T20:34:09.585609Z',
    uuid: 'cmas9gatu2rvqiev4ur0'
  }
];

describe('WorkspaceView Component', () => {
  nock(user.url).get('/person/id/1').reply(200, {});
  it('renders workspace names correctly', async () => {
    jest.spyOn(mainStore, 'getUserRoles').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'getWorkspaceUser').mockReturnValue(Promise.resolve(person as any));
    mainStore.setWorkspaces(workspaces);

    render(<WorkspaceView person={person} />);
    act(async () => {
      await waitFor(() => {
        const workspaceName = screen.getByText(workspaces[0].name);
        const secondWorkspace = screen.getByText(workspaces[1].name);
        expect(workspaceName).toBeInTheDocument();
        expect(secondWorkspace).toBeInTheDocument();
      });
    });
  });

  it('renders view bounties button correctly', async () => {
    jest.spyOn(mainStore, 'getUserRoles').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'getWorkspaceUser').mockReturnValue(Promise.resolve(person as any));
    mainStore.setWorkspaces([workspaces[0]]);

    render(<WorkspaceView person={person} />);
    act(async () => {
      await waitFor(() => {
        const viewBountiesBtn = screen.getByRole('button', {
          name: 'View Bounties open_in_new_tab'
        });
        expect(viewBountiesBtn).toBeInTheDocument();
      });
    });
  });

  it('should not render manage bounties button if user does not have access', async () => {
    jest.spyOn(mainStore, 'getUserRoles').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'getWorkspaceUser').mockReturnValue(Promise.resolve({} as any));
    mainStore.setWorkspaces([workspaces[0]]);

    render(<WorkspaceView person={person} />);

    const manageButton = screen.queryAllByRole('button', { name: 'Manage' });
    expect(manageButton.length).toBe(0);
  });

  it('renders manage bounties button if user is owner correctly', async () => {
    jest.spyOn(mainStore, 'getUserRoles').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'getWorkspaceUser').mockReturnValue(Promise.resolve(person as any));
    const userWorkspace = {
      ...workspaces[0],
      owner_pubkey: person.owner_pubkey
    };
    mainStore.setWorkspaces([userWorkspace]);

    render(<WorkspaceView person={person} />);
    act(async () => {
      await waitFor(() => {
        const manageButton = screen.getByRole('button', { name: 'Manage' });
        expect(manageButton).toBeInTheDocument();
      });
    });
  });

  it('test owner can view all the workspaces which is a part of', async () => {
    jest.spyOn(mainStore, 'getUserRoles').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'getWorkspaceUser').mockReturnValue(Promise.resolve(person as any));
    mainStore.setWorkspaces(workspaces);

    render(<WorkspaceView person={person} />);
    act(async () => {
      await waitFor(() => {
        workspaces.forEach((org: Workspace) => {
          const workspaceName = screen.getByText(org.name);
          expect(workspaceName).toBeInTheDocument();
        });
      });
    });
  });

  it('clicking on "manage" takes me to the workspace admin page in the same window', async () => {
    jest.spyOn(mainStore, 'getUserRoles').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'getWorkspaceUser').mockReturnValue(Promise.resolve(person as any));
    mainStore.setWorkspaces(workspaces);
    uiStore.setMeInfo({
      pubkey: person.owner_pubkey,
      owner_pubkey: person.owner_pubkey,
      photo_url: '',
      alias: 'hhh',
      img: '',
      route_hint: '',
      contact_key: 'xxxxx',
      price_to_meet: 0,
      jwt: 'yyyyy',
      tribe_jwt: '',
      url: '',
      description: 'desc',
      verification_signature: '',
      extras: {},
      isSuperAdmin: false
    });

    const { getByText, queryAllByText, queryByText } = render(<WorkspaceView person={person} />);
    act(async () => {
      await waitFor(() => {
        fireEvent.click(queryAllByText('Manage')[0]);

        expect(getByText(workspaces[0].name)).toBeInTheDocument();
      });
    });
  });

  it('test clicking on "View bounties" takes me to the workspace overview page if there are bounties', async () => {
    const _workspaces = JSON.parse(JSON.stringify(workspaces));
    _workspaces[0].bounty_count = 100;
    const mockWindowOpen = jest.spyOn(window, 'open').mockImplementation(jest.fn());
    jest.spyOn(mainStore, 'getUserRoles').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'getWorkspaceUser').mockReturnValue(Promise.resolve(person as any));
    mainStore.setWorkspaces(_workspaces);

    render(<WorkspaceView person={person} />);

    act(async () => {
      await waitFor(() => {
        const firstBtn = screen.getAllByText('View Bounties')[0];
        fireEvent.click(firstBtn);

        expect(firstBtn).not.toBeDisabled();
        expect(mockWindowOpen).toHaveBeenCalledWith(
          `/workspace/bounties/${_workspaces[0].uuid}`,
          '_target'
        );
        mockWindowOpen.mockRestore();
      });
    });
  });

  it('test if there are no bounties, the "View bounties" button should be greyed and unclickable', async () => {
    const _workspaces = JSON.parse(JSON.stringify(workspaces));
    _workspaces[0].bounty_count = 0;

    jest.spyOn(mainStore, 'getUserRoles').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'getWorkspaceUser').mockReturnValue(Promise.resolve(person as any));
    mainStore.setWorkspaces(_workspaces);

    render(<WorkspaceView person={person} />);
    act(async () => {
      await waitFor(() => {
        const firstBtn = screen.getAllByText('View Bounties')[0];
        expect(firstBtn).toBeDisabled();
      });
    });
  });

  it('test owner can click on "add workspace" and a pop-up appears to guide through the add workspace flow', async () => {
    jest.spyOn(mainStore, 'getUserRoles').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'getWorkspaceUser').mockReturnValue(Promise.resolve(person as any));
    mainStore.setWorkspaces(workspaces);

    render(<WorkspaceView person={person} />);
    act(async () => {
      await waitFor(() => {
        fireEvent.click(screen.getByText('Add Workspace'));
        expect(screen.getByText('Add New Workspace')).toBeInTheDocument();
      });
    });
  });

  it('test if there are no workspaces, the "No workspace yet" image is displayed', async () => {
    jest.spyOn(mainStore, 'getUserRoles').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'getWorkspaceUser').mockReturnValue(Promise.resolve(person as any));
    mainStore.setWorkspaces([]);

    const { container, getByTestId } = render(<WorkspaceView person={person} />);
    act(async () => {
      await waitFor(() => {
        expect(getByTestId('loading-spinner')).toBeInTheDocument();
        const emptyResult = container.querySelector('div[src="/static/no_org.png"]');
        expect(emptyResult).toBeInTheDocument();
        expect(getByTestId('loading-spinner')).not.toBeInTheDocument();
      });
    });
  });
});

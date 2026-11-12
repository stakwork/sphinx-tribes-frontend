import '@testing-library/jest-dom';
import { act, fireEvent, screen, render, waitFor, within } from '@testing-library/react';
import { person } from '__test__/__mockData__/persons';
import { setupStore } from '__test__/__mockData__/setupStore';
import { user } from '__test__/__mockData__/user';
import { mockUsehistory } from '__test__/__mockFn__/useHistory';
import mockBounties, { createdBounty } from 'bounties/__mock__/mockBounties.data';
import nock from 'nock';
import React from 'react';
import { MemoryRouter, Route } from 'react-router-dom';
import { useStores } from '../../../../store';
import { usePerson } from '../../../../hooks';
import { Wanted } from '../Wanted.tsx';

beforeAll(() => {
  nock.disableNetConnect();
  setupStore();
  mockUsehistory();
});

jest.mock('remark-gfm', () => null);

jest.mock('rehype-raw', () => null);

jest.mock('react-markdown', () => (props: { children?: React.ReactNode }) =>
  React.createElement('div', {}, props.children)
);

jest.mock('people/widgetViews/postBounty', () => ({
  __esModule: true,
  PostBounty: ({ onSucces }: { onSucces?: () => void }) => (
    <button type="button" onClick={() => onSucces?.()}>
      Post a Bounty
    </button>
  )
}));

jest.mock('people/utils/NameTag', () => ({
  __esModule: true,
  default: ({ owner_alias }: { owner_alias?: string }) => <span>{owner_alias}</span>
}));

jest.mock('hooks', () => ({
  ...jest.requireActual('hooks'),
  usePerson: jest.fn()
}));

jest.mock('store', () => ({
  ...jest.requireActual('store'),
  useStores: jest.fn()
}));

describe('Wanted Component', () => {
  nock(user.url).get('/person/id/1').reply(200, { user });
  nock(user.url).get('/ask').reply(200, {});

  test('Should call getPersonCreatedBounties when the component is mounted', async () => {
    const userBounty = { ...mockBounties[0], body: {} } as any;
    userBounty.body = {
      ...userBounty.bounty,
      owner_id: person.owner_pubkey,
      title: 'test bounty here',
      description: 'custom ticket for testing'
    };

    (usePerson as jest.Mock).mockImplementation(() => ({
      person: { id: 1, owner_pubkey: person.owner_pubkey },
      canEdit: false
    }));

    const getPersonCreatedBounties = jest.fn(() => Promise.resolve([userBounty]));

    (useStores as jest.Mock).mockReturnValue({
      main: {
        getPersonCreatedBounties,
        getBountyCount: jest.fn(() => 1)
      },
      ui: {
        selectedPerson: '123',
        meInfo: {
          owner_alias: 'test'
        },
        setBountyPerson: jest.fn()
      }
    });

    await act(async () => {
      const { getAllByTestId } = render(
        <MemoryRouter initialEntries={['/p/1234/bounties']}>
          <Route path="/p/:uuid/bounties" component={Wanted} />
        </MemoryRouter>
      );
      await waitFor(() => getAllByTestId('user-created-bounty'));
      expect(getPersonCreatedBounties).toHaveBeenCalled();
    });
  });

  test('Correct calls are made when boxes are clicked', async () => {
    const userBounty = { ...mockBounties[0], body: {} } as any;
    userBounty.body = {
      ...userBounty.bounty,
      owner_id: person.owner_pubkey,
      title: 'test bounty here',
      description: 'custom ticket for testing'
    };

    (usePerson as jest.Mock).mockImplementation(() => ({
      person: { id: 1, owner_pubkey: person.owner_pubkey },
      canEdit: false
    }));

    const getPersonCreatedBounties = jest.fn(() => Promise.resolve([userBounty]));

    (useStores as jest.Mock).mockReturnValue({
      main: {
        getPersonCreatedBounties,
        getBountyCount: jest.fn(() => 1)
      },
      ui: {
        selectedPerson: '123',
        meInfo: {
          owner_alias: 'test'
        },
        setBountyPerson: jest.fn()
      }
    });

    await act(async () => {
      const { getAllByTestId } = render(
        <MemoryRouter initialEntries={['/p/1234/bounties']}>
          <Route path="/p/:uuid/bounties" component={Wanted} />
        </MemoryRouter>
      );
      await waitFor(() => getAllByTestId('user-created-bounty'));

      const clickAssignedCheckBox = screen.getByText('Assigned');

      expect(clickAssignedCheckBox).toBeInTheDocument();

      fireEvent.click(clickAssignedCheckBox);

      await waitFor(() => expect(getPersonCreatedBounties).toHaveBeenCalledTimes(2));
      expect(getPersonCreatedBounties).toHaveBeenLastCalledWith(
        expect.objectContaining({
          Assigned: true,
          Open: false,
          Paid: false
        }),
        '1234'
      );
    });
  });

  test('Should render correct number of bounties created by the user', async () => {
    const createdMockBounties = Array.from({ length: 15 }, (_: any, index: number) => ({
      ...(mockBounties[0] || {}),
      bounty: {
        ...(mockBounties[0]?.bounty || {}),
        id: mockBounties[0]?.bounty?.id + index + 1
      }
    }));

    const userBounties = createdMockBounties.map((bounty: any, index: number) => ({
      ...bounty,
      body: {
        ...bounty.bounty,
        owner_id: person.owner_pubkey,
        title: `test bounty here ${index}`
      }
    })) as any;

    (usePerson as jest.Mock).mockImplementation(() => ({
      person: { id: 1, owner_pubkey: person.owner_pubkey },
      canEdit: false
    }));

    const getPersonCreatedBounties = jest.fn(() => Promise.resolve(userBounties));

    (useStores as jest.Mock).mockReturnValue({
      main: {
        getPersonCreatedBounties,
        getBountyCount: jest.fn(() => userBounties.length)
      },
      ui: {
        selectedPerson: '123',
        meInfo: {
          owner_alias: 'test'
        },
        setBountyPerson: jest.fn()
      }
    });

    await act(async () => {
      const { getAllByTestId } = render(
        <MemoryRouter initialEntries={['/p/1234/bounties']}>
          <Route path="/p/:uuid/bounties" component={Wanted} />
        </MemoryRouter>
      );

      await waitFor(() => getAllByTestId('user-created-bounty'));
      expect(getPersonCreatedBounties).toHaveBeenCalled();
      expect(getAllByTestId('user-created-bounty').length).toBe(15);
    });
  });

  test('Each bounty should be visible on UI', async () => {
    const createdMockBounties = Array.from({ length: 15 }, (_: any, index: number) => ({
      ...(mockBounties[0] || {}),
      bounty: {
        ...(mockBounties[0]?.bounty || {}),
        id: mockBounties[0]?.bounty?.id + index + 1
      }
    })) as any;

    const userBounties = createdMockBounties.map((bounty: any, index: number) => ({
      ...bounty,
      body: {
        ...bounty.bounty,
        owner_id: person.owner_pubkey,
        title: `test bounty here ${index}`
      }
    }));

    (usePerson as jest.Mock).mockImplementation(() => ({
      person: { id: 1, owner_pubkey: person.owner_pubkey },
      canEdit: false
    }));

    const getPersonCreatedBounties = jest.fn(() => Promise.resolve(userBounties));

    (useStores as jest.Mock).mockReturnValue({
      main: {
        getPersonCreatedBounties,
        getBountyCount: jest.fn(() => userBounties.length)
      },
      ui: {
        selectedPerson: '123',
        meInfo: {
          owner_alias: 'test'
        },
        setBountyPerson: jest.fn()
      }
    });

    await act(async () => {
      const { getByText } = render(
        <MemoryRouter initialEntries={['/p/1234/bounties']}>
          <Route path="/p/:uuid/bounties" component={Wanted} />
        </MemoryRouter>
      );

      await waitFor(() => getByText(userBounties[0].body.title));

      for (const bounty of userBounties) {
        expect(getByText(bounty.body.title)).toBeInTheDocument();
      }
    });
  });

  test('should redirect to bounty page when bounty card is clicked', async () => {
    const mockPush = jest.fn();

    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useHistory: () => ({
        push: mockPush,
        replace: mockPush
      })
    }));

    const userBounty = { ...mockBounties[0], body: {} } as any;
    userBounty.body = {
      ...userBounty.bounty,
      owner_id: person.owner_pubkey,
      title: 'test bounty here',
      description: 'custom ticket for testing'
    };

    (usePerson as jest.Mock).mockImplementation(() => ({
      person: { id: 1, owner_pubkey: person.owner_pubkey },
      canEdit: false
    }));

    const getPersonCreatedBounties = jest.fn(() => Promise.resolve([userBounty]));

    (useStores as jest.Mock).mockReturnValue({
      main: {
        getPersonCreatedBounties,
        getBountyCount: jest.fn(() => 1)
      },
      ui: {
        selectedPerson: '123',
        meInfo: {
          owner_alias: 'test'
        },
        setBountyPerson: jest.fn()
      }
    });

    await act(async () => {
      const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null as any);
      const { getAllByTestId } = render(
        <MemoryRouter initialEntries={['/p/1234/bounties']}>
          <Route path="/p/:uuid/bounties" component={Wanted} />
        </MemoryRouter>
      );

      await waitFor(() => getAllByTestId('user-created-bounty'));
      getAllByTestId('user-created-bounty')[0].click();
      expect(getAllByTestId('user-created-bounty').length).toBe(1);
      expect(getAllByTestId('user-created-bounty')[0].getAttribute('href')).toEqual(
        `/bounty/${userBounty.body.id}`
      );
      expect(openSpy).toHaveBeenCalledWith(`/bounty/${userBounty.body.id}`, '_blank');
      openSpy.mockRestore();
    });
  });

  test('should render status assigned if ticket is assigned', async () => {
    const userBounty = { ...createdBounty, body: {} } as any;
    userBounty.body = {
      ...userBounty.bounty,
      owner_id: person.owner_pubkey,
      title: 'test bounty here',
      description: 'custom ticket for testing'
    };

    (usePerson as jest.Mock).mockImplementation(() => ({
      person: { id: 1, owner_pubkey: person.owner_pubkey },
      canEdit: false
    }));

    const getPersonCreatedBounties = jest.fn(() => Promise.resolve([userBounty]));

    (useStores as jest.Mock).mockReturnValue({
      main: {
        getPersonCreatedBounties,
        getBountyCount: jest.fn(() => 1)
      },
      ui: {
        selectedPerson: '123',
        meInfo: {
          owner_alias: 'test'
        },
        setBountyPerson: jest.fn()
      }
    });

    await act(async () => {
      const { getAllByTestId } = render(
        <MemoryRouter initialEntries={['/p/1234/bounties']}>
          <Route path="/p/:uuid/bounties" component={Wanted} />
        </MemoryRouter>
      );

      await waitFor(() => getAllByTestId('user-created-bounty'));
      getAllByTestId('user-created-bounty')[0].click();
      expect(getAllByTestId('user-created-bounty').length).toBe(1);
      within(within(getAllByTestId('user-created-bounty')[0]).getByTestId('status-pill')).getByText(
        'Assigned'
      );
    });
  });

  test('Should render load more button if have more bounties', async () => {
    const createdMockBounties = Array.from({ length: 25 }, (_: any, index: number) => ({
      ...(mockBounties[0] || {}),
      bounty: {
        ...(mockBounties[0]?.bounty || {}),
        id: mockBounties[0]?.bounty?.id + index + 1
      }
    }));

    const userBounties = createdMockBounties.map((bounty: any, index: number) => ({
      ...bounty,
      body: {
        ...bounty.bounty,
        owner_id: person.owner_pubkey,
        title: `test bounty here ${index}`
      }
    })) as any;

    (usePerson as jest.Mock).mockImplementation(() => ({
      person: { id: 1, owner_pubkey: person.owner_pubkey },
      canEdit: false
    }));

    const getPersonCreatedBounties = jest.fn(() => Promise.resolve(userBounties));

    (useStores as jest.Mock).mockReturnValue({
      main: {
        getPersonCreatedBounties,
        getBountyCount: jest.fn(() => userBounties.length)
      },
      ui: {
        selectedPerson: '123',
        meInfo: {
          owner_alias: 'test'
        },
        setBountyPerson: jest.fn()
      }
    });

    await act(async () => {
      const { getByText, getAllByTestId } = render(
        <MemoryRouter initialEntries={['/p/1234/bounties']}>
          <Route path="/p/:uuid/bounties" component={Wanted} />
        </MemoryRouter>
      );
      await waitFor(() => getAllByTestId('user-created-bounty'));
      fireEvent.scroll(window, { target: { scrollY: 1000 } });

      expect(getByText('Load More')).toBeInTheDocument();
    });
  });

  test('Should render correct message if no bounties are assigned', async () => {
    (usePerson as jest.Mock).mockImplementation(() => ({
      person: { id: 1, owner_pubkey: person.owner_pubkey },
      canEdit: false
    }));

    const getPersonCreatedBounties = jest.fn(() => Promise.resolve([]));

    (useStores as jest.Mock).mockReturnValue({
      main: {
        getPersonCreatedBounties,
        getBountyCount: jest.fn(() => 0),
        dropDownWorkspaces: []
      },
      ui: {
        selectedPerson: '123',
        meInfo: {
          owner_alias: 'test'
        },
        setBountyPerson: jest.fn()
      }
    });
    await act(async () => {
      const { getByText } = render(
        <MemoryRouter initialEntries={['/p/1234/bounties']}>
          <Route path="/p/:uuid/bounties" component={Wanted} />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(getByText('No Posted Bounties Yet')).toBeInTheDocument();
      });
    });
  });

  test('when clicking on post a bounty button it triggers the success callback', async () => {
    (usePerson as jest.Mock).mockImplementation(() => ({
      person: { id: 1, owner_pubkey: person.owner_pubkey },
      canEdit: true
    }));

    const getPersonCreatedBounties = jest.fn(() => Promise.resolve([]));

    (useStores as jest.Mock).mockReturnValue({
      main: {
        getPersonCreatedBounties,
        getBountyCount: jest.fn(() => 0),
        getUserDropdownWorkspaces: jest.fn(),
        dropDownWorkspaces: []
      },
      ui: {
        selectedPerson: '123',
        meInfo: {
          owner_alias: 'test'
        },
        setBountyPerson: jest.fn()
      }
    });

    const reloadSpy = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadSpy },
      writable: true
    });

    render(
      <MemoryRouter initialEntries={['/p/1234/bounties']}>
        <Route path="/p/:uuid/bounties" component={Wanted} />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('No Posted Bounties Yet')).toBeInTheDocument());
    const postBountyButtons = await screen.findAllByRole('button', { name: /Post a Bounty/i });
    fireEvent.click(postBountyButtons[postBountyButtons.length - 1]);
    expect(reloadSpy).toHaveBeenCalled();
  });

  test('Should show loading image first and then show correct message if no bounties are assigned', async () => {
    (usePerson as jest.Mock).mockImplementation(() => ({
      person: { id: 1, owner_pubkey: person.owner_pubkey },
      canEdit: false
    }));

    const getPersonCreatedBounties = jest.fn(() => Promise.resolve([]));

    (useStores as jest.Mock).mockReturnValue({
      main: {
        getPersonCreatedBounties,
        getBountyCount: jest.fn(() => 0),
        dropDownWorkspaces: []
      },
      ui: {
        selectedPerson: '123',
        meInfo: {
          owner_alias: 'test'
        },
        setBountyPerson: jest.fn()
      }
    });

    await act(async () => {
      const { getByText, queryByTestId } = render(
        <MemoryRouter initialEntries={['/p/1234/bounties']}>
          <Route path="/p/:uuid/bounties" component={Wanted} />
        </MemoryRouter>
      );

      await waitFor(() => expect(getByText('No Posted Bounties Yet')).toBeInTheDocument());
      await waitFor(() => expect(queryByTestId('loading-spinner')).not.toBeInTheDocument());
    });
  });

  test('bounties are displayed if there are bounties instead of defualt image', async () => {
    const createdMockBounties = Array.from({ length: 15 }, (_: any, index: number) => ({
      ...(mockBounties[0] || {}),
      bounty: {
        ...(mockBounties[0]?.bounty || {}),
        id: mockBounties[0]?.bounty?.id + index + 1
      }
    })) as any;

    const userBounties = createdMockBounties.map((bounty: any, index: number) => ({
      ...bounty,
      body: {
        ...bounty.bounty,
        owner_id: person.owner_pubkey,
        title: `test bounty here ${index}`
      }
    }));

    (usePerson as jest.Mock).mockImplementation(() => ({
      person: { id: 1, owner_pubkey: person.owner_pubkey },
      canEdit: false
    }));

    const getPersonCreatedBounties = jest.fn(() => Promise.resolve(userBounties));

    (useStores as jest.Mock).mockReturnValue({
      main: {
        getPersonCreatedBounties,
        getBountyCount: jest.fn(() => userBounties.length)
      },
      ui: {
        selectedPerson: '123',
        meInfo: {
          owner_alias: 'test'
        },
        setBountyPerson: jest.fn()
      }
    });

    await act(async () => {
      const { getByText, queryByTestId, queryByText } = render(
        <MemoryRouter initialEntries={['/p/1234/bounties']}>
          <Route path="/p/:uuid/bounties" component={Wanted} />
        </MemoryRouter>
      );

      await waitFor(() => getByText(userBounties[0].body.title));

      for (const bounty of userBounties) {
        expect(queryByText('No Posted Bounties Yet')).not.toBeInTheDocument();
        expect(getByText(bounty.body.title)).toBeInTheDocument();
        expect(queryByTestId('loading-spinner')).not.toBeInTheDocument();
      }
    });
  });

  test('that Clicking on bounties tab inside the profile and view a "Post a bounty" button if I am signed in', async () => {
    (usePerson as jest.Mock).mockImplementation(() => ({
      person: { id: 1, owner_pubkey: person.owner_pubkey },
      canEdit: true
    }));

    (useStores as jest.Mock).mockReturnValue({
      main: {
        getPersonCreatedBounties: jest.fn(() => Promise.resolve([])),
        getBountyCount: jest.fn(() => 0)
      },
      ui: {
        selectedPerson: '123',
        meInfo: {
          owner_alias: 'test'
        },
        setBountyPerson: jest.fn()
      }
    });

    render(
      <MemoryRouter initialEntries={['/p/1234/bounties']}>
        <Route path="/p/:uuid/bounties" component={Wanted} />
      </MemoryRouter>
    );

    const postBountyButtons = await screen.findAllByRole('button', { name: /Post a Bounty/i });
    expect(postBountyButtons.length).toBeGreaterThan(0);
  });

  test('that user can view various statuses for bounties created including open, assigned, and paid inside bounties tab', async () => {
    const userBounty = { ...createdBounty, body: {} } as any;
    userBounty.body = {
      ...userBounty.bounty,
      owner_id: person.owner_pubkey,
      title: 'new text',
      description: 'new text'
    };

    const paidUserBounty = { ...userBounty, body: { ...userBounty.body, paid: true } } as any;
    const openUserBounty = {
      ...userBounty,
      assignee: {},
      body: { ...userBounty.body, assignee: '' }
    } as any;

    (usePerson as jest.Mock).mockImplementation(() => ({
      person: { id: 1, owner_pubkey: person.owner_pubkey },
      canEdit: true
    }));

    const getPersonCreatedBounties = jest.fn(() =>
      Promise.resolve([userBounty, paidUserBounty, openUserBounty])
    );

    (useStores as jest.Mock).mockReturnValue({
      main: {
        getPersonCreatedBounties,
        getBountyCount: jest.fn(() => 3)
      },
      ui: {
        selectedPerson: '123',
        meInfo: {
          owner_alias: 'test'
        },
        setBountyPerson: jest.fn()
      }
    });

    await act(async () => {
      const { getByText } = render(
        <MemoryRouter initialEntries={['/p/1234/bounties']}>
          <Route path="/p/:uuid/bounties" component={Wanted} />
        </MemoryRouter>
      );

      await waitFor(() => getByText('Assigned'));

      const AssignedText = getByText('Assigned');
      expect(AssignedText).toBeInTheDocument();

      const OpenText = screen.getByText('Open');
      expect(OpenText).toBeInTheDocument();

      await waitFor(() => {
        const PaidText = screen.getByText('Paid');
        expect(PaidText).toBeInTheDocument();
      });
    });
  });

  test('shows bounty count in header', async () => {
    (usePerson as jest.Mock).mockImplementation(() => ({
      person: { id: 1, owner_pubkey: person.owner_pubkey },
      canEdit: false
    }));

    const getPersonCreatedBounties = jest.fn(() => Promise.resolve([]));

    (useStores as jest.Mock).mockReturnValue({
      main: {
        getPersonCreatedBounties,
        getBountyCount: jest.fn(() => 5)
      },
      ui: {
        selectedPerson: '123',
        meInfo: {
          owner_alias: 'test'
        },
        setBountyPerson: jest.fn()
      }
    });

    render(
      <MemoryRouter initialEntries={['/p/1234/bounties']}>
        <Route path="/p/:uuid/bounties" component={Wanted} />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Bounties (5)')).toBeInTheDocument());
  });

  test('load more requests the next page', async () => {
    const firstPageBounties = Array.from({ length: 25 }, (_: any, index: number) => ({
      ...(mockBounties[0] || {}),
      body: {
        ...(mockBounties[0]?.bounty || {}),
        id: (mockBounties[0]?.bounty?.id || 0) + index + 1,
        owner_id: person.owner_pubkey,
        title: `page1 bounty ${index}`
      }
    })) as any[];

    const secondPageBounty = {
      ...(mockBounties[0] || {}),
      body: {
        ...(mockBounties[0]?.bounty || {}),
        id: 99999,
        owner_id: person.owner_pubkey,
        title: 'page2 bounty'
      }
    } as any;

    (usePerson as jest.Mock).mockImplementation(() => ({
      person: { id: 1, owner_pubkey: person.owner_pubkey },
      canEdit: false
    }));

    const getPersonCreatedBounties = jest.fn((queryParams: any) => {
      if (queryParams?.page === 2) return Promise.resolve([secondPageBounty]);
      return Promise.resolve(firstPageBounties);
    });

    (useStores as jest.Mock).mockReturnValue({
      main: {
        getPersonCreatedBounties,
        getBountyCount: jest.fn(() => firstPageBounties.length + 1)
      },
      ui: {
        selectedPerson: '123',
        meInfo: {
          owner_alias: 'test'
        },
        setBountyPerson: jest.fn()
      }
    });

    render(
      <MemoryRouter initialEntries={['/p/1234/bounties']}>
        <Route path="/p/:uuid/bounties" component={Wanted} />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Load More')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Load More'));

    await waitFor(() => expect(screen.getByText('page2 bounty')).toBeInTheDocument());
    expect(getPersonCreatedBounties).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2 }),
      expect.any(String)
    );
  });
});

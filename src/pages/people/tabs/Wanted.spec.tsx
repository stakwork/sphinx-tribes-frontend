import '@testing-library/jest-dom';
import { act, fireEvent, render, waitFor, within } from '@testing-library/react';
import { person } from '__test__/__mockData__/persons';
import { setupStore } from '__test__/__mockData__/setupStore';
import { user } from '__test__/__mockData__/user';
import { mockUsehistory } from '__test__/__mockFn__/useHistory';
import mockBounties, { createdBounty } from 'bounties/__mock__/mockBounties.data';
import nock from 'nock';
import React from 'react';
import { MemoryRouter, Route } from 'react-router-dom';
import { mainStore } from 'store/main';
import { useStores } from '../../../store';
import { usePerson } from '../../../hooks';
import { Wanted } from './Wanted.tsx';

beforeAll(() => {
  nock.disableNetConnect();
  setupStore();
  mockUsehistory();
});

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
      person: {},
      canEdit: false
    }));

    (useStores as jest.Mock).mockReturnValue({
      main: {
        getPersonCreatedBounties: jest.fn(() => [userBounty])
      },
      ui: {
        selectedPerson: '123',
        meInfo: {
          owner_alias: 'test'
        }
      }
    });

    const mockedPersonAssignedBounites = jest
      .spyOn(mainStore, 'getPersonCreatedBounties')
      .mockReturnValue(Promise.resolve([userBounty]));
    act(async () => {
      const { getAllByTestId } = render(
        <MemoryRouter initialEntries={['/p/1234/wanted']}>
          <Route path="/p/:personPubkey/wanted" component={Wanted} />
        </MemoryRouter>
      );
      await waitFor(() => getAllByTestId('user-created-bounty'));
      expect(mockedPersonAssignedBounites).toBeCalled();
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
      person: {},
      canEdit: false
    }));

    (useStores as jest.Mock).mockReturnValue({
      main: {
        getPersonCreatedBounties: jest.fn(() => [userBounties])
      },
      ui: {
        selectedPerson: '123',
        meInfo: {
          owner_alias: 'test'
        }
      }
    });

    const mockedPersonAssignedBounites = jest
      .spyOn(mainStore, 'getPersonCreatedBounties')
      .mockReturnValue(Promise.resolve(userBounties));
    act(async () => {
      const { getAllByTestId } = render(
        <MemoryRouter initialEntries={['/p/1234/wanted']}>
          <Route path="/p/:personPubkey/wanted" component={Wanted} />
        </MemoryRouter>
      );

      await waitFor(() => getAllByTestId('user-created-bounty'));
      expect(mockedPersonAssignedBounites).toBeCalled();
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
      person: {},
      canEdit: false
    }));

    (useStores as jest.Mock).mockReturnValue({
      main: {
        getPersonCreatedBounties: jest.fn(() => [userBounties])
      },
      ui: {
        selectedPerson: '123',
        meInfo: {
          owner_alias: 'test'
        }
      }
    });

    jest
      .spyOn(mainStore, 'getPersonCreatedBounties')
      .mockReturnValue(Promise.resolve(userBounties));
    act(async () => {
      const { getByText } = render(
        <MemoryRouter initialEntries={['/p/1234/wanted']}>
          <Route path="/p/:personPubkey/wanted" component={Wanted} />
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
      person: {},
      canEdit: false
    }));

    (useStores as jest.Mock).mockReturnValue({
      main: {
        getPersonCreatedBounties: jest.fn(() => [userBounty])
      },
      ui: {
        selectedPerson: '123',
        meInfo: {
          owner_alias: 'test'
        }
      }
    });

    jest
      .spyOn(mainStore, 'getPersonCreatedBounties')
      .mockReturnValue(Promise.resolve([userBounty]));
    act(async () => {
      const { getAllByTestId } = render(
        <MemoryRouter initialEntries={['/p/1234/wanted']}>
          <Route path="/p/:personPubkey/wanted" component={Wanted} />
        </MemoryRouter>
      );

      await waitFor(() => getAllByTestId('user-created-bounty'));
      getAllByTestId('user-created-bounty')[0].click();
      expect(getAllByTestId('user-created-bounty').length).toBe(1);
      expect(getAllByTestId('user-created-bounty')[0].getAttribute('href')).toEqual(
        `/p/1234/wanted/${userBounty.body.id}/0`
      );
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
      person: {},
      canEdit: false
    }));

    (useStores as jest.Mock).mockReturnValue({
      main: {
        getPersonCreatedBounties: jest.fn(() => [userBounty])
      },
      ui: {
        selectedPerson: '123',
        meInfo: {
          owner_alias: 'test'
        }
      }
    });

    jest
      .spyOn(mainStore, 'getPersonCreatedBounties')
      .mockReturnValue(Promise.resolve([userBounty]));
    act(async () => {
      const { getAllByTestId } = render(
        <MemoryRouter initialEntries={['/p/1234/wanted']}>
          <Route path="/p/:personPubkey/wanted" component={Wanted} />
        </MemoryRouter>
      );

      await waitFor(() => getAllByTestId('user-created-bounty'));
      getAllByTestId('user-created-bounty')[0].click();
      expect(getAllByTestId('user-created-bounty').length).toBe(1);
      within(within(getAllByTestId('user-created-bounty')[0]).getByTestId('status-pill')).getByText(
        'Paid'
      );
    });
  });

  test('Should render load more button if have more bounties', async () => {
    const createdMockBounties = Array.from({ length: 20 }, (_: any, index: number) => ({
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
      person: {},
      canEdit: false
    }));

    (useStores as jest.Mock).mockReturnValue({
      main: {
        getPersonCreatedBounties: jest.fn(() => [userBounties])
      },
      ui: {
        selectedPerson: '123',
        meInfo: {
          owner_alias: 'test'
        }
      }
    });

    jest
      .spyOn(mainStore, 'getPersonCreatedBounties')
      .mockReturnValue(Promise.resolve(userBounties));
    act(async () => {
      const { getByText, getAllByTestId } = render(
        <MemoryRouter initialEntries={['/p/1234/wanted']}>
          <Route path="/p/:personPubkey/wanted" component={Wanted} />
        </MemoryRouter>
      );
      await waitFor(() => getAllByTestId('user-created-bounty'));
      fireEvent.scroll(window, { target: { scrollY: 1000 } });

      expect(getByText('Load More')).toBeInTheDocument();
    });
  });

  test('Should render correct message if no bounties are assigned', async () => {
    (usePerson as jest.Mock).mockImplementation(() => ({
      person: {},
      canEdit: false
    }));

    (useStores as jest.Mock).mockReturnValue({
      main: {
        getPersonCreatedBounties: jest.fn(() => []),
        dropDownOrganizations: []
      },
      ui: {
        selectedPerson: '123',
        meInfo: {
          owner_alias: 'test'
        }
      }
    });
    jest.spyOn(mainStore, 'getPersonCreatedBounties').mockReturnValue(Promise.resolve([]));

    const { getByText } = render(
      <MemoryRouter initialEntries={['/p/1234/wanted']}>
        <Route path="/p/:personPubkey/wanted" component={Wanted} />
      </MemoryRouter>
    );
    expect(getByText('No Tickets Yet')).toBeInTheDocument();
  });
});

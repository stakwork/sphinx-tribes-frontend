import '@testing-library/jest-dom';
import { act, fireEvent, render, waitFor, within, screen } from '@testing-library/react';
import { person } from '__test__/__mockData__/persons';
import { setupStore } from '__test__/__mockData__/setupStore';
import { user } from '__test__/__mockData__/user';
import { mockUsehistory } from '__test__/__mockFn__/useHistory';
import mockBounties, { assignedBounty } from 'bounties/__mock__/mockBounties.data';
import nock from 'nock';
import React from 'react';
import { MemoryRouter, Route } from 'react-router-dom';
import { mainStore } from 'store/main';
import UserTickets from './UserTicketsView';

beforeAll(() => {
  nock.disableNetConnect();
  setupStore();
  mockUsehistory();
});

jest.mock('remark-gfm', () => null);
jest.mock('rehype-raw', () => null);

describe('User Tickets View', () => {
  nock(user.url).get('/person/id/1').reply(200, { user });
  nock(user.url).get('/ask').reply(200, {});

  it('Should call getPersonAssignedBounties when the component is mounted', async () => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const userBounty = { ...mockBounties[0], body: {} } as any;
    userBounty.body = {
      ...userBounty.bounty,
      owner_id: person.owner_pubkey,
      title: 'test bounty here',
      description: 'custom ticket for testing'
    };

    const mockedPersonAssignedBounites = jest
      .spyOn(mainStore, 'getPersonAssignedBounties')
      .mockReturnValue(Promise.resolve([userBounty]));
    act(async () => {
      const { getAllByTestId } = render(
        <MemoryRouter initialEntries={['/p/1234/usertickets']}>
          <Route path="/p/:personPubkey/usertickets" component={UserTickets} />
        </MemoryRouter>
      );
      await waitFor(() => getAllByTestId('user-personal-bounty-card'));
      expect(mockedPersonAssignedBounites).toBeCalled();
    });
  });

  it('Should render correct number of bounties assigned to the user', async () => {
    // eslint-disable-next-line @typescript-eslint/typedef
    const createdMockBounties = Array.from({ length: 15 }, (_, index) => ({
      ...(mockBounties[0] || {}),
      bounty: {
        ...(mockBounties[0]?.bounty || {}),
        id: mockBounties[0]?.bounty?.id + index + 1
      }
    }));

    // eslint-disable-next-line @typescript-eslint/typedef
    const userBounties = createdMockBounties.map((bounty, index) => ({
      ...bounty,
      body: {
        ...bounty.bounty,
        owner_id: person.owner_pubkey,
        title: `test bounty here ${index}`
      }
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    })) as any;

    const mockedPersonAssignedBounites = jest
      .spyOn(mainStore, 'getPersonAssignedBounties')
      .mockReturnValue(Promise.resolve(userBounties));
    act(async () => {
      const { getAllByTestId } = render(
        <MemoryRouter initialEntries={['/p/1234/usertickets']}>
          <Route path="/p/:personPubkey/usertickets" component={UserTickets} />
        </MemoryRouter>
      );

      await waitFor(() => getAllByTestId('user-personal-bounty-card'));
      expect(mockedPersonAssignedBounites).toBeCalled();
      expect(getAllByTestId('user-personal-bounty-card').length).toBe(15);
    });
  });

  it('each bounty should be visible on UI', async () => {
    // eslint-disable-next-line @typescript-eslint/typedef
    const createdMockBounties = Array.from({ length: 15 }, (_, index) => ({
      ...(mockBounties[0] || {}),
      bounty: {
        ...(mockBounties[0]?.bounty || {}),
        id: mockBounties[0]?.bounty?.id + index + 1
      }
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    })) as any;

    // eslint-disable-next-line @typescript-eslint/typedef
    const userBounties = createdMockBounties.map((bounty, index) => ({
      ...bounty,
      body: {
        ...bounty.bounty,
        owner_id: person.owner_pubkey,
        title: `test bounty here ${index}`
      }
    }));

    jest
      .spyOn(mainStore, 'getPersonAssignedBounties')
      .mockReturnValue(Promise.resolve(userBounties));
    act(async () => {
      const { getByText } = render(
        <MemoryRouter initialEntries={['/p/1234/usertickets']}>
          <Route path="/p/:personPubkey/usertickets" component={UserTickets} />
        </MemoryRouter>
      );

      await waitFor(() => getByText(userBounties[0].body.title));

      for (const bounty of userBounties) {
        expect(getByText(bounty.body.title)).toBeInTheDocument();
      }
    });
  });

  it('should redirect to bounty page when bounty card is clicked', async () => {
    const mockPush = jest.fn();

    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useHistory: () => ({
        push: mockPush,
        replace: mockPush
      })
    }));

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const userBounty = { ...mockBounties[0], body: {} } as any;
    userBounty.body = {
      ...userBounty.bounty,
      owner_id: person.owner_pubkey,
      title: 'test bounty here',
      description: 'custom ticket for testing'
    };

    jest
      .spyOn(mainStore, 'getPersonAssignedBounties')
      .mockReturnValue(Promise.resolve([userBounty]));
    act(async () => {
      const { getAllByTestId } = render(
        <MemoryRouter initialEntries={['/p/1234/usertickets']}>
          <Route path="/p/:personPubkey/usertickets" component={UserTickets} />
        </MemoryRouter>
      );

      await waitFor(() => getAllByTestId('user-personal-bounty-card'));
      getAllByTestId('user-personal-bounty-card')[0].click();
      expect(getAllByTestId('user-personal-bounty-card').length).toBe(1);
      expect(getAllByTestId('user-personal-bounty-card')[0].getAttribute('href')).toEqual(
        `/p/1234/usertickets/${userBounty.body.id}/0`
      );
    });
  });

  it('should render status assigned if ticket is assigned', async () => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const userBounty = { ...assignedBounty, body: {} } as any;
    userBounty.body = {
      ...userBounty.bounty,
      owner_id: person.owner_pubkey,
      title: 'test bounty here',
      description: 'custom ticket for testing'
    };
    jest
      .spyOn(mainStore, 'getPersonAssignedBounties')
      .mockReturnValue(Promise.resolve([userBounty]));
    act(async () => {
      const { getAllByTestId } = render(
        <MemoryRouter initialEntries={['/p/1234/usertickets']}>
          <Route path="/p/:personPubkey/usertickets" component={UserTickets} />
        </MemoryRouter>
      );

      await waitFor(() => getAllByTestId('user-personal-bounty-card'));
      getAllByTestId('user-personal-bounty-card')[0].click();
      expect(getAllByTestId('user-personal-bounty-card').length).toBe(1);
      within(
        within(getAllByTestId('user-personal-bounty-card')[0]).getByTestId('status-pill')
      ).getByText('Assigned');
    });
  });

  it('should render status closed if ticket is Closed and of type coding_task', async () => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const userBounty = { ...assignedBounty, body: {} } as any;
    userBounty.body = {
      ...userBounty.bounty,
      assignee: userBounty.assignee,
      paid: true,
      owner_id: person.owner_pubkey,
      title: 'test bounty here',
      description: 'custom ticket for testing'
    };
    jest
      .spyOn(mainStore, 'getPersonAssignedBounties')
      .mockReturnValue(Promise.resolve([userBounty]));
    act(async () => {
      const { getAllByTestId } = render(
        <MemoryRouter initialEntries={['/p/1234/usertickets']}>
          <Route path="/p/:personPubkey/usertickets" component={UserTickets} />
        </MemoryRouter>
      );

      await waitFor(() => getAllByTestId('user-personal-bounty-card'));
      getAllByTestId('user-personal-bounty-card')[0].click();
      expect(getAllByTestId('user-personal-bounty-card').length).toBe(1);
      within(
        within(getAllByTestId('user-personal-bounty-card')[0]).getByTestId('status-pill')
      ).getByText('Complete');
    });
  });

  it('Should render load more button if have more bounties', async () => {
    // eslint-disable-next-line @typescript-eslint/typedef
    const createdMockBounties = Array.from({ length: 20 }, (_, index) => ({
      ...(mockBounties[0] || {}),
      bounty: {
        ...(mockBounties[0]?.bounty || {}),
        id: mockBounties[0]?.bounty?.id + index + 1
      }
    }));

    // eslint-disable-next-line @typescript-eslint/typedef
    const userBounties = createdMockBounties.map((bounty, index) => ({
      ...bounty,
      body: {
        ...bounty.bounty,
        owner_id: person.owner_pubkey,
        title: `test bounty here ${index}`
      }
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    })) as any;

    jest
      .spyOn(mainStore, 'getPersonAssignedBounties')
      .mockReturnValue(Promise.resolve(userBounties));
    act(async () => {
      const { getByText, getAllByTestId } = render(
        <MemoryRouter initialEntries={['/p/1234/usertickets']}>
          <Route path="/p/:personPubkey/usertickets" component={UserTickets} />
        </MemoryRouter>
      );
      await waitFor(() => getAllByTestId('user-personal-bounty-card'));
      fireEvent.scroll(window, { target: { scrollY: 1000 } });
      expect(getByText('Load More')).toBeInTheDocument();
    });
  });

  it('Should render correct message if no bounties are assigned', async () => {
    jest.spyOn(mainStore, 'getPersonAssignedBounties').mockReturnValue(Promise.resolve([]));
    await act(async () => {
      const { getByText } = render(
        <MemoryRouter initialEntries={['/p/1234/usertickets']}>
          <Route path="/p/:personPubkey/usertickets" component={UserTickets} />
        </MemoryRouter>
      );
      await waitFor(() => getByText('No Assigned Tickets Yet'));
    });
  });

  it('should render the correct profile photo and name is displayed', async () => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const userBounty = { ...assignedBounty, body: {} } as any;
    userBounty.body = {
      ...userBounty.owner,
      owner_id: person.owner_pubkey,
      owner_alias: person.owner_alias,
      img: person.img
    };
    jest
      .spyOn(mainStore, 'getPersonAssignedBounties')
      .mockReturnValue(Promise.resolve([userBounty]));
    act(async () => {
      const { getAllByTestId } = render(
        <MemoryRouter initialEntries={['/p/1234/usertickets']}>
          <Route path="/p/:personPubkey/usertickets" component={UserTickets} />
        </MemoryRouter>
      );

      await waitFor(() => getAllByTestId('user-personal-bounty-card'));
      const profileImage = screen.getByRole('img');
      expect(profileImage).toHaveAttribute('src', userBounty.img);

      const displayName = screen.getByText(userBounty.owner_alias);
      expect(displayName).toBeInTheDocument();
    });
  });

  it('test that the correct calls are made when boxes are clicked for created bounties tab', async () => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const userBounty = { ...mockBounties[0], body: {} } as any;
    userBounty.body = {
      ...userBounty.bounty,
      owner_id: person.owner_pubkey,
      title: 'test bounty here',
      description: 'custom ticket for testing'
    };

    const mockedPersonAssignedBounites = jest
      .spyOn(mainStore, 'getPersonAssignedBounties')
      .mockReturnValue(Promise.resolve([userBounty]));
    act(async () => {
      render(
        <MemoryRouter initialEntries={['/p/1234/usertickets']}>
          <Route path="/p/:personPubkey/usertickets" component={UserTickets} />
        </MemoryRouter>
      );
      await waitFor(() => {
        const checkBoxLable = screen.queryByText('Assigned');
        expect(checkBoxLable).toBeInTheDocument();

        const checkBoxInput = checkBoxLable?.previousElementSibling as HTMLInputElement;
        fireEvent.click(checkBoxInput);
      });

      await waitFor(() =>
        expect(mockedPersonAssignedBounites).toHaveBeenCalledWith(
          expect.objectContaining({ Open: false, Assigned: true })
        )
      );
    });
  });
});

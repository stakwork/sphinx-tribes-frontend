import '@testing-library/jest-dom';
import { act, render, waitFor, fireEvent, screen, within } from '@testing-library/react';
import { user } from '__test__/__mockData__/user';
import { mockBountiesMutated, newBounty } from 'bounties/__mock__/mockBounties.data';
import { formatSat } from 'helpers';
import React from 'react';
import { MemoryRouter, Route } from 'react-router-dom';
import { mainStore } from 'store/main';
import { useIsMobile } from 'hooks';
import { uiStore } from 'store/ui';
import { TicketModalPage } from '../TicketModalPage';
import { withCreateModal } from '../../../components/common/withCreateModal';

jest.mock('hooks', () => ({
  useIsMobile: jest.fn()
}));

const mockPush = jest.fn();
const mockGoBack = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockPush,
    goBack: mockGoBack
  }),
  useLocation: () => ({
    pathname: '/bounty/1239',
    search: '',
    state: {}
  }),
  useParams: () => ({
    uuid: 'ck95pe04nncjnaefo08g',
    bountyId: '1239'
  })
}));

describe('TicketModalPage Component', () => {
  beforeEach(() => {
    const mockIntersectionObserver = jest.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null
    });
    window.IntersectionObserver = mockIntersectionObserver;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('reder ticket modal', async () => {
    jest
      .spyOn(mainStore, 'getBountyById')
      .mockReturnValue(Promise.resolve([{ ...newBounty, body: { assignee: user } }]));
    jest.spyOn(mainStore, 'getBountyIndexById').mockReturnValue(Promise.resolve(1234));
    await act(async () => {
      const { getByTestId } = render(
        <MemoryRouter initialEntries={['/bounty/1234']}>
          <Route path="/bounty/:bountyId" component={TicketModalPage} />
        </MemoryRouter>
      );

      await waitFor(() => getByTestId('testid-modal'));

      expect(getByTestId('testid-modal')).toBeInTheDocument();
    });
  });

  it('render profile img and username', async () => {
    jest
      .spyOn(mainStore, 'getBountyById')
      .mockReturnValue(
        Promise.resolve([
          { ...newBounty, body: { ...mockBountiesMutated[1].body, assignee: user } }
        ])
      );
    jest.spyOn(mainStore, 'getBountyIndexById').mockReturnValue(Promise.resolve(1234));
    await act(async () => {
      const { getByAltText, getByText } = render(
        <MemoryRouter initialEntries={['/bounty/1234']}>
          <Route path="/bounty/:bountyId" component={TicketModalPage} />
        </MemoryRouter>
      );

      await waitFor(() => getByAltText('assigned_person'));

      expect(getByAltText('assigned_person')).toBeInTheDocument();
      expect(getByText('Vladimir')).toBeInTheDocument();
    });
  });

  it('render I can help button if user not assigned', async () => {
    jest
      .spyOn(mainStore, 'getBountyById')
      .mockReturnValue(
        Promise.resolve([
          { ...newBounty, body: { ...mockBountiesMutated[1].body, assignee: { owner_alias: '' } } }
        ])
      );
    jest.spyOn(mainStore, 'getBountyIndexById').mockReturnValue(Promise.resolve(1234));
    await act(async () => {
      const { getByText } = render(
        <MemoryRouter initialEntries={['/bounty/1234']}>
          <Route path="/bounty/:bountyId" component={TicketModalPage} />
        </MemoryRouter>
      );

      await waitFor(() => getByText('I can help'));

      expect(getByText('I can help')).toBeInTheDocument();
    });
  });

  it('render open connection modal if clicked on i can help', async () => {
    uiStore.setMeInfo(user);
    jest
      .spyOn(mainStore, 'getBountyById')
      .mockReturnValue(
        Promise.resolve([
          { ...newBounty, body: { ...mockBountiesMutated[1].body, assignee: { owner_alias: '' } } }
        ])
      );
    jest.spyOn(mainStore, 'getBountyIndexById').mockReturnValue(Promise.resolve(1234));
    const connectFn = jest.fn();
    await act(async () => {
      const { getByText } = render(
        <MemoryRouter initialEntries={['/bounty/1234']}>
          <Route
            path="/bounty/:bountyId"
            render={(props) => <TicketModalPage setConnectPerson={connectFn} {...props} />}
          />
        </MemoryRouter>
      );

      await waitFor(() => getByText('I can help'));
      fireEvent.click(getByText('I can help'));
      expect(connectFn).toHaveBeenCalled();
    });
  });

  it('render bounty title, description, estimated hours and sats', async () => {
    jest
      .spyOn(mainStore, 'getBountyById')
      .mockReturnValue(
        Promise.resolve([
          { ...newBounty, body: { ...mockBountiesMutated[1].body, assignee: user } }
        ])
      );
    jest.spyOn(mainStore, 'getBountyIndexById').mockReturnValue(Promise.resolve(1234));
    await act(async () => {
      const { getByText, getAllByText } = render(
        <MemoryRouter initialEntries={['/bounty/1234']}>
          <Route path="/bounty/:bountyId" component={TicketModalPage} />
        </MemoryRouter>
      );

      await waitFor(() => getByText(mockBountiesMutated[1].body.title));
      expect(getByText(mockBountiesMutated[1].body.title)).toBeInTheDocument();
      expect(getByText(mockBountiesMutated[1].body.description)).toBeInTheDocument();
      expect(getByText(formatSat(Number(mockBountiesMutated[1].body.price)))).toBeInTheDocument();
    });
  });

  it('render copy link button', async () => {
    jest
      .spyOn(mainStore, 'getBountyById')
      .mockReturnValue(
        Promise.resolve([
          { ...newBounty, body: { ...mockBountiesMutated[1].body, assignee: user } }
        ])
      );
    jest.spyOn(mainStore, 'getBountyIndexById').mockReturnValue(Promise.resolve(1234));
    await act(async () => {
      const { getByText, getAllByText } = render(
        <MemoryRouter initialEntries={['/bounty/1234']}>
          <Route path="/bounty/:bountyId" component={TicketModalPage} />
        </MemoryRouter>
      );

      await waitFor(() => getByText('Copy Link'));
      expect(getByText('Copy Link')).toBeInTheDocument();
    });
  });

  it('render share to twitter button', async () => {
    jest
      .spyOn(mainStore, 'getBountyById')
      .mockReturnValue(
        Promise.resolve([
          { ...newBounty, body: { ...mockBountiesMutated[1].body, assignee: user } }
        ])
      );
    jest.spyOn(mainStore, 'getBountyIndexById').mockReturnValue(Promise.resolve(1234));
    await act(async () => {
      const { getByText } = render(
        <MemoryRouter initialEntries={['/bounty/1234']}>
          <Route path="/bounty/:bountyId" component={TicketModalPage} />
        </MemoryRouter>
      );

      await waitFor(() => getByText('Share to Twitter'));
      expect(getByText('Share to Twitter')).toBeInTheDocument();
    });
  });

  it('should render github ticket link button', async () => {
    jest.spyOn(mainStore, 'getBountyById').mockReturnValue(
      Promise.resolve([
        {
          ...newBounty,
          body: {
            ...mockBountiesMutated[1].body,
            ticket_url: 'http://github.com/sphinx/sphinx-tribes/issues/111',
            assignee: user
          }
        }
      ])
    );
    jest.spyOn(mainStore, 'getBountyIndexById').mockReturnValue(Promise.resolve(1234));
    await act(async () => {
      const { getByText } = render(
        <MemoryRouter initialEntries={['/bounty/1234']}>
          <Route path="/bounty/:bountyId" component={TicketModalPage} />
        </MemoryRouter>
      );

      await waitFor(() => getByText('Github Ticket'));
      expect(getByText('Github Ticket')).toBeInTheDocument();
    });
  });

  it('should redirect to the appropriate page on close based on the route', async () => {
    (useIsMobile as jest.Mock).mockReturnValue(false);

    jest.spyOn(mainStore, 'getBountyById');
    jest.spyOn(mainStore, 'getBountyIndexById');

    render(<TicketModalPage setConnectPerson={jest.fn()} visible={true} />);

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await waitFor(() => {});

    const closeButton = screen.queryByTestId('close-btn');
    if (closeButton) {
      fireEvent.click(closeButton);

      expect(mockPush).toHaveBeenCalledWith('/bounties');
    }
  });

  it('when the user is unassigned, saveBounty method is called', async () => {
    uiStore.setMeInfo(user);

    jest.spyOn(mainStore, 'getBountyById').mockReturnValue(
      Promise.resolve([
        {
          ...newBounty,
          person: { ...newBounty.person, owner_alias: user.alias },
          body: {
            ...mockBountiesMutated[1].body,
            owner: user,
            assignee: user
          }
        }
      ])
    );
    jest.spyOn(mainStore, 'getBountyIndexById').mockReturnValue(Promise.resolve(1234));
    jest.spyOn(mainStore, 'saveBounty').mockResolvedValue();

    await act(async () => {
      const { getByTestId } = render(
        <MemoryRouter initialEntries={['/bounty/1234']}>
          <Route path="/bounty/:bountyId" component={TicketModalPage} />
        </MemoryRouter>
      );

      const editButton = await waitFor(() => getByTestId('edit-btn'));

      expect(editButton).toBeInTheDocument();

      fireEvent.click(editButton);

      await waitFor(() => {
        expect(mainStore.saveBounty).toHaveBeenCalled();
      });
    });
  });

  it('test the ticket modal is rendered when the URL `{host}/bounty/{bountyId}` is hit', async () => {
    jest
      .spyOn(mainStore, 'getBountyById')
      .mockReturnValue(Promise.resolve([{ ...newBounty, body: { assignee: user } }]));
    jest.spyOn(mainStore, 'getBountyIndexById').mockReturnValue(Promise.resolve(1234));

    await act(async () => {
      const { getByTestId } = render(
        <MemoryRouter initialEntries={['/bounty/1234']}>
          <Route path="/bounty/:bountyId" component={TicketModalPage} />
        </MemoryRouter>
      );

      await waitFor(() => getByTestId('testid-modal'));

      expect(getByTestId('testid-modal')).toBeInTheDocument();
    });
  });

  it('the bounty description displays the database description', async () => {
    (useIsMobile as jest.Mock).mockReturnValue(false);

    jest.spyOn(mainStore, 'getBountyById').mockReturnValue(
      Promise.resolve([
        {
          ...newBounty,
          body: { ...mockBountiesMutated[1].body, description: 'test description' }
        }
      ])
    );
    jest.spyOn(mainStore, 'getBountyIndexById');

    await act(async () => {
      const { getByTestId } = render(
        <MemoryRouter initialEntries={['/bounty/1234']}>
          <Route path="/bounty/:bountyId" component={TicketModalPage} />
        </MemoryRouter>
      );

      await waitFor(() => getByTestId('testid-modal'));

      render(<TicketModalPage setConnectPerson={jest.fn()} visible={true} />);

      expect(screen.getByTestId('DescriptionBox').firstChild).toHaveTextContent('test description');
    });
  });

  it('when the Delete Button is clicked, a bounty delete action is performed and the bounty gets deleted', async () => {
    (useIsMobile as jest.Mock).mockReturnValue(false);
    uiStore.setMeInfo(user);

    jest.spyOn(mainStore, 'getBountyById').mockReturnValue(
      Promise.resolve([
        {
          ...newBounty,
          person: { ...newBounty.person, owner_alias: user.alias },
          body: {
            ...mockBountiesMutated[1].body,
            owner: user
          }
        }
      ])
    );
    jest.spyOn(mainStore, 'getBountyIndexById').mockReturnValue(Promise.resolve(1234));

    jest.spyOn(mainStore, 'deleteBounty').mockResolvedValue();

    const App = withCreateModal(() => (
      <div>
        <div id="modal-root" />
        <MemoryRouter initialEntries={['/bounty/1234']}>
          <Route path="/bounty/:bountyId" component={TicketModalPage} />
        </MemoryRouter>
      </div>
    ));

    await act(async () => {
      const { getByText } = render(<App />);

      await waitFor(() => getByText('Delete'));
      fireEvent.click(getByText('Delete'));

      const modalWrapper = document.querySelector('.base-Modal-root');

      expect(within(modalWrapper as HTMLElement).getByText('Delete')).toBeInTheDocument();

      fireEvent.click(within(modalWrapper as HTMLElement).getByText('Delete'));
      fireEvent.click(within(modalWrapper as HTMLElement).getByText('Delete this Bounty?'));

      await waitFor(() => {
        expect(mainStore.deleteBounty).toHaveBeenCalled();
      });
    });
  });

  it('when I click on edit, it takes me to the edit modal', async () => {
    (useIsMobile as jest.Mock).mockReturnValue(false);
    uiStore.setMeInfo(user);

    jest.spyOn(mainStore, 'getBountyById').mockReturnValue(
      Promise.resolve([
        {
          ...newBounty,
          person: { ...newBounty.person, owner_alias: user.alias },
          body: {
            ...mockBountiesMutated[1].body,
            owner: user
          }
        }
      ])
    );
    jest.spyOn(mainStore, 'getBountyIndexById').mockReturnValue(Promise.resolve(1234));

    await act(async () => {
      const { getByText } = render(
        <MemoryRouter initialEntries={['/bounty/1234']}>
          <Route path="/bounty/:bountyId" component={TicketModalPage} />
        </MemoryRouter>
      );

      await waitFor(() => getByText('Edit'));
      fireEvent.click(getByText('Edit'));
      await waitFor(() => getByText('Edit Bounty'));
      expect(getByText('Edit Bounty')).toBeInTheDocument();
    });
  });
});

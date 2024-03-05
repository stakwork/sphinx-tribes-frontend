import '@testing-library/jest-dom';
import { act, render, waitFor, fireEvent, screen, within } from '@testing-library/react';
import { user } from '__test__/__mockData__/user';
import { mockBountiesMutated, newBounty } from 'bounties/__mock__/mockBounties.data';
import { DollarConverter, formatSat, getSessionValue, satToUsd } from 'helpers';
import React from 'react';
import { MemoryRouter, Route } from 'react-router-dom';
import { mainStore } from 'store/main';
import { useIsMobile } from 'hooks';
import { uiStore } from 'store/ui';
import { unpaidString } from 'people/widgetViews/summaries/constants';
import userEvent from '@testing-library/user-event';
import * as helpers from 'helpers';
import { people } from '__test__/__mockData__/persons';
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

jest.mock('helpers', () => ({
  ...jest.requireActual('helpers'),
  userCanManageBounty: jest.fn()
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
            render={(props: any) => <TicketModalPage setConnectPerson={connectFn} {...props} />}
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

  it('test that the user should be able to exit the bounty modal by clicking the "x" on the top right', async () => {
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
      const { getByTestId } = render(
        <MemoryRouter initialEntries={['/bounty/1234']}>
          <Route path="/bounty/:bountyId" component={TicketModalPage} />
        </MemoryRouter>
      );

      await waitFor(() => getByTestId('testid-modal'));

      const closeButton = screen.queryByTestId('close-btn');
      if (closeButton) {
        fireEvent.click(closeButton);
        const absentModal = screen.queryByTestId('testid-modal');
        expect(absentModal).toBeNull();
      }
    });
  });

  it('tests that the bounty poster, title of bounty, Sat amount/usd conversion, est. hours, are all rendered and clickable', async () => {
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
      const { getByText, getByTestId, container } = render(
        <MemoryRouter initialEntries={['/bounty/1234']}>
          <Route path="/bounty/:bountyId" component={TicketModalPage} />
        </MemoryRouter>
      );

      await waitFor(() => getByTestId('testid-modal'));

      // bounty poster
      expect(getByText(user.alias)).toBeInTheDocument();
      // title of bounty
      expect(getByText(mockBountiesMutated[1].body.title)).toBeInTheDocument();
      // Sat amount
      expect(getByText(DollarConverter(mockBountiesMutated[1].body.price))).toBeInTheDocument();
      // usd conversion
      expect(
        getByText(`${satToUsd(parseInt(mockBountiesMutated[1].body.price))} USD`)
      ).toBeInTheDocument();
      screen.debug(undefined, Infinity);
      // Estimated Hours
      expect(
        getByText(getSessionValue(mockBountiesMutated[1].body.estimated_session_length))
      ).toBeInTheDocument();
    });
  });

  it('that if a hunter is not assigned, there should be an empty profile image.', async () => {
    jest
      .spyOn(mainStore, 'getBountyById')
      .mockReturnValue(
        Promise.resolve([{ ...newBounty, body: { ...mockBountiesMutated[1].body, assignee: '' } }])
      );
    jest.spyOn(mainStore, 'getBountyIndexById').mockReturnValue(Promise.resolve(1234));

    await act(async () => {
      const { container, getByTestId, getByAltText } = render(
        <MemoryRouter initialEntries={['/bounty/1234']}>
          <Route path="/bounty/:bountyId" component={TicketModalPage} />
        </MemoryRouter>
      );

      await waitFor(() => getByTestId('testid-modal'));
      const imageElement = document.querySelector(
        '.UnassignedPersonContainer img'
      ) as HTMLImageElement;
      expect(imageElement.src).toContain('/static/unassigned_profile.svg');
    });
  });

  it('should disable delete button for paid bounties', async () => {
    (useIsMobile as jest.Mock).mockReturnValue(true);
    uiStore.setMeInfo(user);

    jest.spyOn(mainStore, 'getBountyById').mockReturnValue(
      Promise.resolve([
        {
          ...newBounty,
          person: { ...newBounty.person, owner_alias: user.alias },
          body: {
            ...mockBountiesMutated[1].body,
            owner: user,
            paid: true
          }
        }
      ])
    );
    jest.spyOn(mainStore, 'getBountyIndexById').mockReturnValue(Promise.resolve(1234));

    const App = withCreateModal(() => (
      <div>
        <div id="modal-root" />
        <MemoryRouter initialEntries={['/bounty/1234']}>
          <Route path="/bounty/:bountyId" component={TicketModalPage} />
        </MemoryRouter>
      </div>
    ));

    await act(async () => {
      const { queryAllByText } = render(<App />);
      expect(queryAllByText('Delete').length).toBe(0);
    });
  });

  it('should allow owner to mark the bounty as unpaid', async () => {
    (useIsMobile as jest.Mock).mockReturnValue(true);
    uiStore.setMeInfo(user);

    jest.spyOn(mainStore, 'getBountyById').mockReturnValue(
      Promise.resolve([
        {
          ...newBounty,
          person: { ...user },
          body: {
            ...mockBountiesMutated[1].body,
            owner: user,
            paid: true,
            assignee: user
          }
        }
      ])
    );
    jest.spyOn(mainStore, 'getBountyIndexById').mockReturnValue(Promise.resolve(1234));
    jest.spyOn(mainStore, 'updateBountyPaymentStatus').mockReturnValue(Promise.resolve(1234));

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

      await waitFor(() => getByText(unpaidString));

      fireEvent.click(getByText(unpaidString));

      await waitFor(() => {
        expect(mainStore.updateBountyPaymentStatus).toHaveBeenCalled();
      });
    });
  });

  it('test that if a bounty is open and I am the creator of the bounty, I should be able to invite a bounty hunter', async () => {
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
    jest.spyOn(mainStore, 'saveBounty').mockResolvedValue();

    await act(async () => {
      const { getByText } = render(
        <MemoryRouter initialEntries={['/bounty/1234']}>
          <Route path="/bounty/:bountyId" component={TicketModalPage} />
        </MemoryRouter>
      );

      await waitFor(() => getByText('Not Assigned'));
      fireEvent.click(getByText('Not Assigned'));

      await waitFor(() => {
        expect(getByText('Assign Developer')).toBeInTheDocument();
      });
    });
  });

  it('test that when I invite a new hunter, the hunter should be the assignee for that bounty', async () => {
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
    jest.spyOn(mainStore, 'saveBounty').mockResolvedValue();
    jest.spyOn(mainStore, 'getPeopleByNameAliasPubkey').mockResolvedValue(
      Promise.resolve([
        {
          id: 1,
          owner_alias: 'TEST_NAME_1',
          extras: {
            coding_languages: [
              { value: 'R', label: 'R' },
              { value: 'C++', label: 'C++' }
            ]
          }
        } as any
      ])
    );

    await act(async () => {
      const { getByText } = render(
        <MemoryRouter initialEntries={['/bounty/1234']}>
          <Route path="/bounty/:bountyId" component={TicketModalPage} />
        </MemoryRouter>
      );

      await waitFor(() => getByText('Not Assigned'));
      fireEvent.click(getByText('Not Assigned'));
      await waitFor(() => {
        expect(getByText('Assign Developer')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByPlaceholderText('Type to search ...'));
      await userEvent.type(screen.getByPlaceholderText('Type to search ...'), 'TEST_NAME');

      await waitFor(() => getByText('TEST_NAME_1'));

      fireEvent.click(screen.getAllByText('Assign')[0]);

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

      await waitFor(() => {
        expect(screen.queryByText('Assign Developer')).toBe(null);
        expect(mainStore.saveBounty).toHaveBeenCalled();
        expect(mainStore.getBountyById).toHaveBeenCalled();
      });

      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('TEST_NAME_1')).toBeInTheDocument();
    });
  });

  it('test that the creator of a bounty can click on the Edit Bounty, and the Edit Modal should pop up', async () => {
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
    jest.spyOn(mainStore, 'saveBounty').mockResolvedValue();

    await act(async () => {
      const { getByText, getByTestId } = render(
        <MemoryRouter initialEntries={['/bounty/1234']}>
          <Route path="/bounty/:bountyId" component={TicketModalPage} />
        </MemoryRouter>
      );

      await waitFor(() => getByText('Edit'));
      fireEvent.click(getByText('Edit'));
      await waitFor(() => getByText('Edit Bounty'));
      expect(getByText('Edit Bounty')).toBeInTheDocument();
      expect(getByText('Save')).toBeInTheDocument();
      expect(getByText('Cancel')).toBeInTheDocument();
      expect(getByTestId('testid-modal')).toBeInTheDocument();
    });
  });

  it('test that when I click Save on the Edit Modal, an Edit action is carried out.', async () => {
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
    jest.spyOn(mainStore, 'saveBounty').mockResolvedValue();

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

      expect(getByText('Save')).toBeInTheDocument();
      fireEvent.click(getByText('Save'));

      await waitFor(() => getByText('Edit'));

      await waitFor(() => {
        expect(mainStore.saveBounty).toHaveBeenCalled();
      });
    });
  });

  it('test that when I click on Cancel on the Edit Modal, it hides the Edit Modal and shows the Bounty Modal', async () => {
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
      const { getByText, queryByText } = render(
        <MemoryRouter initialEntries={['/bounty/1234']}>
          <Route path="/bounty/:bountyId" component={TicketModalPage} />
        </MemoryRouter>
      );

      await waitFor(() => getByText('Edit'));
      fireEvent.click(getByText('Edit'));
      await waitFor(() => getByText('Edit Bounty'));
      fireEvent.click(getByText('Cancel'));
      await waitFor(() => getByText('Edit'));
      expect(queryByText('Edit Bounty')).not.toBeInTheDocument();
      expect(queryByText('Edit')).toBeInTheDocument();
    });
  });

  it('should display left and right arrows in bounty modal', async () => {
    jest
      .spyOn(mainStore, 'getBountyById')
      .mockReturnValue(Promise.resolve([{ ...newBounty, body: { assignee: user } }]));
    jest.spyOn(mainStore, 'getBountyIndexById').mockReturnValue(Promise.resolve(1239));

    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/bounty/1234']}>
          <Route path="/bounty/:bountyId" component={TicketModalPage} />
        </MemoryRouter>
      );

      await waitFor(() => screen.getByText('chevron_right'));
      await waitFor(() => screen.getByText('chevron_left'));

      expect(screen.getByText('chevron_right')).toBeInTheDocument();
      expect(screen.getByText('chevron_left')).toBeInTheDocument();
    });
  });

  it('checks for enabled state of the delete button based on no assignment status', async () => {
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
    jest.spyOn(mainStore, 'getBountyIndexById').mockReturnValue(Promise.resolve(1445));
    jest.spyOn(helpers, 'userCanManageBounty').mockResolvedValue(true);

    await act(async () => {
      const { getByText, getByTestId } = render(
        <MemoryRouter initialEntries={['/bounty/1445']}>
          <Route path="/bounty/:bountyId" component={TicketModalPage} />
        </MemoryRouter>
      );

      await waitFor(() => expect(getByTestId('testid-modal')).toBeInTheDocument());
      expect(getByText('Delete')).toBeEnabled();
    });
  });
});

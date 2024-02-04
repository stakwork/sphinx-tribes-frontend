import '@testing-library/jest-dom';
import { act, render, waitFor, fireEvent, screen } from '@testing-library/react';
import { user } from '__test__/__mockData__/user';
import { mockBountiesMutated, newBounty } from 'bounties/__mock__/mockBounties.data';
import { formatSat } from 'helpers';
import React from 'react';
import { MemoryRouter, Route } from 'react-router-dom';
import { mainStore } from 'store/main';
import { useIsMobile } from 'hooks';
import { useStores } from 'store';
import { TicketModalPage } from '../TicketModalPage';

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
    pathname: '/bounty/1231',
    search: '',
    state: {}
  }),
  useParams: () => ({
    uuid: 'ck95pe04nncjnaefo08g',
    bountyId: '1231'
  })
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () =>
      Promise.resolve({ body: 'This is a detailed description of a GitHub issue or pull request.' })
  } as Response)
);

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

  it('reder ticket modal', async () => {
    jest
      .spyOn(mainStore, 'getBountyById')
      .mockReturnValue(Promise.resolve([{ ...newBounty, body: { assignee: user } }]));
    jest.spyOn(mainStore, 'getBountyIndexById').mockReturnValue(Promise.resolve(1231));
    await act(async () => {
      const { getByTestId } = render(
        <MemoryRouter initialEntries={['/bounty/1231']}>
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
    jest.spyOn(mainStore, 'getBountyIndexById').mockReturnValue(Promise.resolve(1231));
    await act(async () => {
      const { getByAltText, getByText } = render(
        <MemoryRouter initialEntries={['/bounty/1231']}>
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
    jest.spyOn(mainStore, 'getBountyIndexById').mockReturnValue(Promise.resolve(1231));
    await act(async () => {
      const { getByText } = render(
        <MemoryRouter initialEntries={['/bounty/1231']}>
          <Route path="/bounty/:bountyId" component={TicketModalPage} />
        </MemoryRouter>
      );

      await waitFor(() => getByText('I can help'));

      expect(getByText('I can help')).toBeInTheDocument();
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
    jest.spyOn(mainStore, 'getBountyIndexById').mockReturnValue(Promise.resolve(1231));
    await act(async () => {
      const { getByText } = render(
        <MemoryRouter initialEntries={['/bounty/1231']}>
          <Route path="/bounty/:bountyId" component={TicketModalPage} />
        </MemoryRouter>
      );

      await waitFor(() => getByText(mockBountiesMutated[1].body.title));
      expect(getByText(mockBountiesMutated[1].body.title)).toBeInTheDocument();
      expect(getByText(mockBountiesMutated[1].body.description)).toBeInTheDocument();
      expect(getByText(formatSat(Number(mockBountiesMutated[1].body.price)))).toBeInTheDocument();
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

  it('renders bounty title, description, estimated hours, and sats', async () => {
    const mockBountyDetails = {
      ...newBounty,
      body: {
        ...mockBountiesMutated[0].body,
        assignee: user
      }
    };

    jest.spyOn(mainStore, 'getBountyById').mockResolvedValue([mockBountyDetails]);
    jest.spyOn(mainStore, 'getBountyIndexById').mockResolvedValue(1231);

    await act(async () => {
      const { getByText } = render(
        <MemoryRouter initialEntries={['/bounty/1231']}>
          <Route path="/bounty/:bountyId" component={TicketModalPage} />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(getByText(mockBountyDetails.body.title)).toBeInTheDocument();
        expect(getByText(mockBountyDetails.body.description)).toBeInTheDocument();
        expect(getByText(formatSat(Number(mockBountyDetails.body.price)))).toBeInTheDocument();
      });
    });
  });

  it('pulls bounty description from GitHub if a github_link is present', async () => {
    const mockBountyWithGitHubLink = {
      ...newBounty,
      github_link: 'https://api.github.com/repos/owner/repo/issues/1'
    };

    jest.spyOn(mainStore, 'getBountyById').mockResolvedValue([mockBountyWithGitHubLink]);
    jest.spyOn(mainStore, 'getBountyIndexById').mockResolvedValue(1231);

    await act(async () => {
      const { getByText } = render(
        <MemoryRouter initialEntries={['/bounty/1231']}>
          <Route path="/bounty/:bountyId" component={TicketModalPage} />
        </MemoryRouter>
      );

      await waitFor(() =>
        expect(
          getByText('This is a detailed description of a GitHub issue or pull request.')
        ).toBeInTheDocument()
      );
    });
  });
});

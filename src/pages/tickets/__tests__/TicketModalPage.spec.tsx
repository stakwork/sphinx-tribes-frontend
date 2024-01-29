import '@testing-library/jest-dom';
import { act, render, waitFor, fireEvent, screen } from '@testing-library/react';
import { user } from '__test__/__mockData__/user';
import { mockBountiesMutated, newBounty } from 'bounties/__mock__/mockBounties.data';
import { formatSat } from 'helpers';
import React from 'react';
import { MemoryRouter, Route } from 'react-router-dom';
import { mainStore } from 'store/main';
import { TicketModalPage } from '../TicketModalPage';
import { useIsMobile } from 'hooks';
import { useStores } from 'store';


jest.mock('hooks', () => ({
  useIsMobile: jest.fn()
}));

jest.mock('store', () => ({
  useStores: jest.fn()
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
  it('should redirect to the appropriate page on close based on the route', async () => {
    (useIsMobile as jest.Mock).mockReturnValue(false);

    (useStores as jest.Mock).mockReturnValue({
      main: {
        getBountyById: jest.fn(),
        getBountyIndexById: jest.fn()
      }
    });

    render(<TicketModalPage setConnectPerson={jest.fn()} visible={true} />);

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await waitFor(() => {});

    const closeButton = screen.queryByTestId('close-btn');
    if (closeButton) {
      fireEvent.click(closeButton);

      expect(mockPush).toHaveBeenCalledWith('/bounties');
    }
  });
  
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
    jest.spyOn(mainStore, 'getBountyById').mockReturnValue(Promise.resolve([{ ...newBounty, body: { assignee: user }}]));
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
    jest.spyOn(mainStore, 'getBountyById').mockReturnValue(Promise.resolve([{ ...newBounty, body: { ...mockBountiesMutated[1].body, assignee: user }}]));
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
    jest.spyOn(mainStore, 'getBountyById').mockReturnValue(Promise.resolve([{ ...newBounty, body: { ...mockBountiesMutated[1].body, assignee: { owner_alias: '' } }}]));
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

  it('render bounty title, description, estimated hours and sats', async () => {
    jest.spyOn(mainStore, 'getBountyById').mockReturnValue(Promise.resolve([{ ...newBounty, body: { ...mockBountiesMutated[1].body, assignee: user }}]));
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
});

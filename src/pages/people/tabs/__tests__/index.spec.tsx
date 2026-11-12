import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, screen, render, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, useLocation } from 'react-router-dom';
import { usePerson } from 'hooks';
import { useStores } from 'store';
import { TabsPages } from '..';

jest.mock('hooks', () => ({
  useBrowserTabTitle: jest.fn(),
  useIsMobile: jest.fn(() => false),
  usePerson: jest.fn()
}));

jest.mock('store', () => ({
  useStores: jest.fn()
}));

jest.mock('people/widgetViews/RenderWidgets', () => ({
  __esModule: true,
  default: ({ widget }: { widget: string }) => <div data-testid={`widget-${widget}`} />
}));

jest.mock('../Wanted', () => ({
  Wanted: () => <div data-testid="wanted-widget" />
}));

describe('TabsPages Component', () => {
  const getBountyCount = jest.fn();

  const LocationDisplay = () => {
    const location = useLocation();
    return <div data-testid="current-location">{location.pathname}</div>;
  };

  const renderTabs = (initialEntry = '/p/1234/workspaces') =>
    render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <Route path="/p/:uuid/" component={TabsPages} />
        <Route path="*" component={LocationDisplay} />
      </MemoryRouter>
    );

  beforeEach(() => {
    jest.clearAllMocks();

    getBountyCount.mockImplementation((_personKey: string, name: string) =>
      Promise.resolve(name === 'assigned' ? 7 : 3)
    );

    (useStores as jest.Mock).mockReturnValue({
      main: {
        getBountyCount
      },
      ui: {
        selectedPerson: 1
      }
    });

    (usePerson as jest.Mock).mockReturnValue({
      person: {
        owner_pubkey: 'owner-pubkey',
        extras: {
          workspaces: [{ show: true }, { show: false }],
          badges: [{ show: true }]
        }
      },
      canEdit: false
    });
  });

  test('Test that clicking on the profile and view the title sections for org, badges, bounties, assigned', async () => {
    renderTabs();

    await waitFor(() => {
      expect(screen.getByText('Workspaces')).toBeInTheDocument();
      expect(screen.getByText('Badges')).toBeInTheDocument();
      expect(screen.getByText('Bounties')).toBeInTheDocument();
      expect(screen.getByText('Assigned Bounties')).toBeInTheDocument();
    });
  });

  test('renders bounties and assigned bounties counts from the selected profile', async () => {
    renderTabs('/p/1234/bounties');

    await waitFor(() => {
      expect(getBountyCount).toHaveBeenCalledWith('owner-pubkey', 'bounties');
      expect(getBountyCount).toHaveBeenCalledWith('owner-pubkey', 'assigned');
    });

    expect(within(screen.getByTestId('Bounties-tab')).getByText('3')).toBeInTheDocument();
    expect(within(screen.getByTestId('Assigned Bounties-tab')).getByText('7')).toBeInTheDocument();
  });

  test('updates the profile route when profile tabs are clicked', async () => {
    renderTabs();

    fireEvent.click(screen.getByTestId('Badges-tab'));
    await waitFor(() => {
      expect(screen.getByTestId('current-location')).toHaveTextContent('/badges');
    });

    fireEvent.click(screen.getByTestId('Bounties-tab'));
    await waitFor(() => {
      expect(screen.getByTestId('current-location')).toHaveTextContent('/bounties');
    });

    fireEvent.click(screen.getByTestId('Assigned Bounties-tab'));
    await waitFor(() => {
      expect(screen.getByTestId('current-location')).toHaveTextContent('/assigned');
    });
  });
});

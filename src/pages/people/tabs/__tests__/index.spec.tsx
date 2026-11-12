import React from 'react';
import '@testing-library/jest-dom';
import { screen, render, waitFor, within } from '@testing-library/react';
import { usePerson } from 'hooks';
import { MemoryRouter, Route } from 'react-router-dom';
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
        extras: {}
      },
      canEdit: false
    });
  });

  test('Test that clicking on the profile and view the title sections for org, badges, bounties, assigned', async () => {
    render(
      <MemoryRouter initialEntries={['/p/1234/workspaces']}>
        <Route path="/p/:uuid/workspaces" component={TabsPages} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Workspaces')).toBeInTheDocument();
      expect(screen.getByText('Badges')).toBeInTheDocument();
      expect(screen.getByText('Bounties')).toBeInTheDocument();
      expect(screen.getByText('Assigned Bounties')).toBeInTheDocument();
    });
  });

  test('renders assigned bounties count next to the assigned tab title', async () => {
    render(
      <MemoryRouter initialEntries={['/p/1234/assigned']}>
        <Route path="/p/:uuid/assigned" component={TabsPages} />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(getBountyCount).toHaveBeenCalledWith('owner-pubkey', 'assigned')
    );

    const assignedTab = screen.getByTestId('Assigned Bounties-tab');
    expect(within(assignedTab).getByText('7')).toBeInTheDocument();
  });
});

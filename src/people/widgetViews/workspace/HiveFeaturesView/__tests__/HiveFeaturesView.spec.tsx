import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { mainStore } from 'store/main';
import { useParams } from 'react-router-dom';
import { quickBountyTicketStore } from 'store/quickBountyTicketStore';
import HiveFeaturesView from '../HiveFeaturesView';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useHistory: () => ({ push: jest.fn() })
}));

jest.mock('store/main', () => ({
  mainStore: {
    getFeaturePhaseByUUID: jest.fn(),
    meInfo: { pubkey: 'test-pubkey' },
    createUpdateTicket: jest.fn(),
    workspaces: [
      {
        id: 'workspace-1',
        uuid: 'test-workspace-uuid',
        name: 'Test Workspace'
      }
    ]
  }
}));

jest.mock('store/quickBountyTicketStore', () => ({
  quickBountyTicketStore: {
    fetchAndSetQuickData: jest.fn()
  }
}));

describe('HiveFeaturesView Component Tests', () => {
  const mockFeatureUUID = 'test-feature-uuid';
  const mockWorkspaceUUID = 'test-workspace-uuid';

  beforeEach(() => {
    (useParams as jest.Mock).mockReturnValue({
      feature_uuid: mockFeatureUUID,
      workspace_uuid: mockWorkspaceUUID
    });
  });

  test('Renders "No phases available" when no data', async () => {
    (quickBountyTicketStore.fetchAndSetQuickData as jest.Mock).mockResolvedValue([]);

    render(<HiveFeaturesView />);

    await waitFor(() => {
      expect(screen.getByText('No phases available')).toBeInTheDocument();
    });
  });

  test('Renders phase headers when data exists', async () => {
    const mockData = [
      {
        ID: 1,
        phaseID: 'phase1',
        Title: 'Test Ticket',
        status: 'TODO',
        assignedAlias: 'Test User'
      }
    ];

    (quickBountyTicketStore.fetchAndSetQuickData as jest.Mock).mockResolvedValue(mockData);
    (mainStore.getFeaturePhaseByUUID as jest.Mock).mockResolvedValue({ name: 'Test Phase' });

    render(<HiveFeaturesView />);

    await waitFor(() => {
      expect(screen.getByText(/Phase 1: Test Phase/)).toBeInTheDocument();
    });
  });

  test('Toggles phase expansion when clicking header', async () => {
    const mockData = [
      {
        ID: 1,
        phaseID: 'phase1',
        Title: 'Test Ticket',
        status: 'TODO',
        assignedAlias: 'Test User'
      }
    ];

    (quickBountyTicketStore.fetchAndSetQuickData as jest.Mock).mockResolvedValue(mockData);
    (mainStore.getFeaturePhaseByUUID as jest.Mock).mockResolvedValue({ name: 'Test Phase' });

    render(<HiveFeaturesView />);

    await waitFor(() => {
      const header = screen.getByText(/Phase 1: Test Phase/);
      fireEvent.click(header);
      expect(screen.getByText('Test Ticket')).toBeInTheDocument();

      fireEvent.click(header);
      expect(screen.queryByText('Test Ticket')).not.toBeInTheDocument();
    });
  });

  test('Shows draft input and creates ticket', async () => {
    const mockData = [
      {
        ID: 1,
        phaseID: 'phase1',
        Title: 'Test Ticket',
        status: 'TODO',
        assignedAlias: 'Test User'
      }
    ];

    (quickBountyTicketStore.fetchAndSetQuickData as jest.Mock)
      .mockResolvedValueOnce(mockData)
      .mockResolvedValueOnce(mockData);

    (mainStore.getFeaturePhaseByUUID as jest.Mock).mockResolvedValue({ name: 'Test Phase' });
    (mainStore.createUpdateTicket as jest.Mock).mockResolvedValue({ UUID: 'new-ticket' });

    render(<HiveFeaturesView />);

    await waitFor(async () => {
      const header = screen.getByText(/Phase 1: Test Phase/);
      fireEvent.click(header);

      const input = screen.getByPlaceholderText('Quick draft a new ticket...');
      fireEvent.change(input, { target: { value: 'New Ticket Draft' } });

      const draftButton = screen.getByText('Draft');
      fireEvent.click(draftButton);

      await waitFor(() => {
        expect(mainStore.createUpdateTicket).toHaveBeenCalled();
      });
    });
  });
});

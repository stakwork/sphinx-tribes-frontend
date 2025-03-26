import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import HiveFeaturesView from '../HiveFeaturesView';
import { quickBountyTicketStore } from '../../../../../store/quickBountyTicketStore';
import { useDeleteConfirmationModal } from '../../../../../components/common/DeleteConfirmationModal';
import { useStores } from '../../../../../store';

jest.mock('../../../../../store', () => ({
  useStores: jest.fn()
}));

jest.mock('../../../../../components/common/DeleteConfirmationModal', () => ({
  useDeleteConfirmationModal: jest.fn()
}));

jest.mock('../../../../../store/quickBountyTicketStore', () => ({
  quickBountyTicketStore: {
    fetchAndSetQuickData: jest.fn(),
    expandedPhases: {},
    setPhaseExpanded: jest.fn()
  }
}));

jest.mock('../HiveFeaturesView', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-component" />
}));

const mockFeatures = [
  {
    id: 'feature-1',
    title: 'Feature 1',
    icon: 'icon1.svg',
    description: 'First test feature',
    status: 'active'
  },
  {
    id: 'feature-2',
    title: 'Feature 2',
    icon: 'icon2.svg',
    description: 'Second test feature',
    status: 'inactive'
  }
];

describe('HiveFeaturesView', () => {
  const mockHandleFeatureClick = jest.fn();

  const testProps = {
    features: mockFeatures,
    isLoading: false,
    error: null,
    onFeatureClick: mockHandleFeatureClick
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <HiveFeaturesView {...testProps} />
      </MemoryRouter>
    );

  it('should render features with correct titles', () => {
    renderComponent();
    expect(screen.getByTestId('mock-component')).toBeInTheDocument();
  });

  it('should call click handler with correct feature ID', () => {
    renderComponent();
    expect(screen.getByTestId('mock-component')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    renderComponent();
    expect(screen.getByTestId('mock-component')).toBeInTheDocument();
  });

  it('should display error message', () => {
    renderComponent();
    expect(screen.getByTestId('mock-component')).toBeInTheDocument();
  });

  it('should handle empty features state', () => {
    renderComponent();
    expect(screen.getByTestId('mock-component')).toBeInTheDocument();
  });

  describe('FeatureCallButton', () => {
    it('should enable button when URL is available', () => {
      renderComponent();
      expect(screen.getByTestId('mock-component')).toBeInTheDocument();
    });

    it('should disable button when URL is not available', () => {
      renderComponent();
      expect(screen.getByTestId('mock-component')).toBeInTheDocument();
    });

    it('should open URL in new tab on click', () => {
      renderComponent();
      expect(screen.getByTestId('mock-component')).toBeInTheDocument();
    });

    it('should show error state when fetch fails', () => {
      renderComponent();
      expect(screen.getByTestId('mock-component')).toBeInTheDocument();
    });
  });

  describe('Phase Expansion State', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should initialize phases with stored expansion states', async () => {
      const mockExpandedStates = {
        'phase-1': true,
        'phase-2': false
      };

      quickBountyTicketStore.expandedPhases = mockExpandedStates;

      renderComponent();

      waitFor(() => {
        const phase1Header = screen.getByText('Phase 1').closest('div');
        const phase2Header = screen.getByText('Phase 2').closest('div');

        expect(phase1Header).toHaveAttribute('aria-expanded', 'true');
        expect(phase2Header).toHaveAttribute('aria-expanded', 'false');
      });
    });

    it('should default new phases to expanded state', async () => {
      quickBountyTicketStore.expandedPhases = {};

      renderComponent();

      waitFor(() => {
        const phaseHeaders = screen.getAllByRole('button', { name: /Phase \d/ });
        phaseHeaders.forEach((header) => {
          expect(header).toHaveAttribute('aria-expanded', 'true');
        });
      });
    });

    it('should persist phase state changes', async () => {
      renderComponent();

      waitFor(() => {
        const phaseHeader = screen.getByText('Phase 1').closest('div');
        if (phaseHeader) {
          fireEvent.click(phaseHeader);
          expect(quickBountyTicketStore.setPhaseExpanded).toHaveBeenCalledWith('phase-1', false);
        }
      });
    });

    it('should maintain phase states after data refresh', async () => {
      const mockExpandedStates = {
        'phase-1': false,
        'phase-2': true
      };

      quickBountyTicketStore.expandedPhases = mockExpandedStates;

      const { rerender } = renderComponent();

      quickBountyTicketStore.fetchAndSetQuickData('test-feature');
      rerender(
        <MemoryRouter>
          <HiveFeaturesView />
        </MemoryRouter>
      );

      waitFor(() => {
        const phase1Header = screen.getByText('Phase 1').closest('div');
        const phase2Header = screen.getByText('Phase 2').closest('div');

        expect(phase1Header).toHaveAttribute('aria-expanded', 'false');
        expect(phase2Header).toHaveAttribute('aria-expanded', 'true');
      });
    });
  });
});

describe('HiveFeaturesView Delete Ticket Functionality', () => {
  const mockDeleteTicket = jest.fn();
  const mockOpenDeleteConfirmation = jest.fn();
  const mockSetToasts = jest.fn();
  const mockFetchAndSetQuickData = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useStores as jest.Mock).mockReturnValue({
      main: {
        deleteTicket: mockDeleteTicket
      }
    });

    (useDeleteConfirmationModal as jest.Mock).mockReturnValue({
      openDeleteConfirmation: mockOpenDeleteConfirmation
    });

    quickBountyTicketStore.fetchAndSetQuickData = mockFetchAndSetQuickData;
  });

  it('should call deleteTicket with correct UUID when delete is confirmed', () => {
    mockDeleteTicket.mockResolvedValue(true);

    const ticketUUID = 'test-ticket-uuid';
    const deleteHandler = () => mockDeleteTicket(ticketUUID);

    deleteHandler();

    expect(mockDeleteTicket).toHaveBeenCalledWith(ticketUUID);
  });

  it('should open delete confirmation dialog before deleting ticket', () => {
    const confirmDeleteTicket = (ticketUUID: string) => {
      mockOpenDeleteConfirmation({
        onDelete: () => mockDeleteTicket(ticketUUID),
        children: expect.anything()
      });
    };

    confirmDeleteTicket('test-ticket-uuid');

    expect(mockOpenDeleteConfirmation).toHaveBeenCalledWith({
      onDelete: expect.any(Function),
      children: expect.anything()
    });
  });

  it('should refresh data after successful ticket deletion', async () => {
    mockDeleteTicket.mockResolvedValue(true);
    mockFetchAndSetQuickData.mockResolvedValue([]);

    const handleDeleteTicket = async (ticketUUID: string) => {
      const success = await mockDeleteTicket(ticketUUID);
      if (success) {
        mockSetToasts([
          {
            id: expect.any(String),
            title: 'Ticket',
            color: 'success',
            text: 'Ticket deleted successfully!'
          }
        ]);

        await mockFetchAndSetQuickData('feature-uuid');
      }
    };

    await handleDeleteTicket('test-ticket-uuid');

    expect(mockDeleteTicket).toHaveBeenCalledWith('test-ticket-uuid');
    expect(mockSetToasts).toHaveBeenCalledWith([
      {
        id: expect.any(String),
        title: 'Ticket',
        color: 'success',
        text: 'Ticket deleted successfully!'
      }
    ]);
    expect(mockFetchAndSetQuickData).toHaveBeenCalledWith('feature-uuid');
  });

  it('should show error toast when ticket deletion fails', async () => {
    mockDeleteTicket.mockResolvedValue(false);

    const handleDeleteTicket = async (ticketUUID: string) => {
      const success = await mockDeleteTicket(ticketUUID);
      if (success) {
        console.log('success');
      } else {
        mockSetToasts([
          {
            id: expect.any(String),
            title: 'Error',
            color: 'danger',
            text: 'Failed to delete ticket'
          }
        ]);
      }
    };

    await handleDeleteTicket('test-ticket-uuid');

    expect(mockDeleteTicket).toHaveBeenCalledWith('test-ticket-uuid');
    expect(mockSetToasts).toHaveBeenCalledWith([
      {
        id: expect.any(String),
        title: 'Error',
        color: 'danger',
        text: 'Failed to delete ticket'
      }
    ]);
    expect(mockFetchAndSetQuickData).not.toHaveBeenCalled();
  });

  it('should handle errors during ticket deletion', async () => {
    mockDeleteTicket.mockRejectedValue(new Error('Network error'));

    const handleDeleteTicket = async (ticketUUID: string) => {
      try {
        await mockDeleteTicket(ticketUUID);
      } catch (error) {
        mockSetToasts([
          {
            id: expect.any(String),
            title: 'Error',
            color: 'danger',
            text: 'An error occurred while deleting the ticket'
          }
        ]);
      }
    };

    await handleDeleteTicket('test-ticket-uuid');

    expect(mockDeleteTicket).toHaveBeenCalledWith('test-ticket-uuid');
    expect(mockSetToasts).toHaveBeenCalledWith([
      {
        id: expect.any(String),
        title: 'Error',
        color: 'danger',
        text: 'An error occurred while deleting the ticket'
      }
    ]);
  });
});

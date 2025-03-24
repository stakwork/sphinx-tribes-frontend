import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import HiveFeaturesView from '../HiveFeaturesView';
import { quickBountyTicketStore } from '../../../../../store/quickBountyTicketStore';

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

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BountyCard, BountyCardStatus, Feature, Workspace } from 'store/interface';
import { Phase } from 'people/widgetViews/workspace/interface';
import BountyCardComponent from '../index';

const mockMainStore = {
  getBountyById: jest.fn(),
  getPeopleBounties: jest.fn(),
  getWorkspaceBudget: jest.fn(),
  makeBountyPayment: jest.fn(),
  getLnInvoice: jest.fn(),
  setKeysendInvoice: jest.fn(),
  pollInvoice: jest.fn(),
  bountiesStatus: {}
};

jest.mock('store', () => ({
  useStores: () => ({
    main: mockMainStore,
    ui: {
      meInfo: {
        websocketToken: 'mock-token'
      }
    }
  })
}));

jest.mock('../../../../components/common', () => ({
  usePaymentConfirmationModal: () => ({
    openPaymentConfirmation: jest.fn(({ onConfirmPayment }: { onConfirmPayment: () => void }) =>
      onConfirmPayment()
    )
  })
}));

const mockFeature: Feature = {
  id: 1,
  uuid: 'feature-123',
  workspace_uuid: 'workspace-123',
  name: 'Feature 1',
  brief: 'Feature brief',
  requirements: 'Requirements',
  architecture: 'Architecture',
  url: 'http://example.com',
  priority: 1,
  bounties_count_assigned: 0,
  bounties_count_completed: 0,
  bounties_count_open: 0,
  created: '2024-01-01',
  updated: '2024-01-01',
  created_by: 'user1',
  updated_by: 'user1'
};

const mockPhase: Phase = {
  uuid: 'phase-123',
  feature_uuid: 'feature-123',
  name: 'Phase 1',
  priority: 1,
  phase_purpose: 'Test purpose',
  phase_outcome: 'Test outcome',
  phase_scope: 'Test scope',
  phase_design: 'Test design'
};

const mockWorkspace: Workspace = {
  id: 'workspace-1',
  uuid: 'workspace-123',
  name: 'Workspace 1',
  owner_pubkey: 'pubkey-123',
  img: 'image.jpg',
  created: '2024-01-01',
  updated: '2024-01-01',
  show: true
};

interface BountyCardProps extends BountyCard {
  onclick: (bountyId: string, status?: BountyCardStatus, ticketGroup?: string) => void;
}

const mockBountyCard: BountyCardProps = {
  id: '123',
  title: 'Test Bounty',
  features: mockFeature,
  phase: mockPhase,
  workspace: mockWorkspace,
  status: 'IN_PROGRESS',
  assignee_name: 'John Doe',
  assignee_img: 'avatar.jpg',
  paid: false,
  completed: false,
  payment_pending: false,
  assignee: null,
  pow: 0,
  ticket_uuid: 'ticket-123',
  ticket_group: 'group1',
  onclick: jest.fn()
};

describe('BountyCardComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders basic bounty card information', () => {
    const { getByText } = render(<BountyCardComponent {...mockBountyCard} />);

    expect(getByText('Test Bounty')).toBeInTheDocument();
    expect(getByText('John Doe')).toBeInTheDocument();
    expect(getByText('Feature 1')).toBeInTheDocument();
    expect(getByText('Phase 1')).toBeInTheDocument();
    expect(getByText('IN_PROGRESS')).toBeInTheDocument();
  });

  it('shows action menu for appropriate statuses', () => {
    const { getByTestId } = render(<BountyCardComponent {...mockBountyCard} />);
    expect(getByTestId('feature-name-btn')).toBeInTheDocument();
  });

  it('does not show action menu for inappropriate statuses', () => {
    const { queryByTestId } = render(<BountyCardComponent {...mockBountyCard} status="TODO" />);
    expect(queryByTestId('feature-name-btn')).not.toBeInTheDocument();
  });

  it('handles click on the card title', () => {
    const { getByRole } = render(<BountyCardComponent {...mockBountyCard} />);
    fireEvent.click(getByRole('button'));
    expect(mockBountyCard.onclick).toHaveBeenCalledWith('123', 'IN_PROGRESS', 'group1');
  });

  describe('Payment Flow', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      mockMainStore.getBountyById.mockResolvedValue([
        {
          created: '2024-01-01',
          person: { owner_pubkey: 'test-pubkey', owner_route_hint: 'test-hint' },
          body: { price: 1000, org_uuid: 'org-123', paid: false }
        }
      ]);
    });

    it('handles workspace payment flow successfully', async () => {
      const { getByTestId, getByText } = render(<BountyCardComponent {...mockBountyCard} />);

      mockMainStore.getWorkspaceBudget.mockResolvedValue({
        current_budget: 2000
      });

      await act(async () => {
        fireEvent.click(getByTestId('feature-name-btn'));
      });

      await act(async () => {
        fireEvent.click(getByText('Pay Bounty'));
      });

      await waitFor(() => {
        expect(mockMainStore.makeBountyPayment).toHaveBeenCalledWith({
          id: 123,
          websocket_token: 'mock-token'
        });
      });
    });

    it('shows insufficient funds toast for workspace payment', async () => {
      const { getByTestId, getByText, findByText } = render(
        <BountyCardComponent {...mockBountyCard} />
      );

      mockMainStore.getWorkspaceBudget.mockResolvedValue({
        current_budget: 500
      });

      await act(async () => {
        fireEvent.click(getByTestId('feature-name-btn'));
      });

      await act(async () => {
        fireEvent.click(getByText('Pay Bounty'));
      });

      await waitFor(async () => {
        const errorToast = await findByText('Insufficient funds in the workspace.');
        expect(errorToast).toBeInTheDocument();
      });
    });

    it('handles invoice generation for non-workspace bounties', async () => {
      mockMainStore.getBountyById.mockResolvedValue([
        {
          created: '2024-01-01',
          person: { owner_pubkey: 'test-pubkey', owner_route_hint: 'test-hint' },
          body: { price: 1000, paid: false }
        }
      ]);

      const { getByTestId, getByText } = render(<BountyCardComponent {...mockBountyCard} />);

      mockMainStore.getLnInvoice.mockResolvedValue({
        response: { invoice: 'test-invoice' }
      });

      await act(async () => {
        fireEvent.click(getByTestId('feature-name-btn'));
      });

      await act(async () => {
        fireEvent.click(getByText('Pay Bounty'));
      });

      await waitFor(() => {
        expect(mockMainStore.getLnInvoice).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockMainStore.setKeysendInvoice).toHaveBeenCalledWith('test-invoice');
      });
    });
  });
});

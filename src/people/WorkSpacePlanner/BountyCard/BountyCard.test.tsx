import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BountyCardStatus, Feature } from 'store/interface';
import { Workspace } from 'store/interface';
import '@testing-library/jest-dom/extend-expect';
import { Phase } from 'people/widgetViews/workspace/interface';
import React from 'react';
import { useStores } from 'store';
import BountyCardComponent from '.';

jest.mock('store', () => ({
  useStores: jest.fn()
}));

jest.mock('components/common', () => {
  const React = require('react');

  return {
    PaymentConfirmationModal: ({ onClose, onConfirmPayment }: any) =>
      React.createElement(
        'div',
        { 'data-testid': 'payment-confirmation-modal' },
        React.createElement('button', { onClick: onClose }, 'Cancel'),
        React.createElement('button', { onClick: onConfirmPayment }, 'Confirm')
      )
  };
});

jest.mock('@elastic/eui', () => {
  const React = require('react');

  return {
    EuiGlobalToastList: ({ toasts }: any) =>
      React.createElement(
        'div',
        { 'data-testid': 'toast-list' },
        toasts.map((toast: any) =>
          React.createElement('div', { key: toast.id }, toast.title)
        )
      )
  };
});

const mockFeature: Feature = {
  id: 2,
  uuid: 'feat-456',
  workspace_uuid: 'ws-789',
  name: 'Marketing Campaign',
  brief: 'Promotional materials',
  requirements: 'Social media assets',
  architecture: 'Cloud storage',
  url: 'http://campaign.example',
  priority: 2,
  bounties_count_assigned: 1,
  bounties_count_completed: 0,
  bounties_count_open: 2,
  created: '2024-02-15',
  updated: '2024-02-20',
  created_by: 'user2',
  updated_by: 'user2'
};

const mockPhase: Phase = {
  uuid: 'phase-456',
  feature_uuid: 'feat-456',
  name: 'Design Phase',
  priority: 2,
  phase_purpose: 'Create visual assets',
  phase_outcome: 'Brand guidelines',
  phase_scope: 'Graphic design',
  phase_design: 'Figma prototypes'
};

const mockWorkspace: Workspace = {
  id: 'workspace-2',
  uuid: 'ws-789',
  name: 'Creative Team',
  owner_pubkey: 'pubkey-456',
  img: 'creative.jpg',
  created: '2024-01-15',
  updated: '2024-02-01',
  show: true
};

const mockBountyCard = {
  id: '456',
  title: 'Social Media Assets',
  features: mockFeature,
  phase: mockPhase,
  workspace: mockWorkspace,
  status: 'completed' as BountyCardStatus,
  assignee_name: 'Alice Smith',
  assignee_img: 'avatar2.jpg',
  paid: false,
  completed: true,
  payment_pending: false,
  assignee: null,
  pow: 0,
  ticket_uuid: 'ticket-456',
  ticket_group: 'group2',
  onclick: jest.fn()
};

describe('BountyCardComponent', () => {
  const getBountyById = jest.fn();
  const getWorkspaceBudget = jest.fn();
  const makeBountyPayment = jest.fn();
  const pollInvoice = jest.fn();
  const getLnInvoice = jest.fn();
  const setKeysendInvoice = jest.fn();
  const onPayBounty = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    getBountyById.mockResolvedValue([
      {
        created: '2024-02-15',
        person: {
          owner_pubkey: 'hunter-pubkey',
          owner_route_hint: 'hunter-route'
        }
      }
    ]);
    getWorkspaceBudget.mockResolvedValue({ current_budget: 1000 });
    makeBountyPayment.mockResolvedValue({});

    (useStores as jest.Mock).mockReturnValue({
      ui: {
        meInfo: {
          websocketToken: 'socket-token'
        }
      },
      main: {
        getBountyById,
        getWorkspaceBudget,
        makeBountyPayment,
        pollInvoice,
        getLnInvoice,
        setKeysendInvoice
      }
    });
  });

  it('displays all core bounty information correctly', () => {
    const { getByText } = render(<BountyCardComponent {...mockBountyCard} status="COMPLETED" />);

    expect(getByText('Social Media Assets')).toBeInTheDocument();
    expect(getByText('Alice Smith')).toBeInTheDocument();
  });

  it('hides action menu for non-actionable statuses', () => {
    const { queryByTestId } = render(<BountyCardComponent {...mockBountyCard} />);
    expect(queryByTestId('feature-name-btn')).not.toBeInTheDocument();
  });

  it('opens payment confirmation from the Pay Bounty action', async () => {
    render(
      <BountyCardComponent
        {...mockBountyCard}
        status="COMPLETED"
        bounty_price={500}
        onPayBounty={onPayBounty}
      />
    );

    fireEvent.click(screen.getByText('Pay Bounty'));

    expect(screen.getByTestId('payment-confirmation-modal')).toBeInTheDocument();
  });

  it('pays through the organization when workspace budget covers the bounty price', async () => {
    render(
      <BountyCardComponent
        {...mockBountyCard}
        status="COMPLETED"
        bounty_price={500}
        onPayBounty={onPayBounty}
      />
    );

    fireEvent.click(screen.getByText('Pay Bounty'));
    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(getWorkspaceBudget).toHaveBeenCalledWith('ws-789');
      expect(makeBountyPayment).toHaveBeenCalledWith({
        id: 456,
        websocket_token: 'socket-token'
      });
      expect(onPayBounty).toHaveBeenCalledWith('456');
    });

    expect(screen.getByText('Paid successfully')).toBeInTheDocument();
  });

  it('shows an insufficient funds error when organization budget is too low', async () => {
    getWorkspaceBudget.mockResolvedValue({ current_budget: 100 });

    render(
      <BountyCardComponent
        {...mockBountyCard}
        status="COMPLETED"
        bounty_price={500}
        onPayBounty={onPayBounty}
      />
    );

    fireEvent.click(screen.getByText('Pay Bounty'));
    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(getWorkspaceBudget).toHaveBeenCalledWith('ws-789');
      expect(makeBountyPayment).not.toHaveBeenCalled();
    });

    expect(screen.getByText('Insufficient funds in the workspace.')).toBeInTheDocument();
  });
});

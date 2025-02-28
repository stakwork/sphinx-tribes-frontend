import { render } from '@testing-library/react';
import { BountyCardStatus, Feature } from 'store/interface';
import { Workspace } from 'store/interface';
import '@testing-library/jest-dom/extend-expect';
import { Phase } from 'people/widgetViews/workspace/interface';
import React from 'react';
import BountyCardComponent from '.';

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
  beforeEach(() => {
    jest.clearAllMocks();
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
});

import { render, screen, fireEvent } from '@testing-library/react';
import { Feature } from 'store/interface';
import { Workspace } from 'store/interface';
import '@testing-library/jest-dom/extend-expect';
import { Phase } from 'people/widgetViews/workspace/interface';
import React from 'react';
import BountyCardComponent from '.';

const mockFeature: Feature = {
  id: 1,
  uuid: 'feature-123',
  name: 'Test Feature',
  workspace_uuid: 'ws-123',
  brief: 'Test brief',
  requirements: 'Test requirements',
  architecture: 'Test architecture',
  status: 'active',
  priority: 1
} as unknown as Feature;

const mockPhase: Phase = {
  id: 1,
  uuid: 'phase-123',
  name: 'Test Phase',
  workspace_uuid: 'ws-123'
} as unknown as Phase;

const mockWorkspace: Workspace = {
  id: '1',
  uuid: 'ws-123',
  name: 'Test Workspace',
  owner_pubkey: 'testkey',
  img: 'test.jpg'
} as unknown as Workspace;

describe('BountyCardComponent', () => {
  const mockOnClick = jest.fn();
  const mockOnPay = jest.fn();

  beforeEach(() => {
    render(
      <BountyCardComponent
        id="123"
        title="Test Bounty"
        bounty_price={100}
        features={mockFeature}
        phase={mockPhase}
        workspace={mockWorkspace}
        status="COMPLETED"
        onclick={mockOnClick}
        onPayBounty={mockOnPay}
      />
    );
  });

  it('should show action menu for COMPLETED status', () => {
    expect(screen.getByTestId('action-menu-button')).toBeInTheDocument();
  });

  it('should open payment confirmation when clicking Pay Bounty', async () => {
    fireEvent.click(screen.getByTestId('action-menu-button'));
    fireEvent.click(screen.getByText('1. Pay Bounty'));

    expect(screen.getByText('Are you sure you want to')).toBeInTheDocument();
    expect(screen.getByText('Pay this Bounty?')).toBeInTheDocument();
  });
});

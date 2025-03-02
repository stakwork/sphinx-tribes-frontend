import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Author, TicketStatus } from 'store/interface';
import TicketEditor from './TicketEditor';

describe('TicketEditor Thinking/Speed Toggle', () => {
  const mockTicketData = {
    uuid: 'test-uuid',
    name: 'Test Ticket',
    sequence: 1,
    dependency: [],
    description: 'Test Description',
    status: 'DRAFT' as TicketStatus,
    version: 1,
    feature_uuid: 'feature-uuid',
    phase_uuid: 'phase-uuid',
    category: 'Web development',
    amount: 0,
    ticket_group: 'group-uuid',
    author: 'HUMAN' as Author,
    author_id: '123'
  };

  const defaultProps = {
    ticketData: mockTicketData,
    logs: [],
    websocketSessionId: 'session-id',
    draggableId: 'draggable-id',
    hasInteractiveChildren: false,
    getPhaseTickets: jest.fn().mockResolvedValue([]),
    workspaceUUID: 'workspace-uuid'
  };

  beforeEach(() => {
    jest.clearAllMocks();

    document.querySelector = jest.fn().mockReturnValue({
      focus: jest.fn()
    });
  });

  test('renders toggle controls when feature flag is active', () => {
    waitFor(() => {
      render(<TicketEditor {...defaultProps} />);

      expect(screen.getByRole('radiogroup', { name: /toggle thinking mode/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /speed/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /thinking/i })).toBeInTheDocument();
    });
  });

  test('initializes with thinking mode selected by default', () => {
    waitFor(() => {
      render(<TicketEditor {...defaultProps} />);

      const thinkingButton = screen.getByRole('radio', { name: /thinking/i });
      const speedButton = screen.getByRole('radio', { name: /speed/i });

      expect(thinkingButton).toHaveAttribute('aria-checked', 'true');
      expect(speedButton).toHaveAttribute('aria-checked', 'false');
    });
  });

  test('allows mode switching via mouse clicks', () => {
    waitFor(() => {
      render(<TicketEditor {...defaultProps} />);

      const thinkingButton = screen.getByRole('radio', { name: /thinking/i });
      const speedButton = screen.getByRole('radio', { name: /speed/i });

      fireEvent.click(speedButton);
      expect(thinkingButton).toHaveAttribute('aria-checked', 'false');
      expect(speedButton).toHaveAttribute('aria-checked', 'true');

      fireEvent.click(thinkingButton);
      expect(thinkingButton).toHaveAttribute('aria-checked', 'true');
      expect(speedButton).toHaveAttribute('aria-checked', 'false');
    });
  });
});

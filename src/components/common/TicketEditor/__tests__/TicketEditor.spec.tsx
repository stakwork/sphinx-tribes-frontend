import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TicketEditor from '../TicketEditor';
import { useFeatureFlag } from '../../../../hooks/useFeatureFlag';
import { TicketStatus, Author } from '../../../../store/interface';

jest.mock('../../../../hooks/useFeatureFlag', () => ({
  useFeatureFlag: jest.fn()
}));

jest.mock('store', () => ({
  useStores: () => ({
    main: {
      createUpdateTicket: jest.fn().mockResolvedValue(200),
      sendTicketForReview: jest.fn().mockResolvedValue(true),
      deleteTicket: jest.fn().mockResolvedValue(true),
      getTicketsByGroup: jest.fn().mockResolvedValue([])
    }
  })
}));

jest.mock('store/snippetStore.ts', () => ({
  snippetStore: {
    loadSnippets: jest.fn(),
    getAllSnippets: jest.fn().mockReturnValue([])
  }
}));

jest.mock('store/workspace-ticket.ts', () => ({
  workspaceTicketStore: {
    getTicketsByGroup: jest.fn().mockReturnValue([]),
    getLatestVersionFromGroup: jest.fn().mockReturnValue({ version: 1 }),
    addTicket: jest.fn(),
    clearTickets: jest.fn()
  }
}));

jest.mock('../../../../store/phase', () => ({
  phaseTicketStore: {
    getLatestVersionFromGroup: jest.fn().mockReturnValue({ version: 1 }),
    getTicketsByGroup: jest.fn().mockReturnValue([]),
    getTicketByVersion: jest
      .fn()
      .mockReturnValue({ name: 'Test Ticket', description: 'Test Description' }),
    addTicket: jest.fn(),
    clearPhaseTickets: jest.fn()
  }
}));

jest.mock('../../../../store/ui', () => ({
  uiStore: {
    meInfo: { pubkey: '123', owner_alias: 'Test User' }
  }
}));

jest.mock('../../DeleteConfirmationModal', () => ({
  useDeleteConfirmationModal: () => ({
    openDeleteConfirmation: jest.fn()
  })
}));

jest.mock('../TicketTextArea.tsx', () => ({
  TicketTextAreaComp: () => <div data-testid="ticket-textarea">Mocked Text Area</div>
}));

jest.mock('people/utils/RenderMarkdown.tsx', () => ({
  renderMarkdown: (text: string) => <div data-testid="markdown-preview">{text}</div>
}));

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

  test('should not render toggle when feature flag is disabled', async () => {
    (useFeatureFlag as jest.Mock).mockReturnValue({ isEnabled: false });

    await waitFor(() => {
      render(<TicketEditor {...defaultProps} />);
    });

    expect(
      screen.queryByRole('radiogroup', { name: /toggle thinking mode/i })
    ).not.toBeInTheDocument();
  });

  test('should render toggle when feature flag is enabled', async () => {
    (useFeatureFlag as jest.Mock).mockReturnValue({ isEnabled: true });

    await waitFor(() => {
      render(<TicketEditor {...defaultProps} />);
    });

    expect(screen.getByRole('radiogroup', { name: /toggle thinking mode/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /speed/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /thinking/i })).toBeInTheDocument();
  });

  test('should default to thinking mode', async () => {
    (useFeatureFlag as jest.Mock).mockReturnValue({ isEnabled: true });

    await waitFor(() => {
      render(<TicketEditor {...defaultProps} />);
    });

    const thinkingButton = screen.getByRole('radio', { name: /thinking/i });
    const speedButton = screen.getByRole('radio', { name: /speed/i });

    expect(thinkingButton).toHaveAttribute('aria-checked', 'true');
    expect(speedButton).toHaveAttribute('aria-checked', 'false');
  });

  test('should toggle mode when clicking buttons', async () => {
    (useFeatureFlag as jest.Mock).mockReturnValue({ isEnabled: true });

    await waitFor(() => {
      render(<TicketEditor {...defaultProps} />);
    });

    const thinkingButton = screen.getByRole('radio', { name: /thinking/i });
    const speedButton = screen.getByRole('radio', { name: /speed/i });

    expect(thinkingButton).toHaveAttribute('aria-checked', 'true');
    expect(speedButton).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(speedButton);

    expect(thinkingButton).toHaveAttribute('aria-checked', 'false');
    expect(speedButton).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(thinkingButton);

    expect(thinkingButton).toHaveAttribute('aria-checked', 'true');
    expect(speedButton).toHaveAttribute('aria-checked', 'false');
  });

  test('should toggle mode with keyboard arrow keys', async () => {
    (useFeatureFlag as jest.Mock).mockReturnValue({ isEnabled: true });

    await waitFor(() => {
      render(<TicketEditor {...defaultProps} />);
    });

    const toggleContainer = screen.getByRole('radiogroup', { name: /toggle thinking mode/i });
    const thinkingButton = screen.getByRole('radio', { name: /thinking/i });
    const speedButton = screen.getByRole('radio', { name: /speed/i });

    expect(thinkingButton).toHaveAttribute('aria-checked', 'true');
    expect(speedButton).toHaveAttribute('aria-checked', 'false');

    (document.querySelector as jest.Mock).mockClear();

    fireEvent.keyDown(toggleContainer, { key: 'ArrowRight' });

    await waitFor(() => {
      expect(document.querySelector).toHaveBeenCalledWith('[role="radio"][aria-checked="true"]');
    });

    expect(thinkingButton).toHaveAttribute('aria-checked', 'false');
    expect(speedButton).toHaveAttribute('aria-checked', 'true');

    (document.querySelector as jest.Mock).mockClear();

    fireEvent.keyDown(toggleContainer, { key: 'ArrowLeft' });

    await waitFor(() => {
      expect(document.querySelector).toHaveBeenCalledWith('[role="radio"][aria-checked="true"]');
    });

    expect(thinkingButton).toHaveAttribute('aria-checked', 'true');
    expect(speedButton).toHaveAttribute('aria-checked', 'false');
  });

  test('should toggle mode with Enter key', async () => {
    (useFeatureFlag as jest.Mock).mockReturnValue({ isEnabled: true });

    await waitFor(() => {
      render(<TicketEditor {...defaultProps} />);
    });

    const toggleContainer = screen.getByRole('radiogroup', { name: /toggle thinking mode/i });
    const thinkingButton = screen.getByRole('radio', { name: /thinking/i });
    const speedButton = screen.getByRole('radio', { name: /speed/i });

    expect(thinkingButton).toHaveAttribute('aria-checked', 'true');
    expect(speedButton).toHaveAttribute('aria-checked', 'false');

    fireEvent.keyDown(toggleContainer, { key: 'Enter' });

    expect(thinkingButton).toHaveAttribute('aria-checked', 'false');
    expect(speedButton).toHaveAttribute('aria-checked', 'true');
  });

  test('should toggle mode with Space key', async () => {
    (useFeatureFlag as jest.Mock).mockReturnValue({ isEnabled: true });

    await waitFor(() => {
      render(<TicketEditor {...defaultProps} />);
    });

    const toggleContainer = screen.getByRole('radiogroup', { name: /toggle thinking mode/i });
    const thinkingButton = screen.getByRole('radio', { name: /thinking/i });
    const speedButton = screen.getByRole('radio', { name: /speed/i });

    expect(thinkingButton).toHaveAttribute('aria-checked', 'true');
    expect(speedButton).toHaveAttribute('aria-checked', 'false');

    fireEvent.keyDown(toggleContainer, { key: ' ' });

    expect(thinkingButton).toHaveAttribute('aria-checked', 'false');
    expect(speedButton).toHaveAttribute('aria-checked', 'true');
  });

  test('should prevent default on Enter and Space keys', async () => {
    (useFeatureFlag as jest.Mock).mockReturnValue({ isEnabled: true });

    await waitFor(() => {
      render(<TicketEditor {...defaultProps} />);
    });

    const toggleContainer = screen.getByRole('radiogroup', { name: /toggle thinking mode/i });

    const enterEvent = { key: 'Enter', preventDefault: jest.fn() };

    const enterDomEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    Object.defineProperty(enterDomEvent, 'preventDefault', {
      value: enterEvent.preventDefault,
      configurable: true
    });

    toggleContainer.dispatchEvent(enterDomEvent);

    await waitFor(() => {
      expect(enterEvent.preventDefault).toHaveBeenCalled();
    });

    const spaceEvent = { key: ' ', preventDefault: jest.fn() };
    const spaceDomEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
    Object.defineProperty(spaceDomEvent, 'preventDefault', {
      value: spaceEvent.preventDefault,
      configurable: true
    });

    toggleContainer.dispatchEvent(spaceDomEvent);

    await waitFor(() => {
      expect(spaceEvent.preventDefault).toHaveBeenCalled();
    });
  });

  test('should not respond to keyboard events when feature flag is disabled', async () => {
    (useFeatureFlag as jest.Mock).mockReturnValue({ isEnabled: false });

    await waitFor(() => {
      render(<TicketEditor {...defaultProps} />);
    });

    const container = screen.getByTestId('ticket-textarea').parentElement;

    if (container) {
      const keyEvent = {
        key: 'ArrowRight',
        preventDefault: jest.fn()
      };

      fireEvent.keyDown(container, keyEvent);

      expect(keyEvent.preventDefault).not.toHaveBeenCalled();
    }
  });
});

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { formatDistanceToNow } from 'date-fns';
import ChatStatusDisplay from '../ChatStatusDisplay';

jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn()
}));

describe('ChatStatusDisplay', () => {
  const mockFormatDistanceToNow = formatDistanceToNow as jest.MockedFunction<
    typeof formatDistanceToNow
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFormatDistanceToNow.mockReturnValue('less than a minute ago');
  });

  test('renders correctly with success status', () => {
    const chatStatus = {
      status: 'success',
      message: 'Agent workflow completed',
      updatedAt: '2023-06-15T10:30:00Z'
    };

    render(<ChatStatusDisplay chatStatus={chatStatus} />);

    waitFor(() => {
      expect(screen.getByText(/Hive:/)).toBeInTheDocument();
      expect(screen.getByText(/success - Agent workflow completed/)).toBeInTheDocument();
      expect(screen.getByText(/Last Update: less than a minute ago/)).toBeInTheDocument();

      const container = screen.getByText(/Hive:/).closest('div');
      expect(container).toHaveStyle('border: 1px solid #2196f3');
    });
  });

  test('renders correctly with error status', () => {
    const chatStatus = {
      status: 'error',
      message: 'An error occurred during the workflow',
      updatedAt: '2023-06-15T10:30:00Z'
    };

    render(<ChatStatusDisplay chatStatus={chatStatus} />);

    waitFor(() => {
      expect(screen.getByText(/Hive:/)).toBeInTheDocument();
      expect(screen.getByText(/error - An error occurred during the workflow/)).toBeInTheDocument();

      const container = screen.getByText(/Hive:/).closest('div');
      expect(container).toHaveStyle('border: 1px solid #e53935');
    });
  });

  test('renders with longs message text that wraps properly', () => {
    const chatStatus = {
      status: 'processing',
      message:
        'This is a very long message that should wrap properly within the container without causing any layout issues or text overflow problems in the user interface',
      updatedAt: '2023-06-15T10:30:00Z'
    };

    render(<ChatStatusDisplay chatStatus={chatStatus} />);

    waitFor(() => {
      expect(screen.getByText(/processing - This is a very long message/)).toBeInTheDocument();

      const textElement = screen
        .getByText(/processing - This is a very long message/)
        .closest('div');
      expect(textElement).toHaveStyle('word-wrap: break-word');
      expect(textElement).toHaveStyle('white-space: pre-wrap');
    });
  });

  test('renders with different time formats', () => {
    const chatStatus = {
      status: 'info',
      message: 'Status information',
      updatedAt: '2023-06-15T10:30:00Z'
    };

    mockFormatDistanceToNow.mockReturnValue('2 hours ago');

    render(<ChatStatusDisplay chatStatus={chatStatus} />);

    expect(screen.getByText(/Last Update: 2 hours ago/)).toBeInTheDocument();
  });

  test('does not render when chatStatus is null', () => {
    const { container } = render(<ChatStatusDisplay chatStatus={undefined as any} />);
    expect(container).toBeEmptyDOMElement();
  });

  test('renders with sticky positioning at the bottom', () => {
    const chatStatus = {
      status: 'success',
      message: 'Test message',
      updatedAt: '2023-06-15T10:30:00Z'
    };

    render(<ChatStatusDisplay chatStatus={chatStatus} />);

    waitFor(() => {
      const container = screen.getByText(/Hive:/).closest('div');
      expect(container).toHaveStyle('position: sticky');
      expect(container).toHaveStyle('bottom: 0');
    });
  });

  test('handles invalid date gracefully', () => {
    const chatStatus = {
      status: 'success',
      message: 'Test message',
      updatedAt: 'invalid-date'
    };

    mockFormatDistanceToNow.mockImplementation(() => {
      throw new Error('Invalid date');
    });

    waitFor(() => {
      expect(() => render(<ChatStatusDisplay chatStatus={chatStatus} />)).not.toThrow();
    });
  });
});

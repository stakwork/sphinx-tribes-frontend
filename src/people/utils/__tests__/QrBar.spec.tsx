import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import QrBar from '../QrBar';

describe('QrBar Component', () => {
  const mockExecCommand = jest.fn();
  document.execCommand = mockExecCommand;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly in non-simple mode', () => {
    render(<QrBar value="test123" simple={false} />);
    expect(screen.getByTestId('pubkey_user')).toBeInTheDocument();
    expect(screen.getByText('COPY')).toBeInTheDocument();
    expect(screen.getByText('qr_code_2')).toBeInTheDocument();
  });

  test('renders correctly in simple mode without QR icon', () => {
    render(<QrBar value="test123" simple={true} />);
    expect(screen.getByTestId('pubkey_user')).toBeInTheDocument();
    expect(screen.getByText('COPY')).toBeInTheDocument();
    expect(screen.queryByText('qr_code_2')).not.toBeInTheDocument();
  });

  test('formats long value correctly (> 23 characters)', () => {
    const longValue = '1234567890123456789012345678901234567890';
    render(<QrBar value={longValue} simple={false} />);
    expect(screen.getByTestId('pubkey_user')).toHaveTextContent('12345678901234567890123...');
  });

  test('displays short value without formatting (< 23 characters)', () => {
    const shortValue = '12345';
    render(<QrBar value={shortValue} simple={false} />);
    expect(screen.getByTestId('pubkey_user')).toHaveTextContent('12345...');
  });

  test('handles empty string value', () => {
    render(<QrBar value="" simple={false} />);
    expect(screen.getByTestId('pubkey_user')).toHaveTextContent('...');
  });

  test('copies text to clipboard on row click', async () => {
    const testValue = 'test-value';
    render(<QrBar value={testValue} simple={false} />);

    fireEvent.click(screen.getByTestId('copy-button'));

    expect(mockExecCommand).toHaveBeenCalledWith('copy');
    expect(screen.getByText('Copied!')).toBeInTheDocument();
  });

  test('dismisses toast after timeout', async () => {
    jest.useFakeTimers();

    render(<QrBar value="test123" simple={false} />);
    fireEvent.click(screen.getByTestId('copy-button'));

    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(screen.queryByText('Copied!')).not.toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  test('applies custom style prop to Row component', async () => {
    const customStyle = { backgroundColor: 'red' };
    render(<QrBar value="test123" simple={false} style={customStyle} />);

    const row = screen.getByTestId('pubkey_user').closest('div');
    waitFor(() => {
      expect(row).toHaveStyle({ backgroundColor: 'red' });
    });
  });

  test('handles multiple rapid copy operations', () => {
    render(<QrBar value="test123" simple={false} />);

    fireEvent.click(screen.getByTestId('copy-button'));
    fireEvent.click(screen.getByTestId('copy-button'));
    fireEvent.click(screen.getByTestId('copy-button'));

    expect(mockExecCommand).toHaveBeenCalledTimes(3);
    expect(screen.getByText('Copied!')).toBeInTheDocument();
  });

  test('handles non-string value prop gracefully', async () => {
    waitFor(() => {
      // @ts-expect-error Testing invalid prop type intentionally
      render(<QrBar value={123} simple={false} />);
      expect(screen.getByTestId('pubkey_user')).toHaveTextContent('123...');
    });
  });
});

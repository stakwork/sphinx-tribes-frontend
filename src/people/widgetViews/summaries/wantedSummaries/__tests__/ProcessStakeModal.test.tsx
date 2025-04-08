import React from 'react';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProcessStakeModal from '../ProcessStakeModal';
import { useStores } from '../../../../../store';

jest.mock('../../../../../store', () => ({
  useStores: jest.fn()
}));

jest.mock('../Invoice', () => ({
  __esModule: true,
  default: ({ lnInvoice, setInvoiceState }) => (
    <div data-testid="mock-invoice">
      Invoice: {lnInvoice}
      <button onClick={() => setInvoiceState('PAID')}>Mark Paid</button>
      <button onClick={() => setInvoiceState('EXPIRED')}>Mark Expired</button>
    </div>
  )
}));

jest.mock('moment', () => () => ({
  add: () => ({
    format: () => '2023-01-01T00:00:00Z'
  })
}));

describe('ProcessStakeModal', () => {
  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    bountyId: 123,
    stakeMin: 5000,
    workspaceUuid: 'test-uuid'
  };

  const mockStore = {
    ui: {
      meInfo: {
        owner_pubkey: 'test-pubkey'
      }
    },
    main: {
      checkBountyStakeStatus: jest.fn(),
      generateStakeInvoice: jest.fn(),
      pollInvoice: jest.fn()
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useStores as jest.Mock).mockReturnValue(mockStore);
  });

  test('should show loading state initially', async () => {
    mockStore.main.checkBountyStakeStatus.mockResolvedValue([]);
    mockStore.main.generateStakeInvoice.mockResolvedValue({
      response: { invoice: 'test-invoice' }
    });

    render(<ProcessStakeModal {...mockProps} />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  test('should display "bounty currently being assigned" message when bounty has NEW status stake', async () => {
    mockStore.main.checkBountyStakeStatus.mockResolvedValue([{ status: 'NEW', bounty_id: 123 }]);

    await act(async () => {
      render(<ProcessStakeModal {...mockProps} />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Bounty Currently Being Assigned/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Another Hunter is currently assigning this bounty/i)
      ).toBeInTheDocument();
    });
  });

  test('should display "bounty currently being assigned" message when bounty has PENDING status stake', async () => {
    mockStore.main.checkBountyStakeStatus.mockResolvedValue([
      { status: 'PENDING', bounty_id: 123 }
    ]);

    await act(async () => {
      render(<ProcessStakeModal {...mockProps} />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Bounty Currently Being Assigned/i)).toBeInTheDocument();
    });
  });

  test('should display "bounty currently being assigned" message when bounty has PAID status stake', async () => {
    mockStore.main.checkBountyStakeStatus.mockResolvedValue([{ status: 'PAID', bounty_id: 123 }]);

    await act(async () => {
      render(<ProcessStakeModal {...mockProps} />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Bounty Currently Being Assigned/i)).toBeInTheDocument();
    });
  });

  test('should display "bounty currently being assigned" message when bounty has mixed status stakes including active ones', async () => {
    mockStore.main.checkBountyStakeStatus.mockResolvedValue([
      { status: 'FAILED', bounty_id: 123 },
      { status: 'PENDING', bounty_id: 123 },
      { status: 'FAILED', bounty_id: 123 }
    ]);

    await act(async () => {
      render(<ProcessStakeModal {...mockProps} />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Bounty Currently Being Assigned/i)).toBeInTheDocument();
    });
  });

  test('should generate invoice when no stakes exist', async () => {
    mockStore.main.checkBountyStakeStatus.mockResolvedValue([]);
    mockStore.main.generateStakeInvoice.mockResolvedValue({
      response: { invoice: 'test-invoice' }
    });

    await act(async () => {
      render(<ProcessStakeModal {...mockProps} />);
    });

    await waitFor(() => {
      expect(mockStore.main.generateStakeInvoice).toHaveBeenCalledWith(
        mockProps.bountyId,
        mockProps.stakeMin,
        'test-pubkey',
        mockProps.workspaceUuid
      );
      expect(screen.getByText(/Self-Assign Bounty/i)).toBeInTheDocument();
      expect(screen.getByTestId('mock-invoice')).toBeInTheDocument();
    });
  });

  test('should generate invoice when all existing stakes have FAILED status', async () => {
    mockStore.main.checkBountyStakeStatus.mockResolvedValue([
      { status: 'FAILED', bounty_id: 123 },
      { status: 'FAILED', bounty_id: 123 }
    ]);
    mockStore.main.generateStakeInvoice.mockResolvedValue({
      response: { invoice: 'test-invoice' }
    });

    await act(async () => {
      render(<ProcessStakeModal {...mockProps} />);
    });

    await waitFor(() => {
      expect(mockStore.main.generateStakeInvoice).toHaveBeenCalled();
      expect(screen.getByText(/Self-Assign Bounty/i)).toBeInTheDocument();
    });
  });

  test('should generate invoice when all returned stakes have RETURNED status', async () => {
    mockStore.main.checkBountyStakeStatus.mockResolvedValue([
      { status: 'RETURNED', bounty_id: 123 },
      { status: 'FAILED', bounty_id: 123 }
    ]);
    mockStore.main.generateStakeInvoice.mockResolvedValue({
      response: { invoice: 'test-invoice' }
    });

    await act(async () => {
      render(<ProcessStakeModal {...mockProps} />);
    });

    await waitFor(() => {
      expect(mockStore.main.generateStakeInvoice).toHaveBeenCalled();
      expect(screen.getByText(/Self-Assign Bounty/i)).toBeInTheDocument();
    });
  });

  test('should show success message when payment is completed', async () => {
    mockStore.main.checkBountyStakeStatus.mockResolvedValue([]);
    mockStore.main.generateStakeInvoice.mockResolvedValue({
      response: { invoice: 'test-invoice' }
    });

    await act(async () => {
      render(<ProcessStakeModal {...mockProps} />);
    });

    const markPaidButton = await screen.findByText('Mark Paid');

    await act(async () => {
      fireEvent.click(markPaidButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/Payment Received!/i)).toBeInTheDocument();
      expect(
        screen.getByText(/You have successfully self-assigned this bounty/i)
      ).toBeInTheDocument();
    });
  });

  test('should show expired message when invoice expires', async () => {
    mockStore.main.checkBountyStakeStatus.mockResolvedValue([]);
    mockStore.main.generateStakeInvoice.mockResolvedValue({
      response: { invoice: 'test-invoice' }
    });

    await act(async () => {
      render(<ProcessStakeModal {...mockProps} />);
    });

    const markExpiredButton = await screen.findByText('Mark Expired');

    await act(async () => {
      fireEvent.click(markExpiredButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/Invoice Expired/i)).toBeInTheDocument();
      expect(screen.getByText(/The invoice has expired. Please try again./i)).toBeInTheDocument();
    });
  });

  test('should show error message when stake check fails', async () => {
    mockStore.main.checkBountyStakeStatus.mockRejectedValue(new Error('Stake check failed'));

    await act(async () => {
      render(<ProcessStakeModal {...mockProps} />);
    });

    waitFor(() => {
      expect(screen.getByText(/Error/i)).toBeInTheDocument();
      expect(screen.getByText(/Error checking bounty stake status/i)).toBeInTheDocument();
    });
  });

  test('should show error message when invoice generation fails', async () => {
    mockStore.main.checkBountyStakeStatus.mockResolvedValue([]);
    mockStore.main.generateStakeInvoice.mockRejectedValue(new Error('Invoice generation failed'));

    await act(async () => {
      render(<ProcessStakeModal {...mockProps} />);
    });

    waitFor(() => {
      expect(screen.getByText(/Error/i)).toBeInTheDocument();
      expect(screen.getByText(/Error generating invoice/i)).toBeInTheDocument();
    });
  });

  test('should retry stake check when try again button is clicked', async () => {
    mockStore.main.checkBountyStakeStatus.mockResolvedValue([]);
    mockStore.main.generateStakeInvoice.mockResolvedValueOnce({
      response: { invoice: 'test-invoice' }
    });

    await act(async () => {
      render(<ProcessStakeModal {...mockProps} />);
    });

    const markExpiredButton = await screen.findByText('Mark Expired');

    await act(async () => {
      fireEvent.click(markExpiredButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/Invoice Expired/i)).toBeInTheDocument();
    });

    mockStore.main.checkBountyStakeStatus.mockClear();
    mockStore.main.generateStakeInvoice.mockResolvedValueOnce({
      response: { invoice: 'new-invoice' }
    });

    const tryAgainButton = screen.getByText('Try Again');

    await act(async () => {
      fireEvent.click(tryAgainButton);
    });

    waitFor(() => {
      expect(mockStore.main.checkBountyStakeStatus).toHaveBeenCalledTimes(1);
      expect(mockStore.main.generateStakeInvoice).toHaveBeenCalledTimes(1);
    });
  });

  test('should handle the case when user has no pubkey', async () => {
    mockStore.main.checkBountyStakeStatus.mockResolvedValue([]);

    (useStores as jest.Mock).mockReturnValue({
      ...mockStore,
      ui: { meInfo: { owner_pubkey: undefined } }
    });

    await act(async () => {
      render(<ProcessStakeModal {...mockProps} />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Error/i)).toBeInTheDocument();
      expect(screen.getByText(/User information not available/i)).toBeInTheDocument();
    });
  });

  test('should handle missing invoice in response', async () => {
    mockStore.main.checkBountyStakeStatus.mockResolvedValue([]);
    mockStore.main.generateStakeInvoice.mockResolvedValue({
      response: {}
    });

    await act(async () => {
      render(<ProcessStakeModal {...mockProps} />);
    });

    waitFor(() => {
      expect(screen.getByText(/Error/i)).toBeInTheDocument();
      expect(screen.getByText(/Error generating invoice/i)).toBeInTheDocument();
    });
  });
});

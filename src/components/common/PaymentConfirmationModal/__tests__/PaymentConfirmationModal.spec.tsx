import '@testing-library/jest-dom';
import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { PaymentConfirmationModal } from '../PaymentConfirmationModal';

describe('PaymentConfirmationModal', () => {
  it('renders correctly', () => {
    const onCloseMock = jest.fn();
    const onConfirmPaymentMock = jest.fn();
    const { getByText } = render(
      <PaymentConfirmationModal onClose={onCloseMock} onConfirmPayment={onConfirmPaymentMock}>
        Are you sure you want to pay this bounty?
      </PaymentConfirmationModal>
    );

    expect(getByText('Are you sure you want to pay this bounty?')).toBeInTheDocument();
  });

  it('calls onClose when Cancel button is clicked', async () => {
    const onCloseMock = jest.fn();
    const onConfirmPaymentMock = jest.fn();
    const { getByText } = render(
      <PaymentConfirmationModal onClose={onCloseMock} onConfirmPayment={onConfirmPaymentMock}>
        Are you sure you want to pay this bounty?
      </PaymentConfirmationModal>
    );

    fireEvent.click(getByText('Cancel'));
    await waitFor(() => expect(onCloseMock).toHaveBeenCalledTimes(1));
    expect(onConfirmPaymentMock).not.toHaveBeenCalled();
  });

  it('calls onConfirmPayment and onClose when Confirm button is clicked', async () => {
    const onCloseMock = jest.fn();
    const onConfirmPaymentMock = jest.fn();
    const { getByText } = render(
      <PaymentConfirmationModal onClose={onCloseMock} onConfirmPayment={onConfirmPaymentMock}>
        Are you sure you want to pay this bounty?
      </PaymentConfirmationModal>
    );

    fireEvent.click(getByText('Confirm'));
    await waitFor(() => expect(onCloseMock).toHaveBeenCalledTimes(1));
    expect(onConfirmPaymentMock).toHaveBeenCalledTimes(1);
  });
});

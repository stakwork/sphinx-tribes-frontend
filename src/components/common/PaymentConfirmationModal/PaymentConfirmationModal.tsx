import React, { PropsWithChildren } from 'react';
import { Stack } from '@mui/system';
import { BaseModal } from '../BaseModal'; // Assuming you have a BaseModal component
import IconButton from '../IconButton2'; // Assuming you have an IconButton2 component
import { useCreateModal } from '../useCreateModal'; // Assuming you have a custom hook useCreateModal

export type PaymentConfirmationModalProps = PropsWithChildren<{
  onClose: () => void;
  onConfirmPayment: () => void;
  onCancel?: () => void;
}>;

export const PaymentConfirmationModal = data-testid="payment-confirmation-modal-component" ({
  onClose,
  children,
  onCancel,
  onConfirmPayment
}: PaymentConfirmationModalProps) => {
  const closeHandler = () => {
    onClose();
    onCancel?.();
  };

  const confirmPaymentHandler = () => {
    onConfirmPayment();
    onClose();
  };

  return (
    <BaseModal backdrop="white" open onClose={closeHandler}>
      <Stack minWidth={350} p={4} alignItems="center" spacing={3}>
        {children}
        <Stack width="100%" direction="row" justifyContent="space-between">
          <IconButton width={120} height={44} color="white" text="Cancel" onClick={closeHandler} />
          <IconButton
            width={120}
            height={44}
            color="success" // Assuming this color indicates confirmation
            text="Confirm" // Changed "Delete" to "Confirm"
            onClick={confirmPaymentHandler} // Changed onClick handler
          />
        </Stack>
      </Stack>
    </BaseModal>
  );
};

export const usePaymentConfirmationModal = () => {
  const openModal = useCreateModal();

  const openPaymentConfirmation = (props: Omit<PaymentConfirmationModalProps, 'onClose'>) => {
    openModal({
      Component: PaymentConfirmationModal,
      props
    });
  };

  return { openPaymentConfirmation };
};
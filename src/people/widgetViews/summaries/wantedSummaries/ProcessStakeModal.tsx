import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useStores } from 'store';
import moment from 'moment';
import { EuiLoadingSpinner, EuiText, EuiGlobalToastList } from '@elastic/eui';
import { Modal, Button } from '../../../../components/common';
import { colors } from '../../../../config/colors';
import Invoice from './Invoice';

const color = colors['light'];

const ModalWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const InvoiceQrWrapper = styled.div`
  width: 13.5rem;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MessageText = styled(EuiText)`
  text-align: center;
  margin: 16px 0;
`;

interface Toast {
  id: string;
  title: string;
  color: 'success' | 'danger';
  text: string;
}

interface ProcessStakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  bountyId: number;
  stakeMin: number;
  workspaceUuid: string;
}

type StakeProcessStatus = 'NEW' | 'PENDING' | 'PAID' | 'FAILED' | 'RETURNED';

interface BountyStakeProcess {
  id: string;
  bounty_id: number;
  hunter_pubkey: string;
  amount: number;
  status: StakeProcessStatus;
  invoice: string;
  stake_receipt: string;
  stake_return: string;
  staked_at: string | null;
  returned_at: string | null;
  created_at: string;
  updated_at: string;
}

const ProcessStakeModal: React.FC<ProcessStakeModalProps> = ({
  isOpen,
  onClose,
  bountyId,
  stakeMin,
  workspaceUuid
}) => {
  const { ui, main } = useStores();
  const [isLoading, setIsLoading] = useState(true);
  const [isStakeOpen, setIsStakeOpen] = useState(false);
  const [lnInvoice, setLnInvoice] = useState('');
  const [invoiceStatus, setInvoiceStatus] = useState(false);
  const [invoiceState, setInvoiceState] = useState<'PENDING' | 'PAID' | 'EXPIRED' | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pollMinutes = 2;

  function addErrorToast(text: string) {
    setToasts([
      {
        id: `${Math.random()}`,
        title: 'Error',
        color: 'danger',
        text
      }
    ]);
  }

  function removeToast() {
    setToasts([]);
  }

  const startPolling = (invoice: string) => {
    const intervalId = setInterval(async () => {
      try {
        const details = await main.pollInvoice(invoice);
        if (details && details.success && details.response.settled) {
          clearInterval(intervalId);
          setInvoiceStatus(true);
          setInvoiceState('PAID');
        }
      } catch (error) {
        console.error('Error polling invoice:', error);
      }
    }, 5000);

    setTimeout(
      () => {
        clearInterval(intervalId);
        if (!invoiceStatus) {
          setInvoiceState('EXPIRED');
        }
      },
      pollMinutes * 60 * 1000
    );
  };

  const generateInvoice = async () => {
    try {
      if (!ui.meInfo?.owner_pubkey) {
        addErrorToast('User information not available');
        return;
      }

      const data = await main.generateStakeInvoice(
        bountyId,
        stakeMin,
        ui.meInfo.owner_pubkey,
        workspaceUuid
      );

      const paymentRequest = data?.response?.invoice;

      if (paymentRequest) {
        setLnInvoice(paymentRequest);
        startPolling(paymentRequest);
        setInvoiceState('PENDING');
        return;
      }

      addErrorToast('Error generating invoice');
    } catch (error) {
      addErrorToast('Error generating invoice');
      console.error('Error generating invoice:', error);
    }
  };

  const checkBountyStake = async () => {
    try {
      setIsLoading(true);

      const stakeProcesses: BountyStakeProcess[] = await main.checkBountyStakeStatus(bountyId);

      const hasActiveStake = stakeProcesses.some(
        (process) =>
          process.status === 'NEW' || process.status === 'PENDING' || process.status === 'PAID'
      );

      const isStakeOpen = !hasActiveStake;

      setIsStakeOpen(isStakeOpen);

      if (isStakeOpen) {
        await generateInvoice();
      }

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      addErrorToast('Error checking bounty stake status');
      console.error('Error checking stake status:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkBountyStake();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <Modal
      visible={isOpen}
      envStyle={{
        borderRadius: '12px',
        background: color.pureWhite,
        width: '400px',
        maxWidth: '90vw',
        minHeight: '300px',
        boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.1)'
      }}
      bigCloseImage={onClose}
      bigCloseImageStyle={{
        top: '-12px',
        right: '-12px',
        background: color.pureWhite,
        borderRadius: '50%',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        padding: '4px'
      }}
    >
      <ModalWrapper>
        {isLoading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '200px'
            }}
            role="status"
          >
            <EuiLoadingSpinner size="l" />
          </div>
        ) : (
          <>
            {!isStakeOpen && (
              <div style={{ textAlign: 'center' }}>
                <MessageText>
                  <h2>Bounty Currently Being Assigned</h2>
                  <p>
                    Another Hunter is currently assigning this bounty. Check again in 2 minutes.
                  </p>
                </MessageText>
                <Button
                  text="Close"
                  color="primary"
                  onClick={onClose}
                  style={{ width: '120px', marginTop: '20px' }}
                />
              </div>
            )}

            {isStakeOpen && lnInvoice && invoiceState === 'PENDING' && (
              <>
                <MessageText>
                  <h2>Self-Assign Bounty</h2>
                  <p>Scan the QR code to deposit {stakeMin.toLocaleString()} sats.</p>
                </MessageText>
                <InvoiceQrWrapper>
                  <Invoice
                    startDate={new Date(moment().add(pollMinutes, 'minutes').format().toString())}
                    invoiceStatus={invoiceStatus}
                    lnInvoice={lnInvoice}
                    invoiceTime={pollMinutes}
                    setInvoiceState={setInvoiceState}
                    qrSize={216}
                  />
                </InvoiceQrWrapper>
              </>
            )}

            {isStakeOpen && invoiceState === 'PAID' && (
              <div style={{ textAlign: 'center' }}>
                <MessageText>
                  <h2>Payment Received!</h2>
                  <p>You have successfully self-assigned this bounty.</p>
                </MessageText>
                <Button
                  text="Close"
                  color="primary"
                  onClick={onClose}
                  style={{ width: '120px', marginTop: '20px' }}
                />
              </div>
            )}

            {isStakeOpen && invoiceState === 'EXPIRED' && (
              <div style={{ textAlign: 'center' }}>
                <MessageText>
                  <h2>Invoice Expired</h2>
                  <p>The invoice has expired. Please try again.</p>
                </MessageText>
                <Button
                  text="Try Again"
                  color="primary"
                  onClick={() => {
                    setInvoiceState(null);
                    setLnInvoice('');
                    checkBountyStake();
                  }}
                  style={{ width: '120px', marginTop: '20px' }}
                />
              </div>
            )}
          </>
        )}
      </ModalWrapper>
      <EuiGlobalToastList toasts={toasts} dismissToast={removeToast} toastLifeTimeMs={3000} />
    </Modal>
  );
};

export default ProcessStakeModal;

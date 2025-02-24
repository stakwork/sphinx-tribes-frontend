/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/typedef */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { useStores } from 'store';
import { SOCKET_MSG } from 'config/socket';
import { PaymentConfirmationModal } from 'components/common';
import { EuiGlobalToastList } from '@elastic/eui';
import { BountyCard, BountyCardStatus } from '../../../store/interface';
import { colors } from '../../../config';

const truncate = (str: string, n: number) => (str.length > n ? `${str.substr(0, n - 1)}...` : str);

interface CardContainerProps {
  isDraft?: boolean;
}

const CardContainer = styled.div<CardContainerProps>`
  width: 384px;
  height: auto;
  border-radius: 8px;
  padding: 16px 16px 0 16px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  background-color: ${(props: CardContainerProps): string =>
    props.isDraft ? colors.light.grayish.G900 : colors.light.grayish.G950};
  border-left: ${(props: CardContainerProps): string =>
    props.isDraft ? `4px solid ${colors.light.blue1}` : 'none'};
  cursor: pointer;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  position: relative;
`;

const CardTitle = styled.h3`
  font-size: 22px;
  font-weight: 600;
  margin: 0;
  padding-right: 16px;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
  cursor: pointer;
  &:hover {
    color: ${colors.light.primaryColor};
  }
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const RowT = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-bottom: 8px;
  font-size: 14px;
  color: ${colors.light.text2};
  gap: 1.5rem;

  .last-span {
    margin-left: auto;
    margin-right: 0;
  }
`;

const RowB = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-bottom: 8px;
  font-size: 14px;
  color: ${colors.light.text2};
  gap: 4rem;

  .last-span {
    margin-left: auto;
    margin-right: 0;
  }
`;

const StatusText = styled.span<{ status?: BountyCardStatus }>`
  color: ${({ status }: { status?: BountyCardStatus }): string => {
    switch (status) {
      case 'DRAFT':
        return colors.light.statusDraft;
      case 'PAID':
        return colors.light.statusPaid;
      case 'COMPLETED':
        return colors.light.statusCompleted;
      case 'IN_REVIEW':
        return colors.light.statusReview;
      case 'IN_PROGRESS':
        return colors.light.statusAssigned;
      default:
        return colors.light.pureBlack;
    }
  }};
  font-weight: 500;
`;

interface BountyCardProps extends BountyCard {
  onclick: (bountyId: string, status?: BountyCardStatus, ticketGroup?: string) => void;
  onPayBounty?: (bountyId: string) => void;
}

const ActionMenu = ({ status, onPay }: { status?: BountyCardStatus; onPay: () => void }) => {
  const showMenu = ['COMPLETED', 'IN_REVIEW', 'IN_PROGRESS'].includes(status || '');

  if (!showMenu) return null;

  const MenuButton = styled.button`
    border: none;
    background: none;
    padding: 4px;
    cursor: pointer;
    color: ${colors.light.text2};
    &:hover {
      color: ${colors.light.primaryColor};
    }
  `;

  const Dropdown = styled.div`
    position: absolute;
    right: 0;
    top: 100%;
    background: white;
    border: 1px solid ${colors.light.grayish.G300};
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 1;
    display: none;

    ${MenuButton}:focus-within & {
      display: block;
    }
  `;

  const MenuItem = styled.button`
    width: 100%;
    padding: 8px 15px;
    border: none;
    background: none;
    text-align: left;
    cursor: pointer;
    &:hover {
      background: ${colors.light.grayish.G100};
    }
  `;

  return (
    <MenuButton onClick={(e) => e.stopPropagation()} data-testid="action-menu-button">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M6 12a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" fill="currentColor" />
        <path d="M12 12a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" fill="currentColor" />
        <path d="M18 12a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" fill="currentColor" />
      </svg>
      <Dropdown>
        <MenuItem onClick={onPay}>Pay Bounty</MenuItem>
      </Dropdown>
    </MenuButton>
  );
};

const BountyCardComponent: React.FC<BountyCardProps> = ({
  id,
  title,
  features,
  phase,
  workspace,
  status,
  onclick,
  assignee_name,
  ticket_group,
  onPayBounty,
  bounty_price
}: BountyCardProps) => {
  const { ui, main } = useStores();
  const [isOpenPaymentConfirmation, setIsOpenPaymentConfirmation] = React.useState(false);
  const [toasts, setToasts] = React.useState<any[]>([]);
  const [paymentLoading, setPaymentLoading] = React.useState(false);
  const [connectPersonBody, setConnectPersonBody] = React.useState<any>({});
  const [activeBounty, setActiveBounty] = React.useState<any[]>([]);
  let interval: number;

  const addToast = (type: string) => {
    const toastId = Math.random();
    switch (type) {
      case SOCKET_MSG.keysend_success:
        setToasts([
          {
            id: `${toastId}`,
            title: 'Paid successfully',
            color: 'success'
          }
        ]);
        break;
      case SOCKET_MSG.keysend_failed:
        setToasts([
          {
            id: `${toastId}`,
            title: 'Insufficient funds in the workspace.',
            color: 'error',
            toastLifeTimeMs: 10000
          }
        ]);
        break;
      default:
        break;
    }
  };

  const removeToast = () => {
    setToasts([]);
  };

  const getBounty = React.useCallback(async () => {
    let bounty;
    if (id) {
      bounty = await main.getBountyById(Number(id));
    }
    const connectPerson = bounty?.length ? bounty[0].person : [];
    setConnectPersonBody(connectPerson);
    setActiveBounty(bounty || []);
  }, [id, main]);

  React.useEffect(() => {
    getBounty();
  }, [getBounty]);

  const startPolling = React.useCallback(
    async (paymentRequest: string) => {
      let i = 0;
      interval = window.setInterval(async () => {
        try {
          const invoiceData = await main.pollInvoice(paymentRequest);
          if (invoiceData?.success && invoiceData.response.settled) {
            clearInterval(interval);
            addToast(SOCKET_MSG.invoice_success);
            main.setKeysendInvoice('');
          }
          if (i++ > 22) clearInterval(interval);
        } catch (e) {
          console.warn('Invoice Polling Error', e);
        }
      }, 5000);
    },
    [main, addToast]
  );

  const generateInvoice = async (price: number) => {
    if (activeBounty[0]?.created && ui.meInfo?.websocketToken) {
      const data = await main.getLnInvoice({
        amount: price || 0,
        memo: '',
        owner_pubkey: connectPersonBody.owner_pubkey,
        user_pubkey: connectPersonBody.owner_pubkey,
        route_hint: connectPersonBody.owner_route_hint ?? '',
        created: activeBounty[0].created?.toString() || '',
        type: 'KEYSEND'
      });
      if (data.response.invoice) {
        main.setKeysendInvoice(data.response.invoice);
        startPolling(data.response.invoice);
      }
    }
  };

  const handlePayment = async () => {
    setPaymentLoading(true);
    try {
      const price = Number(bounty_price);

      if (workspace.uuid) {
        const workspaceBudget = await main.getWorkspaceBudget(workspace.uuid);
        if (Number(workspaceBudget.current_budget) >= price) {
          await main.makeBountyPayment({
            id: Number(id),
            websocket_token: ui.meInfo?.websocketToken || ''
          });
          addToast(SOCKET_MSG.keysend_success);
          onPayBounty?.(String(id));
        } else {
          addToast(SOCKET_MSG.keysend_failed);
        }
      } else {
        await generateInvoice(price);
      }
    } catch (error) {
      console.error('Payment failed:', error);
      addToast(SOCKET_MSG.keysend_failed);
    } finally {
      setPaymentLoading(false);
      setIsOpenPaymentConfirmation(false);
    }
  };

  const confirmPaymentHandler = () => {
    setIsOpenPaymentConfirmation(true);
  };

  return (
    <>
      <CardContainer isDraft={status === 'DRAFT'} onClick={() => onclick(id, status, ticket_group)}>
        <CardHeader>
          <CardTitle
            role="button"
            tabIndex={0}
            onClick={(e: React.MouseEvent<HTMLHeadingElement>) => {
              e.stopPropagation();
              onclick(id, status, ticket_group);
            }}
          >
            {title}
            <span style={{ fontSize: '16px', marginTop: '10px' }}>{assignee_name}</span>
          </CardTitle>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start' }}
          >
            <ActionMenu status={status} onPay={confirmPaymentHandler} />
          </div>
        </CardHeader>

        <RowT>
          <span title={features?.name ?? 'No Feature'}>
            {truncate(features?.name ?? 'No Feature', 10)}
          </span>
          <span title={phase?.name ?? 'No Phase'}>{truncate(phase?.name ?? 'No Phase', 20)}</span>
        </RowT>
        <RowB>
          <span title={id}>{id}</span>
          <span title={workspace?.name ?? 'No Workspace'}>
            {truncate(workspace?.name ?? 'No Workspace', 20)}
          </span>
          <StatusText className="last-span" status={status}>
            {status}
          </StatusText>
        </RowB>
      </CardContainer>

      {isOpenPaymentConfirmation && (
        <PaymentConfirmationModal
          onClose={() => setIsOpenPaymentConfirmation(false)}
          onConfirmPayment={handlePayment}
        />
      )}

      <EuiGlobalToastList toasts={toasts} dismissToast={removeToast} toastLifeTimeMs={6000} />
    </>
  );
};

BountyCardComponent.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  features: PropTypes.shape({
    name: PropTypes.string
  }) as PropTypes.Validator<BountyCard['features']>,
  phase: PropTypes.shape({
    name: PropTypes.string
  }) as PropTypes.Validator<BountyCard['phase']>,
  workspace: PropTypes.shape({
    name: PropTypes.string
  }) as PropTypes.Validator<BountyCard['workspace']>,
  status: PropTypes.oneOf([
    'DRAFT',
    'TODO',
    'IN_PROGRESS',
    'IN_REVIEW',
    'COMPLETED',
    'PAID'
  ] as BountyCardStatus[]),
  onclick: PropTypes.func.isRequired,
  onPayBounty: PropTypes.func
};

export default BountyCardComponent;

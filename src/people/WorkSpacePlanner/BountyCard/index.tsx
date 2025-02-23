import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { SOCKET_MSG } from 'config/socket';
import { EditPopoverText } from 'pages/tickets/style';
import { EditPopoverContent } from 'pages/tickets/style';
import { useStores } from 'store';
import { EditPopoverTail } from 'pages/tickets/style';
import { EditPopover } from 'pages/tickets/style';
import MaterialIcon from '@material/react-material-icon';
import { FeatureOptionsWrap } from 'pages/tickets/style';
import { Box } from '@mui/system';
import { EuiGlobalToastList } from '@elastic/eui';
import { colors } from '../../../config';
import { BountyCard, BountyCardStatus, PersonBounty } from '../../../store/interface';
import { usePaymentConfirmationModal } from '../../../components/common';

const truncate = (str: string, n: number) => (str.length > n ? `${str.substr(0, n - 1)}...` : str);
let interval;
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
}

const BountyCardComponent: React.FC<BountyCardProps> = ({
  id,
  title,
  features,
  phase,
  workspace,
  status,
  onclick,
  assignee_name,
  ticket_group
}: BountyCardProps) => {
  const [displayNameOptions, setDisplayNameOptions] = useState<boolean>(false);
  const { openPaymentConfirmation } = usePaymentConfirmationModal();
  const [toasts, setToasts] = useState<any[]>([]);
  const { main, ui } = useStores();
  const [activeBounty, setActiveBounty] = useState<PersonBounty[]>([]);
  const [connectPersonBody, setConnectPersonBody] = useState<any>();

  const getBounty = useCallback(async () => {
    let bounty;

    if (id) {
      bounty = await main.getBountyById(Number(id));
    }

    const connectPerson = bounty && bounty.length ? bounty[0].person : [];

    setConnectPersonBody(connectPerson);
    setActiveBounty(bounty);
  }, [id, main]);

  useEffect(() => {
    getBounty();
  }, [getBounty]);

  const recallBounties = async () => {
    await main.getPeopleBounties({ resetPage: true, ...main.bountiesStatus });
  };

  const addToast = useCallback((type: string) => {
    const toastId = Math.random();

    switch (type) {
      case SOCKET_MSG.invoice_success: {
        return setToasts([
          {
            id: `${toastId}`,
            title: 'Invoice has been paid',
            color: 'success'
          }
        ]);
      }
      case SOCKET_MSG.keysend_failed: {
        return setToasts([
          {
            id: `${toastId}`,
            title: 'Keysend Payment failed',
            toastLifeTimeMs: 10000,
            color: 'error'
          }
        ]);
      }
      case SOCKET_MSG.keysend_error: {
        return setToasts([
          {
            id: `${toastId}`,
            title: 'Keysend Payment error',
            toastLifeTimeMs: 10000,
            color: 'error'
          }
        ]);
      }
      case SOCKET_MSG.keysend_success: {
        return setToasts([
          {
            id: `${toastId}`,
            title: 'Paid successfully',
            color: 'success'
          }
        ]);
      }
      case SOCKET_MSG.keysend_pending: {
        return setToasts([
          {
            id: `${toastId}`,
            title: 'Payment is pending',
            toastLifeTimeMs: 10000,
            color: 'warning'
          }
        ]);
      }
    }
  }, []);

  const startPolling = useCallback(
    async (paymentRequest: string) => {
      let i = 0;
      interval = setInterval(async () => {
        try {
          const invoiceData = await main.pollInvoice(paymentRequest);
          if (invoiceData) {
            if (invoiceData.success && invoiceData.response.settled) {
              clearInterval(interval);

              addToast(SOCKET_MSG.invoice_success);
              main.setKeysendInvoice('');
            }
          }

          i++;
          if (i > 22) {
            if (interval) clearInterval(interval);
          }
        } catch (e) {
          console.warn('CodingBounty Invoice Polling Error', e);
        }
      }, 5000);
    },
    [main, addToast]
  );

  const removeToast = () => {
    setToasts([]);
  };

  const generateInvoice = async (price: number) => {
    if (activeBounty[0].created && ui.meInfo?.websocketToken) {
      const data = await main.getLnInvoice({
        amount: price || 0,
        memo: '',
        owner_pubkey: connectPersonBody.owner_pubkey,
        user_pubkey: connectPersonBody.owner_pubkey,
        route_hint: connectPersonBody.owner_route_hint ?? '',
        created: activeBounty[0].created ? activeBounty[0].created?.toString() : '',
        type: 'KEYSEND'
      });

      const paymentRequest = data.response.invoice;

      if (paymentRequest) {
        main.setKeysendInvoice(paymentRequest);
        startPolling(paymentRequest);
      }
    }
  };

  const makePayments = async () => {
    const price = Number(activeBounty[0].body.price);

    if (activeBounty[0].body.org_uuid) {
      const workspaceBudget = await main.getWorkspaceBudget(activeBounty[0].body.org_uuid);
      const budget = workspaceBudget.current_budget;

      if (activeBounty.length && Number(budget) >= Number(price)) {
        const b = activeBounty[0];

        if (!b.body.paid) {
          // make keysend payment
          const body = {
            id: Number(id),
            websocket_token: ui.meInfo?.websocketToken || ''
          };

          await main.makeBountyPayment(body);

          recallBounties();
        }
      } else {
        return setToasts([
          {
            id: `${Math.random()}`,
            title: 'Insufficient funds in the workspace.',
            color: 'danger',
            toastLifeTimeMs: 10000
          }
        ]);
      }
    } else {
      generateInvoice(price || 0);
    }
  };

  const handlePayment = () => {
    openPaymentConfirmation({
      onConfirmPayment: async () => {
        await makePayments();
      },
      children: (
        <Box fontSize={20} textAlign="center">
          Are you sure you want to <br />
          <Box component="span" fontWeight="500">
            Pay this Bounty?
          </Box>
        </Box>
      )
    });
  };

  const handleEditClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDisplayNameOptions(false);
    handlePayment();
  };

  const handleOptionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDisplayNameOptions(!displayNameOptions);
  };

  return (
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
        <FeatureOptionsWrap>
          <MaterialIcon
            icon="more_horiz"
            className="MaterialIcon"
            onClick={handleOptionsClick}
            data-testid="feature-name-btn"
          />
          {displayNameOptions && (
            <EditPopover>
              <EditPopoverTail />
              <EditPopoverContent onClick={handleEditClick}>
                <EditPopoverText data-testid="feature-name-edit-btn">Pay Bounty</EditPopoverText>
              </EditPopoverContent>
            </EditPopover>
          )}
        </FeatureOptionsWrap>
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
      <EuiGlobalToastList toasts={toasts} dismissToast={removeToast} toastLifeTimeMs={6000} />
    </CardContainer>
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
  onclick: PropTypes.func.isRequired
};

export default BountyCardComponent;

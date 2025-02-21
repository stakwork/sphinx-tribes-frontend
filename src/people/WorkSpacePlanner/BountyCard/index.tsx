import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { EditPopoverText } from 'pages/tickets/style';
import { EditPopoverContent } from 'pages/tickets/style';
import { EditPopoverTail } from 'pages/tickets/style';
import { EditPopover } from 'pages/tickets/style';
import MaterialIcon from '@material/react-material-icon';
import { FeatureOptionsWrap } from 'pages/tickets/style';
import { Box } from '@mui/system';
import { colors } from '../../../config';
import { BountyCard, BountyCardStatus } from '../../../store/interface';
import { usePaymentConfirmationModal } from '../../../components/common';

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
  onPayBounty?: (bountyId: string) => Promise<void>;
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
  ticket_group,
  onPayBounty
}: BountyCardProps) => {
  const [displayNameOptions, setDisplayNameOptions] = useState<boolean>(false);
  const { openPaymentConfirmation } = usePaymentConfirmationModal();

  const handleEditClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDisplayNameOptions(false);

    openPaymentConfirmation({
      onConfirmPayment: () => onPayBounty?.(id),
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
  assignee_img: PropTypes.string,
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

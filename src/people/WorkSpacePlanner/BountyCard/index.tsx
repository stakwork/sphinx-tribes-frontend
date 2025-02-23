/* eslint-disable @typescript-eslint/typedef */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
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
    padding: 8px 16px;
    border: none;
    background: none;
    text-align: left;
    cursor: pointer;
    &:hover {
      background: ${colors.light.grayish.G100};
    }
  `;

  return (
    <MenuButton onClick={(e) => e.stopPropagation()}>
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
  onPayBounty
}: BountyCardProps) => (
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ActionMenu status={status} onPay={() => onPayBounty?.(id)} />
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
);

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

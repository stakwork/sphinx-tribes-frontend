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

const AssignerPic = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  color: white;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
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
  assignee_img,
  workspace,
  status,
  onclick,
  assignee_name,
  ticket_group
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
      {assignee_img && (
        <AssignerPic>
          <img src={assignee_img} alt="Assigner" />
        </AssignerPic>
      )}
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
  onclick: PropTypes.func.isRequired
};

export default BountyCardComponent;

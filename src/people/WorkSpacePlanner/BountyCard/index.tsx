import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { BountyCard } from '../../../store/interface';
import { colors } from '../../../config';

const truncate = (str: string, n: number) => (str.length > n ? `${str.substr(0, n - 1)}...` : str);

const CardContainer = styled.div`
  width: 384px;
  height: auto;
  border-radius: 8px;
  padding: 16px 16px 0 16px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  background-color: ${colors.light.grayish.G950};
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
`;

const AssignerPic = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background-color: ${colors.light.red1};
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

interface BountyCardProps extends BountyCard {
  onclick: (bountyId: string) => void;
}

const BountyCardComponent: React.FC<BountyCardProps> = ({
  id,
  title,
  features,
  phase,
  assignee_img,
  workspace,
  onclick
}: BountyCardProps) => (
  <CardContainer onClick={() => onclick(id)}>
    <CardHeader>
      <CardTitle
        role="button"
        tabIndex={0}
        onClick={(e: React.MouseEvent<HTMLHeadingElement>) => e.stopPropagation()}
      >
        {title}
      </CardTitle>
      <AssignerPic>{assignee_img ? <img src={assignee_img} alt="Assigner" /> : 'Pic'}</AssignerPic>
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
      <span className="last-span">Paid?</span>
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
  onclick: PropTypes.func.isRequired
};

export default BountyCardComponent;

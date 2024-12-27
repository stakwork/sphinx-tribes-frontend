import React from 'react';
import styled from 'styled-components';
import { BountyCard } from '../../../store/interface';
import { colors } from '../../../config';

const CardContainer = styled.div`
  width: 384px;
  height: auto;
  border-radius: 8px;
  padding: 16px 16px 0 16px;
  margin-bottom: 16px;
  display: flex;
  background-color: ${colors.light.grayish.G950};
  flex-direction: column;

  &:hover {
    border: 1px solid ${colors.light.light_blue100};
    box-shadow: 0 0 5px 1px ${colors.light.light_blue200};
  }
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
  cursor: pointer;
  text-align: left;

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

const MetadataRow = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-size: 14px;
  font-weight: 400;
  margin-bottom: 8px;

  padding: 0;
  font-size: 14px;
  color: ${colors.light.text2};

  span {
    margin-right: 20%;
    white-space: nowrap;
  }

  .last_span {
    justify-content: flex-end;
    margin-left: auto;
    margin-right: 0;
  }
`;

interface BountyCardProps extends BountyCard {
  onTitleClick: (bountyId: string) => void;
}

const BountyCardComponent: React.FC<BountyCardProps> = ({
  id,
  title,
  features,
  phase,
  assignee_img,
  workspace,
  onTitleClick
}: BountyCardProps) => {
  const handleTitleClick = () => {
    onTitleClick(id);
  };

  return (
    <CardContainer>
      <CardHeader>
        <CardTitle onClick={handleTitleClick} role="button" tabIndex={0}>
          {title}
        </CardTitle>
        <AssignerPic>
          {assignee_img ? <img src={assignee_img} alt="Assigner" /> : 'Pic'}
        </AssignerPic>
      </CardHeader>

      <MetadataRow>
        <span>{features.name}</span>
        <span>{phase.name}</span>
      </MetadataRow>
      <MetadataRow>
        <span>{id}</span>
        <span>{workspace.name}</span>
        <span className="last_span">Paid?</span>
      </MetadataRow>
    </CardContainer>
  );
};

export default BountyCardComponent;

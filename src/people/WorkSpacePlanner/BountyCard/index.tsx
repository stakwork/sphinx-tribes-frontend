import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { BountyCard } from 'store/interface';
import { colors } from '../../../config';

const Card = styled.div`
  width: 384px;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  background-color: ${colors.light.grayish.G950};
  &:hover {
    border: 1px solid ${colors.light.light_blue100};
    box-shadow: 0 0 5px 1px ${colors.light.light_blue200};
  }
`;

const Row = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-size: 14px;
  font-weight: 400;
  margin-bottom: 8px;
  color: ${colors.light.text2};

  span {
    margin-right: 20%;
    white-space: nowrap;
  }

  .span {
    margin-left: auto;
    justify-content: flex-end;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const CardTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  padding-right: 16px;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  text-align: left;
  color: ${colors.light.text1};

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

interface BountyCardProps extends BountyCard {
  onclick: (bountyId: string) => void;
}

const BountyCardComp = ({
  id,
  title,
  features,
  phase,
  assigneePic,
  workspace,
  onclick
}: BountyCardProps) => {
  const handleTitleClick = (
    event: React.MouseEvent<HTMLHeadingElement> | React.KeyboardEvent<HTMLHeadingElement>
  ) => {
    event.preventDefault();
    onclick(id);
  };

  return (
    <Card>
      <Header>
        <CardTitle onClick={handleTitleClick}>{title}</CardTitle>
        <AssignerPic>{assigneePic ? <img src={assigneePic} alt="Assigner" /> : 'Pic'}</AssignerPic>
      </Header>

      <Row>
        <span>{features?.name ?? 'No Feature'}</span>
        <span>{phase?.name ?? 'No Phase'}</span>
      </Row>
      <Row>
        <span>{id}</span>
        <span>{workspace?.name ?? 'No Workspace'}</span>
        <span className="span">Paid?</span>
      </Row>
    </Card>
  );
};

BountyCardComp.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  features: PropTypes.shape({
    name: PropTypes.string
  }),
  phase: PropTypes.shape({
    name: PropTypes.string
  }),
  assignee_img: PropTypes.string,
  workspace: PropTypes.shape({
    name: PropTypes.string
  }),
  onclick: PropTypes.func.isRequired
};

export default BountyCardComp;

import React, { useState } from 'react';
import styled from 'styled-components';
import StartUpModal from '../../people/utils/StartUpModal';

const Nav = styled.nav`
  background: #1a242e;
  padding: 16px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  img {
    height: 32px;
  }
`;

const Img = styled.div`
  background-image: url('/static/people_logo.svg');
  background-position: center;
  background-size: cover;
  height: 37px;
  width: 232px;

  position: relative;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button<{ variant: 'primary' | 'secondary' }>`
  padding: 10px 15px;
  border-radius: 20px;
  font-weight: 500;
  font-size: 15px;
  cursor: pointer;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  white-space: nowrap;
  height: 40px;

  ${({ variant }: { variant: 'primary' | 'secondary' }) =>
    variant === 'primary'
      ? `
    background: #608AFF;
    color: white;
    border: none;
    &:hover {
      background: #4A6FE5;
    }
  `
      : `
    background: transparent;
    color: #608AFF;
    border: 1px solid #608AFF;
    &:hover {
      background: rgba(96, 138, 255, 0.1);
    }
  `}
`;

const BountyNavBar: React.FC = () => {
  const [isOpenStartupModal, setIsOpenStartupModal] = useState(false);

  const handleStartEarning = () => {
    setIsOpenStartupModal(true);
  };

  const handleViewBounties = () => {
    window.open('https://community.sphinx.chat/bounties', '_blank');
  };

  return (
    <>
      <Nav>
        <Logo>
          <Img />
          <span>SPHINX COMMUNITY</span>
        </Logo>
        <ButtonGroup>
          <Button variant="primary" onClick={handleStartEarning}>
            Start Earning
          </Button>
          <Button variant="secondary" onClick={handleViewBounties}>
            View Bounties
          </Button>
        </ButtonGroup>
      </Nav>

      {isOpenStartupModal && (
        <StartUpModal
          closeModal={() => setIsOpenStartupModal(false)}
          dataObject={'createWork'}
          buttonColor={'success'}
        />
      )}
    </>
  );
};

export default BountyNavBar;

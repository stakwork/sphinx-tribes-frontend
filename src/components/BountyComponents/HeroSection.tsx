import React, { useState } from 'react';
import styled from 'styled-components';
import StartUpModal from '../../people/utils/StartUpModal';

const HeroContainer = styled.section`
  background: #1a242e;
  width: 100%;
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 0 80px;
  gap: 40px;
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 40px 20px;
    min-height: auto;
    gap: 40px;
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: white;
  max-width: 600px;
  padding-top: 40px;
  margin-left: 50px;

  h1 {
    font-size: 64px;
    line-height: 1.1;
    margin-bottom: 24px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #ffffff;

    @media (max-width: 768px) {
      margin-top: 20px;
      font-size: 40px;
    }
  }

  p {
    font-size: 18px;
    margin-bottom: 32px;
    line-height: 1.5;
    color: rgba(229, 231, 235, 0.8);
    max-width: 500px;
  }

  @media (max-width: 768px) {
    margin-left: 0;
    order: 1;
  }
`;

const VideoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 40px;

  video {
    width: 100%;
    max-width: 560px;
    border-radius: 12px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 768px) {
    order: 2;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button<{ variant: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border-radius: 24px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  white-space: nowrap;
  height: 44px;

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
    border: 1.5px solid #608AFF;
    &:hover {
      background: rgba(96, 138, 255, 0.1);
    }
  `}
`;

const HeroSection: React.FC = () => {
  const [isOpenStartupModal, setIsOpenStartupModal] = useState(false);

  const handleStartEarning = () => {
    setIsOpenStartupModal(true);
  };

  const handleViewBounties = () => {
    window.open('https://community.sphinx.chat/bounties', '_blank');
  };

  return (
    <>
      <HeroContainer>
        <Content>
          <h1>Complete tasks and get paid, instantly.</h1>
          <p>
            Welcome to the modern marketplace for work that gives you the freedom to earn Bitcoin
            for every bounty you complete.
          </p>
          <ButtonGroup>
            <Button variant="primary" onClick={handleStartEarning}>
              Start Earning
            </Button>
            <Button variant="secondary" onClick={handleViewBounties}>
              View Bounties
            </Button>
          </ButtonGroup>
        </Content>
        <VideoContainer>
          <video
            autoPlay
            loop
            controls
            playsInline
            src="https://stakwork-uploads.s3.amazonaws.com/admin_customers/admin/TimeIntoMoney.mp4"
          />
        </VideoContainer>
      </HeroContainer>

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

export default HeroSection;

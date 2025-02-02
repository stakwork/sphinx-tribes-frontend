import React, { useState } from 'react';
import styled from 'styled-components';
import StartUpModal from '../../people/utils/StartUpModal';

const Section = styled.section`
  background: #f2f3f5;
  padding: 80px 0 30px 0;
  width: 100%;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const Header = styled.div`
  text-align: center;
  max-width: 800px;
  margin: 0 auto 64px;

  h2 {
    font-size: 48px;
    font-weight: 500;
    line-height: 1.2;
    margin-bottom: 24px;
    color: #1a242e;
  }

  p {
    font-size: 19px;
    line-height: 1.6;
    font-weight: 400;
    color: #4a5568;
    margin-bottom: 32px;
  }

  @media (max-width: 768px) {
    h2 {
      font-size: 35px;
    }

    p {
      font-size: 17px;
    }
  }
`;

const CardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);

  h3 {
    font-size: 26px;
    font-family: 'Barlow';
    font-weight: 600;
    color: #1a242e;
    margin: 24px 0 16px;
    line-height: 1.3;
  }

  p {
    font-size: 16px;
    line-height: 1.6;
    color: #4a5568;
    margin: 0;
    margin-bottom: 10px !important;
  }
`;

const Icon = styled.img`
  width: 22%;
  height: 22%;
  display: block;
`;

const IconWrapper = styled.div`
  margin-bottom: 30px;
  display: flex;
`;

const LightningIcon = styled.img`
  width: 20%;
  height: 20%;
  display: block;
`;

const StartEarningButton = styled.button`
  background: #608aff;
  color: white;
  border: none;
  border-radius: 24px;
  padding: 12px 24px;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin: 0 auto;
  display: block;
  margin-top: 32px;

  &:hover {
    background: #4a6fe5;
  }
`;

const CommunitySection: React.FC = () => {
  const [isOpenStartupModal, setIsOpenStartupModal] = useState(false);

  const handleStartEarning = () => {
    setIsOpenStartupModal(true);
  };

  return (
    <Section>
      <Container>
        <Header>
          <h2>
            Join a community of Bounty Hunters built for freedom, flexibility and instant rewards.
          </h2>
          <p>
            Join a growing community of skilled professionals earning their way. We&apos;ve built a
            platform where talent meets opportunity and rewards are instant. Our bounty hunters work
            with freedom, get paid faster, and grow their earnings on their terms.
          </p>
          <StartEarningButton onClick={handleStartEarning}>Start Earning</StartEarningButton>
        </Header>

        <CardsContainer>
          <Card>
            <IconWrapper>
              <Icon src="/static/icons/bitcoin.svg" alt="Bitcoin icon" />
            </IconWrapper>
            <h3>Freedom to earn from anywhere in the world.</h3>
            <p>
              Work on bounties from any country without restrictions or barriers. Our global
              community welcomes talent from everywhere. All you need is an internet connection.
            </p>
          </Card>

          <Card>
            <IconWrapper>
              <Icon src="/static/icons/calendar.svg" alt="Calendar icon" />
            </IconWrapper>
            <h3>Complete bounties that fit your schedule.</h3>
            <p>
              Take control of your earning potential. Apply for the bounties that match your
              schedule and skills. Complete more bounties to increase your earnings.
            </p>
          </Card>

          <Card>
            <IconWrapper>
              <LightningIcon src="/static/icons/lightning.svg" alt="Lightning icon" />
            </IconWrapper>
            <h3>Get paid instantly in Bitcoin.</h3>
            <p>
              No more waiting for payments or dealing with traditional banking delays. Complete a
              bounty and get paid in Bitcoin immediately. Your earnings are yours to keep or spend
              right away.
            </p>
          </Card>
        </CardsContainer>
      </Container>

      {isOpenStartupModal && (
        <StartUpModal
          closeModal={() => setIsOpenStartupModal(false)}
          dataObject={'createWork'}
          buttonColor={'success'}
        />
      )}
    </Section>
  );
};
export default CommunitySection;

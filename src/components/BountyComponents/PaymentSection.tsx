import React, { useState } from 'react';
import styled from 'styled-components';
import StartUpModal from '../../people/utils/StartUpModal';

const Section = styled.section`
  background: #1a242e;
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
    font-size: 47px;
    font-weight: 500;
    line-height: 1.2;
    margin-bottom: 24px;
    color: #fff;
  }

  p {
    font-size: 19px;
    line-height: 1.6;
    font-weight: 400;
    color: #a0aec0;
    margin-bottom: 32px;
    padding: 0 8%;
  }

  @media (max-width: 768px) {
    h2 {
      font-size: 35px;
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

const PaymentSection: React.FC = () => {
  const [isOpenStartupModal, setIsOpenStartupModal] = useState(false);

  const handleStartEarning = () => {
    setIsOpenStartupModal(true);
  };

  return (
    <Section data-testid="payment-section-component">
      <Container>
        <Header>
          <h2>Everything you need to know about getting paid as a Bounty Hunter.</h2>
          <p>
            We&apos;ve made the payment process simple, fast and transparent. When your work is
            approved, you&apos;ll have Bitcoin in your wallet within seconds. Here&apos;s how the
            payment system works on Bounties.
          </p>
          <StartEarningButton onClick={handleStartEarning}>Start Earning</StartEarningButton>
        </Header>

        <CardsContainer>
          <Card>
            <IconWrapper>
              <Icon src="/static/icons/lightningcircle.svg" alt="Lightning icon" />
            </IconWrapper>
            <h3>Instant payments after approval.</h3>
            <p>
              No more waiting days or weeks to get paid. Once your work is approved, payment is sent
              to your wallet in seconds. Complete a bounty in the morning and have Bitcoin in your
              wallet by lunch.
            </p>
          </Card>

          <Card>
            <IconWrapper>
              <Icon src="/static/icons/keys.svg" alt="Keys icon" />
            </IconWrapper>
            <h3>Full control of your earnings.</h3>
            <p>
              Your earnings go directly into your personal Sphinx wallet. You have complete control
              over your Bitcoin with no restrictions. Hold it, spend it, or send it anywhere in the
              world instantly.
            </p>
          </Card>

          <Card>
            <IconWrapper>
              <LightningIcon src="/static/icons/sun.svg" alt="Sunshine icon" />
            </IconWrapper>
            <h3>No hidden costs or surprises.</h3>
            <p>
              Know exactly what you&apos;ll earn before you start. The amount shown on each bounty
              is what you&apos;ll receive. No hidden fees, no surprise deductions, no payment
              processing costs.
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
export default PaymentSection;
/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import styled from 'styled-components';
import { useIsMobile } from '../../hooks';
import { colors } from '../../config/colors';
import TopEarners from '../../components/common/TopEarners/index.tsx';
import { BountyComponents } from '../../components/BountyComponents';
import StartUpModal from '../../people/utils/StartUpModal';

const ButtonContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 20px;
  margin-bottom: 20px;
  padding: 4px;
  overflow: visible;
`;

const Button = styled.button<{ variant: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  ${({ variant }: { variant: 'primary' | 'secondary' }) =>
    variant === 'primary'
      ? `
    background: ${colors.light.blue1};
    color: white;
    border: none;
    &:hover {
      background: ${colors.light.blue2};
    }
  `
      : `
    background: transparent;
    color: ${colors.light.blue1};
    border: 1px solid ${colors.light.blue1};
    &:hover {
      background: ${colors.light.blue1}10;
    }
  `}

  &:focus {
    outline: 2px solid ${colors.light.blue1};
    outline-offset: 1px;
  }
`;

const BountiesLandingPage: React.FC = () => {
  const isMobile = useIsMobile();
  const [isOpenStartupModal, setIsOpenStartupModal] = useState(false);

  const color = colors['light'];

  const Body = styled.div<{ isMobile: boolean }>`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height: ${(p: { isMobile: boolean }) =>
      p.isMobile ? 'calc(100% - 105px)' : 'calc(100vh - 60px)'};
    background: ${(p: { isMobile: boolean }) => (p.isMobile ? undefined : color.grayish.G950)};
    width: 100%;
    overflow-x: hidden;
    overflow-y: auto;
  `;

  const ContentWrapper = styled.div`
    max-width: 1550px;
    width: 100%;
    margin: 40px;
    padding: 40px;
    background: white;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    overflow-y: auto;

    &::-webkit-scrollbar {
      display: none;
    }

    scrollbar-width: none;

    -ms-overflow-style: none;
  `;

  const ContentGrid = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr;
    height: 100%;
    position: relative;

    &:after {
      content: '';
      position: absolute;
      left: 65%;
      top: 0;
      bottom: 0;
      width: 1px;
      background-color: ${color.grayish.G900};
      transform: translateX(-50%);
    }

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 40px;

      &:after {
        display: none;
      }
    }
  `;

  const ScrollableColumn = styled.div`
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    max-height: 100%;
    &::-webkit-scrollbar {
      display: none;
    }

    scrollbar-width: none;
    -ms-overflow-style: none;

    h1 {
      font-size: 24px;
      font-family: Barlow;
      color: ${color.text1};
      margin-bottom: 24px;
      font-weight: 600;
    }

    p {
      margin-bottom: 16px;
      font-weight: 500;
      line-height: 1.6;
      word-wrap: break-word;
      max-width: 560px;
    }
  `;

  const Column = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 100%;

    h1 {
      font-size: 24px;
      font-family: Barlow;
      color: ${color.text1};
      margin-bottom: 24px;
      font-weight: 600;
    }

    h3 {
      font-size: 24px;
      font-family: Barlow;
      color: ${color.text1};
      margin-bottom: 24px;
      font-weight: 600;
    }

    p {
      margin-bottom: 16px;
      font-weight: 500;
      line-height: 1.6;
      word-wrap: break-word;
      max-width: 560px;
    }
  `;

  const handleStartEarning = () => {
    setIsOpenStartupModal(true);
  };

  const handleViewBounties = () => {
    window.open('https://community.sphinx.chat/bounties', '_blank');
  };

  return (
    <Body isMobile={isMobile}>
      <ContentWrapper>
        <ContentGrid>
          <ScrollableColumn>
            <h1>Complete Tasks and Get Paid in Bitcoin Instantly</h1>
            <p>
              Welcome to the modern marketplace for work that gives you the freedom to earn Bitcoin
              for every bounty you complete.
            </p>
            <ButtonContainer>
              <Button variant="primary" onClick={handleStartEarning}>
                Start Earning Bitcoin
              </Button>
              <Button variant="secondary" onClick={handleViewBounties}>
                View Open Bounties
              </Button>
            </ButtonContainer>
            <BountyComponents />
          </ScrollableColumn>
          <Column>
            <h3>All-Time Top Bounty Hunters</h3>
            <TopEarners limit={5} />
          </Column>
        </ContentGrid>
      </ContentWrapper>

      {isOpenStartupModal && (
        <StartUpModal
          closeModal={() => setIsOpenStartupModal(false)}
          dataObject={'createWork'}
          buttonColor={'success'}
        />
      )}
    </Body>
  );
};

export default BountiesLandingPage;

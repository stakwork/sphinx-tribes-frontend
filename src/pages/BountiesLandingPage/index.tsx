/* eslint-disable react/prop-types */
import React from 'react';
import styled from 'styled-components';
import { useIsMobile } from '../../hooks';
import { colors } from '../../config/colors';
import BountyNavBar from '../../components/BountyComponents/BountyNavBar';
import HeroSection from '../../components/BountyComponents/HeroSection';
import CommunitySection from '../../components/BountyComponents/CommunitySection';
import PaymentSection from '../../components/BountyComponents/PaymentSection';
import Footer from '../../components/BountyComponents/Footer.tsx';
import { useBrowserTabTitle } from '../../hooks';

const Body = styled.div<{ isMobile: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100vh;
  background: ${(p: { isMobile: boolean }) =>
    p.isMobile ? undefined : colors['light'].grayish.G950};
  width: 100%;
  overflow-x: hidden;
  overflow-y: scroll;

  &::-webkit-scrollbar {
    display: none;
  }

  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const ContentWrapper = styled.div`
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
`;

const BountiesLandingPage: React.FC = () => {
  const isMobile = useIsMobile();
  useBrowserTabTitle('Bounties');

  return (
    <Body isMobile={isMobile}>
      <ContentWrapper>
        <header>
          <BountyNavBar />
        </header>
        <main>
          <HeroSection />
          <CommunitySection />
          <PaymentSection />
        </main>
        <footer>
          <Footer />
        </footer>
      </ContentWrapper>
    </Body>
  );
};

export default BountiesLandingPage;

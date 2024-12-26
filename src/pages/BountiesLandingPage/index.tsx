/* eslint-disable react/prop-types */
import React from 'react';
import styled from 'styled-components';
import { useIsMobile } from '../../hooks';
import { colors } from '../../config/colors';
import { BountiesHeader, HeaderWrap, Leftheader } from '../tickets/style.ts';
import { BountyHeaderContent } from '../tickets/workspace/workspaceHeader/WorkspaceHeaderStyles.tsx';
import TopEarners from '../../components/common/TopEarners/index.tsx';

const BountiesLandingPage: React.FC = () => {
  const isMobile = useIsMobile();

  const color = colors['light'];

  const Body = styled.div<{ isMobile: boolean }>`
    flex: 1;
    height: ${(p: { isMobile: boolean }) =>
      p.isMobile ? 'calc(100% - 105px)' : 'calc(100vh - 60px)'};
    background: ${(p: { isMobile: boolean }) => (p.isMobile ? undefined : color.grayish.G950)};
    width: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  `;

  const ContentWrapper = styled.div`
    max-width: 1200px;
    min-height: 500px;
    margin: 30px auto;
    width: 100%;
    padding: 40px 20px 20px 30px;
    background: white;
  `;

  const ContentGrid = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 60px;
    height: 100%;
    position: relative;

    &:after {
      content: '';
      position: absolute;
      left: 63%;
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

  const Column = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 100%;
    padding: 0 20px;

    h1 {
      font-size: 24px;
      font-family: Barlow;
      color: ${color.text1};
      margin-bottom: 24px;
      font-weight: 500;
    }

    p {
      font-family: Barlow;
      margin-bottom: 16px;
      line-height: 1.6;
      word-wrap: break-word;
      max-width: 550px;
      color: ${color.text2};
      font-size: 15px;
    }
  `;

  return (
    <Body isMobile={isMobile}>
      <HeaderWrap>
        <BountiesHeader>
          <Leftheader>
            <BountyHeaderContent>Bounties</BountyHeaderContent>
          </Leftheader>
        </BountiesHeader>
      </HeaderWrap>
      <ContentWrapper>
        <ContentGrid>
          <Column>
            <h1>Welcome to Bounties</h1>
            <p>
              Building the modern marketplace for work. Complete a bounty and get paid in Bitcoin
              instantly! ⚡
            </p>
          </Column>
          <Column>
            <h1>Freedom to Earn!</h1>
            <TopEarners limit={5} />
          </Column>
        </ContentGrid>
      </ContentWrapper>
    </Body>
  );
};

export default BountiesLandingPage;

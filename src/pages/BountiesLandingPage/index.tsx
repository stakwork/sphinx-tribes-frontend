/* eslint-disable react/prop-types */
import React from 'react';
import styled from 'styled-components';
import { useIsMobile } from '../../hooks';
import { colors } from '../../config/colors';
import { HeaderWrap, Leftheader } from '../tickets/style.ts';

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

  return (
    <Body isMobile={isMobile}>
      <HeaderWrap>
        <Leftheader>
          <div>Bounties</div>
        </Leftheader>
      </HeaderWrap>
    </Body>
  );
};

export default BountiesLandingPage;

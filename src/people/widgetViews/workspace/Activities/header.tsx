import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background: #1a1b23;
  color: white;
`;

const SubHeader = styled.div`
  padding: 1.5rem 2rem;
  background: white;
  border-bottom: 1px solid #e2e8f0;
`;

const BountiesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
`;

const BountiesInfo = styled.div`
  h1 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1a1b23;
    margin-bottom: 0.5rem;
  }

  p {
    color: #64748b;
    font-size: 0.875rem;
  }
`;

const PostBountyButton = styled.button`
  background: #22c55e;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s ease;

  &:hover {
    background: #16a34a;
  }
`;

export default function ActivitiesHeader() {
  return (
    <HeaderContainer>
      <SubHeader>
        <BountiesHeader>
          <BountiesInfo>
            <h1>Bounties Platform</h1>
            <p>
              Building the modern marketplace for work. Complete a bounty and get paid in Bitcoin
              instantly! 💰
            </p>
          </BountiesInfo>

          <PostBountyButton>Post a Bounty</PostBountyButton>
        </BountiesHeader>
      </SubHeader>
    </HeaderContainer>
  );
}

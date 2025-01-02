import React from 'react';
import styled from 'styled-components';
import { colors } from '../../config/colors';

const StepsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 20px 0;
`;

const StepItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 4px;
  font-size: 16px;
  margin-left: 2%;
  color: ${colors.light.text1};
`;

const StepLabel = styled.span`
  font-weight: 800;
  font-size: 18px;
`;

const StepText = styled.span`
  font-weight: 500;
`;

const StepLink = styled.a`
  color: ${colors.light.text1};
  font-weight: 500;
  text-decoration: none;
  color: ${colors.light.blue1};
  &:hover {
    color: ${colors.light.blue2};
    text-decoration: none;
  }
`;

const StepTitle = styled.h6`
  font-size: 20px;
  font-family: 'Barlow';
  font-weight: 800;
  color: ${colors.light.text1};
  margin-bottom: 20px;
`;

interface Step {
  text: string;
  link?: string;
}

const steps: Step[] = [
  {
    text: 'Sign up for a Sphinx by clicking the Get Sphinx button!'
  },
  {
    text: 'Check out the',
    link: 'https://community.sphinx.chat/bounties'
  },
  {
    text: 'Reach out to the bounty provider by clicking "I can help!"'
  },
  {
    text: 'Introduce yourself and get assigned'
  },
  {
    text: 'Complete the work and get paid directly to your Sphinx Wallet!'
  }
];

export const BountySteps: React.FC = () => (
  <StepsContainer>
    <StepTitle>If you want to earn bounties</StepTitle>
    {steps.map((step: Step, index: number) => (
      <StepItem key={index}>
        <StepLabel>{`Step ${index + 1}:`}</StepLabel>
        <StepText>
          {step.link ? (
            <>
              {step.text}{' '}
              <StepLink href={step.link} target="_blank" rel="noopener noreferrer">
                open bounties, by clicking bounties
              </StepLink>
              !
            </>
          ) : (
            step.text
          )}
        </StepText>
      </StepItem>
    ))}
  </StepsContainer>
);

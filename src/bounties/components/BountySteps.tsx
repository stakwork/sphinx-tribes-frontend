import React from 'react';
import styled from 'styled-components';
import { colors } from '../../config/colors';

const StepsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px; /* Improved spacing for better readability */
  margin: 20px 0;
`;

const StepItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px; /* Consistent with container spacing */
  font-size: 16px;
  color: ${colors.light.text1};
  line-height: 1.5; /* Improves text readability */
`;

const StepLabel = styled.span`
  font-weight: 800;
  font-size: 18px;
  color: ${colors.light.text2}; /* Subtle variation for labels */
`;

const StepText = styled.span`
  font-weight: 500;
`;

const StepTitle = styled.h6`
  font-size: 20px;
  font-family: 'Barlow', sans-serif; /* Added fallback font */
  font-weight: 800;
  color: ${colors.light.text1};
  margin-bottom: 20px;
`;

interface Step {
  text: string;
}

const steps: Step[] = [
  { text: 'Sign up for a Sphinx by clicking the Get Sphinx button!' },
  { text: 'Check out the open bounties by clicking Bounties!' },
  { text: 'Reach out to the bounty provider by clicking "I can help!"' },
  { text: 'Introduce yourself and get assigned.' },
  { text: 'Complete the work and get paid directly to your Sphinx Wallet!' }
];

export const BountySteps: React.FC = () => (
  <StepsContainer>
    <StepTitle>How to Earn Bounties</StepTitle>
    {steps.map((step: Step, index: number) => (
      <StepItem key={index}>
        <StepLabel>{`Step ${index + 1}:`}</StepLabel>
        <StepText>{step.text}</StepText>
      </StepItem>
    ))}
  </StepsContainer>
);

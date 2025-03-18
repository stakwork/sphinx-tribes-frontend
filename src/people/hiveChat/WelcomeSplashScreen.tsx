import React from 'react';
import styled from 'styled-components';

const SplashScreenContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin: 20px auto;
  max-width: 800px;
`;

const WelcomeHeader = styled.h1`
  font-size: 2.5rem;
  font-weight: 600;
  color: #4285f4;
  margin-bottom: 16px;
`;

const WelcomeTagline = styled.p`
  font-size: 1.2rem;
  color: #5f6368;
  margin-bottom: 32px;
  line-height: 1.5;
`;

const QuickActionButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ActionButton = styled.button`
  padding: 12px 20px;
  background-color: #f2f3f5;
  color: #202124;
  border: 1px solid #e4e7eb;
  border-radius: 8px;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 200px;

  &:hover {
    background-color: #e4e7eb;
    transform: translateY(-2px);
  }
`;

interface WelcomeSplashScreenProps {
  userAlias: string;
  onActionClick: (actionText: string) => void;
  isSending: boolean;
}

const WelcomeSplashScreen: React.FC<WelcomeSplashScreenProps> = ({
  userAlias,
  onActionClick,
  isSending
}) => {
  const quickActionOptions = [
    'Make a change to the leaderboard',
    'Update the ticket editor component',
    'Can you explain how to create a new feature?'
  ];

  return (
    <SplashScreenContainer>
      <WelcomeHeader>Hello, {userAlias || 'there'}</WelcomeHeader>
      <WelcomeTagline>
        Welcome to Hive Chat, AI Native Product Development. How can I help you today?
      </WelcomeTagline>
      <QuickActionButtons>
        {quickActionOptions.map((option, index) => (
          <ActionButton key={index} onClick={() => onActionClick(option)} disabled={isSending}>
            {option}
          </ActionButton>
        ))}
      </QuickActionButtons>
    </SplashScreenContainer>
  );
};

export default WelcomeSplashScreen;

import React from 'react';
import { useState } from 'react';
import styled from 'styled-components';

interface User {
  alias: string;
}

interface SplashScreenProps {
  user: User;
  onSendMessage: (message: string) => void;
}

const SplashScreenContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
`;

const WelcomeHeader = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: black;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const WelcomeTagline = styled.p`
  font-size: 1.2rem;
  color: #64748b;
  margin-bottom: 2.5rem;
  line-height: 1.6;
  max-width: 600px;
`;

const ButtonsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ActionButton = styled.button`
  background-color: #f8fafc;
  color: #334155;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  min-width: 200px;

  &:hover {
    background-color: #f1f5f9;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SplashScreen: React.FC<SplashScreenProps> = ({ user, onSendMessage }) => {
  const [visible, setVisible] = useState(true);

  const handleButtonClick = (message: string) => {
    onSendMessage(message);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <SplashScreenContainer data-testid="splash-screen-component">
      <WelcomeHeader>Hello, {user.alias}</WelcomeHeader>
      <WelcomeTagline>
        Welcome to Hive Chat, AI Native Product Development. How can I help you today?
      </WelcomeTagline>
      <ButtonsContainer>
        <ActionButton onClick={() => handleButtonClick('Make a change to the leaderboard')}>
          Make a change to the leaderboard
        </ActionButton>
        <ActionButton onClick={() => handleButtonClick('Update the ticket editor component')}>
          Update the ticket editor component
        </ActionButton>
        <ActionButton
          onClick={() => handleButtonClick('Can you explain how to create a new feature?')}
        >
          Can you explain how to create a new feature?
        </ActionButton>
      </ButtonsContainer>
    </SplashScreenContainer>
  );
};

export default SplashScreen;

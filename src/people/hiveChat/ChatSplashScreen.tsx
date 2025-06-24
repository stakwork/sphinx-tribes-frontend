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

const SplashScreen: React.FC<SplashScreenProps> = ({ user, onSendMessage }) => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <SplashScreenContainer data-testid="splash-screen-component">
      <WelcomeHeader>Hello, {user.alias}</WelcomeHeader>
      <WelcomeTagline>
        Welcome to Hive Chat, AI Native Product Development. How can I help you today?
      </WelcomeTagline>
    </SplashScreenContainer>
  );
};

export default SplashScreen;

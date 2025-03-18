import React from 'react';
import styled from 'styled-components';
import MaterialIcon from '@material/react-material-icon';

const SplashScreenContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 32px;
  text-align: center;
  background: linear-gradient(to bottom, #ffffff, #f8f9fa);
  border-radius: 16px;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.08),
    0 2px 4px rgba(0, 0, 0, 0.05),
    0 0 1px rgba(0, 0, 0, 0.1);
  margin: 24px auto;
  max-width: 1000px;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 24px 16px;
    margin: 12px auto;
    box-shadow:
      0 4px 16px rgba(0, 0, 0, 0.06),
      0 1px 3px rgba(0, 0, 0, 0.04),
      0 0 1px rgba(0, 0, 0, 0.08);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #4285f4, #34a853, #fbbc05, #ea4335);
  }
`;

const WelcomeHeader = styled.div`
  margin-bottom: 24px;
  position: relative;
`;

const Greeting = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  background: linear-gradient(135deg, #4285f4, #0d47a1);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const WelcomeTagline = styled.p`
  font-size: 1.4rem;
  color: #5f6368;
  margin-bottom: 30px;
  line-height: 1.6;
  max-width: 700px;
  position: relative;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e8eaed;

  &::before {
    content: '"';
    position: absolute;
    top: -16px;
    left: -8px;
    font-size: 48px;
    font-family: Georgia, serif;
    color: #4285f4;
    opacity: 0.2;
  }

  &::after {
    content: '"';
    position: absolute;
    bottom: -23px;
    right: -6px;
    font-size: 48px;
    font-family: Georgia, serif;
    color: #4285f4;
    opacity: 0.2;
    transform: rotate(180deg);
  }

  @media (max-width: 768px) {
    font-size: 1.1rem;
    padding: 16px;
    margin-bottom: 20px;
  }
`;

const QuickActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 800px;
  margin-top: 20px;

  @media (min-width: 769px) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    padding: 0 16px;

    & > button:last-child {
      grid-column: 1 / -1;
      max-width: 500px;
      margin: 0 auto;
      width: fit-content;
    }
  }

  @media (max-width: 768px) {
    gap: 12px;
    margin-top: 12px;
    padding: 0 8px;
  }
`;

const ActionButton = styled.button`
  padding: 16px 24px;
  background-color: #ffffff;
  color: #202124;
  border: 1px solid #e4e7eb;
  border-radius: 12px;
  font-weight: 500;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  text-align: left;
  width: 100%;

  @media (max-width: 768px) {
    padding: 12px 16px;
    font-size: 0.9rem;
    gap: 8px;
    width: 100%;
    max-width: 100%;
  }

  &:hover {
    background-color: #f8f9fa;
    border-color: #4285f4;
    box-shadow: 0 4px 12px rgba(66, 133, 244, 0.1);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &::after {
    content: '→';
    font-size: 25px;
    color: gray;
    position: absolute;
    right: 16px;
    opacity: 0;
    transform: translateX(-10px);
    transition: all 0.2s ease;
  }

  &:hover::after {
    opacity: 1;
    transform: translateX(0);
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
`;

const ButtonText = styled.span`
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 24px;

  @media (max-width: 768px) {
    margin-right: 12px;
    white-space: normal;
    text-overflow: clip;
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
    {
      text: 'Make a change to the leaderboard',
      icon: 'leaderboard'
    },
    {
      text: 'Update the ticket editor component',
      icon: 'edit_note'
    },
    {
      text: 'Can you explain how to create a new feature?',
      icon: 'lightbulb'
    }
  ];

  return (
    <SplashScreenContainer>
      <WelcomeHeader>
        <Greeting>Hello, {userAlias || 'there'}</Greeting>
      </WelcomeHeader>
      <WelcomeTagline>
        Welcome to Hive Chat, AI Native Product Development. How can I help you today?
      </WelcomeTagline>
      <QuickActionButtons>
        {quickActionOptions.map(({ text, icon }, index) => (
          <ActionButton key={index} onClick={() => onActionClick(text)} disabled={isSending}>
            <IconWrapper>
              <MaterialIcon icon={icon} style={{ fontSize: '20px', color: '#4285f4' }} />
            </IconWrapper>
            <ButtonText>{text}</ButtonText>
          </ActionButton>
        ))}
      </QuickActionButtons>
    </SplashScreenContainer>
  );
};

export default WelcomeSplashScreen;

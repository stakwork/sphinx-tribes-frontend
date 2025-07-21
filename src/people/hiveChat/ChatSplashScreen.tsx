import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

interface User {
  alias: string;
}

interface SplashScreenProps {
  user: User;
  onSendMessage: (message: string) => void;
  isWorkspaceIncomplete?: boolean;
  isPATExpired?: boolean;
  workspaceUuid?: string;
  disableInput?: boolean;
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
  line-height: 1.6;
  max-width: 600px;
`;

const RequirementsList = styled.ul`
  text-align: left;
  width: fit-content;
  color: #64748b;
  font-size: 1.1rem;
  line-height: 1.8;
`;

const RequirementItem = styled.li`
  margin-bottom: 0.1px;
`;

const SettingsLink = styled(Link)`
  display: inline-block;
  padding: 10px 24px;
  margin-left: 20px;
  background-color: #4285f4;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    color: black;
    background-color: #3367d6;
    transform: translateY(-1px);
    text-decoration: none;
  }
`;

const SplashScreen: React.FC<SplashScreenProps> = ({
  user,
  isWorkspaceIncomplete,
  isPATExpired,
  workspaceUuid
}) => {
  if (isWorkspaceIncomplete || isPATExpired) {
    return (
      <SplashScreenContainer>
        <WelcomeHeader>Workspace Incomplete</WelcomeHeader>
        <WelcomeTagline>
          {isPATExpired
            ? 'Your GitHub Personal Access Token (PAT) has expired. Please update it in Settings.'
            : 'To get started, please complete your workspace setup in the settings.'}
        </WelcomeTagline>

        {!isPATExpired && (
          <>
            <WelcomeTagline>You need to provide:</WelcomeTagline>
            <RequirementsList>
              <RequirementItem>Code Space URL</RequirementItem>
              <RequirementItem>Code Graph URL</RequirementItem>
              <RequirementItem>Secret Alias</RequirementItem>
            </RequirementsList>
          </>
        )}

        <SettingsLink to={`/workspace/${workspaceUuid}/mission`}>Go to Settings</SettingsLink>
      </SplashScreenContainer>
    );
  }

  return (
    <SplashScreenContainer>
      <WelcomeHeader>Hello, {user.alias}</WelcomeHeader>
      <WelcomeTagline>
        Welcome to Hive Chat, AI Native Product Development. How can I help you today?
      </WelcomeTagline>
    </SplashScreenContainer>
  );
};

export default SplashScreen;

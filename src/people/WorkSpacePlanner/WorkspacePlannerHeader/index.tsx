import React, { useState, useCallback, useEffect } from 'react';
import { EuiText } from '@elastic/eui';
import MaterialIcon from '@material/react-material-icon';
import { Workspace } from 'store/interface';
import { useStores } from '../../../store';
import { userCanManageBounty } from '../../../helpers';
import { PostModal } from '../../widgetViews/postBounty/PostModal';
import { colors } from '../../../config';
import {
  FillContainer,
  ImageContainer,
  CompanyNameAndLink,
  CompanyLabel,
  UrlButtonContainer,
  UrlButton,
  RightHeader,
  CompanyDescription,
  Button,
  Filters,
  FiltersRight,
  NewStatusContainer,
  StatusContainer,
  InnerContainer
} from '../../../pages/tickets/workspace/workspaceHeader/WorkspaceHeaderStyles';

import { Header, Leftheader } from '../../../pages/tickets/style';
import addBounty from '../../../pages/tickets/workspace/workspaceHeader/Icons/addBounty.svg';
import websiteIcon from '../../../pages/tickets/workspace/workspaceHeader/Icons/websiteIcon.svg';
import githubIcon from '../../../pages/tickets/workspace/workspaceHeader/Icons/githubIcon.svg';

const color = colors['light'];

interface WorkspacePlannerHeaderProps {
  workspace_uuid: string;
  workspaceData: Workspace;
}

export const WorkspacePlannerHeader = ({
  workspace_uuid,
  workspaceData
}: WorkspacePlannerHeaderProps) => {
  const { main, ui } = useStores();
  const [isPostBountyModalOpen, setIsPostBountyModalOpen] = useState(false);
  const [canPostBounty, setCanPostBounty] = useState(false);

  const checkUserPermissions = useCallback(async () => {
    const hasPermission = await userCanManageBounty(workspace_uuid, ui.meInfo?.pubkey, main);
    setCanPostBounty(hasPermission);
  }, [workspace_uuid, ui.meInfo, main]);

  useEffect(() => {
    checkUserPermissions();
  }, [checkUserPermissions]);

  const handlePostBountyClick = () => {
    setIsPostBountyModalOpen(true);
  };

  const handleWebsiteButton = (websiteUrl: string) => {
    window.open(websiteUrl, '_blank');
  };

  const handleGithubButton = (githubUrl: string) => {
    window.open(githubUrl, '_blank');
  };

  const { name, img, description, website, github } = workspaceData || {};
  const selectedWidget = 'bounties';

  return (
    <>
      <FillContainer>
        <Header>
          <Leftheader>
            <ImageContainer src={img} width="72px" height="72px" alt="workspace icon" />
            <CompanyNameAndLink>
              <CompanyLabel>{name}</CompanyLabel>
              <UrlButtonContainer data-testid="url-button-container">
                {website && (
                  <UrlButton onClick={() => handleWebsiteButton(website)}>
                    <img src={websiteIcon} alt="" />
                    Website
                  </UrlButton>
                )}
                {github && (
                  <UrlButton onClick={() => handleGithubButton(github)}>
                    <img src={githubIcon} alt="" />
                    Github
                  </UrlButton>
                )}
              </UrlButtonContainer>
            </CompanyNameAndLink>
          </Leftheader>
          <RightHeader>
            <CompanyDescription>{description}</CompanyDescription>
            {canPostBounty && (
              <Button onClick={handlePostBountyClick}>
                <img src={addBounty} alt="" />
                Post a Bounty
              </Button>
            )}
          </RightHeader>
        </Header>
      </FillContainer>

      <FillContainer>
        <Filters>
          <FiltersRight>
            <NewStatusContainer>
              <StatusContainer color={color}>
                <InnerContainer>
                  <EuiText className="statusText">Feature</EuiText>
                  <div className="filterStatusIconContainer">
                    <MaterialIcon className="materialStatusIcon" icon="keyboard_arrow_down" />
                  </div>
                </InnerContainer>
              </StatusContainer>
            </NewStatusContainer>

            <NewStatusContainer>
              <StatusContainer color={color}>
                <InnerContainer>
                  <EuiText className="statusText">Phase</EuiText>
                  <div className="filterStatusIconContainer">
                    <MaterialIcon className="materialStatusIcon" icon="keyboard_arrow_down" />
                  </div>
                </InnerContainer>
              </StatusContainer>
            </NewStatusContainer>

            <NewStatusContainer>
              <StatusContainer color={color}>
                <InnerContainer>
                  <EuiText className="statusText">Status</EuiText>
                  <div className="filterStatusIconContainer">
                    <MaterialIcon className="materialStatusIcon" icon="keyboard_arrow_down" />
                  </div>
                </InnerContainer>
              </StatusContainer>
            </NewStatusContainer>
          </FiltersRight>
        </Filters>
      </FillContainer>

      <PostModal
        widget={selectedWidget}
        isOpen={isPostBountyModalOpen}
        onClose={() => setIsPostBountyModalOpen(false)}
      />
    </>
  );
};

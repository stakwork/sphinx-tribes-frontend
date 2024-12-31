import React, { useState, useCallback, useEffect } from 'react';
import { EuiText, EuiPopover, EuiCheckboxGroup } from '@elastic/eui';
import MaterialIcon from '@material/react-material-icon';
import { observer } from 'mobx-react-lite';
import styled from 'styled-components';
import { Workspace, Feature, BountyCard } from 'store/interface';
import { useStores } from '../../../store';
import { userCanManageBounty } from '../../../helpers';
import { PostModal } from '../../widgetViews/postBounty/PostModal';
import { colors } from '../../../config';
import { useBountyCardStore } from '../../../store/bountyCard';
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
  InnerContainer,
  EuiPopOverCheckbox,
  FilterCount,
  Formatter
} from '../../../pages/tickets/workspace/workspaceHeader/WorkspaceHeaderStyles';
import { Header, Leftheader } from '../../../pages/tickets/style';
import addBounty from '../../../pages/tickets/workspace/workspaceHeader/Icons/addBounty.svg';
import websiteIcon from '../../../pages/tickets/workspace/workspaceHeader/Icons/websiteIcon.svg';
import githubIcon from '../../../pages/tickets/workspace/workspaceHeader/Icons/githubIcon.svg';

const color = colors['light'];

interface WorkspacePlannerHeaderProps {
  workspace_uuid: string;
  workspaceData: Workspace & {
    features?: Feature[];
  };
  filterToggle: boolean;
  setFilterToggle: (a: boolean) => void;
}

interface FeatureOption {
  label: string;
  id: string;
}

const ClearButton = styled.button`
  color: ${colors.light.primaryColor};
  background: none;
  border: none;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  margin-left: 8px;

  &:hover {
    text-decoration: underline;
  }
`;

export const WorkspacePlannerHeader = observer(
  ({
    workspace_uuid,
    workspaceData,
    filterToggle,
    setFilterToggle
  }: WorkspacePlannerHeaderProps) => {
    const { main, ui } = useStores();
    const [isPostBountyModalOpen, setIsPostBountyModalOpen] = useState(false);
    const [canPostBounty, setCanPostBounty] = useState(false);
    const [isFeaturePopoverOpen, setIsFeaturePopoverOpen] = useState<boolean>(false);
    const bountyCardStore = useBountyCardStore(workspace_uuid);

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

    const onFeatureButtonClick = (): void => {
      setIsFeaturePopoverOpen((isPopoverOpen: boolean) => !isPopoverOpen);
    };

    const closeFeaturePopover = () => setIsFeaturePopoverOpen(false);

    const getFeatureOptions = (): FeatureOption[] => {
      const options: FeatureOption[] = [];
      const uniqueFeatures = new Map<string, { name: string; count: number }>();
      let noFeatureCount = 0;

      bountyCardStore.bountyCards.forEach((card: BountyCard) => {
        if (card.features?.uuid && card.features?.name) {
          const existing = uniqueFeatures.get(card.features.uuid);
          if (existing) {
            existing.count++;
          } else {
            uniqueFeatures.set(card.features.uuid, {
              name: card.features.name,
              count: 1
            });
          }
        } else {
          noFeatureCount++;
        }
      });

      uniqueFeatures.forEach((value: { name: string; count: number }, uuid: string) => {
        options.push({
          label: `${value.name} (${value.count})`,
          id: uuid
        });
      });

      options.sort((a: FeatureOption, b: FeatureOption) => a.label.localeCompare(b.label));

      if (noFeatureCount > 0) {
        options.unshift({
          label: `No Feature (${noFeatureCount})`,
          id: 'no-feature'
        });
      }

      return options;
    };

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
                <EuiPopover
                  button={
                    <StatusContainer onClick={onFeatureButtonClick} color={color}>
                      <InnerContainer>
                        <EuiText
                          className="statusText"
                          style={{
                            color: isFeaturePopoverOpen ? color.grayish.G10 : ''
                          }}
                        >
                          Feature
                        </EuiText>
                        <Formatter>
                          {bountyCardStore.selectedFeatures.length > 0 && (
                            <FilterCount color={color}>
                              <EuiText className="filterCountText">
                                {bountyCardStore.selectedFeatures.length}
                              </EuiText>
                            </FilterCount>
                          )}
                        </Formatter>
                        <div className="filterStatusIconContainer">
                          <MaterialIcon
                            className="materialStatusIcon"
                            icon={`${
                              isFeaturePopoverOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'
                            }`}
                            style={{
                              color: isFeaturePopoverOpen ? color.grayish.G10 : ''
                            }}
                          />
                        </div>
                      </InnerContainer>
                    </StatusContainer>
                  }
                  panelStyle={{
                    border: 'none',
                    boxShadow: `0px 1px 20px ${color.black90}`,
                    background: `${color.pureWhite}`,
                    borderRadius: '0px 0px 6px 6px',
                    maxWidth: '140px',
                    minHeight: '160px',
                    marginTop: '0px',
                    marginLeft: '20px'
                  }}
                  isOpen={isFeaturePopoverOpen}
                  closePopover={closeFeaturePopover}
                  panelClassName="yourClassNameHere"
                  panelPaddingSize="none"
                  anchorPosition="downLeft"
                >
                  <div style={{ display: 'flex', flex: 'row' }}>
                    <EuiPopOverCheckbox className="CheckboxOuter" color={color}>
                      <EuiCheckboxGroup
                        options={getFeatureOptions()}
                        idToSelectedMap={bountyCardStore.selectedFeatures.reduce(
                          (acc: { [key: string]: boolean }, featureId: string) => {
                            acc[featureId] = true;
                            return acc;
                          },
                          {}
                        )}
                        onChange={(id: string) => {
                          bountyCardStore.toggleFeature(id);
                          setFilterToggle(!filterToggle);
                        }}
                      />
                      {bountyCardStore.selectedFeatures.length > 0 && (
                        <div
                          style={{
                            padding: '8px 16px',
                            borderTop: `1px solid ${color.grayish.G800}`
                          }}
                        >
                          <ClearButton
                            onClick={(e: React.MouseEvent): void => {
                              e.stopPropagation();
                              bountyCardStore.clearAllFilters();
                            }}
                          >
                            Clear All
                          </ClearButton>
                        </div>
                      )}
                    </EuiPopOverCheckbox>
                  </div>
                </EuiPopover>
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
  }
);

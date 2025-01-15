/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import React, { useState, useCallback, useEffect } from 'react';
import { EuiText, EuiPopover, EuiCheckboxGroup } from '@elastic/eui';
import MaterialIcon from '@material/react-material-icon';
import { observer } from 'mobx-react-lite';
import styled from 'styled-components';
import { Workspace, Feature, BountyCard, BountyCardStatus } from 'store/interface';
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
import { Phase } from '../../widgetViews/workspace/interface.ts';

const color = colors['light'];

interface WorkspacePlannerHeaderProps {
  workspace_uuid: string;
  workspaceData: Workspace & {
    features?: Feature[];
  };
  filterToggle: boolean;
  setFilterToggle: (a: boolean) => void;
  searchText: string;
  setSearchText: React.Dispatch<React.SetStateAction<string>>;
}

interface FeatureOption {
  label: string;
  id: string;
}

const ClearButton = styled.button`
  color: ${colors.light.blue4};
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

const SearchInputContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
  margin-bottom: 1rem;

  input {
    width: 100%;
    padding: 0.5rem 2.5rem 0.5rem 0.5rem; /* Add padding to account for the button */
    border: 1px solid ${colors.light.grayish.G1100};
    border-radius: 4px;
    font-size: 1rem;
    outline: none;
    transition: border-color 0.3s;

    &:focus {
      border-color: ${colors.light.blue3};
    }
  }

  button {
    position: absolute;
    top: 50%;
    right: 0.5rem;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    color: ${colors.light.black400};
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      color: ${colors.light.blue3};
    }
  }
`;

const SearchInput = ({
  value,
  onChange,
  onClear
}: {
  value: string;
  onChange: (val: string) => void;
  onClear: () => void;
}) => (
  <SearchInputContainer>
    <input
      type="text"
      placeholder="Search tickets..."
      value={value}
      onChange={(e: any) => onChange(e.target.value)}
    />
    {value && <button onClick={onClear}>×</button>}
  </SearchInputContainer>
);

export const WorkspacePlannerHeader = observer(
  ({
    workspace_uuid,
    workspaceData,
    filterToggle,
    setFilterToggle,
    searchText,
    setSearchText
  }: WorkspacePlannerHeaderProps) => {
    const { main, ui } = useStores();
    const [isPostBountyModalOpen, setIsPostBountyModalOpen] = useState(false);
    const [canPostBounty, setCanPostBounty] = useState(false);
    const [isFeaturePopoverOpen, setIsFeaturePopoverOpen] = useState<boolean>(false);
    const [isPhasePopoverOpen, setIsPhasePopoverOpen] = useState<boolean>(false);
    const [isAssigneePopoverOpen, setIsAssigneePopoverOpen] = useState<boolean>(false);
    const [isStatusPopoverOpen, setIsStatusPopoverOpen] = useState<boolean>(false);
    const bountyCardStore = useBountyCardStore(workspace_uuid);
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const checkUserPermissions = useCallback(async () => {
      const hasPermission = await userCanManageBounty(workspace_uuid, ui.meInfo?.pubkey, main);
      setCanPostBounty(hasPermission);
    }, [workspace_uuid, ui.meInfo, main]);

    useEffect(() => {
      const handler = setTimeout(() => setDebouncedSearch(searchText), 300);
      return () => clearTimeout(handler);
    }, [searchText]);

    const handleClearSearch = () => setSearchText('');

    useEffect(() => {
      bountyCardStore.restoreFilterState();
      const savedSearchText = sessionStorage.getItem('workspaceSearchText');
      if (savedSearchText) setSearchText(savedSearchText);
    }, [bountyCardStore, filterToggle, setSearchText]);

    useEffect(() => {
      sessionStorage.setItem('workspaceSearchText', searchText);
    }, [searchText]);

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

    const onPhaseButtonClick = (): void => {
      setIsPhasePopoverOpen((isPopoverOpen: boolean) => !isPopoverOpen);
    };

    const onStatusButtonClick = (): void => {
      setIsStatusPopoverOpen((isPopoverOpen: boolean) => !isPopoverOpen);
    };

    const onAssigneeButtonClick = (): void => {
      setIsAssigneePopoverOpen((isPopoverOpen: boolean) => !isPopoverOpen);
    };

    const closeFeaturePopover = () => setIsFeaturePopoverOpen(false);
    const closePhasePopover = () => setIsPhasePopoverOpen(false);
    const closeStatusPopover = () => setIsStatusPopoverOpen(false);
    const closeAssigneePopover = () => setIsAssigneePopoverOpen(false);

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

    const isPhaseFilterDisabled =
      bountyCardStore.selectedFeatures.length === 0 ||
      (bountyCardStore.selectedFeatures.length === 1 &&
        bountyCardStore.selectedFeatures.includes('no-feature'));

    return (
      <>
        <FillContainer>
          <Header>
            <Leftheader>
              {img && <ImageContainer src={img} width="72px" height="72px" alt="workspace icon" />}
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
                              setFilterToggle(!filterToggle);
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
                <EuiPopover
                  button={
                    <StatusContainer
                      onClick={isPhaseFilterDisabled ? undefined : onPhaseButtonClick}
                      color={color}
                      style={{
                        opacity: isPhaseFilterDisabled ? 0.5 : 1,
                        cursor: isPhaseFilterDisabled ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <InnerContainer>
                        <EuiText className="statusText">Phase</EuiText>
                        <Formatter>
                          {bountyCardStore.selectedPhases.length > 0 && (
                            <FilterCount color={color}>
                              <EuiText className="filterCountText">
                                {bountyCardStore.selectedPhases.length}
                              </EuiText>
                            </FilterCount>
                          )}
                        </Formatter>
                        <MaterialIcon
                          icon={isPhasePopoverOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                        />
                      </InnerContainer>
                    </StatusContainer>
                  }
                  isOpen={isPhasePopoverOpen && !isPhaseFilterDisabled}
                  closePopover={closePhasePopover}
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
                  panelClassName="yourClassNameHere"
                  panelPaddingSize="none"
                  anchorPosition="downLeft"
                >
                  <div style={{ display: 'flex', flex: 'row' }}>
                    <EuiPopOverCheckbox className="CheckboxOuter" color={color}>
                      <EuiCheckboxGroup
                        options={bountyCardStore.availablePhases.map((phase: any) => ({
                          label: phase.name,
                          id: phase.uuid
                        }))}
                        idToSelectedMap={bountyCardStore.selectedPhases.reduce(
                          (acc: { [key: string]: boolean }, phaseId: string) => {
                            acc[phaseId] = true;
                            return acc;
                          },
                          {}
                        )}
                        onChange={(id: string) => {
                          bountyCardStore.togglePhase(id);
                          setFilterToggle(!filterToggle);
                        }}
                      />
                      {bountyCardStore.selectedPhases.length > 0 && (
                        <div
                          style={{
                            padding: '8px 16px',
                            borderTop: `1px solid ${color.grayish.G800}`
                          }}
                        >
                          <ClearButton
                            onClick={(e: React.MouseEvent): void => {
                              e.stopPropagation();
                              bountyCardStore.clearPhaseFilters();
                              setFilterToggle(!filterToggle);
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
                <EuiPopover
                  button={
                    <StatusContainer onClick={onStatusButtonClick} color={color}>
                      <InnerContainer>
                        <EuiText className="statusText">Status</EuiText>
                        <Formatter>
                          {bountyCardStore.selectedStatuses.length > 0 && (
                            <FilterCount color={color}>
                              <EuiText className="filterCountText">
                                {bountyCardStore.selectedStatuses.length}
                              </EuiText>
                            </FilterCount>
                          )}
                        </Formatter>
                        <MaterialIcon
                          icon={isStatusPopoverOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                        />
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
                  isOpen={isStatusPopoverOpen}
                  closePopover={closeStatusPopover}
                  panelClassName="yourClassNameHere"
                  panelPaddingSize="none"
                  anchorPosition="downLeft"
                >
                  <div style={{ display: 'flex', flex: 'row' }}>
                    <EuiPopOverCheckbox className="CheckboxOuter" color={color}>
                      <EuiCheckboxGroup
                        options={[
                          { label: 'TODO', id: 'TODO' },
                          { label: 'IN_PROGRESS', id: 'IN_PROGRESS' },
                          { label: 'IN_REVIEW', id: 'IN_REVIEW' },
                          { label: 'COMPLETED', id: 'COMPLETED' },
                          { label: 'PAID', id: 'PAID' }
                        ]}
                        idToSelectedMap={bountyCardStore.selectedStatuses.reduce(
                          (acc: any, status: any) => ({ ...acc, [status]: true }),
                          {}
                        )}
                        onChange={(id: string) => {
                          bountyCardStore.toggleStatus(id as BountyCardStatus);
                          setFilterToggle(!filterToggle);
                        }}
                      />
                      {bountyCardStore.selectedStatuses.length > 0 && (
                        <div
                          style={{
                            padding: '8px 16px',
                            borderTop: `1px solid ${color.grayish.G800}`
                          }}
                        >
                          <ClearButton
                            onClick={(e: React.MouseEvent): void => {
                              e.stopPropagation();
                              bountyCardStore.clearStatusFilters();
                              setFilterToggle(!filterToggle);
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
                <EuiPopover
                  button={
                    <StatusContainer
                      onClick={onAssigneeButtonClick}
                      color={color}
                      // style={{
                      //   opacity: isPhaseFilterDisabled ? 0.5 : 1,
                      //   cursor: isPhaseFilterDisabled ? 'not-allowed' : 'pointer'
                      // }}
                    >
                      <InnerContainer>
                        <EuiText className="statusText">Assignee</EuiText>
                        <Formatter>
                          {bountyCardStore.selectedAssignees.length > 0 && (
                            <FilterCount color={color}>
                              <EuiText className="filterCountText">
                                {bountyCardStore.selectedAssignees.length}
                              </EuiText>
                            </FilterCount>
                          )}
                        </Formatter>
                        <MaterialIcon
                          icon={isAssigneePopoverOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                        />
                      </InnerContainer>
                    </StatusContainer>
                  }
                  isOpen={isAssigneePopoverOpen}
                  closePopover={closeAssigneePopover}
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
                  panelClassName="yourClassNameHere"
                  panelPaddingSize="none"
                  anchorPosition="downLeft"
                >
                  <div style={{ display: 'flex', flex: 'row' }}>
                    <EuiPopOverCheckbox className="CheckboxOuter" color={color}>
                      <EuiCheckboxGroup
                        options={bountyCardStore.availableAssignees.map((assignee: any) => ({
                          label: assignee.name,
                          id: assignee
                        }))}
                        idToSelectedMap={bountyCardStore.availableAssignees.reduce(
                          (acc: { [key: string]: boolean }, assignee: any) => {
                            acc[assignee] = bountyCardStore.selectedAssignees.includes(assignee);
                            return acc;
                          },
                          {}
                        )}
                        onChange={(id: string) => {
                          bountyCardStore.toggleAssignee(id);
                          setFilterToggle(!filterToggle);
                        }}
                      />
                      {bountyCardStore.selectedAssignees.length > 0 && (
                        <div
                          style={{
                            padding: '8px 16px',
                            borderTop: `1px solid ${color.grayish.G800}`
                          }}
                        >
                          <ClearButton
                            onClick={(e: React.MouseEvent): void => {
                              e.stopPropagation();
                              bountyCardStore.clearAssigneeFilters();
                              setFilterToggle(!filterToggle);
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
              <SearchInput
                value={searchText}
                onChange={(val: string) => setSearchText(val)}
                onClear={handleClearSearch}
              />
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

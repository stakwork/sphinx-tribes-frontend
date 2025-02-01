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

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
  margin-top: -4px;
`;

const SearchControls = styled.div`
  display: flex;
  align-items: center;
  background: ${colors.light.pureWhite};
  border: 1px solid ${colors.light.black400};
  border-radius: 8px;
  padding: 4px;
  gap: 4px;
  transition: all 0.2s;

  &:focus-within {
    border-color: ${colors.light.blue3};
    box-shadow: 0 0 0 2px ${colors.light.blue3}20;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  padding: 8px 12px;
  font-size: 14px;
  outline: none;
  background: transparent;
  color: ${colors.light.black400};

  &::placeholder {
    color: ${colors.light.grayish.G400};
  }
`;

const InverseToggle = styled.button<{ active: boolean }>`
  padding: 6px 12px;
  border: 1px solid
    ${(props: any) => (props.active ? colors.light.blue3 : colors.light.grayish.G800)};
  border-radius: 6px;
  background: ${(props: any) => (props.active ? colors.light.blue3 : 'transparent')};
  color: ${(props: any) => (props.active ? colors.light.pureWhite : colors.light.grayish.G200)};
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    background: ${(props: any) => (props.active ? colors.light.blue4 : colors.light.grayish.G900)};
    border-color: ${(props: any) =>
      props.active ? colors.light.blue4 : colors.light.grayish.G700};
  }

  &:active {
    transform: scale(0.98);
  }
`;

const ClearButton = styled.button`
  background: transparent;
  border: none;
  color: ${colors.light.grayish.G400};
  font-size: 18px;
  padding: 4px 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  border-radius: 4px;

  &:hover {
    background: ${colors.light.grayish.G900};
    color: ${colors.light.grayish.G200};
  }
`;

const SearchComponent = ({
  value,
  onChange,
  onClear,
  inverseSearch,
  onToggleInverse
}: {
  value: string;
  onChange: (val: string) => void;
  onClear: () => void;
  inverseSearch: boolean;
  onToggleInverse: () => void;
}) => (
  <SearchContainer>
    <SearchControls>
      <SearchInput
        type="text"
        placeholder={`${inverseSearch ? 'Exclude' : 'Search'} tickets...`}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      />
      <InverseToggle
        active={inverseSearch}
        onClick={onToggleInverse}
        title={inverseSearch ? 'Excluding matches' : 'Including matches'}
      >
        {inverseSearch ? (
          <>
            <MaterialIcon icon="remove_circle_outline" style={{ fontSize: '16px' }} />
            Exclude
          </>
        ) : (
          <>
            <MaterialIcon icon="search" style={{ fontSize: '16px' }} />
            Include
          </>
        )}
      </InverseToggle>
      {value && (
        <ClearButton onClick={onClear} title="Clear search">
          ×
        </ClearButton>
      )}
    </SearchControls>
  </SearchContainer>
);

const ScrollablePopoverContent = styled.div`
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 3px;
  }

  &::-webkit-scrollbar-track {
    background: ${colors.light.grayish.G800};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${colors.light.grayish.G200};
    border-radius: 3px;
  }
`;

const CustomEuiPopOverCheckbox = styled(EuiPopOverCheckbox)`
  border-right: none;
  background: ${colors.light.pureWhite};
  padding: 15px 10px !important;
`;

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

    const handleSearchChange = (value: string) => {
      setSearchText(value);
      bountyCardStore.setSearchText(value);
      bountyCardStore.loadWorkspaceBounties();
    };

    const handleClearSearch = () => {
      setSearchText('');
      bountyCardStore.clearSearch();
      bountyCardStore.loadWorkspaceBounties();
    };

    const handleToggleInverse = () => {
      bountyCardStore.toggleInverseSearch();
    };

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
                    marginTop: '0px',
                    marginLeft: '20px'
                  }}
                  isOpen={isFeaturePopoverOpen}
                  closePopover={closeFeaturePopover}
                  panelClassName="yourClassNameHere"
                  panelPaddingSize="none"
                  anchorPosition="downLeft"
                >
                  <ScrollablePopoverContent>
                    <div style={{ display: 'flex', flex: 'row' }}>
                      <CustomEuiPopOverCheckbox className="CheckboxOuter" color={color}>
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
                      </CustomEuiPopOverCheckbox>
                    </div>
                  </ScrollablePopoverContent>
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
                    maxWidth: '148px',
                    marginTop: '0px',
                    marginLeft: '20px'
                  }}
                  panelClassName="yourClassNameHere"
                  panelPaddingSize="none"
                  anchorPosition="downLeft"
                >
                  <ScrollablePopoverContent>
                    <div style={{ display: 'flex', flex: 'row' }}>
                      <CustomEuiPopOverCheckbox className="CheckboxOuter" color={color}>
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
                      </CustomEuiPopOverCheckbox>
                    </div>
                  </ScrollablePopoverContent>
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
                          { label: 'DRAFT', id: 'DRAFT' },
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
                    <StatusContainer onClick={onAssigneeButtonClick} color={color}>
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
                          id: assignee.name
                        }))}
                        idToSelectedMap={bountyCardStore.availableAssignees.reduce(
                          (acc: { [key: string]: boolean }, assignee: any) => {
                            acc[assignee.name] = bountyCardStore.selectedAssignees.includes(
                              assignee.name
                            );
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
              <SearchComponent
                value={searchText}
                onChange={handleSearchChange}
                onClear={handleClearSearch}
                inverseSearch={bountyCardStore.inverseSearch}
                onToggleInverse={handleToggleInverse}
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
